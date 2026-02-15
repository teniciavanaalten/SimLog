import React, { useState } from 'react';
import { 
  ArrowLeft, Check, Wrench, AlertTriangle, ClipboardList 
} from 'lucide-react';
import { storageService } from '../services/storage';
import { IssueStatus } from '../types';

interface MaintenanceViewProps {
  onBack: () => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({ onBack }) => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form States
  const [maintTech, setMaintTech] = useState('');
  const [maintAction, setMaintAction] = useState('');
  const [maintHours, setMaintHours] = useState('');

  // Quick stats for context
  const openIssues = storageService.getIssues().filter(i => i.status !== IssueStatus.RESOLVED);

  const handleLogMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.addMaintenance({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      technician: maintTech,
      actionPerformed: maintAction,
      hoursSpent: parseFloat(maintHours),
      timestamp: Date.now()
    });
    setSuccessMsg("Maintenance Recorded Successfully");
    setTimeout(() => {
      setSuccessMsg(null);
      setMaintTech('');
      setMaintAction('');
      setMaintHours('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-6">
      
      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
        <div className="flex items-center">
          <div className="p-3 bg-emerald-900/30 rounded-full mr-4">
            <Wrench className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-wider uppercase text-slate-100">Maintenance <span className="text-emerald-500">Mode</span></h1>
            <p className="text-slate-400 text-sm">Technician Access Only</p>
          </div>
        </div>
        <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors text-sm font-medium flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Exit
        </button>
      </header>

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-xl shadow-2xl z-50 flex items-center animate-bounce">
          <Check className="w-6 h-6 mr-3" />
          <span className="font-bold text-lg">{successMsg}</span>
        </div>
      )}

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Context / Open Issues */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-slate-300 mb-4 flex items-center">
              <ClipboardList className="w-5 h-5 mr-2 text-slate-400" />
              Pending Squawks
            </h3>
            
            {openIssues.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-900/50 rounded-xl">
                <Check className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No Open Issues
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {openIssues.map(issue => (
                  <div key={issue.id} className="bg-slate-900/80 p-4 rounded-xl border-l-4 border-amber-500">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-amber-500 uppercase">{issue.component}</span>
                      <span className="text-xs text-slate-500">{new Date(issue.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-snug">{issue.description}</p>
                    <div className="mt-2 text-xs text-slate-500 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" /> {issue.severity}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Log Maintenance Form */}
        <div className="md:col-span-2">
          <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center text-emerald-400">
              <Wrench className="mr-3" /> Log Work Performed
            </h2>
            
            <form onSubmit={handleLogMaintenance} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Technician Name</label>
                  <input 
                    type="text"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600"
                    value={maintTech}
                    onChange={e => setMaintTech(e.target.value)}
                    placeholder="e.g. Mike Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Hours Spent</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600"
                    value={maintHours}
                    onChange={e => setMaintHours(e.target.value)}
                    placeholder="e.g. 2.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Action Performed / Resolution</label>
                <textarea 
                  required
                  className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition-all placeholder:text-slate-600"
                  value={maintAction}
                  onChange={e => setMaintAction(e.target.value)}
                  placeholder="Detail the repairs, replacements, or inspections completed..."
                />
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 rounded-xl text-xl flex items-center justify-center transition-all mt-4 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transform hover:-translate-y-0.5">
                <Check className="w-6 h-6 mr-3" /> Save Maintenance Log
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
