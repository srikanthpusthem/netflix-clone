'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { AxiosError } from 'axios'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.register(email, password)
      router.push('/login?registered=1')
    } catch (err) {
      const msg = (err as AxiosError<{ detail: string }>).response?.data?.detail
      setError(msg ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-[#141414]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)), url("https://assets.nflxext.com/ffe/siteui/vlv3/9db4998a-06ba-4fc5-a623-38f9c12fa386/710e9d3b-6793-4aef-ade2-42c14b4c7eb5/US-en-20231016-popsignuptwoweeks-perspective_alpha_website_large.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <header className="px-12 py-6">
        <span className="text-[#E50914] font-black text-4xl tracking-tighter select-none">
          NETFLIX
        </span>
      </header>

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md bg-black/75 rounded-md px-10 py-12">
          <h1 className="text-3xl font-bold mb-8">Create Account</h1>

          {error && (
            <div className="mb-5 bg-[#E87C03] text-white text-sm px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-700 rounded px-4 py-4 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <input
              type="password"
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-zinc-700 rounded px-4 py-4 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E50914] hover:bg-[#f6121d] transition-colors text-white font-semibold py-4 rounded mt-4 disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>

          <p className="text-zinc-400 mt-8 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-white font-semibold hover:underline">
              Sign in.
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
