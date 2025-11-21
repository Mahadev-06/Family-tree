import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FamilyNodeData, Gender } from '../types';

const PersonNode = ({ data, selected }: NodeProps<FamilyNodeData>) => {
  const isHighlighted = data.isHighlighted;

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        data.onSelect(data.person);
      }}
      className={`
        px-4 py-3 shadow-lg rounded-xl bg-white w-[200px]
        border-2 transition-all duration-200 ease-in-out cursor-pointer
        ${selected 
          ? 'border-primary ring-2 ring-primary/20' 
          : isHighlighted
            ? 'border-secondary ring-2 ring-secondary/20 shadow-xl scale-105'
            : 'border-slate-100 hover:border-primary/50 hover:-translate-y-1 hover:shadow-xl'
        }
      `}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-slate-400" />
      
      <div className="flex items-center space-x-3">
        <div className="relative">
           <img 
            src={data.person.photoUrl || 'https://via.placeholder.com/50'} 
            alt={data.person.firstName}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm bg-slate-100"
          />
          {/* Gender indicator dot */}
          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            data.person.gender === Gender.MALE ? 'bg-blue-400' : 
            data.person.gender === Gender.FEMALE ? 'bg-pink-400' : 'bg-slate-400'
          }`} />
        </div>
        
        <div className="overflow-hidden">
          <div className="font-bold text-slate-800 truncate text-base leading-tight">{data.person.firstName}</div>
          <div className="text-xs text-slate-500 truncate leading-tight">{data.person.lastName}</div>
          {data.person.birthDate && (
             <div className="text-[10px] text-slate-400 mt-1">
               {new Date(data.person.birthDate).getFullYear()}
             </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-slate-400" />
    </div>
  );
};

export default memo(PersonNode);