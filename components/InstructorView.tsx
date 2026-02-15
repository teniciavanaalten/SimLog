import React, { useState } from 'react';
import { 
  Plane, AlertTriangle, ArrowLeft, Send, Check, Calendar, Clock, ClipboardCheck, User, Info 
} from 'lucide-react';
import { storageService } from '../services/storage';
import { MOCK_INSTRUCTORS, MOCK_COMPONENTS, IssueSeverity, IssueStatus } from '../types';

interface InstructorViewProps {
  onBack: () => void;
}

export const InstructorView: React.FC<InstructorViewProps> = ({ onBack }) => {
  const [activeScreen, setActiveScreen] = useState<'HOME' | 'LOG_SESSION' | 'REPORT_ISSUE'>('HOME');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // --- Session Log State ---
  const [instructor, setInstructor] = useState('');
  const [sessionType, setSessionType] = useState<string>(''); // Default empty
  const [simulator, setSimulator] = useState('Airbus A320');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // Downtime & Issues
  const [downtimeMinutes, setDowntimeMinutes] = useState<string>('0');
  const [isSessionLost, setIsSessionLost] = useState(false);
  const [sessionLostReason, setSessionLostReason] = useState('');

  // Declarations
  const [checkStart, setCheckStart] = useState(false);
  const [checkBrief, setCheckBrief] = useState(false);
  const [checkShutdown, setCheckShutdown] = useState(false);

  // --- Issue Report State ---
  const [issueDesc, setIssueDesc] = useState('');
  const [issueComp, setIssueComp] = useState(MOCK_COMPONENTS[0]);
  const [issueSev, setIssueSev] = useState<IssueSeverity>(IssueSeverity.LOW);

  const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    let duration = (endH + endM / 60) - (startH + startM / 60);
    if (duration < 0) duration += 24; // Handle midnight crossing slightly simply
    return parseFloat(duration.toFixed(2));
  };

  const handleLogSession = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!sessionType) {
      alert("Please select a Session Type.");
      return;
    }

    if (!checkStart || !checkBrief || !checkShutdown) {
      alert("You must confirm all safety and checklist declarations before submitting.");
      return;
    }

    if (isSessionLost && !sessionLostReason.trim()) {
      alert("Please provide an explanation for the lost session.");
      return;
    }

    const calculatedDuration = calculateDuration(startTime, endTime);
    // Auto-create name
    const generatedName = `${simulator}_${date}`;

    storageService.addSession({
      id: Date.now().toString(),
      sessionName: generatedName,
      instructorName: instructor,
      date: date,
      startTime: startTime,
      endTime: endTime,
      durationHours: calculatedDuration,
      simulator: simulator,
      sessionType: sessionType as 'Certified' | 'Non-Certified',
      downtimeMinutes: parseInt(downtimeMinutes) || 0,
      isSessionLost: isSessionLost,
      sessionLostReason: isSessionLost ? sessionLostReason : undefined,
      timestamp: Date.now()
    });

    setSuccessMsg("Flight Logged Successfully");
    setTimeout(() => {
      setSuccessMsg(null);
      setActiveScreen('HOME');
      // Reset Form
      setStartTime('');
      setEndTime('');
      setSessionType('');
      setDowntimeMinutes('0');
      setIsSessionLost(false);
      setSessionLostReason('');
      setCheckStart(false);
      setCheckBrief(false);
      setCheckShutdown(false);
    }, 2000);
  };

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.addIssue({
      id: Date.now().toString(),
      reportedBy: instructor || 'Unknown Instructor',
      date: new Date().toISOString(),
      severity: issueSev,
      status: IssueStatus.OPEN,
      component: issueComp,
      description: issueDesc,
      timestamp: Date.now()
    });
    setSuccessMsg("Issue Reported. Maintenance Notified.");
    setTimeout(() => {
      setSuccessMsg(null);
      setActiveScreen('HOME');
      setIssueDesc('');
    }, 2000);
  };

  // Shared classes for consistent height and alignment
  const inputClass = "w-full h-[52px] bg-slate-800 border border-slate-600 rounded-xl px-4 text-white focus:ring-2 focus:ring-sky-500 outline-none placeholder-slate-500";
  const labelClass = "block text-sm font-medium text-slate-400 mb-2";

  if (activeScreen === 'HOME') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        {/* Header */}
        <header className="p-6 flex justify-between items-center border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold tracking-wider uppercase text-slate-100">Sim<span className="text-sky-500">Log</span> Kiosk</h1>
            <p className="text-slate-400 text-sm">Select an action to proceed</p>
          </div>
          <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors text-sm font-medium">
            Exit Kiosk
          </button>
        </header>

        {/* Success Toast */}
        {successMsg && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-8 py-4 rounded-xl shadow-2xl z-50 flex items-center animate-bounce">
            <Check className="w-6 h-6 mr-3" />
            <span className="font-bold text-lg">{successMsg}</span>
          </div>
        )}

        {/* Main Buttons Grid */}
        <div className="flex-1 p-8 flex items-center justify-center max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl">
            {/* Button 1: Log Session */}
            <button 
              onClick={() => setActiveScreen('LOG_SESSION')}
              className="group h-80 bg-slate-800 hover:bg-sky-600 transition-all duration-300 rounded-3xl p-8 flex flex-col items-center justify-center border-2 border-slate-700 hover:border-sky-400 shadow-xl hover:shadow-sky-900/50"
            >
              <div className="bg-slate-900 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                <Plane className="w-16 h-16 text-sky-400 group-hover:text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Log Session</h2>
              <p className="text-slate-400 group-hover:text-sky-100 text-center">Record flight hours, checklist compliance, and progress</p>
            </button>

            {/* Button 2: Report Issue */}
            <button 
              onClick={() => setActiveScreen('REPORT_ISSUE')}
              className="group h-80 bg-slate-800 hover:bg-amber-600 transition-all duration-300 rounded-3xl p-8 flex flex-col items-center justify-center border-2 border-slate-700 hover:border-amber-400 shadow-xl hover:shadow-amber-900/50"
            >
              <div className="bg-slate-900 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-16 h-16 text-amber-400 group-hover:text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Report Issue</h2>
              <p className="text-slate-400 group-hover:text-amber-100 text-center">Flag maintenance squawks or defects</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- LOG SESSION FORM ---
  if (activeScreen === 'LOG_SESSION') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="bg-slate-800 w-full max-w-4xl rounded-3xl p-8 shadow-2xl border border-slate-700 overflow-y-auto max-h-[90vh] custom-scrollbar">
          <button onClick={() => setActiveScreen('HOME')} className="flex items-center text-slate-400 hover:text-white mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Menu
          </button>
          
          <h2 className="text-3xl font-bold mb-8 flex items-center text-white">
            <Plane className="mr-3 text-sky-400"/> 
            <span className="uppercase tracking-wide">{simulator}</span> 
            <span className="mx-3 text-slate-500">|</span> 
            <span className="text-sky-400">{date}</span>
          </h2>
          
          <form onSubmit={handleLogSession} className="space-y-8">
            
            {/* Section 1: Session Details */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-sky-400 font-bold mb-4 uppercase text-sm tracking-wider flex items-center">
                <Calendar className="w-4 h-4 mr-2" /> Session Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Simulator</label>
                  <select 
                    className={inputClass}
                    value={simulator}
                    onChange={e => setSimulator(e.target.value)}
                  >
                    <option value="Airbus A320">Airbus A320</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Date</label>
                  <input 
                    type="date"
                    required
                    className={inputClass}
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Start Time</label>
                  <input 
                    type="time"
                    required
                    className={inputClass}
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>End Time</label>
                  <input 
                    type="time"
                    required
                    className={inputClass}
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Instructor & Type */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-sky-400 font-bold mb-4 uppercase text-sm tracking-wider flex items-center">
                <User className="w-4 h-4 mr-2" /> Instructor & Type
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Instructor Name</label>
                  <input 
                    type="text" 
                    required
                    autoComplete="off"
                    className={inputClass}
                    value={instructor}
                    onChange={e => setInstructor(e.target.value)}
                    placeholder="Enter instructor name"
                  />
                </div>
                <div>
                  <label className={labelClass}>Session Type</label>
                  <select 
                    className={inputClass}
                    value={sessionType}
                    onChange={e => setSessionType(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select Type...</option>
                    <option value="Certified">Certified Session</option>
                    <option value="Non-Certified">Non-Certified Session</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Issues & Downtime */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-amber-400 font-bold uppercase text-sm tracking-wider flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" /> Issues & Downtime
                 </h3>
                 <div className="flex items-center text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                    <Info className="w-3 h-3 mr-2 text-sky-400" />
                    Detailed issues can be reported via the main menu portal
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left Col: Downtime Input */}
                <div>
                  <label className={labelClass}>Downtime Experienced (Minutes)</label>
                  <input 
                    type="number" 
                    min="0"
                    className={inputClass}
                    value={downtimeMinutes}
                    onChange={e => setDowntimeMinutes(e.target.value)}
                  />
                </div>
                
                {/* Right Col: Session Lost Checkbox (Aligned with Input) */}
                <div>
                  {/* Invisible label for vertical alignment matching */}
                  <label className="block text-sm font-medium text-transparent mb-2 select-none">Spacer</label>
                  
                  {/* Container matches the input height exactly */}
                  <div className="h-[52px] flex items-center px-1"> 
                    <div className="flex items-center">
                      <input 
                        id="sessionLost" 
                        type="checkbox" 
                        className="w-6 h-6 border border-slate-600 rounded bg-slate-800 focus:ring-3 focus:ring-red-500 text-red-600 transition-colors cursor-pointer"
                        checked={isSessionLost}
                        onChange={e => setIsSessionLost(e.target.checked)}
                      />
                      <label htmlFor="sessionLost" className="ml-3 text-sm font-medium text-slate-300 cursor-pointer select-none">
                        Session considered <span className="text-red-400 font-bold">LOST</span> due to technical issues?
                      </label>
                    </div>
                  </div>

                  {isSessionLost && (
                    <div className="animate-fade-in mt-4">
                       <label className="block text-xs font-medium text-red-400 mb-1">Reason for lost session:</label>
                       <textarea 
                          className="w-full bg-slate-800 border border-red-500/50 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-red-500 outline-none"
                          rows={2}
                          placeholder="Briefly explain why the session was lost..."
                          value={sessionLostReason}
                          onChange={e => setSessionLostReason(e.target.value)}
                          required={isSessionLost}
                       />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Declaration */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-600">
               <h3 className="text-white font-bold mb-4 text-lg">Declaration</h3>
               <p className="text-slate-400 text-sm mb-4">I hereby declare that I have:</p>
               
               <div className="space-y-4">
                 <div className="flex items-start">
                    <input 
                      id="checkStart" 
                      type="checkbox" 
                      required
                      className="mt-1 w-5 h-5 border border-slate-500 rounded bg-slate-800 focus:ring-3 focus:ring-sky-500 text-sky-500 cursor-pointer"
                      checked={checkStart}
                      onChange={e => setCheckStart(e.target.checked)}
                    />
                    <label htmlFor="checkStart" className="ml-3 text-sm text-slate-300 cursor-pointer">
                      Started the simulator according to the start-up checklist
                    </label>
                 </div>
                 <div className="flex items-start">
                    <input 
                      id="checkBrief" 
                      type="checkbox" 
                      required
                      className="mt-1 w-5 h-5 border border-slate-500 rounded bg-slate-800 focus:ring-3 focus:ring-sky-500 text-sky-500 cursor-pointer"
                      checked={checkBrief}
                      onChange={e => setCheckBrief(e.target.checked)}
                    />
                    <label htmlFor="checkBrief" className="ml-3 text-sm text-slate-300 cursor-pointer">
                      Briefed all participants on safety installations and procedures
                    </label>
                 </div>
                 <div className="flex items-start">
                    <input 
                      id="checkShutdown" 
                      type="checkbox" 
                      required
                      className="mt-1 w-5 h-5 border border-slate-500 rounded bg-slate-800 focus:ring-3 focus:ring-sky-500 text-sky-500 cursor-pointer"
                      checked={checkShutdown}
                      onChange={e => setCheckShutdown(e.target.checked)}
                    />
                    <label htmlFor="checkShutdown" className="ml-3 text-sm text-slate-300 cursor-pointer">
                      Shut down the simulator according to the shutdown checklist
                    </label>
                 </div>
               </div>
            </div>

            <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-5 rounded-xl text-xl flex items-center justify-center transition-colors mt-8 shadow-lg shadow-sky-900/20">
              <Send className="w-6 h-6 mr-3" /> Submit Flight Log
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- REPORT ISSUE FORM ---
  if (activeScreen === 'REPORT_ISSUE') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="bg-slate-800 w-full max-w-2xl rounded-3xl p-8 shadow-2xl border border-slate-700">
           <button onClick={() => setActiveScreen('HOME')} className="flex items-center text-slate-400 hover:text-white mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Menu
          </button>
          
          <h2 className="text-3xl font-bold mb-8 flex items-center text-amber-500"><AlertTriangle className="mr-3"/> Report Squawk</h2>
          
          <form onSubmit={handleReportIssue} className="space-y-6">
             <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>System Component</label>
                <select 
                  className={inputClass}
                  value={issueComp}
                  onChange={e => setIssueComp(e.target.value)}
                >
                  {MOCK_COMPONENTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Severity</label>
                <select 
                  className={inputClass}
                  value={issueSev}
                  onChange={e => setIssueSev(e.target.value as IssueSeverity)}
                >
                  {Object.values(IssueSeverity).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Description of Problem</label>
              <textarea 
                required
                className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none placeholder-slate-500 text-white"
                value={issueDesc}
                onChange={e => setIssueDesc(e.target.value)}
                placeholder="Describe what happened, error codes, etc."
              />
            </div>

            <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-5 rounded-xl text-xl flex items-center justify-center transition-colors mt-8 shadow-lg shadow-amber-900/20">
              <AlertTriangle className="w-6 h-6 mr-3" /> Submit Report
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
};