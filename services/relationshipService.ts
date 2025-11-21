
import { Person, Relationship, RelationshipType, PathResult } from '../types';

export interface RelatedPerson {
  person: Person;
  relationship: Relationship;
}

export interface ImmediateFamily {
  parents: RelatedPerson[];
  children: RelatedPerson[];
  spouses: RelatedPerson[];
  siblings: Person[];
}

// Helper to get immediate family
export const getImmediateFamily = (personId: string, people: Person[], relationships: Relationship[]): ImmediateFamily => {
  const family: ImmediateFamily = {
    parents: [],
    children: [],
    spouses: [],
    siblings: [],
  };

  // 1. Find Parents (where relationship is PARENT and target is personId)
  const parentRels = relationships.filter(r => r.type === RelationshipType.PARENT && r.person2Id === personId);
  family.parents = parentRels
    .map(r => ({ relationship: r, person: people.find(p => p.id === r.person1Id) }))
    .filter((item): item is RelatedPerson => !!item.person);

  // 2. Find Children (where relationship is PARENT and source is personId)
  const childRels = relationships.filter(r => r.type === RelationshipType.PARENT && r.person1Id === personId);
  family.children = childRels
    .map(r => ({ relationship: r, person: people.find(p => p.id === r.person2Id) }))
    .filter((item): item is RelatedPerson => !!item.person);

  // 3. Find Spouses
  const spouseRels = relationships.filter(r => 
    r.type === RelationshipType.SPOUSE && (r.person1Id === personId || r.person2Id === personId)
  );
  family.spouses = spouseRels
    .map(r => {
      const spouseId = r.person1Id === personId ? r.person2Id : r.person1Id;
      return { relationship: r, person: people.find(p => p.id === spouseId) };
    })
    .filter((item): item is RelatedPerson => !!item.person);

  // 4. Find Siblings (share at least one parent)
  if (family.parents.length > 0) {
    const parentIds = family.parents.map(fp => fp.person.id);
    // Find all relationships where source is one of the parents
    const siblingRels = relationships.filter(r => 
      r.type === RelationshipType.PARENT && parentIds.includes(r.person1Id) && r.person2Id !== personId
    );
    const siblingIds = Array.from(new Set(siblingRels.map(r => r.person2Id)));
    family.siblings = people.filter(p => siblingIds.includes(p.id));
  }

  return family;
};

/**
 * RULE ENFORCEMENT:
 * Automatically infers missing parent relationships. 
 * If Child -> ParentA, and ParentA <-> ParentB (Spouse), then implies ParentB -> Child.
 */
export const validateAndNormalizeGraph = (people: Person[], relationships: Relationship[]): Relationship[] => {
  const normalizedRels = [...relationships];
  const childParentMap = new Map<string, Set<string>>();
  const personSpouseMap = new Map<string, Set<string>>();

  // 1. Build Maps
  normalizedRels.forEach(r => {
    if (r.type === RelationshipType.PARENT) {
      if (!childParentMap.has(r.person2Id)) childParentMap.set(r.person2Id, new Set());
      childParentMap.get(r.person2Id)!.add(r.person1Id);
    }
    if (r.type === RelationshipType.SPOUSE) {
      if (!personSpouseMap.has(r.person1Id)) personSpouseMap.set(r.person1Id, new Set());
      if (!personSpouseMap.has(r.person2Id)) personSpouseMap.set(r.person2Id, new Set());
      personSpouseMap.get(r.person1Id)!.add(r.person2Id);
      personSpouseMap.get(r.person2Id)!.add(r.person1Id);
    }
  });

  // 2. Infer Missing Links
  childParentMap.forEach((parentIds, childId) => {
    parentIds.forEach(parentId => {
      const spouses = personSpouseMap.get(parentId);
      if (spouses) {
        spouses.forEach(spouseId => {
          // Check if spouse is already linked as a parent
          if (!parentIds.has(spouseId)) {
            // Verify spouse exists in people list to be safe
            const spouseExists = people.some(p => p.id === spouseId);
            if (spouseExists) {
              normalizedRels.push({
                id: `r_inferred_${parentId}_${spouseId}_${childId}`,
                person1Id: spouseId,
                person2Id: childId,
                type: RelationshipType.PARENT,
                label: 'Inferred Parent'
              });
              parentIds.add(spouseId); // Update local set to prevent duplicates
            }
          }
        });
      }
    });
  });

  return normalizedRels;
};

// BFS Algorithm to find shortest path between two people
export const findRelationshipPath = (
  startId: string,
  endId: string,
  people: Person[],
  relationships: Relationship[]
): PathResult | null => {
  if (startId === endId) return { path: [startId], relationshipDescription: "Self" };

  // Adjacency List Construction
  const adj = new Map<string, string[]>();
  
  const addEdge = (u: string, v: string) => {
    if (!adj.has(u)) adj.set(u, []);
    adj.get(u)?.push(v);
  };

  relationships.forEach(r => {
    addEdge(r.person1Id, r.person2Id);
    addEdge(r.person2Id, r.person1Id); // Treat graph as undirected for traversal
  });

  // BFS
  const queue: string[] = [startId];
  const visited = new Set<string>([startId]);
  const parentMap = new Map<string, string>();

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current === endId) {
      // Reconstruct path
      const path: string[] = [];
      let curr: string | undefined = endId;
      while (curr) {
        path.unshift(curr);
        curr = parentMap.get(curr);
      }
      return describePath(path, people, relationships);
    }

    const neighbors = adj.get(current) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parentMap.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }

  return null; // No connection found
};

const describePath = (path: string[], people: Person[], relationships: Relationship[]): PathResult => {
  if (path.length < 2) return { path, relationshipDescription: "Self" };

  // Analyze the path steps to build a pattern string
  // U = Up (Child -> Parent)
  // D = Down (Parent -> Child)
  // S = Spouse
  let pattern = "";

  for (let i = 0; i < path.length - 1; i++) {
    const currentId = path[i];
    const nextId = path[i + 1];
    
    const rel = relationships.find(r => 
      (r.person1Id === currentId && r.person2Id === nextId) || 
      (r.person1Id === nextId && r.person2Id === currentId)
    );

    if (rel) {
      if (rel.type === RelationshipType.SPOUSE) {
        pattern += "S";
      } else if (rel.type === RelationshipType.PARENT) {
        // If current is person1 (Parent), we are going DOWN to child
        if (rel.person1Id === currentId) {
          pattern += "D";
        } else {
          // If current is person2 (Child), we are going UP to parent
          pattern += "U";
        }
      }
    }
  }

  // Dictionary of common patterns
  const descriptions: Record<string, string> = {
    // Direct
    "U": "Parent",
    "D": "Child",
    "S": "Spouse",
    
    // 2 Steps
    "UD": "Sibling", // Up to parent, Down to sibling
    "UU": "Grandparent",
    "DD": "Grandchild",
    "US": "Step-Parent", // Parent's spouse
    "SD": "Step-Child", // Spouse's child
    "SU": "Parent-in-Law", // Spouse's parent
    "DS": "Child-in-Law", // Child's spouse

    // 3 Steps
    "UUU": "Great-Grandparent",
    "DDD": "Great-Grandchild",
    "UUD": "Aunt/Uncle", // Up to parent, Up to G-parent, Down to Uncle
    "UDD": "Niece/Nephew", // Up to Parent, Down to Sibling, Down to Nephew
    "UUS": "Grandparent-in-Law", // Grandparent's spouse (Step-Grandparent)
    "SUD": "Brother/Sister-in-Law", // Spouse's sibling (Spouse -> Parent -> Child)
    "UDS": "Brother/Sister-in-Law", // Sibling's spouse (Parent -> Child -> Spouse) - Note: Wait, UD is sibling. UDS is sibling's spouse.

    // 4 Steps
    "UUDD": "First Cousin", // Up to GP, Down to Aunt/Uncle, Down to Cousin
    "UUUU": "Great-Great-Grandparent",
  };

  // Check exact match
  if (descriptions[pattern]) {
    return { path, relationshipDescription: descriptions[pattern] };
  }

  // Heuristic matches for deeper patterns
  if (pattern.match(/^U+$/)) {
    const generations = pattern.length;
    return { path, relationshipDescription: `${"Great-".repeat(generations - 2)}Grandparent` };
  }
  
  if (pattern.match(/^D+$/)) {
     const generations = pattern.length;
    return { path, relationshipDescription: `${"Great-".repeat(generations - 2)}Grandchild` };
  }

  // Great Aunt/Uncle: U-U-U-D (Parent -> GP -> GGP -> Great Uncle)
  if (pattern === "UUUD") return { path, relationshipDescription: "Great-Aunt/Uncle" };
  
  // Second Cousin: U-U-U-D-D-D (Common Great-Grandparent)
  // This gets complex quickly. 

  // Fallback: Human readable steps
  return { path, relationshipDescription: `${path.length - 1} degrees of separation` };
};
