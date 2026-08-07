'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Bot, Send, Sparkles, Plus, Trash2, Edit2, 
  MessageSquare, User, RefreshCw, Star, Info, GraduationCap
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  agent: string;
}

export default function AICounselor() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('counselor');
  
  // Local profile context
  const [profile, setProfile] = useState<any>({
    fullName: 'Aspirant',
    category: 'GENERAL',
    education: 'B.Tech',
    branch: 'Computer Engineering',
    cgpa: 8.2,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Load profile
    const localProf = localStorage.getItem('udanpath_onboarding_profile');
    if (localProf) {
      setProfile(JSON.parse(localProf));
    }

    // 2. Load chat sessions
    const savedSessions = localStorage.getItem('udanpath_ai_sessions');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) {
        setActiveSessionId(parsed[0].id);
      } else {
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom of chat
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId]);

  const saveSessions = (updated: ChatSession[]) => {
    setSessions(updated);
    localStorage.setItem('udanpath_ai_sessions', JSON.stringify(updated));
  };

  const createNewSession = (agentName = selectedAgent) => {
    const newId = 'session_' + Date.now();
    const newSess: ChatSession = {
      id: newId,
      title: `Counseling session #${sessions.length + 1}`,
      messages: [
        { role: 'assistant', content: `Hello! I am your UdanPath AI assistant. I have reviewed your profile (${profile.education} in ${profile.branch}, Category: ${profile.category}). How can I help you map out your competitive exams career today?` }
      ],
      created_at: new Date().toISOString(),
      agent: agentName
    };
    const updated = [newSess, ...sessions];
    saveSessions(updated);
    setActiveSessionId(newId);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    saveSessions(updated);
    if (activeSessionId === id && updated.length > 0) {
      setActiveSessionId(updated[0].id);
    } else if (updated.length === 0) {
      createNewSession();
    }
  };

  const renameSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = prompt("Enter new session title:");
    if (newName && newName.trim() !== '') {
      const updated = sessions.map(s => s.id === id ? { ...s, title: newName.trim() } : s);
      saveSessions(updated);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const handleSend = async (messageText = inputMsg) => {
    if (!messageText.trim() || loading || !activeSessionId) return;

    // Add user message
    const userMsg: Message = { role: 'user', content: messageText };
    let currentMessages = [...(activeSession?.messages || []), userMsg];
    
    // Update session state
    let updatedSessions = sessions.map(s => 
      s.id === activeSessionId ? { ...s, messages: currentMessages } : s
    );
    saveSessions(updatedSessions);
    setInputMsg('');
    setLoading(true);

    // Create assistant message slot for streaming response
    const assistantMsg: Message = { role: 'assistant', content: '' };
    currentMessages = [...currentMessages, assistantMsg];
    
    try {
      // Connect to real FastAPI stream endpoint
      const res = await fetch("http://localhost:8000/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          selected_agent: selectedAgent,
          user_profile: profile,
          history: activeSession?.messages.map(m => ({ role: m.role, content: m.content })) || []
        })
      });

      if (!res.ok) throw new Error("Backend connection failed.");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let streamedResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          streamedResponse += chunk;

          // Reactively update message chunk-by-chunk
          updatedSessions = sessions.map(s => 
            s.id === activeSessionId 
              ? { 
                  ...s, 
                  messages: [
                    ...currentMessages.slice(0, -1),
                    { role: 'assistant' as const, content: streamedResponse }
                  ] 
                } 
              : s
          );
          setSessions(updatedSessions);
        }
        // Save final streamed results to localStorage
        localStorage.setItem('udanpath_ai_sessions', JSON.stringify(updatedSessions));
      }
    } catch (err) {
      // Fallback response if FastAPI connection is offline
      const fallback = `[FastAPI Gateway Offline] Simulated Advice:\n\nBased on your profile, you match exceptionally well with **GATE CS 2026** and **ISRO Scientist** opportunities. I recommend focusing 3 hours daily on Algorithms & Operating Systems, and attempting previous years mocks weekly. Please ensure the Python backend is running on port 8000 for live streaming answers.`;
      
      const failedSessions = sessions.map(s => 
        s.id === activeSessionId 
          ? { 
              ...s, 
              messages: [
                ...currentMessages.slice(0, -1),
                { role: 'assistant' as const, content: fallback }
              ] 
            } 
          : s
      );
      saveSessions(failedSessions);
    } finally {
      setLoading(false);
    }
  };

  const suggestedPrompts = [
    { label: "Check my eligibility details", text: `What exam targets match my eligibility profile as a ${profile.education} graduate in ${profile.branch}?` },
    { label: "Construct 6-month study timetable", text: "Please prepare a daily 6-hour timetable structure highlighting syllabus milestones." },
    { label: "Compare SSC CGL vs. Bank PO", text: "Can you compare SSC CGL vs IBPS Bank PO vacancies, pay metrics, and preparation complexity?" }
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex border border-border bg-card rounded-2xl overflow-hidden select-none">
      
      {/* ==================== LEFT CHATS HISTORY SIDEBAR ==================== */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card shrink-0">
        <div className="p-4 border-b border-border">
          <button
            onClick={() => createNewSession()}
            className="w-full btn btn-primary py-2.5 justify-center font-bold text-xs shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> New Counseling Chat
          </button>
        </div>

        {/* Sessions list */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-1">
          {sessions.map((sess) => {
            const active = sess.id === activeSessionId;
            return (
              <div
                key={sess.id}
                onClick={() => setActiveSessionId(sess.id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  active 
                    ? 'bg-primary-light text-primary' 
                    : 'text-text-muted hover:bg-card-hover hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="w-4 h-4 shrink-0 text-text-subtle" />
                  <span className="truncate">{sess.title}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0 opacity-0 hover:opacity-100 focus-within:opacity-100 group-hover:opacity-100">
                  <button 
                    onClick={(e) => renameSession(sess.id, e)}
                    className="p-1 rounded hover:bg-background text-text-muted"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={(e) => deleteSession(sess.id, e)}
                    className="p-1 rounded hover:bg-background text-danger"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Agent selector */}
        <div className="p-4 border-t border-border bg-background/50 space-y-2">
          <label className="text-[0.62rem] font-bold text-text-subtle uppercase">Counselor Persona</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
          >
            <option value="counselor">🤖 AI Career Counselor</option>
            <option value="upsc">👔 UPSC Civils Strategist</option>
            <option value="gate">💻 GATE & Technical Guide</option>
            <option value="banking">💳 Banking Aptitude Coach</option>
          </select>
        </div>
      </aside>

      {/* ==================== CENTER MAIN PANEL ==================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-background/40">
        
        {/* Messages viewport */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {activeSession?.messages.map((msg, index) => {
            const isBot = msg.role === 'assistant';
            return (
              <div 
                key={index} 
                className={`flex gap-3 max-w-3xl ${isBot ? '' : 'ml-auto flex-row-reverse'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                  isBot 
                    ? 'bg-gradient-to-br from-primary to-secondary' 
                    : 'bg-text-muted'
                }`}>
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className={`p-4 rounded-2xl border text-xs md:text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap font-semibold ${
                  isBot 
                    ? 'bg-card border-border text-foreground shadow-sm shadow-black/5' 
                    : 'bg-primary text-white border-primary'
                }`}>
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts (Only shown if current conversation is short) */}
        {activeSession && activeSession.messages.length <= 1 && (
          <div className="px-4 py-2 flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.text)}
                className="px-3 py-1.5 rounded-full border border-border bg-card hover:bg-card-hover text-[0.72rem] font-bold text-text-muted hover:text-foreground transition-all"
              >
                ★ {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Chat input footer form */}
        <div className="p-4 border-t border-border bg-card">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="flex gap-2 max-w-3xl mx-auto"
          >
            <input 
              type="text"
              placeholder="Ask anything about eligibility, resources, books or timetables..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              disabled={loading}
              className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-xs md:text-sm focus:outline-none focus:border-primary font-semibold"
            />
            <button
              type="submit"
              disabled={loading || !inputMsg.trim()}
              className="px-4 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50 flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center text-[0.62rem] text-text-subtle mt-2 font-bold uppercase">
            Powered by Gemini 1.5 Pro AI Engine Gateway
          </div>
        </div>

      </div>

    </div>
  );
}
