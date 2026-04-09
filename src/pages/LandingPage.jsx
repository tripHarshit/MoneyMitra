import { Link } from 'react-router-dom';
import { ArrowRight, Wallet, Sparkles, Shield, Target, BookOpen, TrendingUp, Star, Zap } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    title: 'AI Financial Coach',
    description: 'Chat with an AI that knows your goals and gives personalized, actionable advice — not generic tips.',
  },
  {
    icon: TrendingUp,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    title: 'Expense Tracker',
    description: 'Log spending in seconds and get AI insights that tell you exactly where your money is going.',
  },
  {
    icon: Target,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    title: 'Goal Tracker',
    description: 'Set savings goals with smart monthly targets and track your real progress automatically.',
  },
  {
    icon: BookOpen,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    title: 'Learning Hub',
    description: 'Build financial literacy with bite-sized modules designed for Indian earners.',
  },
  {
    icon: Shield,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
    title: 'Privacy First',
    description: 'Your financial data is encrypted and never sold. Always private, always yours.',
  },
  {
    icon: Zap,
    color: 'text-lime-400',
    bg: 'bg-lime-400/10',
    title: 'Instant Insights',
    description: 'From budget tables to latte-factor calculations — get answers in under 3 seconds.',
  },
];

const steps = [
  { num: '01', title: 'Create your profile', desc: 'Tell us your occupation and goals — takes 30 seconds.' },
  { num: '02', title: 'Log expenses & goals', desc: 'Track spending and define what you\'re saving toward.' },
  { num: '03', title: 'Chat with your AI coach', desc: 'Ask anything. Get personalized, instant financial guidance.' },
];

const LandingPage = () => {
  const demoMessages = [
    { user: true,  text: 'I want to save ₹8,000 per month. Can I still enjoy weekends out?' },
    { user: false, text: 'Yes. Cut delivery spend by 20% and move that ₹1,600 straight to your travel goal.' },
    { user: true,  text: 'Nice. Show me my projected balance in 6 months.' },
    { user: false, text: 'On track: ₹52,400 saved by October with your current plan. 🎯' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06150d] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[8%] h-96 w-96 rounded-full bg-emerald-500/12 blur-[80px]" />
        <div className="absolute right-[5%] top-[15%] h-80 w-80 rounded-full bg-emerald-600/10 blur-[60px]" />
        <div className="absolute bottom-[10%] left-[20%] h-72 w-72 rounded-full bg-emerald-400/8 blur-[70px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.028]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '48px 48px' }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-20 pt-5 sm:px-8 lg:px-10">

        {/* ── Nav ───────────────────────────────────────── */}
        <header className="mb-16 flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-5 py-3.5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-emerald shadow-lg shadow-emerald-900/30">
              <Wallet className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <p className="font-headline text-base font-extrabold text-white">MoneyMitra</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300/60">AI Financial Coach</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/8"
            >
              Sign in
            </Link>
            <Link
              to="/login"
              className="rounded-xl gradient-emerald-bright px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 transition hover:brightness-110"
            >
              Get started free
            </Link>
          </div>
        </header>

        {/* ── Hero ─────────────────────────────────────── */}
        <section className="grid items-center gap-12 py-4 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Financial guidance built for real Indian earners
            </div>

            <h1 className="font-headline text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl xl:text-6xl">
              Your AI-Powered<br />
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                Financial Coach
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg">
              Track expenses, crush savings goals, and get personalized financial advice — powered by AI, built for you.
            </p>

            {/* Social proof */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center">
                {['#10b981','#059669','#047857','#065f46','#064e3b'].map((c, i) => (
                  <div
                    key={i}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#06150d] text-[10px] font-bold text-white"
                    style={{ background: c, marginLeft: i === 0 ? 0 : -8 }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm text-slate-300">
                <span className="font-semibold text-white">1,200+</span> users · <Star className="inline h-3 w-3 text-amber-400 fill-amber-400" /> <span className="font-semibold text-white">4.8</span>/5
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl gradient-emerald-bright px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-900/30 transition hover:brightness-110"
              >
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Demo chat */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-emerald-500/25 via-emerald-400/8 to-lime-300/15 blur-2xl" />
            <div className="relative rounded-3xl border border-white/12 bg-white/8 p-5 backdrop-blur-2xl shadow-2xl">
              {/* Chat header */}
              <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/8 bg-[#0a2017]/80 px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-emerald">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-slate-300">MoneyMitra AI Chat</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>

              <div className="space-y-3">
                {demoMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.user
                        ? 'mr-6 border border-emerald-300/20 bg-emerald-400/12 text-emerald-50'
                        : 'ml-6 border border-emerald-200/15 bg-white/8 text-slate-200'
                    }`}
                    style={{
                      opacity: 0,
                      animation: 'slideUpFadeIn 0.45s ease forwards',
                      animationDelay: `${i * 160}ms`,
                    }}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────── */}
        <section id="features" className="scroll-mt-24 py-24">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400/60">Features</p>
            <h2 className="mt-3 font-headline text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Everything you need to grow smarter
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-slate-300">
              Built for Indian earners — from students to self-employed, and everyone in between.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/18 hover:bg-white/9"
                >
                  <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.bg}`}>
                    <Icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-headline text-base font-bold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── How it works ─────────────────────────────── */}
        <section id="how-it-works" className="scroll-mt-24 py-4">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400/60">How it works</p>
            <h2 className="mt-3 font-headline text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Start in 3 simple steps
            </h2>
          </div>

          <div className="relative grid gap-4 md:grid-cols-3">
            {/* Connector line */}
            <div className="absolute left-[16.5%] top-8 hidden h-0.5 w-[67%] bg-gradient-to-r from-emerald-500/40 via-emerald-400/20 to-emerald-500/40 md:block" />

            {steps.map((step, i) => (
              <div key={step.num} className="relative rounded-2xl border border-white/10 bg-white/6 p-6 backdrop-blur">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl gradient-emerald shadow-lg shadow-emerald-900/25 text-sm font-extrabold text-white">
                  {step.num}
                </div>
                <h3 className="font-headline text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA band ─────────────────────────────────── */}
        <section className="mt-20 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 p-10 text-center backdrop-blur">
          <div className="mx-auto max-w-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-emerald shadow-xl shadow-emerald-900/30">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <h2 className="font-headline text-3xl font-extrabold text-white">Ready to take control?</h2>
            <p className="mt-3 text-slate-300">Join 1,200+ Indians building better money habits with MoneyMitra.</p>
            <div className="mt-7">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-2xl gradient-emerald-bright px-8 py-4 text-base font-bold text-white shadow-xl shadow-emerald-900/30 transition hover:brightness-110"
              >
                Get Started — It&apos;s Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────── */}
        <footer className="mt-16 rounded-2xl border border-white/8 bg-white/4 px-6 py-6 text-center backdrop-blur">
          <p className="font-semibold text-slate-200">MoneyMitra © {new Date().getFullYear()}</p>
          <p className="mt-1 text-sm text-slate-400">Smart money decisions start here · Made with ♥ in India</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-emerald-300/60">
            <a href="#" className="transition hover:text-emerald-300">Privacy Policy</a>
            <span className="text-white/20">·</span>
            <a href="#" className="transition hover:text-emerald-300">Terms of Service</a>
            <span className="text-white/20">·</span>
            <a href="mailto:support@moneymitra.app" className="transition hover:text-emerald-300">Support</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
