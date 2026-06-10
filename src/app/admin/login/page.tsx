'use client'

import { useState } from 'react'
import { login } from './actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6 selection:bg-[var(--color-cyan-500)] selection:text-white">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-cyan-500)]/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative w-full max-w-md group">
        {/* Card Border Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-cyan-400)] via-blue-600 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        
        <div className="relative bg-surface border border-surface-border p-8 md:p-10 rounded-[2rem] shadow-2xl">
          <div className="text-center mb-10 space-y-2">
            <h1 className="text-2xl font-black tracking-tighter text-foreground uppercase italic">
              Admin Gateway
            </h1>
            <p className="text-gray-500 text-xs tracking-[0.3em] font-light">AI-ANONYMOUS MUSIC FES.</p>
          </div>

          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 tracking-widest uppercase ml-1">Account ID</label>
              <input
                name="email"
                type="email"
                required
                placeholder="xxxxxxxxxxxx"
                className="w-full bg-background border border-surface-border rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:border-[var(--color-cyan-400)] focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 tracking-widest uppercase ml-1">Password</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-background border border-surface-border rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-700"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-xl text-center font-medium animate-pulse">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-[var(--color-cyan-500)] hover:text-black transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none mt-4 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              {loading ? 'CONNECTING...' : 'LOGIN TO DASHBOARD'}
            </button>
          </form>

          <div className="mt-8 text-center text-[10px] text-gray-600 tracking-widest uppercase">
            Restricted Area / Authorized Only
          </div>
        </div>
      </div>
    </main>
  )
}
