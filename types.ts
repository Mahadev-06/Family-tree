
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum RelationshipType {
  PARENT = 'PARENT', // source is parent of target
  SPOUSE = 'SPOUSE', // source is spouse of target
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  gender: Gender;
  photoUrl: string;
  bio: string;
}

export interface Relationship {
  id: string;
  person1Id: string;
  person2Id: string;
  type: RelationshipType;
  label?: string; // Custom relationship label (e.g., "Friend", "Guardian")
}

// For React Flow
export interface FamilyNodeData {
  label: string;
  person: Person;
  isRoot?: boolean;
  onSelect: (person: Person) => void;
  isHighlighted?: boolean;
}

export interface PathResult {
  path: string[]; // Array of Person IDs
  relationshipDescription: string;
}