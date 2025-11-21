
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch, 
  query, 
  where, 
  getDocs,
  FirestoreError 
} from 'firebase/firestore';
import { db } from './firebase';
import { Person, Relationship } from '../types';

const PEOPLE_COLLECTION = 'people';
const RELATIONSHIPS_COLLECTION = 'relationships';

/**
 * Subscribes to real-time updates for People and Relationships.
 * Includes error handling for permission issues.
 */
export const subscribeToTree = (
  onData: (people: Person[], relationships: Relationship[]) => void,
  onError?: (error: FirestoreError) => void
) => {
  if (!db) return () => {};

  let people: Person[] = [];
  let relationships: Relationship[] = [];
  let peopleLoaded = false;
  let relsLoaded = false;

  const checkAndCallback = () => {
    if (peopleLoaded && relsLoaded) {
      onData(people, relationships);
    }
  };

  const unsubPeople = onSnapshot(
    collection(db, PEOPLE_COLLECTION), 
    (snapshot) => {
      people = snapshot.docs.map(doc => doc.data() as Person);
      peopleLoaded = true;
      checkAndCallback();
    },
    (error) => {
      console.error("Firestore People Error:", error);
      if (onError) onError(error);
    }
  );

  const unsubRels = onSnapshot(
    collection(db, RELATIONSHIPS_COLLECTION), 
    (snapshot) => {
      relationships = snapshot.docs.map(doc => doc.data() as Relationship);
      relsLoaded = true;
      checkAndCallback();
    },
    (error) => {
      console.error("Firestore Relationships Error:", error);
      if (onError) onError(error);
    }
  );

  return () => {
    unsubPeople();
    unsubRels();
  };
};

/**
 * Adds a new person and their initial relationships in a batch.
 */
export const addPersonWithRelationships = async (person: Person, relationships: Relationship[]) => {
  if (!db) return;
  const batch = writeBatch(db);

  const personRef = doc(db, PEOPLE_COLLECTION, person.id);
  batch.set(personRef, person);

  relationships.forEach(rel => {
    const relRef = doc(db, RELATIONSHIPS_COLLECTION, rel.id);
    batch.set(relRef, rel);
  });

  await batch.commit();
};

/**
 * Updates an existing person.
 */
export const updatePerson = async (person: Person) => {
  if (!db) return;
  const personRef = doc(db, PEOPLE_COLLECTION, person.id);
  await setDoc(personRef, person, { merge: true });
};

/**
 * Deletes a person and all relationships connected to them.
 */
export const deletePerson = async (personId: string) => {
  if (!db) return;
  const batch = writeBatch(db);

  // Delete the person
  const personRef = doc(db, PEOPLE_COLLECTION, personId);
  batch.delete(personRef);

  // Find and delete all related relationships
  // Note: In a production app with high volume, this query strategy might need an index or cloud function.
  
  const q1 = query(collection(db, RELATIONSHIPS_COLLECTION), where("person1Id", "==", personId));
  const q2 = query(collection(db, RELATIONSHIPS_COLLECTION), where("person2Id", "==", personId));

  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

  snap1.forEach(doc => batch.delete(doc.ref));
  snap2.forEach(doc => batch.delete(doc.ref));

  await batch.commit();
};

/**
 * Adds or Updates a single relationship.
 */
export const saveRelationship = async (relationship: Relationship) => {
  if (!db) return;
  const relRef = doc(db, RELATIONSHIPS_COLLECTION, relationship.id);
  await setDoc(relRef, relationship);
};

/**
 * Deletes a single relationship.
 */
export const deleteRelationship = async (relId: string) => {
  if (!db) return;
  const relRef = doc(db, RELATIONSHIPS_COLLECTION, relId);
  await deleteDoc(relRef);
};

/**
 * Clears the entire database (Reset Tree).
 */
export const clearDatabase = async () => {
  if (!db) return;
  const batch = writeBatch(db);

  const peopleSnap = await getDocs(collection(db, PEOPLE_COLLECTION));
  peopleSnap.forEach(doc => batch.delete(doc.ref));

  const relSnap = await getDocs(collection(db, RELATIONSHIPS_COLLECTION));
  relSnap.forEach(doc => batch.delete(doc.ref));

  await batch.commit();
};

/**
 * Batch Import / Restore.
 */
export const importData = async (people: Person[], relationships: Relationship[]) => {
  if (!db) return;
  
  // Firestore batches are limited to 500 operations. 
  // For a simple implementation we'll do one batch.
  const batch = writeBatch(db);
  
  people.slice(0, 250).forEach(p => {
    batch.set(doc(db, PEOPLE_COLLECTION, p.id), p);
  });
  
  relationships.slice(0, 240).forEach(r => {
    batch.set(doc(db, RELATIONSHIPS_COLLECTION, r.id), r);
  });

  await batch.commit();
};
