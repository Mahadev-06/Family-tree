
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Gender, Person, Relationship, RelationshipType } from '../types';

interface AddPersonModalProps {
  onClose: () => void;
  onAdd: (person: Omit<Person, 'id'>, relatedTo: string, relationType: string, customLabel?: string, addUnknownParent?: boolean) => void;
  onEdit?: (person: Person) => void;
  onDelete?: (personId: string) => void;
  existingPeople: Person[];
  relationships: Relationship[];
  initialRelatedToId?: string;
  personToEdit?: Person | null;
}

export enum AddRelationshipType {
  PARENT = 'PARENT', // New person is Parent of Selected
  SPOUSE = 'SPOUSE', // New person is Spouse of Selected
  CHILD = 'CHILD',   // New person is Child of Selected
  CUSTOM = 'CUSTOM'  // Custom relationship
}

interface RelationshipOption {
  id: string;
  label: string;
  type: AddRelationshipType;
  gender: Gender | null; // null means gender neutral
}

const RELATIONSHIP_OPTIONS: RelationshipOption[] = [
  { id: 'FATHER', label: 'Father', type: AddRelationshipType.PARENT, gender: Gender.MALE },
  { id: 'MOTHER', label: 'Mother', type: AddRelationshipType.PARENT, gender: Gender.FEMALE },
  { id: 'PARENT', label: 'Parent', type: AddRelationshipType.PARENT, gender: null },

  { id: 'SON', label: 'Son', type: AddRelationshipType.CHILD, gender: Gender.MALE },
  { id: 'DAUGHTER', label: 'Daughter', type: AddRelationshipType.CHILD, gender: Gender.FEMALE },
  { id: 'CHILD', label: 'Child', type: AddRelationshipType.CHILD, gender: null },

  { id: 'HUSBAND', label: 'Husband', type: AddRelationshipType.SPOUSE, gender: Gender.MALE },
  { id: 'WIFE', label: 'Wife', type: AddRelationshipType.SPOUSE, gender: Gender.FEMALE },
  { id: 'PARTNER', label: 'Partner', type: AddRelationshipType.SPOUSE, gender: null },
  
  { id: 'CUSTOM', label: 'Custom...', type: AddRelationshipType.CUSTOM, gender: null },
];

const resizeAndConvertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 600; // Resize to max 600px to save space

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality JPEG
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const AddPersonModal: React.FC<AddPersonModalProps> = ({ 
  onClose, 
  onAdd, 
  onEdit,
  onDelete,
  existingPeople, 
  relationships,
  initialRelatedToId,
  personToEdit 
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [birthDate, setBirthDate] = useState('');
  const [bio, setBio] = useState('');
  
  // Connection state (only used for Adding)
  const [relatedTo, setRelatedTo] = useState(existingPeople[0]?.id || '');
  const [relationType, setRelationType] = useState<AddRelationshipType>(AddRelationshipType.CHILD);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('SON'); // Default role
  
  // Custom relationship state
  const [customLabel, setCustomLabel] = useState('');
  const [customStructure, setCustomStructure] = useState<AddRelationshipType>(AddRelationshipType.SPOUSE);

  // Unknown parent state
  const [createUnknownParent, setCreateUnknownParent] = useState(false);

  // Delete confirmation state
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if this is the very first person in the tree
  const isFirstPerson = existingPeople.length === 0 && !personToEdit;

  // Load data if editing
  useEffect(() => {
    if (personToEdit) {
      setFirstName(personToEdit.firstName);
      setLastName(personToEdit.lastName);
      setGender(personToEdit.gender);
      setBirthDate(personToEdit.birthDate || '');
      setBio(personToEdit.bio || '');
    } else {
      // Reset or set defaults for new add
      setFirstName('');
      setLastName('');
      setGender(Gender.MALE);
      setBirthDate('');
      setBio('');
      // Reset relationship defaults
      setSelectedRoleId('SON'); 
      setRelationType(AddRelationshipType.CHILD);
      setCustomLabel('');
      setCustomStructure(AddRelationshipType.SPOUSE);
      setCreateUnknownParent(false);
      
      if (initialRelatedToId) {
        setRelatedTo(initialRelatedToId);
      } else if (existingPeople.length > 0) {
        setRelatedTo(existingPeople[0].id);
      }
    }
    setIsDeleting(false); // Reset delete state when opening/changing person
  }, [personToEdit, initialRelatedToId, existingPeople]);

  // Reset createUnknownParent when related person changes
  useEffect(() => {
    setCreateUnknownParent(false);
  }, [relatedTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    let photoUrl = personToEdit?.photoUrl || `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`;
    
    try {
      if (fileInputRef.current?.files?.[0]) {
        // Convert to Base64 for persistence
        photoUrl = await resizeAndConvertToBase64(fileInputRef.current.files[0]);
      }

      const personData = {
        firstName,
        lastName,
        gender,
        birthDate,
        bio,
        photoUrl
      };

      if (personToEdit && onEdit) {
        onEdit({
          ...personToEdit,
          ...personData
        });
      } else {
        let finalRelationType = relationType;
        let finalLabel = undefined;

        if (relationType === AddRelationshipType.CUSTOM) {
          finalRelationType = customStructure;
          finalLabel = customLabel;
        }
        
        // If first person, relatedTo might be empty, which is fine
        onAdd(personData, relatedTo, finalRelationType, finalLabel, createUnknownParent);
      }
      
      onClose();
    } catch (error) {
      console.error("Error saving person:", error);
      alert("Failed to save person. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Relationship Role Change
  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    const role = RELATIONSHIP_OPTIONS.find(r => r.id === roleId);
    if (role) {
      setRelationType(role.type);
    }
  };

  // Handle Gender Change
  const handleGenderChange = (newGender: Gender) => {
    setGender(newGender);
    
    if (!personToEdit && relationType !== AddRelationshipType.CUSTOM && !isFirstPerson) {
      if (newGender === Gender.FEMALE) {
        if (['FATHER', 'PARENT'].includes(selectedRoleId)) handleRoleChange('MOTHER');
        if (['SON', 'CHILD'].includes(selectedRoleId)) handleRoleChange('DAUGHTER');
        if (['HUSBAND', 'PARTNER'].includes(selectedRoleId)) handleRoleChange('WIFE');
      } else if (newGender === Gender.MALE) {
        if (['MOTHER', 'PARENT'].includes(selectedRoleId)) handleRoleChange('FATHER');
        if (['DAUGHTER', 'CHILD'].includes(selectedRoleId)) handleRoleChange('SON');
        if (['WIFE', 'PARTNER'].includes(selectedRoleId)) handleRoleChange('HUSBAND');
      } else {
        // Other
        if (['FATHER', 'MOTHER'].includes(selectedRoleId)) handleRoleChange('PARENT');
        if (['SON', 'DAUGHTER'].includes(selectedRoleId)) handleRoleChange('CHILD');
        if (['HUSBAND', 'WIFE'].includes(selectedRoleId)) handleRoleChange('PARTNER');
      }
    }
  };

  // Determine if we can offer to create an unknown parent
  const canAddUnknownParent = useMemo(() => {
    if (!!personToEdit || isFirstPerson) return false; 
    if (relationType !== AddRelationshipType.CHILD) return false;
    if (selectedRoleId === 'CUSTOM') return false; 

    const hasSpouse = relationships.some(r => 
      r.type === RelationshipType.SPOUSE && 
      (r.person1Id === relatedTo || r.person2Id === relatedTo)
    );

    return !hasSpouse;
  }, [relationType, selectedRoleId, relatedTo, relationships, personToEdit, isFirstPerson]);

  // Filter options based on the selected gender of the NEW person
  const filteredRelationshipOptions = RELATIONSHIP_OPTIONS.filter(opt => {
    if (opt.type === AddRelationshipType.CUSTOM) return true;
    if (opt.id === 'PARTNER') return true; 

    if (gender === Gender.MALE) {
      return opt.gender === Gender.MALE;
    }
    if (gender === Gender.FEMALE) {
      return opt.gender === Gender.FEMALE;
    }
    return opt.gender === null; 
  });

  const isEditing = !!personToEdit;
  const relatedPersonName = existingPeople.find(p => p.id === relatedTo)?.firstName || 'Selected Person';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Edit Person' : isFirstPerson ? 'Create Tree Root' : 'Add Family Member'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" type="button">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700">First Name</label>
              <input required type="text" className="mt-1 w-full border rounded px-2 py-1" value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">Last Name</label>
              <input type="text" className="mt-1 w-full border rounded px-2 py-1" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700">Gender</label>
              <select className="mt-1 w-full border rounded px-2 py-1" value={gender} onChange={e => handleGenderChange(e.target.value as Gender)}>
                {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
               <label className="block text-xs font-medium text-slate-700">Birth Date</label>
               <input type="date" className="mt-1 w-full border rounded px-2 py-1" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
            </div>
          </div>

          {/* Connection Section - Only for Adding (and if not first person) */}
          {!isEditing && !isFirstPerson && (
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <h3 className="text-sm font-bold text-indigo-900 mb-3">Relationship</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-medium text-indigo-800 mb-1">Connect To</label>
                  <select className="w-full border border-indigo-200 rounded px-2 py-1.5 bg-white text-sm" value={relatedTo} onChange={e => setRelatedTo(e.target.value)}>
                    {existingPeople.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-indigo-800 mb-1">This new person is the...</label>
                  <select 
                    className="w-full border border-indigo-200 rounded px-2 py-1.5 bg-white text-sm font-medium" 
                    value={selectedRoleId} 
                    onChange={e => handleRoleChange(e.target.value)}
                  >
                    {filteredRelationshipOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label} of {relatedPersonName}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Custom Relationship Inputs */}
                {selectedRoleId === 'CUSTOM' && (
                  <div className="mt-2 p-3 bg-white border border-indigo-100 rounded-md space-y-3">
                    <div>
                       <label className="block text-xs font-medium text-slate-700 mb-1">Relationship Name (e.g. "Best Friend")</label>
                       <input 
                          type="text" 
                          required 
                          className="w-full border rounded px-2 py-1 text-sm" 
                          placeholder="Enter label..."
                          value={customLabel}
                          onChange={(e) => setCustomLabel(e.target.value)}
                        />
                    </div>
                    <div>
                       <label className="block text-xs font-medium text-slate-700 mb-1">Graph Structure (How are they connected?)</label>
                       <select 
                          className="w-full border rounded px-2 py-1 text-sm"
                          value={customStructure}
                          onChange={(e) => setCustomStructure(e.target.value as AddRelationshipType)}
                        >
                          <option value={AddRelationshipType.PARENT}>Parent / Guardian / Superior (Above)</option>
                          <option value={AddRelationshipType.CHILD}>Child / Dependent / Subordinate (Below)</option>
                          <option value={AddRelationshipType.SPOUSE}>Partner / Peer / Sibling-like (Same Level)</option>
                        </select>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Determines visual placement in the family tree.
                        </p>
                    </div>
                  </div>
                )}
                
                {/* Unknown Parent Option */}
                {canAddUnknownParent && (
                   <div className="mt-2 flex items-center">
                      <input 
                        id="unknown-parent-check"
                        type="checkbox" 
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={createUnknownParent}
                        onChange={(e) => setCreateUnknownParent(e.target.checked)}
                      />
                      <label htmlFor="unknown-parent-check" className="ml-2 block text-xs text-indigo-900 font-medium cursor-pointer">
                        Add unknown other parent placeholder?
                      </label>
                   </div>
                )}

                <div className="text-[10px] text-indigo-600 mt-1.5 leading-tight">
                  {selectedRoleId === 'FATHER' && `Adding ${firstName || 'this person'} as the Father (Parent) of ${relatedPersonName}.`}
                  {selectedRoleId === 'MOTHER' && `Adding ${firstName || 'this person'} as the Mother (Parent) of ${relatedPersonName}.`}
                  {selectedRoleId === 'PARENT' && `Adding ${firstName || 'this person'} as the Parent of ${relatedPersonName}.`}
                  
                  {selectedRoleId === 'SON' && `Adding ${firstName || 'this person'} as the Son (Child) of ${relatedPersonName}.`}
                  {selectedRoleId === 'DAUGHTER' && `Adding ${firstName || 'this person'} as the Daughter (Child) of ${relatedPersonName}.`}
                  {selectedRoleId === 'CHILD' && `Adding ${firstName || 'this person'} as the Child of ${relatedPersonName}.`}
                  
                  {selectedRoleId === 'HUSBAND' && `Adding ${firstName || 'this person'} as the Husband (Spouse) of ${relatedPersonName}.`}
                  {selectedRoleId === 'WIFE' && `Adding ${firstName || 'this person'} as the Wife (Spouse) of ${relatedPersonName}.`}
                  {selectedRoleId === 'PARTNER' && `Adding ${firstName || 'this person'} as the Partner of ${relatedPersonName}.`}
                  
                  {selectedRoleId === 'CUSTOM' && `Adding a custom relationship.`}
                </div>
              </div>
            </div>
          )}
          
          {isFirstPerson && (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-amber-800 text-sm">
              <strong>First Person:</strong> Since the tree is empty, this person will be the root node. You can add connections to them afterwards.
            </div>
          )}

          <div>
             <label className="block text-xs font-medium text-slate-700">Photo</label>
             <input ref={fileInputRef} type="file" accept="image/*" className="mt-1 w-full text-sm" />
             <p className="text-[10px] text-slate-500 mt-1">Images are saved locally in your browser.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Bio</label>
            <textarea className="mt-1 w-full border rounded px-2 py-1" rows={2} value={bio} onChange={e => setBio(e.target.value)}></textarea>
          </div>

          <div className="flex justify-between pt-4 items-center">
             {isDeleting ? (
               <div className="w-full flex items-center justify-between bg-red-50 p-2 rounded-md border border-red-100">
                 <span className="text-sm text-red-800 font-bold">Confirm Delete?</span>
                 <div className="flex space-x-2">
                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); setIsDeleting(false); }}
                      className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                         e.preventDefault();
                         if (onDelete && personToEdit) onDelete(personToEdit.id);
                      }}
                      className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700"
                    >
                      Yes, Delete
                    </button>
                 </div>
               </div>
             ) : (
               <>
                 {isEditing && onDelete && personToEdit ? (
                   <button 
                     type="button" 
                     onClick={(e) => { e.preventDefault(); setIsDeleting(true); }}
                     className="px-4 py-2 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-100 text-sm font-medium"
                   >
                     Delete Person
                   </button>
                 ) : <div></div>}

                 <div className="flex space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded text-sm font-medium">Cancel</button>
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className={`px-4 py-2 bg-primary text-white rounded hover:bg-indigo-700 text-sm font-medium flex items-center ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                      {isLoading && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                      {isEditing ? 'Save Changes' : 'Add Person'}
                    </button>
                 </div>
               </>
             )}
          </div>
        </form>
      </div>
    </div>
  );
};
