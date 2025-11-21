import React, { useState, useMemo, useEffect } from 'react';
import { Person, Relationship } from '../types';
import { getImmediateFamily, findRelationshipPath, RelatedPerson } from '../services/relationshipService';

interface DetailsPanelProps {
  person: Person;
  allPeople: Person[];
  relationships: Relationship[];
  onClose: () => void;
  onSelectPerson: (p: Person) => void;
  onPathChange: (path: string[]) => void;
  onAddRelative: (personId: string) => void;
  onEdit: (person: Person) => void;
  onEditRelationship: (rel: Relationship, p1: Person, p2: Person) => void;
}

const FamilyMemberItem: React.FC<{ 
  member: Person, 
  role: string, 
  relationship?: Relationship,
  onSelect: (p: Person) => void,
  onEditRel?: (r: Relationship, p: Person) => void
}> = ({ member, role, relationship, onSelect, onEditRel }) => (
  <div 
    className="flex items-center justify-between p-2 hover:bg-slate-100 rounded-md transition-colors group"
  >
    <div 
      className="flex items-center flex-1 cursor-pointer"
      onClick={() => onSelect(member)}
    >
      <img src={member.photoUrl} className="w-8 h-8 rounded-full object-cover mr-3" alt="" />
      <div>
        <p className="text-sm font-medium">{member.firstName} {member.lastName}</p>
        <p className="text-xs text-slate-500 uppercase tracking-wide">{role}</p>
      </div>
    </div>
    {relationship && onEditRel && (
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onEditRel(relationship, member);
        }}
        className="p-1.5 text-slate-400 hover:text-primary transition-colors"
        title="Edit Relationship"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
      </button>
    )}
  </div>
);

export const DetailsPanel: React.FC<DetailsPanelProps> = ({
  person,
  allPeople,
  relationships,
  onClose,
  onSelectPerson,
  onPathChange,
  onAddRelative,
  onEdit,
  onEditRelationship
}) => {
  const [compareTargetId, setCompareTargetId] = useState<string>('');
  
  const family = useMemo(() => 
    getImmediateFamily(person.id, allPeople, relationships), 
    [person.id, allPeople, relationships]
  );

  const relationshipPath = useMemo(() => {
    if (!compareTargetId || compareTargetId === person.id) return null;
    return findRelationshipPath(person.id, compareTargetId, allPeople, relationships);
  }, [person.id, compareTargetId, allPeople, relationships]);

  // Sync path to parent for graph highlighting
  useEffect(() => {
    if (relationshipPath) {
      onPathChange(relationshipPath.path);
    } else {
      onPathChange([]);
    }
  }, [relationshipPath, onPathChange]);

  const handleEditRel = (rel: Relationship, relative: Person) => {
    onEditRelationship(rel, person, relative);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl transform transition-transform z-50 overflow-y-auto border-l border-slate-200">
      <div className="p-6">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div className="text-center mb-6 relative">
           <button
            onClick={() => onEdit(person)}
            className="absolute top-0 left-0 p-2 text-slate-400 hover:text-primary transition-colors"
            title="Edit Details"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          </button>

          <img 
            src={person.photoUrl} 
            alt={person.firstName} 
            className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-slate-100 shadow-sm mb-4"
          />
          <h2 className="text-2xl font-bold text-slate-900">{person.firstName} {person.lastName}</h2>
          <p className="text-slate-500 text-sm mt-1">
            {person.birthDate ? new Date(person.birthDate).getFullYear() : 'Unknown'} - {person.deathDate ? new Date(person.deathDate).getFullYear() : 'Present'}
          </p>
          
          <button
            onClick={() => onAddRelative(person.id)}
            className="mt-3 px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-full text-xs font-bold transition-colors flex items-center mx-auto"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add Relative
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Biography</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {person.bio || "No biography available."}
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Immediate Family</h3>
          <div className="space-y-1">
            {family.spouses.map(item => (
              <FamilyMemberItem 
                key={item.person.id} 
                member={item.person} 
                role="Spouse" 
                relationship={item.relationship}
                onSelect={onSelectPerson} 
                onEditRel={handleEditRel}
              />
            ))}
            {family.children.map(item => (
              <FamilyMemberItem 
                key={item.person.id} 
                member={item.person} 
                role="Child" 
                relationship={item.relationship}
                onSelect={onSelectPerson} 
                onEditRel={handleEditRel}
              />
            ))}
            {family.parents.map(item => (
              <FamilyMemberItem 
                key={item.person.id} 
                member={item.person} 
                role="Parent" 
                relationship={item.relationship}
                onSelect={onSelectPerson} 
                onEditRel={handleEditRel}
              />
            ))}
            {family.siblings.map(p => (
              <FamilyMemberItem 
                key={p.id} 
                member={p} 
                role="Sibling" 
                onSelect={onSelectPerson} 
                // Siblings don't have a direct single relationship to edit from here
              />
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Find Relationship</h3>
          <select 
            className="w-full p-2 text-sm border border-slate-300 rounded-md mb-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            value={compareTargetId}
            onChange={(e) => setCompareTargetId(e.target.value)}
          >
            <option value="">Compare with...</option>
            {allPeople.filter(p => p.id !== person.id).map(p => (
              <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
            ))}
          </select>
          
          {relationshipPath && (
            <div className="bg-indigo-50 p-3 rounded-md border border-indigo-100">
              <p className="text-sm font-bold text-indigo-900 text-center mb-2">
                {relationshipPath.relationshipDescription}
              </p>
              <div className="flex justify-center items-center space-x-1 text-xs text-indigo-600 flex-wrap">
                 {relationshipPath.path.map((pid, idx) => {
                   const p = allPeople.find(x => x.id === pid);
                   return (
                     <span key={pid} className="flex items-center">
                        <span className={pid === person.id || pid === compareTargetId ? "font-bold" : ""}>
                          {p?.firstName}
                        </span>
                        {idx < relationshipPath.path.length - 1 && <span className="mx-1">→</span>}
                     </span>
                   )
                 })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};