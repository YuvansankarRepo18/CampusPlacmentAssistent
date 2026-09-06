import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  PlusCircle,
  Trash2,
  CheckCircle2,
  Circle,
  BrainCircuit,
  PenTool,
  Code2,
  MessageSquareText,
  Target,
  ListTodo,
  Building2,
  Zap,
  RefreshCw,
  X,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export type CoachingMode =
  | 'General'
  | 'Resume'
  | 'Coding'
  | 'Aptitude'
  | 'Interview'
  | 'Career'
  | 'Strategy';

interface CoachMessage {
  id: string;
  sessionId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  mode: CoachingMode;
  proactive?: boolean;
  metadata?: any;
  timestamp: number;
}

interface CoachSession {
  id: string;
  userId: string;
  title: string;
  mode: CoachingMode;
  lastMessage?: string;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  category: 'Aptitude' | 'Coding' | 'Resume' | 'Interview' | 'Strategy';
  topic?: string;
  targetCompany?: string;
  completed: boolean;
  dueDate?: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface UserActionPlan {
  id: string;
  userId: string;
  goalTitle: string;
  items: ActionItem[];
  targetRole: string;
  targetCompanies: string[];
  weeklySchedule?: Array<{ day: string; focus: string; tasks: string[] }>;
  createdAt: number;
  updatedAt: number;
}

interface ProactiveInsight {
  id: string;
  userId: string;
  type: string;
  title: string;
  summary: string;
  actionPrompt: string;
  topic?: string;
  generatedAt: number;
  dismissed: boolean;
}

const api = {
  async get<T>(path: string): Promise<T> {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || errBody.error || `HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json() as Promise<T>;
  },
  async post<T>(path: string, body?: unknown): Promise<T> {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || errBody.error || `HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json() as Promise<T>;
  },
  async delete<T>(path: string): Promise<T> {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api${path}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || errBody.error || `HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json() as Promise<T>;
  },
};

const MODE_CONFIGS: Record<CoachingMode, { label: string; icon: any; color: string; bg: string }> = {
  General: { label: 'Master Coach', icon: Bot, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  Strategy: { label: 'Placement Strategy', icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' },
  Resume: { label: 'Resume & ATS', icon: PenTool, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  Coding: { label: 'Coding & DSA', icon: Code2, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
  Aptitude: { label: 'Aptitude Mentor', icon: BrainCircuit, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  Interview: { label: 'Mock Interview', icon: MessageSquareText, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  Career: { label: 'Career & Company', icon: Building2, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
};

const QUICK_PROMPTS = [
  'Analyze my placement readiness.',
  'How can I improve my ATS score?',
  'What should I study this week?',
  'Which companies am I currently ready for?',
  'Create a 30-day placement preparation plan.',
  'Suggest coding problems based on my weaknesses.',
  'Analyze my interview performance.',
  'Predict my placement chances.',
  'Recommend projects to strengthen my resume.',
  'Generate company-specific preparation roadmaps.',
];

export function CoachModule() {
  const [sessions, setSessions] = useState<CoachSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState('');
  const [activeMode, setActiveMode] = useState<CoachingMode>('General');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<ProactiveInsight[]>([]);
  const [actionPlan, setActionPlan] = useState<UserActionPlan | null>(null);
  const [readinessData, setReadinessData] = useState<any>(null);
  const [showPlanDrawer, setShowPlanDrawer] = useState(false);
  const [showSessionsDrawer, setShowSessionsDrawer] = useState(false);
  const [healthInfo, setHealthInfo] = useState<{ status: string; activeMode?: string; apiKeyConfigured?: boolean } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Initial Data Fetch
  useEffect(() => {
    loadSessions();
    loadInsights();
    loadActionPlan();
    loadReadiness();
    loadHealthStatus();
  }, []);

  const loadHealthStatus = async () => {
    try {
      const data = await api.get<any>('/coach/health');
      setHealthInfo(data);
    } catch (err) {
      console.warn('Failed to load coach health status:', err);
    }
  };

  const loadSessions = async () => {
    try {
      const data = await api.get<CoachSession[]>('/coach/sessions');
      setSessions(data || []);
      if (data && data.length > 0) {
        const first = data[0].id;
        setActiveSessionId(first);
        loadMessages(first);
      }
    } catch (err) {
      console.error('Failed to load coach sessions:', err);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const msgs = await api.get<CoachMessage[]>(`/coach/sessions/${sessionId}/messages`);
      setMessages(msgs || []);
    } catch (err) {
      console.error('Failed to load session messages:', err);
    }
  };

  const loadInsights = async () => {
    try {
      const res = await api.get<ProactiveInsight[]>('/coach/insights');
      setInsights(res || []);
    } catch (err) {
      console.error('Failed to load proactive insights:', err);
    }
  };

  const loadActionPlan = async () => {
    try {
      const plan = await api.get<UserActionPlan>('/coach/action-plan');
      setActionPlan(plan);
    } catch (err) {
      console.error('Failed to load action plan:', err);
    }
  };

  const loadReadiness = async () => {
    try {
      const data = await api.get<any>('/readiness/detail');
      setReadinessData(data);
    } catch (err) {
      console.error('Failed to load readiness details:', err);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    const targetSession = sessions.find((s) => s.id === sessionId);
    if (targetSession) {
      setActiveMode(targetSession.mode || 'General');
    }
    loadMessages(sessionId);
    setShowSessionsDrawer(false);
  };

  const handleCreateNewSession = async (mode: CoachingMode = 'General') => {
    try {
      const title = `${MODE_CONFIGS[mode].label} Thread`;
      const newSession = await api.post<CoachSession>('/coach/sessions', { title, mode });
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setActiveMode(mode);
      setMessages([]);
      loadMessages(newSession.id);
      setShowSessionsDrawer(false);
    } catch (err) {
      alert('Failed to create new session');
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this session?')) return;
    try {
      await api.delete(`/coach/sessions/${sessionId}`);
      const remaining = sessions.filter((s) => s.id !== sessionId);
      setSessions(remaining);
      if (activeSessionId === sessionId) {
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
          loadMessages(remaining[0].id);
        } else {
          handleCreateNewSession('General');
        }
      }
    } catch (err) {
      alert('Failed to delete session');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    setInput('');
    setLoading(true);

    // Optimistic User Message
    const tempUserMsg: CoachMessage = {
      id: 'temp-' + Date.now(),
      sessionId: activeSessionId || '',
      userId: 'current',
      role: 'user',
      content: text,
      mode: activeMode,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.post<{
        reply: string;
        responseMessage: CoachMessage;
        actionPlan?: UserActionPlan;
        sessionId?: string;
      }>('/coach/chat', {
        message: text,
        sessionId: activeSessionId,
        mode: activeMode,
      });

      if (res.sessionId && res.sessionId !== activeSessionId) {
        setActiveSessionId(res.sessionId);
      }

      const assistantMsg: CoachMessage = res?.responseMessage || {
        id: 'asst-' + Date.now(),
        sessionId: res?.sessionId || activeSessionId || '',
        userId: 'assistant',
        role: 'assistant',
        content: res?.reply || 'I have analyzed your metrics and updated your readiness profile.',
        mode: activeMode,
        timestamp: Date.now(),
      };

      setMessages((prev) => [
        ...(prev || []).filter((m) => m && m.id && !m.id.startsWith('temp-')),
        tempUserMsg,
        assistantMsg,
      ]);
      if (res?.actionPlan) setActionPlan(res.actionPlan);
      loadSessions();
      loadHealthStatus();
    } catch (err: any) {
      console.error('[CoachModule] Chat submission error:', err);
      const errDetail = err?.message || String(err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sessionId: activeSessionId || '',
          userId: 'system',
          role: 'assistant',
          content: `⚠️ **AI Coach Error:** ${errDetail}\n\n*If your API key is missing or invalid, please verify \`GEMINI_API_KEY\` in your \`backend/.env\` file.*`,
          mode: activeMode,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActionItem = async (itemId: string) => {
    try {
      const updated = await api.post<UserActionPlan>('/coach/action-plan', { itemToggleId: itemId });
      setActionPlan(updated);
    } catch (err) {
      console.error('Failed to toggle action item:', err);
    }
  };

  const handleDismissInsight = async (insightId: string) => {
    try {
      await api.post('/coach/insights/dismiss', { insightId });
      setInsights((prev) => prev.filter((i) => i.id !== insightId));
    } catch (err) {
      console.error('Failed to dismiss insight:', err);
    }
  };

  const handleGenerateFreshPlan = async () => {
    setLoading(true);
    try {
      const plan = await api.post<UserActionPlan>('/coach/generate-plan');
      setActionPlan(plan);
      setShowPlanDrawer(true);
    } catch (err) {
      alert('Failed to generate fresh plan');
    } finally {
      setLoading(false);
    }
  };

  // Simple Markdown Renderer Helper
  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-lg font-bold text-white mt-4 mb-2 tracking-tight flex items-center gap-2">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={idx} className="text-sm font-semibold text-slate-200 mt-3 mb-1 uppercase tracking-wider">{line.replace('#### ', '')}</h4>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const itemText = line.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-sm text-slate-300 my-1 leading-relaxed">
            {formatBold(itemText)}
          </li>
        );
      }
      if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
        const checked = line.startsWith('- [x] ');
        const taskText = line.replace(/- \[[ x]\] /, '');
        return (
          <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 my-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            {checked ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Circle size={16} className="text-slate-500" />}
            <span className={checked ? 'line-through text-slate-500' : 'text-slate-200 font-medium'}>{formatBold(taskText)}</span>
          </div>
        );
      }
      if (line.trim() === '---') {
        return <hr key={idx} className="border-slate-800 my-4" />;
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-sm text-slate-300 leading-relaxed my-1">
          {formatBold(line)}
        </p>
      );
    });
  };

  const formatBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\`.*?\`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="rounded bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 font-mono text-xs text-blue-300">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const activeModeConfig = MODE_CONFIGS[activeMode];
  const ActiveIcon = activeModeConfig.icon;

  const completedActionItems = actionPlan?.items?.filter((i) => i.completed).length || 0;
  const totalActionItems = actionPlan?.items?.length || 0;
  const actionProgress = totalActionItems > 0 ? Math.round((completedActionItems / totalActionItems) * 100) : 0;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-7xl mx-auto space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className={`rounded-2xl p-3 border ${activeModeConfig.bg} shadow-lg`}>
            <ActiveIcon size={24} className={activeModeConfig.color} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white tracking-tight">AI Placement & Career Coach</h1>
              <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                RAG Empowered
              </span>
              {healthInfo && (
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${
                  healthInfo.status === 'ready'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  {healthInfo.status === 'ready' ? '🟢 Gemini 1.5 Flash Active' : '🟡 RAG Rule Fallback Mode'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Personalized mentor analyzing your ATS Resumes, Aptitude, Coding & AI Interview reports
            </p>
          </div>
        </div>

        {/* Readiness Badge & Action Bar */}
        <div className="flex items-center gap-3">
          {readinessData && (
            <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Placement Readiness</p>
                <p className="font-extrabold text-emerald-400 text-sm">{readinessData.overallReadinessScore}% <span className="text-slate-500 text-[11px]">({readinessData.confidenceLevel})</span></p>
              </div>
              <div className="h-8 w-8 rounded-full border-2 border-emerald-500/40 flex items-center justify-center bg-emerald-500/10 text-emerald-300 font-bold text-xs">
                {readinessData.overallReadinessScore}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowPlanDrawer(!showPlanDrawer)}
            className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition shadow-sm"
          >
            <ListTodo size={16} />
            <span>Action Plan</span>
            <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-200">
              {completedActionItems}/{totalActionItems}
            </span>
          </button>

          <button
            onClick={() => setShowSessionsDrawer(!showSessionsDrawer)}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <Layers size={16} />
            <span className="hidden md:inline">Saved Threads</span>
          </button>
        </div>
      </div>

      {/* Proactive Insights Banner */}
      {insights.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="rounded-xl bg-amber-500/20 p-2 text-amber-300 border border-amber-500/30">
              <Zap size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md">Proactive Coach Nudge</span>
                <p className="text-xs font-bold text-white">{insights[0].title}</p>
              </div>
              <p className="text-xs text-amber-200/90 mt-1">{insights[0].summary}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSendMessage(insights[0].actionPrompt)}
              className="rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition shadow-md whitespace-nowrap flex items-center gap-1.5"
            >
              <span>Act Now</span> <ArrowUpRight size={14} />
            </button>
            <button
              onClick={() => handleDismissInsight(insights[0].id)}
              className="text-amber-300 hover:text-white p-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex flex-1 gap-4 overflow-hidden relative">
        {/* Chat Thread Container */}
        <div className="flex-1 flex flex-col rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Coaching Mode Selector Bar */}
          <div className="flex items-center gap-2 p-3 border-b border-slate-800 bg-slate-950/60 overflow-x-auto custom-scrollbar">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">Mode:</span>
            {(Object.keys(MODE_CONFIGS) as CoachingMode[]).map((mode) => {
              const cfg = MODE_CONFIGS[mode];
              const Icon = cfg.icon;
              const isSelected = activeMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setActiveMode(mode)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition whitespace-nowrap border ${
                    isSelected
                      ? `${cfg.bg} ${cfg.color} font-bold shadow-md`
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon size={14} />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-8">
                <div className="rounded-3xl bg-blue-600/10 border border-blue-500/20 p-6 text-blue-400">
                  <Bot size={48} className="animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-white">Your Personal Placement Mentor</h3>
                <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                  Select a coaching mode above or pick a quick question to analyze your placement readiness, ATS resume scores, DSA weaknesses, and interview metrics.
                </p>
              </div>
            ) : (
              (messages || [])
                .filter((m): m is CoachMessage => Boolean(m && m.role))
                .map((msg) => {
                  const isUser = msg.role === 'user';
                  const msgModeCfg = MODE_CONFIGS[msg.mode || 'General'] || MODE_CONFIGS['General'];
                  const ModeIcon = msgModeCfg.icon;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1">
                      {!isUser && (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${msgModeCfg.bg} ${msgModeCfg.color}`}>
                          <ModeIcon size={12} /> {msgModeCfg.label}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`max-w-3xl rounded-2xl p-5 shadow-xl ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-br-none font-medium text-sm'
                          : 'bg-slate-950/90 border border-slate-800 text-slate-100 rounded-bl-none space-y-2'
                      }`}
                    >
                      {isUser ? msg.content : renderMarkdown(msg.content)}

                      {/* Interactive Metadata Cards inside Assistant Responses */}
                      {!isUser && msg.metadata?.suggestedTopics && (
                        <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-2">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Suggested Follow-Up Topics:</p>
                          <div className="flex flex-wrap gap-2">
                            {msg.metadata.suggestedTopics.map((topic: string, i: number) => (
                              <button
                                key={i}
                                onClick={() => handleSendMessage(topic)}
                                className="rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/10 transition text-left"
                              >
                                {topic}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}

            {loading && (
              <div className="flex items-center gap-3 bg-slate-950/90 border border-slate-800 p-4 rounded-2xl max-w-sm">
                <RefreshCw className="animate-spin text-blue-400" size={18} />
                <span className="text-xs text-slate-300 font-medium">Synthesizing RAG analytics & recommendations...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 overflow-x-auto custom-scrollbar flex gap-2">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="whitespace-nowrap rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:border-blue-500/40 hover:bg-slate-800 hover:text-white transition disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={loading}
              placeholder={`Ask your ${activeModeConfig.label} (e.g. "What should I study this week?")...`}
              className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || loading}
              className="rounded-2xl bg-blue-600 hover:bg-blue-500 px-5 py-3 font-semibold text-white transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send size={18} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>

        {/* Action Plan Drawer / Sidebar Panel */}
        <AnimatePresence>
          {showPlanDrawer && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-80 md:w-96 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl flex flex-col space-y-4 backdrop-blur-md overflow-hidden z-20"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ListTodo className="text-indigo-400" size={20} />
                  <h3 className="font-bold text-white text-base">Placement Action Plan</h3>
                </div>
                <button onClick={() => setShowPlanDrawer(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              {actionPlan ? (
                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{actionPlan.goalTitle}</h4>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-xs text-slate-400 font-semibold">
                        <span>Sprint Progress</span>
                        <span className="text-indigo-400">{actionProgress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500" style={{ width: `${actionProgress}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Action Items:</p>
                    {actionPlan.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleActionItem(item.id)}
                        className={`rounded-2xl border p-3 cursor-pointer transition flex items-start gap-3 ${
                          item.completed ? 'border-slate-800 bg-slate-950/60 opacity-65' : 'border-slate-800 bg-slate-950 hover:border-indigo-500/40'
                        }`}
                      >
                        <div className="mt-0.5">
                          {item.completed ? (
                            <CheckCircle2 size={18} className="text-emerald-400" />
                          ) : (
                            <Circle size={18} className="text-slate-500" />
                          )}
                        </div>
                        <div className="space-y-1 text-left flex-1">
                          <p className={`text-xs font-semibold ${item.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-400 leading-snug">{item.description}</p>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-medium">{item.category}</span>
                            {item.dueDate && <span className="text-[10px] text-indigo-400 font-medium">Due: {item.dueDate}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleGenerateFreshPlan}
                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-semibold text-white transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    <RefreshCw size={14} /> Regenerate 30-Day Sprint Plan
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <p className="text-xs text-slate-400">No active action plan found.</p>
                  <button onClick={handleGenerateFreshPlan} className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white">
                    Generate Plan
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sessions Manager Drawer */}
        <AnimatePresence>
          {showSessionsDrawer && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-80 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl flex flex-col space-y-4 backdrop-blur-md overflow-hidden z-20"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="text-blue-400" size={20} />
                  <h3 className="font-bold text-white text-base">Coaching History</h3>
                </div>
                <button onClick={() => setShowSessionsDrawer(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <button
                onClick={() => handleCreateNewSession(activeMode)}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-semibold text-white transition flex items-center justify-center gap-2 shadow-md"
              >
                <PlusCircle size={16} /> New Coaching Session
              </button>

              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                {sessions.map((sess) => {
                  const isCurrent = sess.id === activeSessionId;
                  const cfg = MODE_CONFIGS[sess.mode || 'General'];
                  const Icon = cfg.icon;

                  return (
                    <div
                      key={sess.id}
                      onClick={() => handleSelectSession(sess.id)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between group ${
                        isCurrent
                          ? 'border-blue-500/40 bg-blue-500/10 text-white font-semibold'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Icon size={18} className={cfg.color} />
                        <div className="truncate text-left">
                          <p className="text-xs truncate">{sess.title}</p>
                          <p className="text-[10px] text-slate-500">
                            {new Date(sess.updatedAt).toLocaleDateString()} • {sess.messageCount || 0} msgs
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(e, sess.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
