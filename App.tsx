
import React, { useState, useMemo, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  NodeTypes,
  ReactFlowProvider
} from 'reactflow';

import { SEED_PEOPLE, SEED_RELATIONSHIPS } from './constants';
import { Gender, Person, Relationship, RelationshipType } from './types';
import { buildGraphData } from './services/graphLogic';
import { validateAndNormalizeGraph } from './services/relationshipService';
import PersonNode from './components/PersonNode';
import { DetailsPanel } from './components/DetailsPanel';
import { AddPersonModal, AddRelationshipType } from './components/AddPersonModal';
import { RelationshipModal } from './components/RelationshipModal';

const nodeTypes: NodeTypes = {
  personNode: PersonNode,
};

// Wrapper to provide React Flow context
const App = () => (
  <ReactFlowProvider>
    <AncestryApp />
  </ReactFlowProvider>
);

const AncestryApp = () => {
  // In a real production app with Firebase, these states would be synced with Firestore
  // We validate and normalize the seed data on initial load to ensure graph integrity (Rule 5)
  const [people, setPeople] = useState<Person[]>(SEED_PEOPLE);
  const [relationships, setRelationships] = useState<Relationship[]>(() => 
    validateAndNormalizeGraph(SEED_PEOPLE, SEED_RELATIONSHIPS)
  );
  
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);
  
  // Relationship Edit State
  const [relationshipToEdit, setRelationshipToEdit] = useState<{rel: Relationship, p1: Person, p2: Person} | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  
  // State to track the IDs of people in the calculated shortest path
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);

  const handleNodeClick = useCallback((person: Person) => {
    setSelectedPerson(person);
  }, []);

  // Recalculate graph when data changes or highlight path changes
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return buildGraphData(people, relationships, handleNodeClick, highlightedPath);
  }, [people, relationships, handleNodeClick, highlightedPath]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes whenever layout or highlight changes
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleAddPerson = (
    newPersonData: Omit<Person, 'id'>, 
    relatedToId: string, 
    relationType: string, 
    customLabel?: string,
    addUnknownParent?: boolean
  ) => {
    const newId = `p${Date.now()}`;
    const newPerson: Person = { id: newId, ...newPersonData };
    
    const newRels: Relationship[] = [];
    const newPeopleToAdd: Person[] = [newPerson];

    const createRelationship = (p1: string, p2: string, type: RelationshipType, label?: string) => ({
      id: `r${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      person1Id: p1,
      person2Id: p2,
      type,
      label
    });

    // relationType comes from the Modal as PARENT, CHILD, or SPOUSE (even if custom structure selected)
    // logic inside modal ensures we get a valid structural type here

    // Only create relationships if there is a person to relate to (not the first person)
    if (relatedToId) {
      if (relationType === AddRelationshipType.PARENT) {
         // New Person is Parent OF relatedToId
         newRels.push(createRelationship(newId, relatedToId, RelationshipType.PARENT, customLabel));
      } else if (relationType === AddRelationshipType.CHILD) {
         // relatedToId is Parent OF New Person
         newRels.push(createRelationship(relatedToId, newId, RelationshipType.PARENT, customLabel));
         
         // AUTO-LINK SPOUSE or create UNKNOWN Parent
         // We only do this automatically if it's a standard child relationship (no custom label)
         if (!customLabel) {
           const spouseRel = relationships.find(r => 
             r.type === RelationshipType.SPOUSE && 
             (r.person1Id === relatedToId || r.person2Id === relatedToId)
           );
           
           if (spouseRel) {
             // If spouse exists, link child to them too
             const spouseId = spouseRel.person1Id === relatedToId ? spouseRel.person2Id : spouseRel.person1Id;
             newRels.push(createRelationship(spouseId, newId, RelationshipType.PARENT, customLabel));
           } else if (addUnknownParent) {
             // Create Unknown Parent Node
             const unknownParentId = `p_${Date.now()}_u`;
             const relatedPerson = people.find(p => p.id === relatedToId);
             
             // Determine unknown parent gender (opposite of known parent, or other)
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
             
             newPeopleToAdd.push(unknownParent);
             
             // Link Unknown Parent -> Child
             newRels.push(createRelationship(unknownParentId, newId, RelationshipType.PARENT));
             
             // Link Known Parent <-> Unknown Parent (Spouse/Partner) to ensure they layout together
             newRels.push(createRelationship(relatedToId, unknownParentId, RelationshipType.SPOUSE, 'Partner'));
           }
         }
  
      } else {
         // Spouse
         newRels.push(createRelationship(newId, relatedToId, RelationshipType.SPOUSE, customLabel));
      }
    }

    setPeople([...people, ...newPeopleToAdd]);
    setRelationships([...relationships, ...newRels]);
  };

  const handleEditPerson = (updatedPerson: Person) => {
    setPeople(people.map(p => p.id === updatedPerson.id ? updatedPerson : p));
    // Also update selectedPerson if it's the one being edited
    if (selectedPerson && selectedPerson.id === updatedPerson.id) {
      setSelectedPerson(updatedPerson);
    }
  };

  const handleDeletePerson = useCallback((personId: string) => {
    // Deletion confirmation is handled in the AddPersonModal UI now
    setPeople(prev => prev.filter(p => p.id !== personId));
    setRelationships(prev => prev.filter(r => r.person1Id !== personId && r.person2Id !== personId));
    
    setIsModalOpen(false);
    setSelectedPerson(null);
  }, []);
  
  const handleUpdateRelationship = (updatedRel: Relationship) => {
    setRelationships(relationships.map(r => r.id === updatedRel.id ? updatedRel : r));
    setRelationshipToEdit(null);
  };

  const handleDeleteRelationship = useCallback((relId: string) => {
    setRelationships(prev => prev.filter(r => r.id !== relId));
    setRelationshipToEdit(null);
  }, []);
  
  const handleResetTree = useCallback(() => {
    if (window.confirm("Are you sure you want to delete the entire family tree? This action cannot be undone.")) {
      setPeople([]);
      setRelationships([]);
      setSelectedPerson(null);
      setHighlightedPath([]);
      setSearchQuery('');
    }
  }, []);

  const filteredPeople = useMemo(() => {
    if (!searchQuery) return [];
    return people.filter(p => 
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [people, searchQuery]);

  const handleCloseDetails = () => {
    setSelectedPerson(null);
    setHighlightedPath([]); // Clear highlight when closing panel
  };

  const handleOpenAddModal = () => {
    setPersonToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (person: Person) => {
    setPersonToEdit(person);
    setIsModalOpen(true);
  };

  const handleAddRelative = (personId: string) => {
    setPersonToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="h-full w-full flex flex-col relative">
      {/* Header / Toolbar */}
      <div className="absolute top-4 left-4 z-40 bg-white/90 backdrop-blur shadow-lg rounded-lg p-3 flex items-center gap-4 flex-wrap">
        <h1 className="text-xl font-bold text-primary mr-2">AncestryFlow</h1>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search family..." 
            className="border border-slate-300 rounded-full px-4 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none w-48"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {filteredPeople.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-md mt-1 border border-slate-100 overflow-hidden">
              {filteredPeople.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => { setSelectedPerson(p); setSearchQuery(''); }}
                  className="px-4 py-2 text-sm hover:bg-slate-50 cursor-pointer"
                >
                  {p.firstName} {p.lastName}
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={handleOpenAddModal}
          className="bg-secondary hover:bg-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
        >
          + Add Person
        </button>
        
        <button 
          onClick={handleResetTree}
          className="bg-white hover:bg-red-50 text-red-500 border border-red-200 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          title="Delete all data and start over"
        >
          New Tree
        </button>
      </div>
      
      {/* Empty State Guide (if no people) */}
      {people.length === 0 && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur p-8 rounded-2xl shadow-2xl text-center max-w-md pointer-events-auto">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Start Your Family Tree</h2>
            <p className="text-slate-600 mb-6">The canvas is empty. Add the first person to begin building your genealogy graph.</p>
            <button 
              onClick={handleOpenAddModal}
              className="bg-primary hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105"
            >
              Create First Person
            </button>
          </div>
        </div>
      )}

      {/* Main Graph Area */}
      <div className="flex-1 w-full h-full bg-slate-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onPaneClick={handleCloseDetails}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#cbd5e1" gap={20} />
          <Controls />
        </ReactFlow>
      </div>

      {/* Overlays */}
      {selectedPerson && (
        <DetailsPanel 
          person={selectedPerson} 
          allPeople={people}
          relationships={relationships}
          onClose={handleCloseDetails}
          onSelectPerson={setSelectedPerson}
          onPathChange={setHighlightedPath}
          onAddRelative={handleAddRelative}
          onEdit={handleOpenEditModal}
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
