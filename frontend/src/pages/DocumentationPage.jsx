import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import logo from '../assets/logo.png';
import { useThemeStore } from '../store/useThemeStore';

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'start', label: 'Quick Start' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'conventions', label: 'Conventions' },
  { id: 'contributors', label: 'Contributing' },
  { id: 'checklist', label: 'PR Checklist' },
];

const techCards = [
  {
    title: 'Backend',
    text: 'Node.js, Express, MongoDB, JWT auth, validation middleware, and centralized API responses.',
  },
  {
    title: 'Frontend',
    text: 'React + Vite, route-based pages, reusable components, and focused feature modules.',
  },
  {
    title: 'Open Source Focus',
    text: 'Contributor-friendly structure with clear docs, predictable patterns, and review-ready changes.',
  },
];

const DocumentationPage = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.3,
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f8f7] dark:bg-[#07090d] text-zinc-900 dark:text-white transition-colors">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-60 left-1/2 -translate-x-1/2 w-237.5 h-237.5 rounded-full bg-[radial-gradient(circle,rgba(0,220,130,0.12),transparent_60%)] blur-3xl" />
        <div className="absolute top-[20%] right-[-10%] w-125 h-125 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-[-5%] w-105 h-105 rounded-full bg-emerald-400/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <header className="sticky top-4 z-50 px-4">
        <div className="max-w-7xl mx-auto h-16 rounded-[28px] border border-white/50 dark:border-white/10 bg-white/75 dark:bg-[#0c0f14]/70 backdrop-blur-2xl shadow-[0_8px_40px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.45)] flex items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-white flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-white/10 p-1 shadow-sm">
              <img src={logo} alt="GitNest Logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-black tracking-tight">
                Git<span className="text-emerald-400">Nest</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Documentation</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl bg-linear-to-r from-[#00dc82] via-[#2be4da] to-[#4fd1ff] text-black font-semibold text-sm hover:scale-[1.02] transition-all shadow-[0_10px_30px_rgba(0,220,130,0.22)]"
            >
              Join Project
            </Link>
            <Link
              to="/"
              className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-white/3 backdrop-blur-xl text-sm text-zinc-600 dark:text-zinc-300 hover:shadow-lg transition-all"
            >
              Home
            </Link>

            <button
              onClick={toggleTheme}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={isDarkMode}
              className="relative w-22.5 h-12 rounded-full bg-white dark:bg-[#11151c] border border-zinc-200 dark:border-white/10 shadow-inner flex items-center px-1"
            >
              <div
                className={`absolute top-1 w-10 h-10 rounded-full bg-linear-to-br from-[#00dc82] to-cyan-400 transition-all duration-500 shadow-lg ${
                  isDarkMode ? 'translate-x-11.25' : 'translate-x-0'
                }`}
              />
              <div className="relative flex w-full justify-between px-1 z-10">
                <Sun className="w-7 h-5 text-zinc-700" />
                <Moon className="w-5 h-5 text-zinc-700" />
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 lg:py-14">
        <section className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-8">
          <aside className="lg:sticky lg:top-24 h-fit rounded-4xl border border-white/60 dark:border-white/5 bg-white/70 dark:bg-white/3 backdrop-blur-2xl p-6 shadow-[0_15px_50px_rgba(15,23,42,0.06)]">
            <div className="text-xs font-semibold tracking-[0.3em] uppercase text-emerald-400 mb-4">Contents</div>
            <nav className="space-y-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setActiveSection(section.id)}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                    activeSection === section.id
                      ? 'bg-linear-to-r from-[#e9fff5] to-[#f4fffb] dark:from-[#102019] dark:to-[#0f1714] text-[#00c97b] border border-[#00dc82]/10 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-300 hover:bg-white/70 dark:hover:bg-white/5 hover:text-[#00c97b]'
                  }`}
                >
                  {section.label}
                </a>
              ))}
            </nav>

            <div className="mt-6 rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-4 text-sm text-zinc-700 dark:text-zinc-300">
              Start here if you are a new contributor. The page is optimized for clarity, not just appearance.
            </div>
          </aside>

          <section className="space-y-6">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 dark:border-white/5 bg-linear-to-br from-white via-[#fbfffd] to-[#f6fffb] dark:from-[#11161d] dark:to-[#0d1218] p-8 md:p-10 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
              <div className="absolute top-0 right-0 w-72 h-72 bg-[#00dc82]/10 blur-3xl rounded-full" />
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/20 bg-linear-to-r from-[#ebfff6] to-[#f4fffb] dark:from-[#112018] dark:to-[#101a17] text-[#00c97b] text-sm mb-6">
                Open Source Contributor Guide
              </div>

              <h1 className="text-4xl md:text-6xl font-black leading-none tracking-tight mb-5 text-zinc-900 dark:text-black-200">
                GitNest Documentation
              </h1>

              <p className="text-lg text-zinc-500 dark:text-zinc-900 leading-8 max-w-3xl">
                A professional starting point for contributors and maintainers. Use this page to understand the project structure, run the app locally, and keep changes consistent with the repository standards.
              </p>
              <div className="mt-8 grid md:grid-cols-3 gap-4">
                {techCards.map((card) => (
                  <div key={card.title} className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-white/5 bg-linear-to-br from-white to-[#f7fffb] dark:from-[#121820] dark:to-[#0f141a] p-5 shadow-sm hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute left-0 top-0 h-full w-0.75 bg-linear-to-b from-[#00dc82] to-cyan-400 rounded-full" />
                    <h3 className="font-bold text-lg mb-2">{card.title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-7">{card.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <section id="overview" className="rounded-3xl border border-zinc-200/80 dark:border-white/5 bg-white/70 dark:bg-white/3 backdrop-blur-xl p-7 md:p-8 shadow-[0_10px_40px_rgba(15,23,42,0.05)]">
              <p className="bg-linear-to-r from-[#00c97b] to-cyan-400 bg-clip-text text-transparent text-sm font-semibold tracking-widest uppercase mb-3">1. Overview</p>
              <h2 className="text-3xl font-black tracking-tight mb-4">What GitNest is</h2>
              <p className="text-zinc-500 dark:text-zinc-400 leading-8 max-w-4xl">
                GitNest is a GitHub-inspired collaborative development platform built with the MERN stack. It supports repository workflows, authentication, profile management, and a contributor-friendly open source experience.
              </p>
            </section>

            <section id="start" className="rounded-3xl border border-zinc-200/80 dark:border-white/5 bg-white/70 dark:bg-white/3 backdrop-blur-xl p-7 md:p-8 shadow-[0_10px_40px_rgba(15,23,42,0.05)]">
              <p className="bg-linear-to-r from-[#00c97b] to-cyan-400 bg-clip-text text-transparent text-sm font-semibold tracking-widest uppercase mb-3">2. Quick Start</p>
              <h2 className="text-3xl font-black tracking-tight mb-4">Run the project locally</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-zinc-200/80 dark:border-white/5 bg-white/80 dark:bg-[#0e141b] p-5 shadow-inner">
                  <h3 className="font-bold mb-3">Backend</h3>
                  <pre className="overflow-auto text-sm leading-7 text-emerald-200 bg-[#09111d] rounded-2xl p-4 m-0"><code>cd backend
npm install
npm run dev</code></pre>
                </div>
                <div className="rounded-2xl border border-zinc-200/80 dark:border-white/5 bg-white/80 dark:bg-[#0e141b] p-5 shadow-inner">
                  <h3 className="font-bold mb-3">Frontend</h3>
                  <pre className="overflow-auto text-sm leading-7 text-emerald-200 bg-[#09111d] rounded-2xl p-4 m-0"><code>cd frontend
npm install
npm run dev</code></pre>
                </div>
              </div>
              <p className="mt-4 text-zinc-500 dark:text-zinc-400 leading-7">
                If you prefer containerized development, use <span className="font-medium text-zinc-900 dark:text-white">docker-compose.yml</span>.
              </p>
            </section>

            <section id="architecture" className="rounded-3xl border border-zinc-200/80 dark:border-white/5 bg-white/70 dark:bg-white/3 backdrop-blur-xl p-7 md:p-8 shadow-[0_10px_40px_rgba(15,23,42,0.05)]">
              <p className="bg-linear-to-r from-[#00c97b] to-cyan-400 bg-clip-text text-transparent text-sm font-semibold tracking-widest uppercase mb-3">3. Architecture</p>
              <h2 className="text-3xl font-black tracking-tight mb-4">How the codebase is organized</h2>
              <div className="rounded-2xl border border-zinc-200/80 dark:border-white/5 bg-white/80 dark:bg-white/3 p-5 shadow-sm overflow-auto">
                <pre className="m-0 text-sm leading-7 text-zinc-700 dark:text-zinc-200"><code>GitNest/
  backend/
    src/
      controllers/
      routes/
      middleware/
      models/
      validators/
      utils/
  frontend/
    src/
      pages/
      components/
      api/
      store/
      utils/</code></pre>
              </div>
              <p className="mt-4 text-zinc-500 dark:text-zinc-400 leading-7">
                The backend follows a route-controller-model pattern. The frontend stays page-focused, with reusable components and feature-specific API modules.
              </p>
            </section>

            <section id="conventions" className="rounded-3xl border border-zinc-200/80 dark:border-white/5 bg-white/70 dark:bg-white/3 backdrop-blur-xl p-7 md:p-8 shadow-[0_10px_40px_rgba(15,23,42,0.05)]">
              <p className="bg-linear-to-r from-[#00c97b] to-cyan-400 bg-clip-text text-transparent text-sm font-semibold tracking-widest uppercase mb-3">4. Conventions</p>
              <h2 className="text-3xl font-black tracking-tight mb-4">How to keep changes consistent</h2>
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="rounded-2xl border border-zinc-200/80 dark:border-white/5 bg-white/80 dark:bg-white/3 p-5 shadow-sm">
                  <h3 className="font-bold text-lg mb-3">Backend</h3>
                  <ul className="space-y-3 text-zinc-500 dark:text-zinc-400 leading-7">
                    <li>Keep request logic inside controllers, not routes.</li>
                    <li>Place validation in the validators and middleware layer.</li>
                    <li>Use centralized response helpers and shared error handling.</li>
                    <li>Avoid mixing business logic into transport code.</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-zinc-200/80 dark:border-white/5 bg-white/80 dark:bg-white/3 p-5 shadow-sm">
                  <h3 className="font-bold text-lg mb-3">Frontend</h3>
                  <ul className="space-y-3 text-zinc-500 dark:text-zinc-400 leading-7">
                    <li>Keep pages route-focused and components reusable.</li>
                    <li>Centralize HTTP calls in API modules.</li>
                    <li>Use stores only for shared state, not everything.</li>
                    <li>Design loading, success, and error states explicitly.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="contributors" className="rounded-3xl border border-zinc-200/80 dark:border-white/5 bg-white/70 dark:bg-white/3 backdrop-blur-xl p-7 md:p-8 shadow-[0_10px_40px_rgba(15,23,42,0.05)]">
              <p className="bg-linear-to-r from-[#00c97b] to-cyan-400 bg-clip-text text-transparent text-sm font-semibold tracking-widest uppercase mb-3">5. Contributing</p>
              <h2 className="text-3xl font-black tracking-tight mb-4">Contributor workflow</h2>
              <ol className="space-y-3 text-zinc-500 dark:text-zinc-400 leading-7 pl-5">
                <li>Create a focused branch from <span className="font-medium text-zinc-900 dark:text-white">main</span>.</li>
                <li>Make small, reviewable commits with clear messages.</li>
                <li>Run linting and test the touched flow locally.</li>
                <li>Open a pull request with the problem, solution, and impact.</li>
                <li>Attach screenshots or short clips for UI work.</li>
              </ol>
            </section>

            <section id="checklist" className="rounded-3xl border border-zinc-200/80 dark:border-white/5 bg-white/70 dark:bg-white/3 backdrop-blur-xl p-7 md:p-8 shadow-[0_10px_40px_rgba(15,23,42,0.05)]">
              <p className="bg-linear-to-r from-[#00c97b] to-cyan-400 bg-clip-text text-transparent text-sm font-semibold tracking-widest uppercase mb-3">6. PR Checklist</p>
              <h2 className="text-3xl font-black tracking-tight mb-4">Before you submit</h2>
              <ul className="space-y-3 text-zinc-600 dark:text-zinc-300 leading-7">
                <li>The change matches the existing structure and naming patterns.</li>
                <li>No secrets, keys, or private values are committed to source files.</li>
                <li>New endpoints include validation and error-path handling.</li>
                <li>UI changes include loading and failure states where needed.</li>
                <li>The pull request description explains the value of the change clearly.</li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/register" className="px-5 py-3 rounded-2xl bg-linear-to-r from-[#00dc82] via-[#2be4da] to-[#4fd1ff] text-black font-semibold shadow-[0_10px_40px_rgba(0,220,130,0.25)] hover:-translate-y-1 transition-all">
                  Start Contributing
                </Link>
                <Link to="/" className="px-5 py-3 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-white/3 backdrop-blur-xl hover:shadow-lg transition-all">
                  Back to Home
                </Link>
              </div>
            </section>
          </section>
        </section>
      </main>
    </div>
  );
};

export default DocumentationPage;