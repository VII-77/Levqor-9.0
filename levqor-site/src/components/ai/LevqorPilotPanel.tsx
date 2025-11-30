'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { getApiBase } from '@/lib/api-config';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'workflow' | 'debug' | 'health' | 'general';
  data?: any;
}

const API_BASE = getApiBase();

export default function LevqorPilotPanel() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const detectIntent = (text: string): 'workflow' | 'debug' | 'health' | 'general' => {
    const lower = text.toLowerCase();
    if (lower.includes('create') || lower.includes('build') || lower.includes('automate') || lower.includes('workflow')) {
      return 'workflow';
    }
    if (lower.includes('error') || lower.includes('fix') || lower.includes('debug') || lower.includes('broken') || lower.includes('failed')) {
      return 'debug';
    }
    if (lower.includes('health') || lower.includes('status') || lower.includes('monitor') || lower.includes('check')) {
      return 'health';
    }
    return 'general';
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const intent = detectIntent(userMessage.content);

    try {
      let response: Response;
      let assistantContent = '';
      let responseData: any = null;

      if (intent === 'workflow') {
        response = await fetch(`${API_BASE}/api/ai/brain/build_workflow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal: userMessage.content,
            language: locale || 'en',
          }),
        });
        const data = await response.json();
        responseData = data;
        if (data.proposed_workflow) {
          assistantContent = `I've designed a workflow for you:\n\n**${data.proposed_workflow.name}**\n\n${data.explanation || ''}\n\nThis is a ${data.impact_name || 'standard'} impact workflow (Class ${data.impact_level || 'B'}).`;
        } else {
          assistantContent = data.explanation || 'I created a workflow based on your request.';
        }
      } else if (intent === 'debug') {
        response = await fetch(`${API_BASE}/api/ai/brain/debug_error`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error_description: userMessage.content,
            language: locale || 'en',
          }),
        });
        const data = await response.json();
        responseData = data;
        assistantContent = data.diagnosis || data.explanation || 'Let me analyze that error for you...';
        if (data.suggested_fixes && data.suggested_fixes.length > 0) {
          assistantContent += '\n\n**Suggested fixes:**\n' + data.suggested_fixes.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n');
        }
      } else if (intent === 'health') {
        response = await fetch(`${API_BASE}/api/ai/brain/workflow_health`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: userMessage.content,
            language: locale || 'en',
          }),
        });
        const data = await response.json();
        responseData = data;
        assistantContent = data.summary || data.health_report || 'Your workflows are running smoothly.';
      } else {
        response = await fetch(`${API_BASE}/api/ai/brain/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: userMessage.content,
            language: locale || 'en',
          }),
        });
        const data = await response.json();
        responseData = data;
        assistantContent = data.answer || data.response || "I'm here to help! You can ask me to create workflows, debug errors, or check workflow health.";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        type: intent,
        data: responseData,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Pilot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
        type: 'general',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, locale]);

  const quickActions = [
    { label: 'Create a workflow', prompt: 'Create a workflow to ' },
    { label: 'Debug an error', prompt: 'Help me fix this error: ' },
    { label: 'Check workflow health', prompt: 'How healthy are my workflows?' },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
        aria-label="Open Levqor Pilot"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="font-medium">Ask Pilot</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[600px]">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="font-semibold">Levqor Pilot</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-white/20 rounded transition"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Hi, I'm your AI Pilot</h4>
            <p className="text-sm text-gray-600 mb-4">
              I can help you create workflows, debug errors, and monitor your automation health.
            </p>
            <div className="space-y-2">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => setInput(action.prompt)}
                  className="block w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 hover:border-blue-300"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.type === 'workflow' && message.data?.proposed_workflow && (
                  <div className="mt-2 pt-2 border-t border-white/20">
                    <Link
                      href="/workflows/ai-create"
                      className="text-xs underline hover:no-underline"
                    >
                      Open in Workflow Builder
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Powered by Levqor Brain
          </p>
          <Link
            href="/pricing"
            className="text-xs text-blue-600 hover:underline"
          >
            Upgrade for more
          </Link>
        </div>
      </form>
    </div>
  );
}
