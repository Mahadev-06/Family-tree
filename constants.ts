
import { Gender, Person, Relationship, RelationshipType } from './types';

// Helper to create relationships easily
const createRel = (p1: string, p2: string, type: RelationshipType, idSuffix: string): Relationship => ({
  id: `r_${idSuffix}`,
  person1Id: p1,
  person2Id: p2,
  type
});

export const SEED_PEOPLE: Person[] = [
  // ==========================================
  // ROOT GENERATION
  // ==========================================
  { id: 'root_f', firstName: 'Anapurna', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Anapurna&background=fce7f3&color=db2777', bio: 'Matriarch' },
  { id: 'root_m', firstName: 'S.Bayana', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=S+Bayana&background=dbeafe&color=2563eb', bio: 'Patriarch' },

  // ==========================================
  // BRANCH 1: S.Nagarathna & Jagannath
  // ==========================================
  { id: 'b1_f', firstName: 'S.Nagarathna', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=S+Nagarathna&background=fce7f3&color=db2777', bio: 'Daughter of Root' },
  { id: 'b1_m', firstName: 'Jagannath', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Jagannath&background=dbeafe&color=2563eb', bio: '' },

  // Children of B1
  { id: 'b1_c1', firstName: 'Rajesh', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Rajesh&background=dbeafe&color=2563eb', bio: '' },
  { id: 'b1_c1_s', firstName: 'Anima', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Anima&background=fce7f3&color=db2777', bio: '' },
  { id: 'b1_c1_gc1', firstName: 'Aarav', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Aarav&background=dbeafe&color=2563eb', bio: '' },

  { id: 'b1_c2', firstName: 'Rajeshwari', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Rajeshwari&background=fce7f3&color=db2777', bio: '' },
  { id: 'b1_c2_s', firstName: 'Rajdeep', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Rajdeep&background=dbeafe&color=2563eb', bio: '' },

  { id: 'b1_c3', firstName: 'Gandhi', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Gandhi&background=dbeafe&color=2563eb', bio: '' },

  { id: 'b1_c4', firstName: 'Purnima', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Purnima&background=fce7f3&color=db2777', bio: '' },
  { id: 'b1_c4_s', firstName: 'Manoj', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Manoj&background=dbeafe&color=2563eb', bio: '' },
  { id: 'b1_c4_gc1', firstName: 'Ishita', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Ishita&background=fce7f3&color=db2777', bio: '' },
  { id: 'b1_c4_gc2', firstName: 'Arpita', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Arpita&background=fce7f3&color=db2777', bio: '' },

  // ==========================================
  // BRANCH 2: S.Kanyakumari & S.Kumaraswami
  // ==========================================
  { id: 'b2_f', firstName: 'S.Kanyakumari', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=S+Kanyakumari&background=fce7f3&color=db2777', bio: 'Daughter of Root' },
  { id: 'b2_m', firstName: 'S.Kumaraswami', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=S+Kumaraswami&background=dbeafe&color=2563eb', bio: '' },

  // Children of B2
  { id: 'b2_c1', firstName: 'Nandini', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Nandini&background=fce7f3&color=db2777', bio: '' },
  { id: 'b2_c1_s', firstName: 'Prabhakar', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Prabhakar&background=dbeafe&color=2563eb', bio: '' },
  { id: 'b2_c1_gc1', firstName: 'Tanishk', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Tanishk&background=dbeafe&color=2563eb', bio: '' },
  { id: 'b2_c1_gc2', firstName: 'Sudiksha', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Sudiksha&background=fce7f3&color=db2777', bio: '' },

  { id: 'b2_c2', firstName: 'Swarnamanjari', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Swarnamanjari&background=fce7f3&color=db2777', bio: '' },
  { id: 'b2_c2_s', firstName: 'Santosh', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Santosh&background=dbeafe&color=2563eb', bio: '' },
  { id: 'b2_c2_gc1', firstName: 'Rushil', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Rushil&background=dbeafe&color=2563eb', bio: '' },

  { id: 'b2_c3', firstName: 'Sunaina', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Sunaina&background=fce7f3&color=db2777', bio: '' },

  { id: 'b2_c4', firstName: 'Soumyaranjan', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Soumyaranjan&background=dbeafe&color=2563eb', bio: '' },
  { id: 'b2_c4_s', firstName: 'Sumati', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Sumati&background=fce7f3&color=db2777', bio: '' },
  { id: 'b2_c4_gc1', firstName: 'Amar', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Amar&background=dbeafe&color=2563eb', bio: '' },
  { id: 'b2_c4_gc2', firstName: 'Aditya', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Aditya&background=dbeafe&color=2563eb', bio: '' },

  { id: 'b2_c5', firstName: 'Anil', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Anil&background=dbeafe&color=2563eb', bio: '' },
  { id: 'b2_c6', firstName: 'Akash', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Akash&background=dbeafe&color=2563eb', bio: '' },


  // ==========================================
  // BRANCH 3: B.Puspanjali & B.Dhabaleswara
  // ==========================================
  { id: 'b3_f', firstName: 'B.Puspanjali', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=B+Puspanjali&background=fce7f3&color=db2777', bio: 'Daughter of Root' },
  { id: 'b3_m', firstName: 'B.Dhabaleswara', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=B+Dhabaleswara&background=dbeafe&color=2563eb', bio: '' },

  // Children of B3
  { id: 'b3_c1', firstName: 'Swapnarani', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Swapnarani&background=fce7f3&color=db2777', bio: '' },
  { id: 'b3_c1_s', firstName: 'Srikrushna', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Srikrushna&background=dbeafe&color=2563eb', bio: '' },
  // Child of Swapnarani
  { id: 'b3_c1_gc1', firstName: 'Sunaina', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Sunaina&background=fce7f3&color=db2777', bio: '' },
  { id: 'b3_c1_gc1_s', firstName: 'Biranchi', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Biranchi&background=dbeafe&color=2563eb', bio: '' },
  // Children of Sunaina
  { id: 'b3_c1_ggc1', firstName: 'Baishnavi', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Baishnavi&background=fce7f3&color=db2777', bio: '' },
  { id: 'b3_c1_ggc2', firstName: 'Baishav', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Baishav&background=dbeafe&color=2563eb', bio: '' },

  { id: 'b3_c2', firstName: 'Muni', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Muni&background=fce7f3&color=db2777', bio: '' },
  { id: 'b3_c2_s', firstName: 'Satya', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Satya&background=dbeafe&color=2563eb', bio: '' },
  { id: 'b3_c2_gc1', firstName: 'Subhashree', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Subhashree&background=fce7f3&color=db2777', bio: '' },
  { id: 'b3_c2_gc2', firstName: 'Mahadev', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Mahadev&background=dbeafe&color=2563eb', bio: '' },

  { id: 'b3_c3', firstName: 'Priyambada', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Priyambada&background=fce7f3&color=db2777', bio: '' },
  { id: 'b3_c3_s', firstName: 'Tripati', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Tripati&background=dbeafe&color=2563eb', bio: '' },
  { id: 'b3_c3_gc1', firstName: 'Abhishek', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Abhishek&background=dbeafe&color=2563eb', bio: '' },
  { id: 'b3_c3_gc2', firstName: 'Bighnoraj', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Bighnoraj&background=dbeafe&color=2563eb', bio: '' },

  { id: 'b3_c4', firstName: 'Pragyani', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Pragyani&background=fce7f3&color=db2777', bio: '' },
  { id: 'b3_c4_s', firstName: 'Santosh', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Santosh&background=dbeafe&color=2563eb', bio: '' },
  { id: 'b3_c4_gc1', firstName: 'SaiNarayan', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=SaiNarayan&background=dbeafe&color=2563eb', bio: '' },
  { id: 'b3_c4_gc2', firstName: 'Nityashree', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Nityashree&background=fce7f3&color=db2777', bio: '' },


  // ==========================================
  // BRANCH 4: S.Saraswati & S.Chandramani
  // ==========================================
  { id: 'b4_f', firstName: 'S.Saraswati', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=S+Saraswati&background=fce7f3&color=db2777', bio: 'Daughter of Root' },
  { id: 'b4_m', firstName: 'S.Chandramani', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=S+Chandramani&background=dbeafe&color=2563eb', bio: '' },

  // Children of B4
  { id: 'b4_c1', firstName: 'Ch.Gitanjali', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Ch+Gitanjali&background=fce7f3&color=db2777', bio: '' },
  { id: 'b4_c1_s', firstName: 'Chidananda', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Chidananda&background=dbeafe&color=2563eb', bio: '' },
  // Children of Gitanjali
  { id: 'b4_c1_gc1', firstName: 'Archana', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Archana&background=fce7f3&color=db2777', bio: '' },
  { id: 'b4_c1_ggc1', firstName: 'Noorvi', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Noorvi&background=fce7f3&color=db2777', bio: '' },
  { id: 'b4_c1_ggc2', firstName: 'Poorvi', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Poorvi&background=fce7f3&color=db2777', bio: '' },
  
  { id: 'b4_c1_gc2', firstName: 'Bhabani', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=Bhabani&background=fce7f3&color=db2777', bio: '' },

  { id: 'b4_c1_gc3', firstName: 'Sibananda', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Sibananda&background=dbeafe&color=2563eb', bio: '' },
  { id: 'b4_c1_ggc3', firstName: 'Veer', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Veer&background=dbeafe&color=2563eb', bio: '' },

  { id: 'b4_c2', firstName: 'Ch.Dhabaleswara', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Ch+Dhabaleswara&background=dbeafe&color=2563eb', bio: '' },
  { id: 'b4_c3', firstName: 'S.Chabi', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=S+Chabi&background=dbeafe&color=2563eb', bio: 'Marked Male (Blue)' },
  { id: 'b4_c4', firstName: 'S.Shankara', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=S+Shankara&background=dbeafe&color=2563eb', bio: '' },
  
  { id: 'b4_c5', firstName: 'S.Sandhya', lastName: '', gender: Gender.FEMALE, photoUrl: 'https://ui-avatars.com/api/?name=S+Sandhya&background=fce7f3&color=db2777', bio: '' },
  { id: 'b4_c5_s', firstName: 'S.Mohan', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=S+Mohan&background=dbeafe&color=2563eb', bio: '' },
  { id: 'b4_c5_gc1', firstName: 'Ankit', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Ankit&background=dbeafe&color=2563eb', bio: '' },
  { id: 'b4_c5_gc2', firstName: 'Adarsh', lastName: '', gender: Gender.MALE, photoUrl: 'https://ui-avatars.com/api/?name=Adarsh&background=dbeafe&color=2563eb', bio: '' },
];

export const SEED_RELATIONSHIPS: Relationship[] = [
  // --- Root Couple ---
  createRel('root_m', 'root_f', RelationshipType.SPOUSE, 'root_sp'),

  // --- Connecting Root to 4 Daughters ---
  createRel('root_f', 'b1_f', RelationshipType.PARENT, 'r_b1'), // Anapurna -> Nagarathna
  createRel('root_f', 'b2_f', RelationshipType.PARENT, 'r_b2'), // Anapurna -> Kanyakumari
  createRel('root_f', 'b3_f', RelationshipType.PARENT, 'r_b3'), // Anapurna -> Puspanjali
  createRel('root_f', 'b4_f', RelationshipType.PARENT, 'r_b4'), // Anapurna -> Saraswati

  // ==========================================
  // BRANCH 1: Nagarathna
  // ==========================================
  createRel('b1_f', 'b1_m', RelationshipType.SPOUSE, 'b1_sp'), // Nagarathna - Jagannath

  // Rajesh & Anima
  createRel('b1_f', 'b1_c1', RelationshipType.PARENT, 'b1_c1_rel'),
  createRel('b1_c1', 'b1_c1_s', RelationshipType.SPOUSE, 'b1_c1_sp'),
  createRel('b1_c1', 'b1_c1_gc1', RelationshipType.PARENT, 'b1_c1_gc1_rel'), // Aarav

  // Rajeshwari & Rajdeep
  createRel('b1_f', 'b1_c2', RelationshipType.PARENT, 'b1_c2_rel'),
  createRel('b1_c2', 'b1_c2_s', RelationshipType.SPOUSE, 'b1_c2_sp'),
  
  // Gandhi
  createRel('b1_f', 'b1_c3', RelationshipType.PARENT, 'b1_c3_rel'),

  // Purnima & Manoj
  createRel('b1_f', 'b1_c4', RelationshipType.PARENT, 'b1_c4_rel'),
  createRel('b1_c4', 'b1_c4_s', RelationshipType.SPOUSE, 'b1_c4_sp'),
  createRel('b1_c4', 'b1_c4_gc1', RelationshipType.PARENT, 'b1_c4_gc1_rel'), // Ishita
  createRel('b1_c4', 'b1_c4_gc2', RelationshipType.PARENT, 'b1_c4_gc2_rel'), // Arpita


  // ==========================================
  // BRANCH 2: Kanyakumari
  // ==========================================
  createRel('b2_f', 'b2_m', RelationshipType.SPOUSE, 'b2_sp'),

  // Nandini & Prabhakar
  createRel('b2_f', 'b2_c1', RelationshipType.PARENT, 'b2_c1_rel'),
  createRel('b2_c1', 'b2_c1_s', RelationshipType.SPOUSE, 'b2_c1_sp'),
  createRel('b2_c1', 'b2_c1_gc1', RelationshipType.PARENT, 'b2_c1_gc1_rel'), // Tanishk
  createRel('b2_c1', 'b2_c1_gc2', RelationshipType.PARENT, 'b2_c1_gc2_rel'), // Sudiksha

  // Swarnamanjari & Santosh
  createRel('b2_f', 'b2_c2', RelationshipType.PARENT, 'b2_c2_rel'),
  createRel('b2_c2', 'b2_c2_s', RelationshipType.SPOUSE, 'b2_c2_sp'),
  createRel('b2_c2', 'b2_c2_gc1', RelationshipType.PARENT, 'b2_c2_gc1_rel'), // Rushil

  // Sunaina (Child)
  createRel('b2_f', 'b2_c3', RelationshipType.PARENT, 'b2_c3_rel'),

  // Soumyaranjan & Sumati
  createRel('b2_f', 'b2_c4', RelationshipType.PARENT, 'b2_c4_rel'),
  createRel('b2_c4', 'b2_c4_s', RelationshipType.SPOUSE, 'b2_c4_sp'),
  createRel('b2_c4', 'b2_c4_gc1', RelationshipType.PARENT, 'b2_c4_gc1_rel'), // Amar
  createRel('b2_c4', 'b2_c4_gc2', RelationshipType.PARENT, 'b2_c4_gc2_rel'), // Aditya

  // Anil & Akash
  createRel('b2_f', 'b2_c5', RelationshipType.PARENT, 'b2_c5_rel'),
  createRel('b2_f', 'b2_c6', RelationshipType.PARENT, 'b2_c6_rel'),


  // ==========================================
  // BRANCH 3: Puspanjali
  // ==========================================
  createRel('b3_f', 'b3_m', RelationshipType.SPOUSE, 'b3_sp'),

  // Swapnarani & Srikrushna
  createRel('b3_f', 'b3_c1', RelationshipType.PARENT, 'b3_c1_rel'),
  createRel('b3_c1', 'b3_c1_s', RelationshipType.SPOUSE, 'b3_c1_sp'),
  
  // Sunaina (Child of Swapnarani) & Biranchi
  createRel('b3_c1', 'b3_c1_gc1', RelationshipType.PARENT, 'b3_c1_gc1_rel'),
  createRel('b3_c1_gc1', 'b3_c1_gc1_s', RelationshipType.SPOUSE, 'b3_c1_gc1_sp'),
  createRel('b3_c1_gc1', 'b3_c1_ggc1', RelationshipType.PARENT, 'b3_c1_ggc1_rel'), // Baishnavi
  createRel('b3_c1_gc1', 'b3_c1_ggc2', RelationshipType.PARENT, 'b3_c1_ggc2_rel'), // Baishav

  // Muni & Satya
  createRel('b3_f', 'b3_c2', RelationshipType.PARENT, 'b3_c2_rel'),
  createRel('b3_c2', 'b3_c2_s', RelationshipType.SPOUSE, 'b3_c2_sp'),
  createRel('b3_c2', 'b3_c2_gc1', RelationshipType.PARENT, 'b3_c2_gc1_rel'), // Subhashree
  createRel('b3_c2', 'b3_c2_gc2', RelationshipType.PARENT, 'b3_c2_gc2_rel'), // Mahadev

  // Priyambada & Tripati
  createRel('b3_f', 'b3_c3', RelationshipType.PARENT, 'b3_c3_rel'),
  createRel('b3_c3', 'b3_c3_s', RelationshipType.SPOUSE, 'b3_c3_sp'),
  createRel('b3_c3', 'b3_c3_gc1', RelationshipType.PARENT, 'b3_c3_gc1_rel'), // Abhishek
  createRel('b3_c3', 'b3_c3_gc2', RelationshipType.PARENT, 'b3_c3_gc2_rel'), // Bighnoraj

  // Pragyani & Santosh
  createRel('b3_f', 'b3_c4', RelationshipType.PARENT, 'b3_c4_rel'),
  createRel('b3_c4', 'b3_c4_s', RelationshipType.SPOUSE, 'b3_c4_sp'),
  createRel('b3_c4', 'b3_c4_gc1', RelationshipType.PARENT, 'b3_c4_gc1_rel'), // SaiNarayan
  createRel('b3_c4', 'b3_c4_gc2', RelationshipType.PARENT, 'b3_c4_gc2_rel'), // Nityashree


  // ==========================================
  // BRANCH 4: Saraswati
  // ==========================================
  createRel('b4_f', 'b4_m', RelationshipType.SPOUSE, 'b4_sp'),

  // Gitanjali & Chidananda
  createRel('b4_f', 'b4_c1', RelationshipType.PARENT, 'b4_c1_rel'),
  createRel('b4_c1', 'b4_c1_s', RelationshipType.SPOUSE, 'b4_c1_sp'),
  
  // Children of Gitanjali
  createRel('b4_c1', 'b4_c1_gc1', RelationshipType.PARENT, 'b4_c1_gc1_rel'), // Archana
  createRel('b4_c1_gc1', 'b4_c1_ggc1', RelationshipType.PARENT, 'b4_c1_ggc1_rel'), // Noorvi
  createRel('b4_c1_gc1', 'b4_c1_ggc2', RelationshipType.PARENT, 'b4_c1_ggc2_rel'), // Poorvi

  createRel('b4_c1', 'b4_c1_gc2', RelationshipType.PARENT, 'b4_c1_gc2_rel'), // Bhabani

  createRel('b4_c1', 'b4_c1_gc3', RelationshipType.PARENT, 'b4_c1_gc3_rel'), // Sibananda
  createRel('b4_c1_gc3', 'b4_c1_ggc3', RelationshipType.PARENT, 'b4_c1_ggc3_rel'), // Veer

  // Other Children of Saraswati
  createRel('b4_f', 'b4_c2', RelationshipType.PARENT, 'b4_c2_rel'), // Ch.Dhabaleswara
  createRel('b4_f', 'b4_c3', RelationshipType.PARENT, 'b4_c3_rel'), // S.Chabi
  createRel('b4_f', 'b4_c4', RelationshipType.PARENT, 'b4_c4_rel'), // S.Shankara
  
  // S.Sandhya & S.Mohan
  createRel('b4_f', 'b4_c5', RelationshipType.PARENT, 'b4_c5_rel'),
  createRel('b4_c5', 'b4_c5_s', RelationshipType.SPOUSE, 'b4_c5_sp'),
  createRel('b4_c5', 'b4_c5_gc1', RelationshipType.PARENT, 'b4_c5_gc1_rel'), // Ankit
  createRel('b4_c5', 'b4_c5_gc2', RelationshipType.PARENT, 'b4_c5_gc2_rel'), // Adarsh
];
