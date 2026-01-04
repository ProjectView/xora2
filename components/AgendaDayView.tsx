
import React from 'react';
import { Clock } from 'lucide-react';
import { Appointment } from '../types';

interface AgendaDayViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onAppointmentClick?: (rdv: Appointment) => void;
}

const AgendaDayView: React.FC<AgendaDayViewProps> = ({ currentDate, appointments }) => {
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 08:00 à 18:00
  const dateStr = currentDate.toLocaleDateString('fr-FR');

  const getPositionStyles = (startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutesFrom8am = (startH - 8) * 60 + startM;
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    const rowHeight = 80; 
    return {
      top: `${(startMinutesFrom8am / 60) * rowHeight}px`,
      height: `${(durationMinutes / 60) * rowHeight}px`
    };
  };

  const dayAppointments = appointments.filter(rdv => rdv.date === dateStr);

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-4 duration-300">
      <div className="flex border-b border-gray-100 bg-[#FCFCFD] sticky top-0 z-40">
        <div className="w-20 shrink-0 border-r border-gray-50 flex items-center justify-center">
          <Clock size={16} className="text-gray-200" />
        </div>
        <div className="flex-1 py-6 text-center bg-indigo-50/10">
          <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
            {currentDate.toLocaleDateString('fr-FR', { weekday: 'long' })}
          </div>
          <div className="text-[18px] font-black text-gray-900 mt-1">
            {currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="flex relative min-h-[880px]">
        <div className="w-20 shrink-0 bg-[#FCFCFD]/50 border-r border-gray-50 sticky left-0 z-30">
          {hours.map((hour) => (
            <div key={hour} className="h-20 text-[11px] font-black text-gray-300 text-center pt-2">
              <span className="bg-white px-2 py-0.5 rounded border border-gray-50 shadow-sm">{hour}:00</span>
            </div>
          ))}
        </div>

        <div className="flex-1 relative bg-white">
          <div className="absolute inset-0 flex flex-col pointer-events-none z-0">
            {hours.map((hour) => (
              <div key={hour} className="h-20 border-b border-gray-50/50 w-full"></div>
            ))}
          </div>

          <div className="relative h-full">
            {dayAppointments.map(rdv => {
              const styles = getPositionStyles(rdv.startTime, rdv.endTime);
              return (
                <div 
                  key={rdv.id}
                  className="absolute inset-x-10 rounded-2xl bg-[#C6F6D5] border-l-[6px] border-[#38A169] p-4 cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all z-20 flex flex-col justify-between shadow-lg"
                  style={styles}
                >
                  <div>
                    <h4 className="text-[14px] font-black text-[#22543D] uppercase tracking-tight">{rdv.title}</h4>
                    <p className="text-[12px] font-bold text-[#2F855A] mt-1 opacity-80">{rdv.clientName}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black px-2 py-1 bg-white/40 rounded uppercase text-[#22543D]">{rdv.type} • {rdv.location}</span>
                    <span className="text-[11px] font-black text-[#38A169] bg-white/50 px-2 py-0.5 rounded-lg">{rdv.startTime} - {rdv.endTime}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaDayView;
