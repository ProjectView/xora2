
import React from 'react';
import { ChevronDown, Plus, Minus, FileText } from 'lucide-react';
import { db } from '../firebase';
// Use @firebase/firestore to fix named export resolution issues
import { doc, updateDoc } from '@firebase/firestore';

interface ProjectGeneralDiscoveryProps {
  project: any;
  userProfile: any;
}

const ProjectGeneralDiscovery: React.FC<ProjectGeneralDiscoveryProps> = ({ project, userProfile }) => {
  const companyName = userProfile?.companyName || 'Ma Société';

  const handleUpdate = async (field: string, value: any) => {
    try {
      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, { [field]: value });
    } catch (e) {
      console.error("Erreur update découverte:", e);
    }
  };

  const Section = ({ title, children, action }: { title: string; children?: React.ReactNode; action?: React.ReactNode }) => (
    <div className="bg-white border border-gray-100 rounded-[24px] p-8 space-y-6 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="text-[15px] font-bold text-gray-800">{title}</h3>
        {action}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {children}
      </div>
    </div>
  );

  const Field = ({ label, children, colSpan = "col-span-12 md:col-span-3" }: { label: string; children?: React.ReactNode; colSpan?: string }) => (
    <div className={colSpan}>
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">{label}</label>
      {children}
    </div>
  );

  const Select = ({ value, onChange, options, placeholder = "Sélectionner" }: any) => (
    <div className="relative group">
      <select 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-900 outline-none focus:border-gray-300 transition-all shadow-sm"
      >
        <option value="">{placeholder}</option>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none group-hover:text-gray-400" />
    </div>
  );

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center gap-3">
      <span className={`text-[12px] font-bold ${!value ? 'text-gray-900' : 'text-gray-300'}`}>Non</span>
      <button 
        type="button" 
        onClick={() => onChange(!value)} 
        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${value ? 'bg-gray-800' : 'bg-gray-300'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm ${value ? 'right-1' : 'left-1'}`}></div>
      </button>
      <span className={`text-[12px] font-bold ${value ? 'text-gray-900' : 'text-gray-300'}`}>Oui</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* 1. Attribution */}
      <Section title="Attribution">
        <Field label="Agence" colSpan="col-span-6">
          <div className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-900 flex items-center justify-between shadow-sm">
            {companyName}
            <ChevronDown size={16} className="text-gray-300" />
          </div>
        </Field>
        <Field label="Agenceur référent" colSpan="col-span-6">
          <div className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
            <img src={project.agenceur?.avatar} className="w-8 h-8 rounded-full object-cover border border-gray-50 shadow-sm" alt="" />
            <span className="text-[13px] font-bold text-gray-900">{project.agenceur?.name}</span>
            <ChevronDown size={18} className="ml-auto text-gray-400" />
          </div>
        </Field>
      </Section>

      {/* 2. Origine du projet */}
      <Section title="Origine du Projet">
        <Field label="Origine du projet" colSpan="col-span-3">
          <Select value={project.origine} options={['Relation', 'Web', 'Apporteur', 'Passage magasin']} onChange={(v: string) => handleUpdate('origine', v)} />
        </Field>
        <Field label="Sous origine" colSpan="col-span-3">
          <Select value={project.sousOrigine} options={['Bouche à oreille', 'Google Maps', 'Instagram', 'Ancien client']} onChange={(v: string) => handleUpdate('sousOrigine', v)} />
        </Field>
        <Field label="Nom" colSpan="col-span-3">
          <Select value={project.details?.origineNom} options={['Choisir']} onChange={(v: string) => handleUpdate('details.origineNom', v)} />
        </Field>
        <Field label="Lien parrain" colSpan="col-span-3">
          <Select value={project.details?.lienParrain} options={['Choisir']} onChange={(v: string) => handleUpdate('details.lienParrain', v)} />
        </Field>
      </Section>

      {/* 3. Projet */}
      <Section title="Projet">
        <Field label="Adresse chantier" colSpan="col-span-6">
          <Select value={project.details?.adresseChantier} options={['Choisir']} onChange={(v: string) => handleUpdate('details.adresseChantier', v)} />
        </Field>
        <Field label="Adresse facturation" colSpan="col-span-6">
          <Select value={project.details?.adresseFacturation} options={['Choisir']} onChange={(v: string) => handleUpdate('details.adresseFacturation', v)} />
        </Field>
        <Field label="Métier de l'étude" colSpan="col-span-3">
          <Select value={project.metier} options={['Cuisiniste', 'Bainiste', 'Rénovateur']} onChange={(v: string) => handleUpdate('metier', v)} />
        </Field>
        <Field label="Exécution des travaux" colSpan="col-span-3">
          <Select value={project.details?.executionTravaux} options={['Immédiat', 'Dans 3 mois', 'Dans 6 mois']} onChange={(v: string) => handleUpdate('details.executionTravaux', v)} />
        </Field>
        <Field label="Artisan.s nécessaire.s" colSpan="col-span-2">
          <div className="pt-2"><Toggle value={project.details?.artisansNecessaires || false} onChange={(v) => handleUpdate('details.artisansNecessaires', v)} /></div>
        </Field>
        <Field label="Artisan.s" colSpan="col-span-4">
          <Select value={project.details?.artisanSelection} options={['Choisir']} onChange={(v: string) => handleUpdate('details.artisanSelection', v)} />
        </Field>
        <Field label="Date Prévisionnelle Signature" colSpan="col-span-4">
          <Select value={project.details?.dateSignature} options={['Sélectionner']} onChange={(v: string) => handleUpdate('details.dateSignature', v)} />
        </Field>
        <Field label="Dates prévisionnel chantier" colSpan="col-span-4">
          <Select value={project.details?.dateChantier} options={['Sélectionner']} onChange={(v: string) => handleUpdate('details.dateChantier', v)} />
        </Field>
        <Field label="Date installation cuisine" colSpan="col-span-4">
          <Select value={project.details?.dateInstallation} options={['Sélectionner une date']} onChange={(v: string) => handleUpdate('details.dateInstallation', v)} />
        </Field>
      </Section>

      {/* 4. Enveloppe financière */}
      <Section title="Enveloppe financière" action={<button className="flex items-center gap-2 text-[11px] font-bold text-gray-800 hover:text-indigo-600 transition-colors"><FileText size={14} /> Ajouter une note</button>}>
        <Field label="Fourchette basse Budget">
          <Select value={project.details?.budgetBas} options={['Sélectionner']} onChange={(v: string) => handleUpdate('details.budgetBas', v)} />
        </Field>
        <Field label="Fourchette haute Budget">
          <Select value={project.details?.budgetHaut} options={['Sélectionner']} onChange={(v: string) => handleUpdate('details.budgetHaut', v)} />
        </Field>
        <Field label="Budget global du chantier">
          <Select value={project.details?.budgetGlobal} options={['Sélectionner']} onChange={(v: string) => handleUpdate('details.budgetGlobal', v)} />
        </Field>
        <div className="col-span-12 grid grid-cols-12 gap-6">
          <Field label="Financement du projet" colSpan="col-span-3">
            <Select value={project.details?.financement} options={['Sélectionner']} onChange={(v: string) => handleUpdate('details.financement', v)} />
          </Field>
          <Field label="Organisme financement" colSpan="col-span-3">
            <Select value={project.details?.organismeFinancement} options={['Sélectionner']} onChange={(v: string) => handleUpdate('details.organismeFinancement', v)} />
          </Field>
        </div>
      </Section>

      {/* 5. Installation */}
      <Section title="Installation">
        <Field label="Dépose">
          <Select value={project.details?.depose} options={['Sélectionner']} onChange={(v: string) => handleUpdate('details.depose', v)} />
        </Field>
        <Field label="Installation">
          <Select value={project.details?.installationType} options={['Sélectionner']} onChange={(v: string) => handleUpdate('details.installationType', v)} />
        </Field>
        <Field label="Livraison à charge de">
          <Select value={project.details?.livraisonCharge} options={['Sélectionner']} onChange={(v: string) => handleUpdate('details.livraisonCharge', v)} />
        </Field>
        <Field label="Plans techniques" colSpan="col-span-3">
          <div className="pt-2"><Toggle value={project.details?.plansTechniques || false} onChange={(v) => handleUpdate('details.plansTechniques', v)} /></div>
        </Field>
      </Section>

      {/* 6. Concurrence */}
      <Section title="Concurrence">
        <Field label="Nombre de confrères consultés">
          <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm">
             <span className="text-[13px] font-bold text-gray-200 italic">Confrères</span>
             <div className="flex items-center gap-3">
                <button type="button" onClick={() => handleUpdate('details.nbConfreres', Math.max(0, (project.details?.nbConfreres || 0) - 1))} className="w-7 h-7 bg-gray-100 text-gray-600 rounded flex items-center justify-center hover:bg-gray-200"><Minus size={14} /></button>
                <span className="text-sm font-bold text-gray-900">{project.details?.nbConfreres || 0}</span>
                <button type="button" onClick={() => handleUpdate('details.nbConfreres', (project.details?.nbConfreres || 0) + 1)} className="w-7 h-7 bg-gray-800 text-white rounded flex items-center justify-center hover:bg-black shadow-md"><Plus size={14} /></button>
             </div>
          </div>
        </Field>
        <Field label="Confrères">
          <Select value={project.details?.confrereNom} options={['Sélectionner']} onChange={(v: string) => handleUpdate('details.confrereNom', v)} />
        </Field>
        <Field label="Budget">
          <div className="relative">
            <input 
              type="text" 
              placeholder="0" 
              value={project.details?.budgetConcurrence || ''} 
              onChange={(e) => handleUpdate('details.budgetConcurrence', e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-900 outline-none focus:border-gray-300 shadow-sm"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-900 font-bold">€</span>
          </div>
        </Field>
        <Field label="Statut des projets">
          <Select value={project.details?.statutProjetsConcurrence} options={['Sélectionner']} onChange={(v: string) => handleUpdate('details.statutProjetsConcurrence', v)} />
        </Field>
      </Section>

      {/* 7. Permis de construire */}
      <Section title="Permis de construire">
        <Field label="Permis de construire accordé" colSpan="col-span-3">
          <div className="pt-2"><Toggle value={project.details?.permisAccorde || false} onChange={(v) => handleUpdate('details.permisAccorde', v)} /></div>
        </Field>
        <Field label="Date d'obtention Permis" colSpan="col-span-3">
          <Select value={project.details?.datePermis} options={['Sélectionner une date']} onChange={(v: string) => handleUpdate('details.datePermis', v)} />
        </Field>
      </Section>
    </div>
  );
};

export default ProjectGeneralDiscovery;
