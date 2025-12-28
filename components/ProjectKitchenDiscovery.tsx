
import React, { useState } from 'react';
import { File as FileIcon, Plus } from 'lucide-react';
import ProjectKitchenAmbiance from './ProjectKitchenAmbiance';
import ProjectKitchenElectros from './ProjectKitchenElectros';

interface ProjectKitchenDiscoveryProps {
  project: any;
  userProfile: any;
}

const ProjectKitchenDiscovery: React.FC<ProjectKitchenDiscoveryProps> = ({ project, userProfile }) => {
  const [activeKitchenTab, setActiveKitchenTab] = useState('Ambiance');

  const kitchenTabs = [
    { id: 'Ambiance', label: 'Ambiance', icon: 'file' },
    { id: 'Meubles', label: 'Meubles', icon: 'plus' },
    { id: 'Electros & sanitaires', label: 'Electros & sanitaires', icon: 'plus' },
    { id: 'Estimation financière', label: 'Estimation financière', icon: 'plus' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-[#f0f2f5] p-1.5 rounded-full flex gap-1 w-full shadow-inner border border-gray-100">
        {kitchenTabs.map((kt) => {
          const isActive = activeKitchenTab === kt.id;
          return (
            <button
              key={kt.id}
              onClick={() => setActiveKitchenTab(kt.id)}
              className={`flex-1 px-8 py-3 rounded-full text-[13px] font-bold transition-all flex items-center justify-center gap-3 ${
                isActive 
                ? 'bg-white text-gray-900 shadow-sm border border-gray-100' 
                : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {kt.label}
              {kt.icon === 'file' ? (
                <FileIcon size={14} className={isActive ? 'text-gray-900' : 'text-gray-400'} />
              ) : (
                !isActive && (
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center border border-gray-100">
                    <Plus size={12} className="text-gray-400" />
                  </div>
                )
              )}
            </button>
          );
        })}
      </div>

      <div className="animate-in fade-in duration-300">
        {activeKitchenTab === 'Ambiance' && <ProjectKitchenAmbiance project={project} />}
        {activeKitchenTab === 'Electros & sanitaires' && <ProjectKitchenElectros project={project} userProfile={userProfile} />}
        
        {(activeKitchenTab === 'Meubles' || activeKitchenTab === 'Estimation financière') && (
          <div className="h-64 flex flex-col items-center justify-center text-center p-12 bg-white border border-gray-100 rounded-[24px] shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
              <Plus size={32} />
            </div>
            <h3 className="text-[15px] font-bold text-gray-800 mb-1">Section {activeKitchenTab}</h3>
            <p className="text-[12px] text-gray-400">Détails techniques en cours de développement.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectKitchenDiscovery;
