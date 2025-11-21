
import { Person, Relationship, RelationshipType, PathResult, Gender } from '../types';

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

// Helper for gendered terms
const getGenderedTerm = (base: string, gender: Gender): string => {
  switch (base) {
    case "Sibling": return gender === Gender.MALE ? "Brother" : gender === Gender.FEMALE ? "Sister" : "Sibling";
    case "Parent": return gender === Gender.MALE ? "Father" : gender === Gender.FEMALE ? "Mother" : "Parent";
    case "Child": return gender === Gender.MALE ? "Son" : gender === Gender.FEMALE ? "Daughter" : "Child";
    case "Grandparent": return gender === Gender.MALE ? "Grandfather" : gender === Gender.FEMALE ? "Grandmother" : "Grandparent";
    case "Grandchild": return gender === Gender.MALE ? "Grandson" : gender === Gender.FEMALE ? "Granddaughter" : "Grandchild";
    case "Great-Grandparent": return gender === Gender.MALE ? "Great-Grandfather" : gender === Gender.FEMALE ? "Great-Grandmother" : "Great-Grandparent";
    case "Great-Grandchild": return gender === Gender.MALE ? "Great-Grandson" : gender === Gender.FEMALE ? "Great-Granddaughter" : "Great-Grandchild";
    case "Aunt/Uncle": return gender === Gender.MALE ? "Uncle" : gender === Gender.FEMALE ? "Aunt" : "Aunt/Uncle";
    case "Niece/Nephew": return gender === Gender.MALE ? "Nephew" : gender === Gender.FEMALE ? "Niece" : "Niece/Nephew";
    case "Great-Aunt/Uncle": return gender === Gender.MALE ? "Great-Uncle" : gender === Gender.FEMALE ? "Great-Aunt" : "Great-Aunt/Uncle";
    case "Great-Niece/Nephew": return gender === Gender.MALE ? "Great-Nephew" : gender === Gender.FEMALE ? "Great-Niece" : "Great-Niece/Nephew";
    case "Step-Parent": return gender === Gender.MALE ? "Step-Father" : gender === Gender.FEMALE ? "Step-Mother" : "Step-Parent";
    case "Step-Child": return gender === Gender.MALE ? "Step-Son" : gender === Gender.FEMALE ? "Step-Daughter" : "Step-Child";
    case "Spouse": return gender === Gender.MALE ? "Husband" : gender === Gender.FEMALE ? "Wife" : "Spouse";
    case "Parent-in-Law": return gender === Gender.MALE ? "Father-in-Law" : gender === Gender.FEMALE ? "Mother-in-Law" : "Parent-in-Law";
    case "Child-in-Law": return gender === Gender.MALE ? "Son-in-Law" : gender === Gender.FEMALE ? "Daughter-in-Law" : "Child-in-Law";
    case "Brother/Sister-in-Law": return gender === Gender.MALE ? "Brother-in-Law" : gender === Gender.FEMALE ? "Sister-in-Law" : "Sibling-in-Law";
    case "Aunt/Uncle-in-Law": return gender === Gender.MALE ? "Uncle-in-Law" : gender === Gender.FEMALE ? "Aunt-in-Law" : "Aunt/Uncle-in-Law";
    default: return base;
  }
};

const describePath = (path: string[], people: Person[], relationships: Relationship[]): PathResult => {
  if (path.length < 2) return { path, relationshipDescription: "Self" };

  // Determine target gender for correct terminology (Brother vs Sister, etc.)
  const targetId = path[path.length - 1];
  const targetPerson = people.find(p => p.id === targetId);
  const targetGender = targetPerson?.gender || Gender.MALE; 

  const getTerm = (base: string) => getGenderedTerm(base, targetGender);

  // Build Pattern String (U=Up/Parent, D=Down/Child, S=Spouse)
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

  // --- Pattern Matching ---

  // 1. Simple Direct Matches
  if (pattern === "S") return { path, relationshipDescription: getTerm("Spouse") };
  
  // 2. Blood Relatives (Up... Down...)
  // Regex: ^U*D*$ (U followed by D, including zero of either, but total length > 0)
  const bloodMatch = pattern.match(/^(U*)(D*)$/);
  
  if (bloodMatch) {
    const upCount = bloodMatch[1].length;
    const downCount = bloodMatch[2].length;

    // Direct Line Ascending (Parents, Grandparents...)
    if (downCount === 0) {
      if (upCount === 1) return { path, relationshipDescription: getTerm("Parent") };
      if (upCount === 2) return { path, relationshipDescription: getTerm("Grandparent") };
      if (upCount === 3) return { path, relationshipDescription: getTerm("Great-Grandparent") };
      if (upCount > 3) return { path, relationshipDescription: `${"Great-".repeat(upCount - 2)}Grandparent` };
    }

    // Direct Line Descending (Children, Grandchildren...)
    if (upCount === 0) {
      if (downCount === 1) return { path, relationshipDescription: getTerm("Child") };
      if (downCount === 2) return { path, relationshipDescription: getTerm("Grandchild") };
      if (downCount === 3) return { path, relationshipDescription: getTerm("Great-Grandchild") };
      if (downCount > 3) return { path, relationshipDescription: `${"Great-".repeat(downCount - 2)}Grandchild` };
    }

    // Siblings / Nieces / Nephews / Cousins (Up then Down)
    if (upCount > 0 && downCount > 0) {
      // Sibling (share 1 parent)
      if (upCount === 1 && downCount === 1) return { path, relationshipDescription: getTerm("Sibling") };

      // Niece/Nephew (Sibling's child)
      if (upCount === 1 && downCount > 1) {
        const greats = downCount - 2; // D=2 -> Niece, D=3 -> Great-Niece
        if (greats === 0) return { path, relationshipDescription: getTerm("Niece/Nephew") };
        return { path, relationshipDescription: getTerm("Great-Niece/Nephew") };
      }

      // Aunt/Uncle (Parent's sibling)
      if (upCount > 1 && downCount === 1) {
        const greats = upCount - 2; // U=2 -> Aunt, U=3 -> Great-Aunt
        if (greats === 0) return { path, relationshipDescription: getTerm("Aunt/Uncle") };
        return { path, relationshipDescription: getTerm("Great-Aunt/Uncle") };
      }

      // Cousins
      // Degree = min(up, down) - 1.
      // Removed = abs(up - down).
      const degree = Math.min(upCount, downCount) - 1;
      const removed = Math.abs(upCount - downCount);
      
      if (degree >= 1) {
        const degreeStr = degree === 1 ? "First" : degree === 2 ? "Second" : degree === 3 ? "Third" : `${degree}th`;
        const removedStr = removed === 0 ? "" : removed === 1 ? " Once Removed" : removed === 2 ? " Twice Removed" : ` ${removed} Times Removed`;
        return { path, relationshipDescription: `${degreeStr} Cousin${removedStr}` };
      }
    }
  }

  // 3. In-Laws (involving S)
  
  // Spouse of Relative (ends with S) -> e.g. My Brother's Wife
  if (pattern.endsWith("S")) {
    const subPattern = pattern.slice(0, -1);
    const bloodMatch = subPattern.match(/^(U*)(D*)$/);
    
    if (bloodMatch) {
      const upCount = bloodMatch[1].length;
      const downCount = bloodMatch[2].length;
      
      if (upCount === 0 && downCount === 1) return { path, relationshipDescription: getTerm("Child-in-Law") };
      if (upCount === 1 && downCount === 1) return { path, relationshipDescription: getTerm("Brother/Sister-in-Law") }; // Sibling's spouse
      if (upCount > 1 && downCount === 1) return { path, relationshipDescription: getTerm("Aunt/Uncle-in-Law") }; // Aunt's spouse
    }
  }

  // Relative of Spouse (starts with S) -> e.g. My Wife's Brother
  if (pattern.startsWith("S")) {
    const subPattern = pattern.slice(1);
    const bloodMatch = subPattern.match(/^(U*)(D*)$/);

    if (bloodMatch) {
      const upCount = bloodMatch[1].length;
      const downCount = bloodMatch[2].length;
      
      if (upCount === 1 && downCount === 0) return { path, relationshipDescription: getTerm("Parent-in-Law") };
      if (upCount === 1 && downCount === 1) return { path, relationshipDescription: getTerm("Brother/Sister-in-Law") }; // Spouse's sibling
    }
  }
  
  // Step-Relatives (Parent -> Spouse -> Child) => U S D
  if (pattern === "US") return { path, relationshipDescription: getTerm("Step-Parent") };
  if (pattern === "SD") return { path, relationshipDescription: getTerm("Step-Child") }; 
  if (pattern === "USD") return { path, relationshipDescription: "Step-Sibling" }; 

  // Fallback for very complex paths
  return { path, relationshipDescription: `${path.length - 1} degrees of separation` };
};
