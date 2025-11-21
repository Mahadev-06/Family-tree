
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  NodeTypes,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';

import { SEED_PEOPLE, SEED_RELATIONSHIPS } from './constants';
import { Gender, Person, Relationship, RelationshipType } from './types';
import { buildGraphData } from './services/graphLogic';
import { validateAndNormalizeGraph } from './services/relationshipService';
import { isFirebaseConfigured } from './services/firebase';
import * as FirestoreService from './services/firestoreService';
import { subscribeToAuth, logout } from './services/authService';

import PersonNode from './components/PersonNode';
import { DetailsPanel } from './components/DetailsPanel';
import { AddPersonModal, AddRelationshipType } from './components/AddPersonModal';
import { RelationshipModal } from './components/RelationshipModal';
import { AuthPage } from './components/AuthPage';

const nodeTypes: NodeTypes = {
  personNode: PersonNode,
};

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Only check auth if we are in Cloud Mode
    if (!isFirebaseConfigured) {
      setAuthLoading(false);
      return;
    }
    
    const unsubscribe = subscribeToAuth((u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) {
     return (
       <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
         <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
         </svg>
       </div>
     );
  }

  // If configured for cloud but no user, show auth page
  if (isFirebaseConfigured && !user) {
    return <AuthPage />;
  }

  return (
    <ReactFlowProvider>
      <AncestryApp user={user} />
    </ReactFlowProvider>
  );
};

interface AncestryAppProps {
  user: any;
}

const AncestryApp: React.FC<AncestryAppProps> = ({ user }) => {
  const { fitView } = useReactFlow();
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  
  // State
  const [people, setPeople] = useState<Person[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);
  const [relationshipToEdit, setRelationshipToEdit] = useState<{rel: Relationship, p1: Person, p2: Person} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- DATA INITIALIZATION ---

  useEffect(() => {
    if (isFirebaseConfigured) {
      // CLOUD MODE: Subscribe to Firestore
      setIsLoading(true);
      setDbError(null);
      const unsubscribe = FirestoreService.subscribeToTree(
        (newPeople, newRels) => {
          setPeople(newPeople);
          // We still normalize locally for graph rendering (inferred edges), 
          // but we don't save inferred edges back to DB.
          setRelationships(validateAndNormalizeGraph(newPeople, newRels));
          setIsLoading(false);
          setDbError(null);
        },
        (error) => {
          setIsLoading(false);
          if (error.code === 'permission-denied') {
            setDbError("Permission Denied: Please update your Firestore Security Rules in the Firebase Console to 'allow read, write: if request.auth != null;'");
          } else {
            setDbError(`Connection Error: ${error.message}`);
          }
        }
      );
      return () => unsubscribe();
    } else {
      // LOCAL MODE: Load from LocalStorage or Seed
      try {
        const saved = localStorage.getItem('ancestry_people');
        const savedRels = localStorage.getItem('ancestry_relationships');
        
        if (saved) {
          const parsedPeople = JSON.parse(saved);
          if (Array.isArray(parsedPeople) && parsedPeople.length > 0) {
            setPeople(parsedPeople);
            const parsedRels = savedRels ? JSON.parse(savedRels) : [];
            setRelationships(validateAndNormalizeGraph(parsedPeople, parsedRels));
            setIsLoading(false);
            return;
          }
        }
        // Fallback to seed
        setPeople(SEED_PEOPLE);
        setRelationships(validateAndNormalizeGraph(SEED_PEOPLE, SEED_RELATIONSHIPS));
      } catch (e) {
        console.error("Load error", e);
        setPeople(SEED_PEOPLE);
        setRelationships(validateAndNormalizeGraph(SEED_PEOPLE, SEED_RELATIONSHIPS));
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  // --- PERSISTENCE (Only for Local Mode) ---
  useEffect(() => {
    if (!isFirebaseConfigured && !isLoading) {
      localStorage.setItem('ancestry_people', JSON.stringify(people));
      localStorage.setItem('ancestry_relationships', JSON.stringify(relationships)); // Note: saving normalized includes inferred, which is acceptable for local simple storage
    }
  }, [people, relationships, isLoading]);

  // --- HANDLERS ---

  const handleNodeClick = useCallback((person: Person) => {
    setSelectedPerson(person);
  }, []);

  // Recalculate graph layout
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return buildGraphData(people, relationships, handleNodeClick, highlightedPath);
  }, [people, relationships, handleNodeClick, highlightedPath]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Auto-fit view on data load
  useEffect(() => {
    if (people.length > 0 && !isLoading) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.2, duration: 800 });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [people.length, isLoading, fitView]);

  // ADD PERSON
  const handleAddPerson = async (
    newPersonData: Omit<Person, 'id'>, 
    relatedToId: string, 
    relationType: string, 
    customLabel?: string,
    addUnknownParent?: boolean
  ) => {
    const newId = `p${Date.now()}`;
    const newPerson: Person = { id: newId, ...newPersonData };
    
    const newRels: Relationship[] = [];
    const extraPeople: Person[] = [];

    const createRel = (p1: string, p2: string, type: RelationshipType, label?: string) => ({
      id: `r${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      person1Id: p1,
      person2Id: p2,
      type,
      label
    });

    if (relatedToId) {
      if (relationType === AddRelationshipType.PARENT) {
         newRels.push(createRel(newId, relatedToId, RelationshipType.PARENT, customLabel));
      } else if (relationType === AddRelationshipType.CHILD) {
         newRels.push(createRel(relatedToId, newId, RelationshipType.PARENT, customLabel));
         
         // Auto-spouse logic
         if (!customLabel) {
           const spouseRel = relationships.find(r => 
             r.type === RelationshipType.SPOUSE && 
             (r.person1Id === relatedToId || r.person2Id === relatedToId)
           );
           
           if (spouseRel) {
             const spouseId = spouseRel.person1Id === relatedToId ? spouseRel.person2Id : spouseRel.person1Id;
             newRels.push(createRel(spouseId, newId, RelationshipType.PARENT));
           } else if (addUnknownParent) {
             const unknownParentId = `p_${Date.now()}_u`;
             const relatedPerson = people.find(p => p.id === relatedToId);
             const unknownGender = relatedPerson?.gender === Gender.MALE ? Gender.FEMALE : 
                                   relatedPerson?.gender === Gender.FEMALE ? Gender.MALE : Gender.OTHER;
             
             const unknownParent: Person = {
               id: unknownParentId,
               firstName: 'Unknown',
               lastName: 'Parent',
               gender: unknownGender,
               birthDate: '',
               photoUrl: 'https://ui-avatars.com/api/?name=Unknown&background=cbd5e1&color=fff',
               bio: 'Placeholder parent created automatically.'
             };
             extraPeople.push(unknownParent);
             newRels.push(createRel(unknownParentId, newId, RelationshipType.PARENT));
             newRels.push(createRel(relatedToId, unknownParentId, RelationshipType.SPOUSE, 'Partner'));
           }
         }
      } else {
         newRels.push(createRel(newId, relatedToId, RelationshipType.SPOUSE, customLabel));
      }
    }

    if (isFirebaseConfigured) {
      // In cloud mode, we save each person. 
      // If extraPeople exists (unknown parent), we add them too.
      await FirestoreService.addPersonWithRelationships(newPerson, newRels);
      if (extraPeople.length > 0) {
        // Assuming simplified batch helper for single extra person. 
        // In a real scenario, merge these calls.
        for (const p of extraPeople) {
           await FirestoreService.addPersonWithRelationships(p, []); 
        }
      }
    } else {
      setPeople([...people, newPerson, ...extraPeople]);
      setRelationships([...relationships, ...newRels]);
    }
  };

  // UPDATE PERSON
  const handleEditPerson = async (updatedPerson: Person) => {
    if (isFirebaseConfigured) {
      await FirestoreService.updatePerson(updatedPerson);
      if (selectedPerson?.id === updatedPerson.id) setSelectedPerson(updatedPerson);
    } else {
      setPeople(people.map(p => p.id === updatedPerson.id ? updatedPerson : p));
      if (selectedPerson?.id === updatedPerson.id) setSelectedPerson(updatedPerson);
    }
  };

  // DELETE PERSON
  const handleDeletePerson = async (personId: string) => {
    if (isFirebaseConfigured) {
      await FirestoreService.deletePerson(personId);
      setIsModalOpen(false);
      setSelectedPerson(null);
    } else {
      setPeople(prev => prev.filter(p => p.id !== personId));
      setRelationships(prev => prev.filter(r => r.person1Id !== personId && r.person2Id !== personId));
      setIsModalOpen(false);
      setSelectedPerson(null);
    }
  };
  
  // UPDATE RELATIONSHIP
  const handleUpdateRelationship = async (updatedRel: Relationship) => {
    if (isFirebaseConfigured) {
      await FirestoreService.saveRelationship(updatedRel);
    } else {
      setRelationships(relationships.map(r => r.id === updatedRel.id ? updatedRel : r));
    }
    setRelationshipToEdit(null);
  };

  // DELETE RELATIONSHIP
  const handleDeleteRelationship = async (relId: string) => {
    if (isFirebaseConfigured) {
      await FirestoreService.deleteRelationship(relId);
    } else {
      setRelationships(prev => prev.filter(r => r.id !== relId));
    }
    setRelationshipToEdit(null);
  };
  
  // RESET
  const handleResetTree = async () => {
    if (window.confirm("Are you sure you want to clear the entire family tree? This cannot be undone.")) {
      if (isFirebaseConfigured) {
        await FirestoreService.clearDatabase();
      } else {
        setPeople([]);
        setRelationships([]);
        localStorage.removeItem('ancestry_people');
        localStorage.removeItem('ancestry_relationships');
      }
      setSelectedPerson(null);
      setHighlightedPath([]);
      setSearchQuery('');
    }
  };

  // RESTORE DEFAULTS
  const handleRestoreDefaults = async () => {
    if (window.confirm("Load demo data? This will overwrite current data.")) {
      if (isFirebaseConfigured) {
        // Clear then Import
        await FirestoreService.clearDatabase();
        await FirestoreService.importData(SEED_PEOPLE, SEED_RELATIONSHIPS);
      } else {
        setPeople(SEED_PEOPLE);
        setRelationships(validateAndNormalizeGraph(SEED_PEOPLE, SEED_RELATIONSHIPS));
      }
      setSelectedPerson(null);
      setHighlightedPath([]);
      setSearchQuery('');
    }
  };

  // IMPORT
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = event.target.files && event.target.files[0];
    if (!fileObj) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = e.target?.result as string;
        const json = JSON.parse(result);
        
        if (json && Array.isArray(json.people)) {
          const importedPeople = json.people;
          const importedRelationships = Array.isArray(json.relationships) ? json.relationships : [];

          if (window.confirm(`Load tree with ${importedPeople.length} people? This will overwrite current data.`)) {
             if (isFirebaseConfigured) {
                await FirestoreService.clearDatabase();
                await FirestoreService.importData(importedPeople, importedRelationships);
             } else {
                setPeople(importedPeople);
                setRelationships(validateAndNormalizeGraph(importedPeople, importedRelationships));
             }
             setSelectedPerson(null);
             setHighlightedPath([]);
          }
        } else {
          if (json.applets) {
             alert("Incorrect file type. Please upload the family tree JSON.");
          } else {
             alert("Invalid file format.");
          }
        }
      } catch (err) {
        console.error(err);
        alert("Failed to parse JSON.");
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(fileObj);
  };

  const handleExport = () => {
    // Filter out inferred relationships before export
    const cleanRels = relationships.filter(r => !r.id.startsWith('r_inferred_'));
    const dataStr = JSON.stringify({ people, relationships: cleanRels }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `ancestry-backup-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const filteredPeople = useMemo(() => {
    if (!searchQuery) return [];
    return people.filter(p => 
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [people, searchQuery]);

  return (
    <div className="h-full w-full flex flex-col relative">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/json" className="hidden" />

      {/* HEADER */}
      {people.length > 0 && (
        <div className="absolute top-4 left-4 z-40 bg-white/90 backdrop-blur shadow-lg rounded-lg p-2 flex items-center gap-3 flex-wrap pr-4">
          <div className="flex items-center px-2 border-r border-slate-200 mr-2">
             <h1 className="text-xl font-bold text-primary">AncestryFlow</h1>
          </div>
          
          {/* SEARCH */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search family..." 
              className="border border-slate-300 rounded-full px-4 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none w-48 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {filteredPeople.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-md mt-1 border border-slate-100 overflow-hidden">
                {filteredPeople.map(p => (
                  <div key={p.id} onClick={() => { setSelectedPerson(p); setSearchQuery(''); }} className="px-4 py-2 text-sm hover:bg-slate-50 cursor-pointer">
                    {p.firstName} {p.lastName}
                  </div>
                ))}
              </div>
            )}
          </div>
  
          <div className="h-6 w-px bg-slate-300 mx-1"></div>
  
          {/* ACTIONS */}
          <div className="flex items-center space-x-2">
            <button onClick={handleExport} className="p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-md" title="Export">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-md" title="Import">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            </button>
          </div>
          
          <div className="h-6 w-px bg-slate-300 mx-1"></div>
          <button onClick={handleResetTree} className="text-slate-500 hover:text-red-600 hover:bg-slate-50 px-3 py-1.5 rounded-md text-xs font-medium transition-colors">Clear</button>
          
          {user && (
             <>
                <div className="h-6 w-px bg-slate-300 mx-1"></div>
                <button onClick={() => logout()} className="text-slate-500 hover:text-slate-800 hover:bg-slate-50 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center">
                  Logout
                </button>
             </>
          )}
        </div>
      )}

      {/* DATABASE ERROR BANNER */}
      {dbError && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[60] bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg shadow-xl max-w-lg text-center animate-bounce-in">
          <div className="flex items-center justify-center mb-2 text-red-500">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <strong className="font-bold block text-lg mb-1">Database Connection Issue</strong>
          <span className="block sm:inline text-sm mb-2">{dbError}</span>
          <div className="mt-3 text-xs bg-white p-2 rounded border border-red-100 text-slate-500 font-mono text-left">
            match /databases/&#123;database&#125;/documents &#123;<br/>
            &nbsp;&nbsp;match /&#123;document=**&#125; &#123;<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;allow read, write: if request.auth != null;<br/>
            &nbsp;&nbsp;&#125;<br/>
            &#125;
          </div>
        </div>
      )}
      
      {/* EMPTY STATE */}
      {people.length === 0 && !isLoading && !dbError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none bg-slate-50/50">
          <div className="bg-white/90 backdrop-blur p-8 rounded-2xl shadow-2xl text-center max-w-md pointer-events-auto border border-white/20">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Start Your Family Tree</h2>
            <p className="text-slate-600 mb-6">
              {isFirebaseConfigured ? "Connected to Cloud Database." : "Using Local Storage."}
              <br/>Create your first family member.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={() => { setPersonToEdit(null); setIsModalOpen(true); }} className="bg-primary hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105">
                Create First Person
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105">
                Import JSON
              </button>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200">
               <p className="text-xs text-slate-500 mb-2">Just testing?</p>
               <button onClick={handleRestoreDefaults} className="text-xs text-primary hover:text-indigo-700 font-semibold underline">Load Demo Data</button>
            </div>
          </div>
        </div>
      )}

      {/* LOADING */}
      {isLoading && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-white">
            <div className="flex flex-col items-center">
               <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               <p className="text-slate-500 font-medium">Loading family tree...</p>
            </div>
         </div>
      )}

      {/* GRAPH */}
      <div className="flex-1 w-full h-full bg-slate-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onPaneClick={() => { setSelectedPerson(null); setHighlightedPath([]); }}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.05}
          maxZoom={2}
        >
          <Background color="#cbd5e1" gap={20} />
          <Controls />
        </ReactFlow>
      </div>

      {/* OVERLAYS */}
      {selectedPerson && (
        <DetailsPanel 
          person={selectedPerson} 
          allPeople={people}
          relationships={relationships}
          onClose={() => { setSelectedPerson(null); setHighlightedPath([]); }}
          onSelectPerson={setSelectedPerson}
          onPathChange={setHighlightedPath}
          onAddRelative={(pid) => { setPersonToEdit(null); setIsModalOpen(true); }}
          onEdit={(p) => { setPersonToEdit(p); setIsModalOpen(true); }}
          onEditRelationship={(rel, p1, p2) => setRelationshipToEdit({ rel, p1, p2 })}
        />
      )}

      {isModalOpen && (
        <AddPersonModal 
          existingPeople={people}
          relationships={relationships}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddPerson}
          onEdit={handleEditPerson}
          onDelete={handleDeletePerson}
          initialRelatedToId={selectedPerson?.id}
          personToEdit={personToEdit}
        />
      )}
      
      {relationshipToEdit && (
        <RelationshipModal 
          relationship={relationshipToEdit.rel}
          person1={relationshipToEdit.p1}
          person2={relationshipToEdit.p2}
          onClose={() => setRelationshipToEdit(null)}
          onUpdate={handleUpdateRelationship}
          onDelete={handleDeleteRelationship}
        />
      )}
    </div>
  );
};

export default App;
