import { GoogleGenAI } from "@google/genai";
import { IssueReport, MaintenanceLog, SessionLog } from "../types";

// Initialize Gemini
// Note: process.env.API_KEY is assumed to be available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  analyzeSimData: async (issues: IssueReport[], maintenance: MaintenanceLog[], sessions: SessionLog[]) => {
    if (!process.env.API_KEY) {
      return "Gemini API Key is missing. Please configure the environment.";
    }

    const openIssues = issues.filter(i => i.status !== 'Resolved');
    const recentSessions = sessions.slice(0, 10);
    
    // Prepare a concise summary for the prompt
    const dataContext = `
      Open Issues: ${JSON.stringify(openIssues.map(i => ({ sev: i.severity, comp: i.component, desc: i.description })))}
      Recent Maintenance: ${JSON.stringify(maintenance.slice(0, 5).map(m => ({ action: m.actionPerformed })))}
      Recent Usage: ${recentSessions.length} sessions in last period. Total hours logged recently: ${recentSessions.reduce((acc, s) => acc + s.durationHours, 0)}.
    `;

    const prompt = `
      You are an expert Flight Simulator Maintenance Chief. 
      Analyze the following data context from our flight simulator facility.
      
      Data Context:
      ${dataContext}

      Please provide a brief, professional executive summary (max 3 bullet points) for the owner regarding:
      1. Critical attention items (if any grounded/high severity issues).
      2. Suggested maintenance actions based on patterns.
      3. Operational readiness status (Green/Yellow/Red).
      
      Keep it strictly professional and aviation-focused.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Analysis Failed", error);
      return "Unable to generate AI analysis at this time.";
    }
  }
};
