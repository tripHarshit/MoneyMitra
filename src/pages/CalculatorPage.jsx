import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { ArrowLeft, TrendingUp, DollarSign, Calculator, Target } from 'lucide-react'

const fmt = (n) => Math.round(n).toLocaleString('en-IN')

// ─── Slider Input ─────────────────────────────────────────────────────────────
function SliderInput({ label, value, onChange, min, max, step = 1, prefix = '', suffix = '' }) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-semibold text-emerald-800">{label}</label>
        <span className="rounded-lg bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-900 border border-emerald-200">
          {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-emerald-600 cursor-pointer"
      />
      <div className="mt-1 flex justify-between text-xs text-emerald-600/70 font-medium">
        <span>{prefix}{min.toLocaleString('en-IN')}{suffix}</span>
        <span>{prefix}{max.toLocaleString('en-IN')}{suffix}</span>
      </div>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, highlight }) {
  return (
    <div className={`rounded-2xl border p-4 text-center ${highlight
      ? 'border-emerald-300 bg-emerald-50'
      : 'border-emerald-100 bg-white'}`}>
      <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700/70">{label}</p>
      <p className={`mt-1 font-bold ${highlight ? 'text-2xl text-emerald-800' : 'text-xl text-emerald-900'}`}>
        ₹{value}
      </p>
    </div>
  )
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-emerald-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm text-xs">
      <p className="mb-1 font-bold text-emerald-900">Year {label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: ₹{fmt(p.value)}
        </p>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1 — SIP CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────
function SIPCalculator() {
  const [monthly, setMonthly] = useState(5000)
  const [years, setYears] = useState(10)
  const [rate, setRate] = useState(12)

  const totalInvested = monthly * 12 * years
  const monthlyRate = rate / 12 / 100
  const months = years * 12
  const corpus = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
  const returns = corpus - totalInvested

  const chartData = Array.from({ length: years }, (_, i) => {
    const y = i + 1
    const m = y * 12
    const invested = monthly * 12 * y
    const total = monthly * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) * (1 + monthlyRate)
    return { year: y, Invested: Math.round(invested), Returns: Math.round(total - invested) }
  })

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Inputs */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-base font-bold text-emerald-900">Configure your SIP</h3>
        <SliderInput label="Monthly Investment" value={monthly} onChange={setMonthly} min={500} max={100000} step={500} prefix="₹" />
        <SliderInput label="Duration" value={years} onChange={setYears} min={1} max={30} suffix=" yrs" />
        <SliderInput label="Expected Annual Return" value={rate} onChange={setRate} min={1} max={30} suffix="%" />
      </div>

      {/* Outputs */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Invested" value={fmt(totalInvested)} />
          <StatCard label="Est. Returns" value={fmt(returns)} />
          <StatCard label="Total Corpus" value={fmt(corpus)} highlight />
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-700/70">Corpus Growth</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="sipInvested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="sipReturns" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5f0eb" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#6d7a72' }} />
              <YAxis tick={{ fontSize: 10, fill: '#6d7a72' }} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Invested" stackId="1" stroke="#059669" fill="url(#sipInvested)" strokeWidth={2} />
              <Area type="monotone" dataKey="Returns" stackId="1" stroke="#10b981" fill="url(#sipReturns)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2 — LUMP SUM CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────
function LumpSumCalculator() {
  const [amount, setAmount] = useState(100000)
  const [years, setYears] = useState(10)
  const [rate, setRate] = useState(12)

  const finalValue = amount * Math.pow(1 + rate / 100, years)
  const gain = finalValue - amount

  const chartData = Array.from({ length: years }, (_, i) => {
    const y = i + 1
    const val = amount * Math.pow(1 + rate / 100, y)
    return { year: y, Invested: amount, Returns: Math.round(val - amount) }
  })

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-base font-bold text-emerald-900">One-time Investment</h3>
        <SliderInput label="Investment Amount" value={amount} onChange={setAmount} min={1000} max={10000000} step={1000} prefix="₹" />
        <SliderInput label="Duration" value={years} onChange={setYears} min={1} max={30} suffix=" yrs" />
        <SliderInput label="Expected Annual Return" value={rate} onChange={setRate} min={1} max={30} suffix="%" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Gain" value={fmt(gain)} />
          <StatCard label="Final Value" value={fmt(finalValue)} highlight />
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-700/70">Value Growth</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="lsInvested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="lsReturns" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5f0eb" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#6d7a72' }} />
              <YAxis tick={{ fontSize: 10, fill: '#6d7a72' }} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Invested" stackId="1" stroke="#059669" fill="url(#lsInvested)" strokeWidth={2} />
              <Area type="monotone" dataKey="Returns" stackId="1" stroke="#10b981" fill="url(#lsReturns)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3 — LOAN EMI CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────
function EMICalculator() {
  const [loan, setLoan] = useState(500000)
  const [rate, setRate] = useState(9)
  const [tenure, setTenure] = useState(60)

  const monthlyRate = rate / 12 / 100
  const emi = monthlyRate === 0
    ? loan / tenure
    : (loan * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1)
  const totalPayment = emi * tenure
  const totalInterest = totalPayment - loan

  const pieData = [
    { name: 'Principal', value: Math.round(loan) },
    { name: 'Interest', value: Math.round(totalInterest) }
  ]
  const COLORS = ['#059669', '#34d399']

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-base font-bold text-emerald-900">Loan Details</h3>
        <SliderInput label="Loan Amount" value={loan} onChange={setLoan} min={10000} max={10000000} step={10000} prefix="₹" />
        <SliderInput label="Annual Interest Rate" value={rate} onChange={setRate} min={1} max={30} suffix="%" />
        <SliderInput label="Tenure" value={tenure} onChange={setTenure} min={6} max={360} step={6} suffix=" mo" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Monthly EMI" value={fmt(emi)} highlight />
          <StatCard label="Total Payment" value={fmt(totalPayment)} />
          <StatCard label="Total Interest" value={fmt(totalInterest)} />
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm flex flex-col items-center">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-emerald-700/70 self-start">Principal vs Interest</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => `₹${fmt(v)}`} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 4 — GOAL REVERSE CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────
function GoalCalculator() {
  const [target, setTarget] = useState(500000)
  const [months, setMonths] = useState(24)
  const [rate, setRate] = useState(12)
  const [motivation, setMotivation] = useState('')
  const [motivLoading, setMotivLoading] = useState(false)

  const monthlyRate = rate / 12 / 100
  const requiredSIP = monthlyRate === 0
    ? target / months
    : (target * monthlyRate) / ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate))

  const fetchMotivation = async () => {
    if (motivLoading) return
    setMotivLoading(true)
    setMotivation('')
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY
      const prompt = `User wants to save ₹${fmt(target)} in ${months} months. Give one encouraging sentence under 20 words.`
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      )
      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      setMotivation(text.trim())
    } catch {
      setMotivation('Every rupee saved today builds the freedom of tomorrow.')
    } finally {
      setMotivLoading(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-base font-bold text-emerald-900">Define your Goal</h3>
        <SliderInput label="Target Amount" value={target} onChange={setTarget} min={10000} max={10000000} step={10000} prefix="₹" />
        <SliderInput label="Time to Achieve" value={months} onChange={setMonths} min={3} max={360} step={1} suffix=" mo" />
        <SliderInput label="Expected Annual Return" value={rate} onChange={setRate} min={1} max={30} suffix="%" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700/70">Required Monthly SIP</p>
          <p className="mt-2 text-4xl font-extrabold text-emerald-900">₹{fmt(requiredSIP)}</p>
          <p className="mt-1 text-sm text-emerald-700">for {months} months at {rate}% p.a.</p>
        </div>

        <button
          onClick={fetchMotivation}
          disabled={motivLoading}
          className="w-full rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {motivLoading ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
              Getting motivation from AI…
            </>
          ) : (
            <>
              <span>✨</span> Get AI Motivation
            </>
          )}
        </button>

        {motivation && !motivLoading && (
          <div className="rounded-2xl border border-amber-200/60 bg-amber-50/60 p-4 flex items-center gap-3">
            <span className="text-xl">✨</span>
            <p className="text-sm font-medium text-amber-900 italic">"{motivation}"</p>
          </div>
        )}

        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
          <div className="flex justify-between text-sm">
            <span className="text-emerald-700">Total invested</span>
            <span className="font-bold text-emerald-900">₹{fmt(requiredSIP * months)}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-emerald-700">Returns earned</span>
            <span className="font-bold text-emerald-900">₹{fmt(target - requiredSIP * months)}</span>
          </div>
          <div className="mt-3 h-px bg-emerald-100" />
          <div className="flex justify-between text-sm mt-3">
            <span className="font-bold text-emerald-800">Goal amount</span>
            <span className="font-extrabold text-emerald-900">₹{fmt(target)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'sip', label: 'SIP', icon: TrendingUp, component: SIPCalculator },
  { id: 'lumpsum', label: 'Lump Sum', icon: DollarSign, component: LumpSumCalculator },
  { id: 'emi', label: 'Loan EMI', icon: Calculator, component: EMICalculator },
  { id: 'goal', label: 'Goal', icon: Target, component: GoalCalculator },
]

export default function CalculatorPage() {
  const navigate = useNavigate()
  const [active, setActive] = useState('sip')

  const ActiveComponent = TABS.find(t => t.id === active)?.component

  return (
    <div className="min-h-screen bg-[#f2fcf8] text-[#141d1b]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-emerald-100 bg-white/90 backdrop-blur-xl px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/app')}
          className="rounded-xl border border-emerald-200 bg-white p-2 text-emerald-700 hover:bg-emerald-50 transition"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-emerald-900">What-If Calculator</h1>
          <p className="text-xs text-emerald-700/70">Explore financial scenarios instantly</p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-8">
        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-emerald-100 bg-white p-1.5 shadow-sm">
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex flex-1 min-w-22.5 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition whitespace-nowrap ${
                active === tab.id
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/20'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <TabIcon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )})}
        </div>

        {/* Calculator panel */}
        <div className="rounded-3xl border border-emerald-100 bg-[#f8fdf9] p-4 md:p-6 shadow-sm">
          {ActiveComponent && <ActiveComponent />}
        </div>

        <p className="mt-4 text-center text-xs text-emerald-600/50 font-medium">
          All calculations are estimates for illustrative purposes only. Returns are not guaranteed.
        </p>
      </main>
    </div>
  )
}
