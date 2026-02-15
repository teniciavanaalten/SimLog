import React, { useState } from 'react';
import { ViewMode } from './types';
import { AdminDashboard } from './components/AdminDashboard';
import { InstructorView } from './components/InstructorView';
import { MaintenanceView } from './components/MaintenanceView';
import { Plane, Users, LayoutDashboard, Wrench } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('LANDING');

  if (view === 'INSTRUCTOR') {
    return <InstructorView onBack={() => setView('LANDING')} />;
  }

  if (view === 'MAINTENANCE') {
    return <MaintenanceView onBack={() => setView('LANDING')} />;
  }

  if (view === 'ADMIN') {
    return (
      <div>
        <button 
          onClick={() => setView('LANDING')}
          className="fixed bottom-4 right-4 z-50 bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-slate-700 text-sm"
        >
          Exit Dashboard
        </button>
        <AdminDashboard />
      </div>
    );
  }

  // Landing Screen
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
         <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
         <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="z-10 text-center mb-12">
        <div className="inline-block p-4 bg-slate-800 rounded-full mb-6 shadow-2xl">
          <Plane className="w-16 h-16 text-sky-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">SimFlying Aviation Training</h1>
        <h2 className="text-xl md:text-2xl text-sky-500 font-bold tracking-widest uppercase">SimLog Pro</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl z-10 px-4">
        
        {/* Role: Instructor */}
        <button 
          onClick={() => setView('INSTRUCTOR')}
          className="group relative bg-slate-800 hover:bg-slate-700 p-8 rounded-3xl border border-slate-700 hover:border-sky-500 transition-all duration-300 text-left hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-1 flex flex-col h-full"
        >
          <div className="absolute top-8 right-8 bg-slate-900 p-3 rounded-xl group-hover:bg-sky-500 transition-colors">
            <Users className="w-6 h-6 text-slate-400 group-hover:text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 pr-20 min-h-[4rem] flex items-center">Instructor Mode</h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed flex-grow">
            Interface for instructors to log sessions and report simulator issues
          </p>
          <span className="text-sky-500 font-bold flex items-center text-sm uppercase tracking-wider mt-auto">
            Log session or issue &rarr;
          </span>
        </button>

        {/* Role: Maintenance */}
        <button 
          onClick={() => setView('MAINTENANCE')}
          className="group relative bg-slate-800 hover:bg-slate-700 p-8 rounded-3xl border border-slate-700 hover:border-emerald-500 transition-all duration-300 text-left hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 flex flex-col h-full"
        >
          <div className="absolute top-8 right-8 bg-slate-900 p-3 rounded-xl group-hover:bg-emerald-500 transition-colors">
            <Wrench className="w-6 h-6 text-slate-400 group-hover:text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 pr-20 min-h-[4rem] flex items-center">Maintenance Mode</h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed flex-grow">
            Technician access to log repairs, inspections, and view open squawks
          </p>
          <span className="text-emerald-500 font-bold flex items-center text-sm uppercase tracking-wider mt-auto">
            Log maintenance &rarr;
          </span>
        </button>

        {/* Role: Admin/Owner */}
        <button 
          onClick={() => setView('ADMIN')}
          className="group relative bg-slate-800 hover:bg-slate-700 p-8 rounded-3xl border border-slate-700 hover:border-indigo-500 transition-all duration-300 text-left hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 flex flex-col h-full"
        >
          <div className="absolute top-8 right-8 bg-slate-900 p-3 rounded-xl group-hover:bg-indigo-500 transition-colors">
            <LayoutDashboard className="w-6 h-6 text-slate-400 group-hover:text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 pr-20 min-h-[4rem] flex items-center">Owner Dashboard</h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed flex-grow">
            Dashboard for analytics and simulator overview
          </p>
          <span className="text-indigo-400 font-bold flex items-center text-sm uppercase tracking-wider mt-auto">
            View dashboard &rarr;
          </span>
        </button>
      </div>

      <div className="mt-16 text-slate-500 text-sm">
        &copy; 2026 SimFlying Aviation Training.
      </div>
    </div>
  );
};

export default App;