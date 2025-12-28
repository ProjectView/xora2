
import React from 'react';
import { Plus } from 'lucide-react';

interface ProjectKitchenElectrosProps {
  project: any;
  userProfile: any;
}

const ProjectKitchenElectros: React.FC<ProjectKitchenElectrosProps> = ({ project, userProfile }) => {
  return (
    <div className="h-64 flex flex-col items-center justify-center text-center p-12 bg-white border border-gray-100 rounded-3xl shadow-sm animate-in fade-in duration-300">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
        <Plus size={32} />
      </div>
      <h3 className="text-[15px] font-bold text-gray-800 mb-1">Électroménagers & Sanitaires</h3>
      <p className="text-[12px] text-gray-400">Section technique en cours de développement pour {project?.projectName}.</p>
    </div>
  );
};

export default ProjectKitchenElectros;
