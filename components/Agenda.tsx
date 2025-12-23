import React from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  ChevronDown, 
  Video, 
  MapPin
} from 'lucide-react';

const Agenda: React.FC = () => {
  // Mock data for the week days
  const weekDays = [
    { day: 'Lundi', date: '12 avril', avatars: 3 },
    { day: 'Mardi', date: '13 avril', avatars: 3 },
    { day: 'Mercredi', date: '14 avril', avatars: 3 },
    { day: 'Jeudi', date: '15 avril', avatars: 3 },
    { day: 'Vendredi', date: '16 avril', avatars: 3 },
    { day: 'Samedi', date: '17 avril', avatars: 3 },
    { day: 'Dimanche', date: '18 avril', avatars: 3 },
  ];

  // Hours to display
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 08:00 to 18:00

  return (
    <div className="flex flex-col h-full bg-gray-50">
      
      {/* Controls Header */}
      <div className="px-6 py-6 flex flex-col gap-6">
        
        {/* Top Row: Title, View Toggles, Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">Agenda</h2>
            
            <div className="flex items-center bg-white rounded-md border border-gray-200 p-0.5">
                <span className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded shadow-sm">Semaine 17</span>
            </div>

            <div className="flex bg-gray-200 rounded-lg p-1 space-x-1">
                 <button className="px-4 py-1.5 rounded-md text-xs font-medium text-gray-600 hover:bg-white/50 transition-colors">Jours</button>
                 <button className="px-4 py-1.5 rounded-md text-xs font-medium bg-gray-800 text-white shadow-sm">Semaine</button>
                 <button className="px-4 py-1.5 rounded-md text-xs font-medium text-gray-600 hover:bg-white/50 transition-colors">Mois</button>
            </div>

            <div className="relative">
                <button className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50">
                   <span>12/05 - 18/05</span>
                   <ChevronDown size={14} className="text-gray-400" />
                </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <CheckSquare size={16} className="mr-2" />
                Ajouter une tâche
             </button>
             <button className="flex items-center px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-100 transition-colors">
                <Plus size={16} className="mr-2" />
                Ajouter un rendez-vous
             </button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-col md:flex-row gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Rechercher" 
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-800 placeholder-gray-400"
                />
             </div>
             <div className="relative w-full md:w-64">
                <button className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 hover:bg-gray-50">
                    <div className="flex items-center">
                        <img src="https://i.pravatar.cc/150?u=admin" alt="" className="w-6 h-6 rounded-full mr-2" />
                        <span className="font-medium">Loïc <span className="text-gray-500 font-normal">(Vous)</span></span>
                    </div>
                    <ChevronDown size={16} className="text-gray-400" />
                </button>
             </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto px-6 pb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-w-[1000px] flex flex-col h-full">
            
            {/* Header Row */}
            <div className="flex border-b border-gray-200">
                {/* Time Column Header */}
                <div className="w-16 flex-shrink-0 border-r border-gray-100"></div>
                
                {/* Days Headers */}
                <div className="flex-1 grid grid-cols-7 divide-x divide-gray-100">
                    {weekDays.map((day, index) => (
                        <div key={index} className="p-3 text-center">
                            <div className="text-sm font-semibold text-gray-800 mb-1">{day.day} {day.date}</div>
                            {/* Avatars Stack */}
                            <div className="flex justify-center -space-x-1.5">
                                {[1, 2, 3, 4].map(i => (
                                    <img 
                                        key={i} 
                                        src={`https://i.pravatar.cc/150?u=${10 + i + index}`} 
                                        alt="" 
                                        className="w-5 h-5 rounded-full border border-white ring-1 ring-gray-100" 
                                    />
                                ))}
                                <div className="w-5 h-5 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[8px] font-bold text-gray-500">
                                    +{day.avatars}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-y-auto">
                 {/* Time Labels Column */}
                 <div className="w-16 flex-shrink-0 border-r border-gray-100 bg-white z-10">
                     {hours.map(hour => (
                         <div key={hour} className="h-24 text-xs text-gray-400 font-medium text-center relative">
                             <span className="absolute -top-2 left-0 right-0">{hour}:00</span>
                         </div>
                     ))}
                 </div>

                 {/* Days Columns */}
                 <div className="flex-1 grid grid-cols-7 divide-x divide-gray-100 relative">
                     {/* Background Grid Lines */}
                     <div className="absolute inset-0 flex flex-col pointer-events-none z-0">
                         {hours.map(hour => (
                             <div key={hour} className="h-24 border-b border-gray-50 w-full"></div>
                         ))}
                     </div>

                     {weekDays.map((_, dayIndex) => (
                         <div key={dayIndex} className="relative h-[1056px] z-0"> {/* Height = 11 hours * 96px (h-24) */}
                             
                             {/* Mock Events for Monday (Index 0) */}
                             {dayIndex === 0 && (
                                 <>
                                     {/* Event 1: 11:30 - 13:30 */}
                                     {/* 11:30 starts at: (11.5 - 8) * 96px = 3.5 * 96 = 336px */}
                                     {/* Duration 2h = 192px */}
                                     <div 
                                        className="absolute left-1 right-1 rounded-lg bg-indigo-100 border border-indigo-200 p-2 cursor-pointer hover:shadow-md transition-shadow z-10"
                                        style={{ top: '336px', height: '192px' }}
                                     >
                                         <div className="text-[10px] font-semibold text-indigo-800 mb-1">RDV R1 Dupont</div>
                                         <div className="flex -space-x-1.5 mb-2">
                                             <img src="https://i.pravatar.cc/150?u=20" className="w-5 h-5 rounded-full border border-indigo-100" alt="" />
                                             <img src="https://i.pravatar.cc/150?u=21" className="w-5 h-5 rounded-full border border-indigo-100" alt="" />
                                         </div>
                                         <div className="flex items-center text-[10px] text-indigo-700 mb-1">
                                             <MapPin size={10} className="mr-1" />
                                             Extérieur <span className="bg-gray-800 text-white rounded-full px-1 py-0.5 text-[8px] ml-1">R1</span>
                                         </div>
                                         <div className="flex items-center text-[10px] text-indigo-700 mt-4 border-t border-indigo-200 pt-2">
                                             <Video size={10} className="mr-1" />
                                             11:30 - 13:30
                                         </div>
                                     </div>

                                     {/* Event 2: 14:30 - 15:30 */}
                                     {/* 14:30 starts at: (14.5 - 8) * 96px = 6.5 * 96 = 624px */}
                                     {/* Duration 1h = 96px */}
                                     <div 
                                        className="absolute left-1 right-1 rounded-lg bg-emerald-100 border border-emerald-200 p-2 cursor-pointer hover:shadow-md transition-shadow z-10"
                                        style={{ top: '624px', height: '96px' }}
                                     >
                                         <div className="text-[10px] font-semibold text-emerald-800 mb-1">RDV R2 Dubois</div>
                                         <div className="flex justify-between items-end">
                                            <div className="flex -space-x-1.5">
                                                <img src="https://i.pravatar.cc/150?u=22" className="w-5 h-5 rounded-full border border-emerald-100" alt="" />
                                                <img src="https://i.pravatar.cc/150?u=23" className="w-5 h-5 rounded-full border border-emerald-100" alt="" />
                                            </div>
                                            <div className="text-[10px] text-emerald-700">14:30 - 15:30</div>
                                         </div>
                                     </div>
                                 </>
                             )}
                         </div>
                     ))}
                 </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Agenda;