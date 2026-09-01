"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewCompanyPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [industry, setIndustry] = useState("Information Technology")
  const [website, setWebsite] = useState("")
  const [location, setLocation] = useState("Bengaluru")
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")

    if (!name.trim()) {
      setErrorMsg("Company name is required")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          industry: industry.trim() || null,
          website: website.trim() || null,
          location: location.trim() || null,
          contactName: contactName.trim() || null,
          contactEmail: contactEmail.trim() || null,
          contactPhone: contactPhone.trim() || null,
          description: description.trim() || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to register company")

      setSuccessMsg("Company registered successfully!")
      setTimeout(() => {
        router.push("/companies")
        router.refresh()
      }, 1000)
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <div className="bg-white border border-[#c4c6cf] rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-[#000a1e] px-6 py-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#adc6ff] bg-[#002147] px-2.5 py-1 rounded-full border border-[#0058be]/40">
              Recruitment Partners
            </span>
            <h1 className="text-xl font-bold mt-2 tracking-tight">Register Hiring Company</h1>
            <p className="text-xs text-[#adc6ff] mt-0.5">
              Add corporate partners, recruiters, industry domains, and campus point-of-contact details
            </p>
          </div>
          <Link
            href="/companies"
            className="self-start md:self-auto text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition border border-white/20 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Companies
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#410002] rounded-xl text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ba1a1a] text-lg">error</span>
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-4 bg-[#d1e7dd] border border-[#0f5132]/30 text-[#0f5132] rounded-xl text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0f5132] text-lg">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cisco Systems, Infosys, Bosch"
                required
                className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
                Industry Sector
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
              >
                <option value="Information Technology">Information Technology & Software</option>
                <option value="Semiconductors & VLSI">Semiconductors & Hardware</option>
                <option value="Automotive & Aerospace">Automotive & Aerospace</option>
                <option value="Finance & Banking">Finance & Fintech</option>
                <option value="Consulting">Management & IT Consulting</option>
                <option value="EdTech & Healthcare">HealthTech & Life Sciences</option>
                <option value="Manufacturing & Core">Core Engineering & Manufacturing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
                Headquarters / Office Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bengaluru, India"
                className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
                Company Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://www.cisco.com"
                className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
                HR Contact Name
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Neha Sharma"
                className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
                HR Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="recruiting@company.com"
                className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
                HR Phone / Mobile
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#000a1e]">
              Company Profile / Overview
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description of the organization and recruitment profile..."
              className="w-full text-xs font-medium bg-[#f8f9ff] border border-[#c4c6cf] rounded-xl px-4 py-2.5 outline-none focus:border-[#0058be] resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#eff4ff]">
            <Link
              href="/companies"
              className="px-5 py-2.5 rounded-xl border border-[#c4c6cf] text-xs font-semibold text-[#44474e] hover:bg-[#f8f9ff] transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#000a1e] hover:bg-[#002147] text-white text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? "Registering..." : "Register Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
