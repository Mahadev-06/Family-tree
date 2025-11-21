
import React, { useState } from 'react';
import { Gender, Person, Relationship, RelationshipType } from '../types';

interface RelationshipModalProps {
  relationship: Relationship;
  person1: Person; // The person currently being viewed or the first person in the pair
  person2: Person; // The related person
  onClose: () => void;
  onUpdate: (updatedRel: Relationship) => void;
  onDelete: (relId: string) => void;
}

export const RelationshipModal: React.FC<RelationshipModalProps> = ({
  relationship,
  person1,
  person2,
  onClose,
  onUpdate,
  onDelete
}) => {
  // Initialize state based on existing relationship properties
  const [type, setType] = useState<RelationshipType>(relationship.type);
  
  // For PARENT type, determine who is the parent.
  // Initial state: check if person1 is the parent in the current relationship
  const [isPerson1Parent, setIsPerson1Parent] = useState(
    relationship.type === RelationshipType.PARENT && relationship.person1Id === person1.id
  );
  
  const [customLabel, setCustomLabel] = useState(relationship.label || '');
  const [isCustom, setIsCustom] = useState(!!relationship.label);

  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = () => {
    let newP1 = relationship.person1Id;
    let newP2 = relationship.person2Id;
    const finalLabel = isCustom ? customLabel : undefined;

    if (type === RelationshipType.PARENT) {
      if (isPerson1Parent) {
        // P1 is Parent of P2
        newP1 = person1.id;
        newP2 = person2.id;
      } else {
        // P2 is Parent of P1
        newP1 = person2.id;
        newP2 = person1.id;
      }
    } else {
      // Spouse - order doesn't strictly matter for graph, but we keep consistent
      newP1 = person1.id;
      newP2 = person2.id;
    }

    onUpdate({
      ...relationship,
      type,
      person1Id: newP1,
      person2Id: newP2,
      label: finalLabel
    });
    onClose();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(relationship.id);
  };

  // Helpers for Dynamic Labels
  const p1Gender = person1.gender;
  const p1IsMale = p1Gender === Gender.MALE;
  const p1IsFemale = p1Gender === Gender.FEMALE;

  // We model the selection as "What is Person 1's role relative to Person 2?"
  const currentRoleValue = (() => {
    if (isCustom) return 'CUSTOM';
    if (type === RelationshipType.SPOUSE) return 'SPOUSE';
    if (type === RelationshipType.PARENT) {
      return isPerson1Parent ? 'PARENT' : 'CHILD';
    }
    return 'SPOUSE';
  })();

  const handleRoleChange = (val: string) => {
    if (val === 'CUSTOM') {
      setIsCustom(true);
      // Default structural type if switching to custom
      if (!customLabel) setCustomLabel('Friend');
      return;
    }

    setIsCustom(false);
    if (val === 'PARENT') {
      setType(RelationshipType.PARENT);
      setIsPerson1Parent(true);
    } else if (val === 'CHILD') {
      setType(RelationshipType.PARENT);
      setIsPerson1Parent(false);
    } else {
      setType(RelationshipType.SPOUSE);
    }
  };
  
  const handleCustomStructureChange = (val: string) => {
     if (val === 'PARENT') {
      setType(RelationshipType.PARENT);
      setIsPerson1Parent(true);
    } else if (val === 'CHILD') {
      setType(RelationshipType.PARENT);
      setIsPerson1Parent(false);
    } else {
      setType(RelationshipType.SPOUSE);
    }
  };
  
  const getCustomStructureValue = () => {
    if (type === RelationshipType.SPOUSE) return 'SPOUSE';
    if (type === RelationshipType.PARENT) return isPerson1Parent ? 'PARENT' : 'CHILD';
    return 'SPOUSE';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Relationship</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" type="button">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between">
            <div className="text-center w-1/3">
              <div className="font-bold text-sm">{person1.firstName}</div>
              <div className="text-[10px] text-slate-500">{person1.gender}</div>
            </div>
            <div className="text-slate-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            </div>
             <div className="text-center w-1/3">
              <div className="font-bold text-sm">{person2.firstName}</div>
              <div className="text-[10px] text-slate-500">{person2.gender}</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              How is <span className="text-primary">{person1.firstName}</span> related to {person2.firstName}?
            </label>
            <select 
              className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
              value={currentRoleValue}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              <option value="PARENT">
                {p1IsMale ? 'Father' : p1IsFemale ? 'Mother' : 'Parent'}
              </option>
              <option value="CHILD">
                {p1IsMale ? 'Son' : p1IsFemale ? 'Daughter' : 'Child'}
              </option>
              <option value="SPOUSE">
                {p1IsMale ? 'Husband' : p1IsFemale ? 'Wife' : 'Partner'}
              </option>
              <option value="CUSTOM">
                 Custom / Other...
              </option>
            </select>
            
            {isCustom && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-md space-y-3">
                 <div>
                   <label className="block text-xs font-bold text-slate-700 mb-1">Label (e.g. "Guardian")</label>
                   <input 
                     type="text"
                     className="w-full border rounded px-2 py-1.5 text-sm"
                     value={customLabel}
                     onChange={(e) => setCustomLabel(e.target.value)}
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-700 mb-1">Structural Role</label>
                   <select
                     className="w-full border rounded px-2 py-1.5 text-sm bg-white"
                     value={getCustomStructureValue()}
                     onChange={(e) => handleCustomStructureChange(e.target.value)}
                   >
                     <option value="PARENT">Parent-like (Above)</option>
                     <option value="CHILD">Child-like (Below)</option>
                     <option value="SPOUSE">Peer / Partner (Same Level)</option>
                   </select>
                 </div>
              </div>
            )}
            
            {!isCustom && (
              <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded">
                {currentRoleValue === 'PARENT' && (
                  <span><strong>{person1.firstName}</strong> is the {p1IsMale ? 'father' : p1IsFemale ? 'mother' : 'parent'} of {person2.firstName}.</span>
                )}
                {currentRoleValue === 'CHILD' && (
                  <span><strong>{person1.firstName}</strong> is the {p1IsMale ? 'son' : p1IsFemale ? 'daughter' : 'child'} of {person2.firstName}.</span>
                )}
                {currentRoleValue === 'SPOUSE' && (
                  <span><strong>{person1.firstName}</strong> is the {p1IsMale ? 'husband' : p1IsFemale ? 'wife' : 'spouse'} of {person2.firstName}.</span>
                )}
              </p>
            )}
          </div>

          <div className="pt-4 border-t">
            {!isDeleting ? (
              <div className="flex justify-between items-center">
                <button 
                  type="button"
                  onClick={() => setIsDeleting(true)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-100 transition-colors flex items-center text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  Delete Relationship
                </button>

                <div className="space-x-3 flex">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded text-sm">Cancel</button>
                  <button type="button" onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded hover:bg-indigo-700 text-sm">Save</button>
                </div>
              </div>
            ) : (
               <div className="w-full flex flex-col sm:flex-row items-center justify-between bg-red-50 p-3 rounded-md border border-red-100">
                 <span className="text-sm text-red-800 font-medium mb-2 sm:mb-0">Are you sure you want to delete?</span>
                 <div className="flex space-x-3">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDeleting(false);
                      }}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={handleDelete}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 shadow-sm"
                    >
                      Yes, Delete
                    </button>
                 </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};