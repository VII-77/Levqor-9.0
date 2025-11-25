"use client";

import { useState } from 'react';
import { designTokens } from '@/config/design-tokens';

export default function ConsultationPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    timezone: 'UTC',
    duration: 60,
    preferred_time: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [brief, setBrief] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/consultations/book/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setBrief(data.pre_consultation_brief);
        setSuccess(true);
      } else {
        setError(data.error || 'Booking failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Consultation Booked Successfully!
              </h1>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Pre-Consultation Brief</h2>
              <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {brief}
              </div>
            </div>

            <div className="flex gap-4">
              <a
                href="/dashboard/v2"
                className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-cyan-700 transition-all text-center"
              >
                Go to Dashboard
              </a>
              <button
                onClick={() => setSuccess(false)}
                className="flex-1 bg-slate-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-600 transition-all"
              >
                Book Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              AI-Powered Consultation
            </span>
          </h1>
          <p className="text-xl text-slate-400">
            Get expert guidance on your data backup strategy
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Fully automated consultation powered by AI • No human involvement needed
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                required
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="john@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Timezone */}
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-slate-300 mb-2">
                Timezone
              </label>
              <select
                id="timezone"
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              >
                <option value="UTC">UTC (GMT+0)</option>
                <option value="America/New_York">Eastern Time (GMT-5)</option>
                <option value="America/Chicago">Central Time (GMT-6)</option>
                <option value="America/Denver">Mountain Time (GMT-7)</option>
                <option value="America/Los_Angeles">Pacific Time (GMT-8)</option>
                <option value="Europe/London">London (GMT+0)</option>
                <option value="Europe/Paris">Paris (GMT+1)</option>
                <option value="Europe/Berlin">Berlin (GMT+1)</option>
                <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                <option value="Asia/Singapore">Singapore (GMT+8)</option>
                <option value="Australia/Sydney">Sydney (GMT+11)</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Consultation Duration
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`px-6 py-4 rounded-lg font-medium transition-all ${
                    formData.duration === 60
                      ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                  onClick={() => setFormData({ ...formData, duration: 60 })}
                >
                  <div className="text-lg">1 Hour</div>
                  <div className="text-sm opacity-75">Quick-start guidance</div>
                </button>
                <button
                  type="button"
                  className={`px-6 py-4 rounded-lg font-medium transition-all ${
                    formData.duration === 120
                      ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                  onClick={() => setFormData({ ...formData, duration: 120 })}
                >
                  <div className="text-lg">2 Hours</div>
                  <div className="text-sm opacity-75">Deep-dive strategy</div>
                </button>
              </div>
            </div>

            {/* Preferred Time */}
            <div>
              <label htmlFor="preferred_time" className="block text-sm font-medium text-slate-300 mb-2">
                Preferred Date & Time
              </label>
              <input
                type="datetime-local"
                id="preferred_time"
                required
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={formData.preferred_time}
                onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value + ':00Z' })}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Booking...' : 'Book AI Consultation'}
            </button>

            <p className="text-center text-sm text-slate-500">
              You'll receive a confirmation email with your AI-generated pre-consultation brief
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
