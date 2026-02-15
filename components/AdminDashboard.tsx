import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  LayoutDashboard, AlertTriangle, CheckCircle, Clock, Wrench, 
  BrainCircuit, Activity, Plus, X
} from 'lucide-react';
import { SessionLog, IssueReport, MaintenanceLog, IssueStatus, IssueSeverity } from '../types';
import { storageService } from '../services/storage';
import { geminiService } from '../services/geminiService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const AdminDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [issues, setIssues] = useState<IssueReport[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'maintenance' | 'sessions'>('overview');
  
  // Maintenance Form State
  const [showMaintForm, setShowMaintForm] = useState(false);
  const [newMaint, setNewMaint] = useState({ technician: 'Owner', action: '', hours: '1.0' });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setSessions(storageService.getSessions());
    setIssues(storageService.getIssues());
    setMaintenance(storageService.getMaintenance());
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await geminiService.analyzeSimData(issues, maintenance, sessions);
    setAiAnalysis(result || "No analysis available.");
    setIsAnalyzing(false);
  };

  const handleResolveIssue = (issue: IssueReport) => {
    const updated = { ...issue, status: IssueStatus.RESOLVED };
    storageService.updateIssue(updated);
    
    // Auto-log a maintenance entry for this resolution
    const maintenanceEntry: MaintenanceLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      technician: 'Owner (Admin)',
      actionPerformed: `Resolved issue: ${issue.description}`,
      relatedIssueId: issue.id,
      hoursSpent: 1, // Default
      timestamp: Date.now()
    };
    storageService.addMaintenance(maintenanceEntry);
    
    refreshData();
  };

  const handleAddMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    const log: MaintenanceLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      technician: newMaint.technician,
      actionPerformed: newMaint.action,
      hoursSpent: parseFloat(newMaint.hours),
      timestamp: Date.now()
    };
    storageService.addMaintenance(log);
    refreshData();
    setShowMaintForm(false);
    setNewMaint({ technician: 'Owner', action: '', hours: '1.0' });
  };

  // Derived Stats
  const totalFlightHours = sessions.reduce((acc, curr) => acc + curr.durationHours, 0);
  const totalMaintenanceHours = maintenance.reduce((acc, curr) => acc + curr.hoursSpent, 0);
  const openIssuesCount = issues.filter(i => i.status !== IssueStatus.RESOLVED).length;
  const criticalIssuesCount = issues.filter(i => i.severity === IssueSeverity.CRITICAL && i.status !== IssueStatus.RESOLVED).length;
  
  // Chart Data
  const sessionsByInstructor = sessions.reduce((acc, session) => {
    const existing = acc.find(item => item.name === session.instructorName);
    if (existing) {
      existing.hours += session.durationHours;
    } else {
      acc.push({ name: session.instructorName, hours: session.durationHours });
    }
    return acc;
  }, [] as { name: string, hours: number }[]);

  const issuesByComponent = issues.reduce((acc, issue) => {
    const existing = acc.find(item => item.name === issue.component);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: issue.component, value: 1 });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation */}
      <nav className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <LayoutDashboard className="w-6 h-6 text-sky-400" />
            <span className="font-bold text-xl tracking-tight">SimLog <span className="text-sky-400">Admin</span></span>
          </div>
          <div className="flex space-x-6 text-sm font-medium">
            <button onClick={() => setActiveTab('overview')} className={`${activeTab === 'overview' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'} transition-colors pb-1`}>Overview</button>
            <button onClick={() => setActiveTab('sessions')} className={`${activeTab === 'sessions' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'} transition-colors pb-1`}>Sessions</button>
            <button onClick={() => setActiveTab('issues')} className={`${activeTab === 'issues' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'} transition-colors pb-1`}>Issues</button>
            <button onClick={() => setActiveTab('maintenance')} className={`${activeTab === 'maintenance' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'} transition-colors pb-1`}>Maintenance</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        
        {/* KPI Cards - The 3 Main Parameters + System Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* 1. Total Flight Hours */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Flight Hours</p>
              <h3 className="text-2xl font-bold">{totalFlightHours.toFixed(1)}</h3>
            </div>
          </div>

          {/* 2. Total Maintenance Hours */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className="p-3 rounded-full bg-slate-100 text-slate-600">
              <Wrench className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Maint. Hours</p>
              <h3 className="text-2xl font-bold">{totalMaintenanceHours.toFixed(1)}</h3>
            </div>
          </div>

          {/* 3. Open Issues */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className={`p-3 rounded-full ${openIssuesCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Open Issues</p>
              <h3 className="text-2xl font-bold">{openIssuesCount}</h3>
            </div>
          </div>

          {/* 4. Overall Status */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className={`p-3 rounded-full ${criticalIssuesCount > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">System Status</p>
              <h3 className="text-xl font-bold">{criticalIssuesCount > 0 ? 'Grounded' : 'Operational'}</h3>
            </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BrainCircuit className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold flex items-center">
                    <BrainCircuit className="w-5 h-5 mr-2 text-sky-400" />
                    AI Maintenance Chief
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">Get an instant analysis of your fleet's health based on recent logs.</p>
                </div>
                <button 
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Generate Report'}
                </button>
              </div>
              
              {aiAnalysis && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-slate-200">
                    {aiAnalysis}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-6 text-slate-800">Hours by Instructor</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionsByInstructor}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="hours" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-6 text-slate-800">Issues by Component</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={issuesByComponent}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {issuesByComponent.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold">Issue Tracker</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Severity</th>
                    <th className="px-6 py-3">Component</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Reported By</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => (
                    <tr key={issue.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4">{new Date(issue.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${issue.severity === IssueSeverity.CRITICAL ? 'bg-red-100 text-red-700' :
                            issue.severity === IssueSeverity.HIGH ? 'bg-orange-100 text-orange-700' :
                            issue.severity === IssueSeverity.MEDIUM ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'}`}>
                          {issue.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{issue.component}</td>
                      <td className="px-6 py-4 text-slate-600">{issue.description}</td>
                      <td className="px-6 py-4 text-slate-500">{issue.reportedBy}</td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center space-x-1 
                          ${issue.status === IssueStatus.RESOLVED ? 'text-green-600' : 'text-slate-600'}`}>
                          {issue.status === IssueStatus.RESOLVED ? <CheckCircle className="w-4 h-4"/> : <Clock className="w-4 h-4"/>}
                          <span>{issue.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {issue.status !== IssueStatus.RESOLVED && (
                          <button 
                            onClick={() => handleResolveIssue(issue)}
                            className="text-sky-600 hover:text-sky-800 font-medium text-xs border border-sky-200 px-3 py-1 rounded hover:bg-sky-50 transition-colors"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {issues.length === 0 && (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">No issues recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-100"><h3 className="text-lg font-bold">Session Log</h3></div>
             <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-6 py-3">Session Name / Date</th>
                    <th className="px-6 py-3">Sim</th>
                    <th className="px-6 py-3">Instructor</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Duration</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700">{s.sessionName}</div>
                        <div className="text-xs text-slate-500">{s.date} | {s.startTime} - {s.endTime}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{s.simulator}</td>
                      <td className="px-6 py-4">{s.instructorName}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          s.sessionType === 'Certified' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {s.sessionType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold">{s.durationHours} hrs</td>
                      <td className="px-6 py-4">
                         {s.isSessionLost ? (
                           <div className="space-y-1">
                             <span className="text-red-600 font-bold text-xs flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> LOST</span>
                             {s.sessionLostReason && (
                               <div className="text-xs text-red-500/80 italic max-w-[150px] truncate" title={s.sessionLostReason}>
                                 "{s.sessionLostReason}"
                               </div>
                             )}
                           </div>
                         ) : (
                           <span className="text-green-600 font-bold text-xs flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> OK</span>
                         )}
                         {s.downtimeMinutes > 0 && (
                           <div className="text-xs text-amber-600 mt-1">{s.downtimeMinutes}m down</div>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        )}

        {activeTab === 'maintenance' && (
           <div className="relative">
             {/* Maintenance Modal/Overlay */}
             {showMaintForm && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-900">Log Maintenance</h3>
                      <button onClick={() => setShowMaintForm(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <form onSubmit={handleAddMaintenance} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Technician</label>
                        <input 
                          type="text" 
                          required 
                          className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-sky-500"
                          value={newMaint.technician}
                          onChange={e => setNewMaint({...newMaint, technician: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Action Performed</label>
                        <textarea 
                          required 
                          className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-sky-500"
                          rows={3}
                          value={newMaint.action}
                          onChange={e => setNewMaint({...newMaint, action: e.target.value})}
                          placeholder="Routine inspection, part replacement, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Hours Spent</label>
                        <input 
                          type="number" 
                          step="0.1"
                          required 
                          className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-sky-500"
                          value={newMaint.hours}
                          onChange={e => setNewMaint({...newMaint, hours: e.target.value})}
                        />
                      </div>
                      <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-colors">
                        Save Maintenance Record
                      </button>
                    </form>
                  </div>
                </div>
             )}

             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="text-lg font-bold">Maintenance Log</h3>
                 <button 
                  onClick={() => setShowMaintForm(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center transition-colors"
                 >
                   <Plus className="w-4 h-4 mr-2" /> Log Maintenance
                 </button>
               </div>
               <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Technician</th>
                      <th className="px-6 py-3">Action</th>
                      <th className="px-6 py-3">Hours Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenance.map((m) => (
                      <tr key={m.id} className="border-b border-slate-100">
                        <td className="px-6 py-4">{new Date(m.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{m.technician}</td>
                        <td className="px-6 py-4">{m.actionPerformed}</td>
                        <td className="px-6 py-4 font-bold">{m.hoursSpent}</td>
                      </tr>
                    ))}
                    {maintenance.length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No maintenance records found.</td></tr>
                    )}
                  </tbody>
               </table>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};