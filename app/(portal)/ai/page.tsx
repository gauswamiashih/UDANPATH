'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Bot, Send, Sparkles, Plus, Trash2, Edit2, 
  MessageSquare, User, BrainCircuit, AlignLeft, ShieldCheck, Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

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

  const saveSessions = (updated: ChatSession[]) => {
    setSessions(updated);
    localStorage.setItem('udanpath_ai_sessions', JSON.stringify(updated));
  };

  const createNewSession = (agentName = selectedAgent, initial = false) => {
    const newId = 'session_' + Date.now();
    const newSess: ChatSession = {
      id: newId,
      title: `Counseling session #${initial ? 1 : sessions.length + 1}`,
      messages: [
        { role: 'assistant', content: `Hello! I am your AI Career Copilot. I've reviewed your profile (${profile.education} in ${profile.branch}). How can I guide your preparation today?` }
      ],
      created_at: new Date().toISOString(),
      agent: agentName
    };
    
    if (initial) {
      const updated = [newSess];
      setSessions(updated);
      localStorage.setItem('udanpath_ai_sessions', JSON.stringify(updated));
      setActiveSessionId(newId);
    } else {
      const updated = [newSess, ...sessions];
      saveSessions(updated);
      setActiveSessionId(newId);
    }
  };

  useEffect(() => {
    const localProf = localStorage.getItem('udanpath_onboarding_profile');
    if (localProf) setProfile(JSON.parse(localProf));

    const savedSessions = localStorage.getItem('udanpath_ai_sessions');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) {
        setActiveSessionId(parsed[0].id);
      } else {
        createNewSession(selectedAgent, true);
      }
    } else {
      createNewSession(selectedAgent, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId]);



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

    const userMsg: Message = { role: 'user', content: messageText };
    let currentMessages = [...(activeSession?.messages || []), userMsg];
    
    let updatedSessions = sessions.map(s => 
      s.id === activeSessionId ? { ...s, messages: currentMessages } : s
    );
    saveSessions(updatedSessions);
    setInputMsg('');
    setLoading(true);

    const assistantMsg: Message = { role: 'assistant', content: '' };
    currentMessages = [...currentMessages, assistantMsg];
    
    try {
      const res = await fetch(`/api/v1/ai/chat`, {
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
        localStorage.setItem('udanpath_ai_sessions', JSON.stringify(updatedSessions));
      }
    } catch (err) {
      const fallback = `[FastAPI Gateway Offline] Simulated Advice:\n\nBased on your profile, I recommend focusing on quantitative aptitude this week. Ensure your Python backend is running for live intelligent responses.`;
      
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
    "Which exams am I eligible for?",
    "What should I prepare this week?",
    "Compare UPSC and SSC CGL",
    "Explain this exam syllabus",
    "Which career path fits my profile?"
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex border border-border bg-card rounded-2xl overflow-hidden shadow-sm">
      
      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-[260px] border-r border-border bg-background-secondary shrink-0">
        <div className="p-4">
          <Button
            variant="primary"
            className="w-full justify-center text-xs h-10 shadow-sm"
            onClick={() => createNewSession()}
          >
            <Plus className="w-4 h-4 mr-2" /> New Chat
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-1 p-2">
          {sessions.map((sess) => {
            const active = sess.id === activeSessionId;
            return (
              <div
                key={sess.id}
                onClick={() => setActiveSessionId(sess.id)}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all group",
                  active ? "bg-white border border-border shadow-sm text-foreground" : "text-text-muted hover:bg-white hover:border hover:border-border"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className={cn("w-4 h-4 shrink-0", active ? "text-primary" : "text-text-subtle")} />
                  <span className="truncate">{sess.title}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => renameSession(sess.id, e)} className="p-1 rounded hover:bg-background-tertiary text-text-muted"><Edit2 className="w-3 h-3" /></button>
                  <button onClick={(e) => deleteSession(sess.id, e)} className="p-1 rounded hover:bg-background-tertiary text-danger"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2 bg-white">
          <label className="text-[0.65rem] font-bold text-text-subtle uppercase tracking-wider">Copilot Persona</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full bg-background-tertiary border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary"
          >
            <option value="counselor">🤖 Standard Copilot</option>
            <option value="upsc">👔 UPSC Strategist</option>
            <option value="gate">💻 Technical Guide</option>
          </select>
        </div>
      </aside>

      {/* CHAT PANEL */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none opacity-50"></div>
        
        <div className="h-14 border-b border-border flex items-center px-6 sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm text-foreground">AI Career Copilot</span>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-6 relative z-0">
          {activeSession?.messages.map((msg, index) => {
            const isBot = msg.role === 'assistant';
            return (
              <div key={index} className={cn("flex gap-4 max-w-3xl", !isBot && "ml-auto flex-row-reverse")}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm mt-1",
                  isBot ? "bg-primary" : "bg-text-muted"
                )}>
                  {isBot ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap font-medium shadow-sm",
                  isBot ? "bg-background-tertiary border border-border text-foreground rounded-tl-sm" : "bg-primary text-white rounded-tr-sm"
                )}>
                  {msg.content}
                </div>
              </div>
            );
          })}
          
          {loading && (
            <div className="flex gap-4 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-white shadow-sm mt-1">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-background-tertiary border border-border text-foreground rounded-tl-sm">
                <div className="flex gap-1.5 items-center h-4">
                  <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {activeSession && activeSession.messages.length <= 1 && (
          <div className="p-6 pt-0">
            <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="px-4 py-2 rounded-full border border-border bg-white hover:border-primary hover:text-primary hover:shadow-sm text-xs font-semibold text-text-muted transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="p-4 border-t border-border bg-white">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="flex gap-3 max-w-3xl mx-auto relative items-end"
          >
            <div className="relative flex-1">
              <Input 
                type="text"
                placeholder="Ask about exams, roadmaps, or colleges..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                disabled={loading}
                className="h-12 pr-12 shadow-sm rounded-xl"
              />
              <Button
                type="submit"
                variant="icon"
                disabled={loading || !inputMsg.trim()}
                className="absolute right-2 top-1.5 h-9 w-9 bg-primary text-white hover:bg-primary-hover disabled:bg-border disabled:text-text-muted"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
          <div className="text-center text-[0.65rem] text-text-subtle mt-3 font-semibold">
            Copilot can make mistakes. Check important deadlines on official websites.
          </div>
        </div>

      </div>

    </div>
  );
}
