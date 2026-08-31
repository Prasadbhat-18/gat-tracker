"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (result?.error || (result && !result.ok)) {
        setError("Invalid email or password. Please verify your staff credentials.")
      } else {
        window.location.href = "/dashboard"
      }
    } catch (err: any) {
      console.error("Sign in error:", err)
      setError("An unexpected connection error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs leading-relaxed">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Institutional Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#44474e]">
          Institutional Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@gat.edu.in"
          required
          autoComplete="email"
          className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-[#0d1c2e] placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be] focus:border-[#0058be] transition"
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#44474e]">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            autoComplete="current-password"
            className="w-full px-3.5 py-2.5 bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl text-[#0d1c2e] placeholder-slate-400 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#0058be] focus:border-[#0058be] transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !email || !password}
        className="w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all bg-[#002147] hover:bg-[#003166] disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md shadow-[#002147]/20 flex items-center justify-center gap-2 mt-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In to Administrative Portal"
        )}
      </button>

      {/* Demo Quick Fill Roles */}
      <div className="rounded-xl bg-[#eff4ff]/70 border border-[#adc6ff]/60 p-3.5 space-y-2 mt-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-[#004395] uppercase tracking-wider">Quick Fill Demo Roles</p>
          <span className="text-[10px] text-emerald-700 bg-emerald-100 font-semibold px-2 py-0.5 rounded">
            GAT Staff
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
          {[
            { role: "Super Admin", email: "admin@gat.edu.in", pass: "Admin@123" },
            { role: "HOD (CSE)", email: "hod.cse@gat.edu.in", pass: "Hod@123" },
            { role: "Faculty Coordinator", email: "faculty@gat.edu.in", pass: "Faculty@123" },
            { role: "Placement Officer", email: "placement@gat.edu.in", pass: "Placement@123" },
          ].map((cred) => (
            <button
              key={cred.role}
              type="button"
              onClick={() => {
                setEmail(cred.email)
                setPassword(cred.pass)
                setError("")
              }}
              className="text-left px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#dce9ff] border border-[#adc6ff]/50 transition group flex items-center justify-between"
            >
              <span className="text-xs font-semibold text-[#002147] truncate">{cred.role}</span>
              <span className="text-[10px] text-blue-600 font-mono">fill</span>
            </button>
          ))}
        </div>
      </div>
    </form>
  )
}
