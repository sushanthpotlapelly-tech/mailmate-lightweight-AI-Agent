import React from 'react';
import {
  Mail,
  CheckSquare,
  Calendar,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Clock,
  Inbox,
  FileText,
  Lock,
} from 'lucide-react';

interface LandingPageProps {
  onConnectGmail: () => void;
  onStartDemo: () => void;
  isLoggingIn: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onConnectGmail,
  onStartDemo,
  isLoggingIn,
}) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Top Bar Contract: Zone 1 Brand | Zone 2 Nav Links | Zone 3 1 Primary Action */}
      <header className="flex items-center justify-between gap-8 px-6 lg:px-12 py-4 border-b border-slate-200 max-w-[1440px] w-full mx-auto">
        <a
          href="#top"
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          MailMate
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a
            href="#features"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Capabilities
          </a>
          <a
            href="#digest-preview"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Daily Digest
          </a>
          <a
            href="#security"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Privacy
          </a>
          <a
            href="#setup"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Local Setup
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            onClick={onStartDemo}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Open Workspace
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 lg:px-12 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-xs font-semibold text-indigo-700 tracking-tight mb-3">
              Lightweight AI Email Assistant · Less reading. More doing.
            </p>
            <h1
              className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15] mb-6"
              style={{ textWrap: 'balance' }}
            >
              Transform a crowded inbox into clear, actionable priorities.
            </h1>
            <p className="text-base text-slate-600 leading-relaxed mb-8 max-w-xl">
              MailMate summarizes incoming messages, extracts deadlines and
              action items, categorizes academic and work threads, and suggests
              your next step—grounded strictly in your real emails.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              {/* Official Sign in with Google button style */}
              <button
                onClick={onConnectGmail}
                disabled={isLoggingIn}
                className="gsi-material-button"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      style={{ display: 'block' }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {isLoggingIn ? 'Connecting Gmail...' : 'Connect Gmail with Google'}
                  </span>
                </div>
              </button>

              <button
                onClick={onStartDemo}
                className="px-4 py-2.5 text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Explore Interactive Demo (9 Sample Emails)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Read-only Gmail OAuth 2.0</span>
              <span aria-hidden="true">·</span>
              <span>Server-side Gemini 3.8 Flash</span>
              <span aria-hidden="true">·</span>
              <span>Zero password storage</span>
            </div>
          </div>

          {/* Right Column: Live Interactive Preview of Daily Digest */}
          <div
            id="digest-preview"
            className="lg:col-span-6 bg-slate-900 text-white rounded-xl p-6 lg:p-8 flex flex-col justify-between border border-slate-800"
          >
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
                <div>
                  <p className="text-xs text-indigo-300 font-medium">
                    Example Demo Data · Daily AI Digest
                  </p>
                  <h2 className="text-lg font-semibold text-white mt-0.5">
                    AI Email Summary — Today
                  </h2>
                </div>
                <div className="text-right font-mono text-xs text-slate-300 tabular-nums">
                  <div>Total emails processed: 9</div>
                  <div className="text-indigo-300">Items requiring attention: 3</div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 mb-2.5">
                    Key Updates (Extracted from Emails)
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-200">
                    <li className="flex items-start justify-between gap-4 py-1.5 border-b border-slate-800/80">
                      <span>Exam schedule released by the college.</span>
                      <span className="text-xs text-slate-400 font-mono whitespace-nowrap">
                        Registrar
                      </span>
                    </li>
                    <li className="flex items-start justify-between gap-4 py-1.5 border-b border-slate-800/80">
                      <span>Project file review requested by the team.</span>
                      <span className="text-xs text-slate-400 font-mono whitespace-nowrap">
                        Elena Rostova
                      </span>
                    </li>
                    <li className="flex items-start justify-between gap-4 py-1.5 border-b border-slate-800/80">
                      <span>Internship opportunity announced by HR.</span>
                      <span className="text-xs text-slate-400 font-mono whitespace-nowrap">
                        Lumina AI HR
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-indigo-300 mb-2.5">
                    Action Items & Recommended Next Steps
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-200">
                    <li className="py-1.5 flex items-center justify-between gap-4">
                      <span>1. Check the exam schedule and plan study time.</span>
                      <span className="text-xs font-mono text-amber-300 whitespace-nowrap tabular-nums">
                        Due Oct 16
                      </span>
                    </li>
                    <li className="py-1.5 flex items-center justify-between gap-4">
                      <span>2. Share the project file by the stated deadline.</span>
                      <span className="text-xs font-mono text-rose-300 whitespace-nowrap tabular-nums">
                        Due Oct 11
                      </span>
                    </li>
                    <li className="py-1.5 flex items-center justify-between gap-4">
                      <span>
                        3. Review the internship opportunity and decide whether to apply.
                      </span>
                      <span className="text-xs font-mono text-indigo-300 whitespace-nowrap tabular-nums">
                        Due Oct 18
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Sample preview based on 9 realistic demo messages</span>
              <button
                onClick={onStartDemo}
                className="text-indigo-300 hover:text-white font-medium underline cursor-pointer"
              >
                Inspect in Demo Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Core Capabilities Grid */}
        <section id="features" className="mt-20 pt-16 border-t border-slate-200">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Designed for Students, Engineers, and Busy Teams
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every email is parsed into factual summaries, explicit dates, smart
              categories, and verifiable tasks without inventing commitments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
              <Sparkles className="w-5 h-5 text-indigo-600 mb-3" />
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                01. Grounded AI Summarization
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Extracts a 1–2 sentence summary, primary purpose, key people,
                and explicit dates using Gemini 3.8 Flash. If a date is not
                stated in the email, MailMate states it is unclear rather than
                guessing.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
              <CheckSquare className="w-5 h-5 text-indigo-600 mb-3" />
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                02. Action Item & Deadline Extraction
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Automatically detects tasks, priorities (High, Medium, Low), and
                suggested next actions. Mark tasks complete, reopen them, or
                sort by deadline and priority.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
              <ShieldCheck className="w-5 h-5 text-indigo-600 mb-3" />
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                03. Untrusted Content Isolation
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Email bodies are treated strictly as untrusted data. MailMate
                never follows prompt injections inside emails and requires
                explicit user confirmation before any reply or action.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy & Local Setup Section */}
        <section
          id="security"
          className="mt-16 pt-16 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Privacy & Least-Privilege Security
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              MailMate uses official Google OAuth 2.0 with the read-only{' '}
              <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                gmail.readonly
              </code>{' '}
              permission. Access tokens are held exclusively in browser memory
              and cleared immediately upon sign-out.
            </p>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>· Server-side Gemini API proxy keeps keys out of the browser</li>
              <li>· Never asks for or stores your Gmail password</li>
              <li>· One-click Disconnect Account revokes session state</li>
              <li>· No automatic sending, deleting, or modifying of emails</li>
            </ul>
          </div>

          <div id="setup" className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="text-base font-semibold text-slate-900 mb-2">
              Running MailMate Locally & Environment Setup
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              Configure <code className="font-mono">.env</code> based on{' '}
              <code className="font-mono">.env.example</code> and start the
              full-stack Express + Vite server on port 3000:
            </p>
            <pre className="bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-lg overflow-x-auto leading-relaxed">
{`# 1. Copy environment template
cp .env.example .env

# 2. Set GEMINI_API_KEY in .env
GEMINI_API_KEY="your_gemini_api_key"

# 3. Install dependencies & start full-stack server
npm install
npm run dev`}
            </pre>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-6 px-6 lg:px-12 text-xs text-slate-500 max-w-[1440px] w-full mx-auto flex flex-wrap items-center justify-between gap-4">
        <span>MailMate — Lightweight AI Email Assistant · Less reading. More doing.</span>
        <div className="flex items-center gap-4">
          <button
            onClick={onStartDemo}
            className="hover:text-slate-900 underline cursor-pointer"
          >
            Launch Demo Mode
          </button>
          <span>·</span>
          <button
            onClick={onConnectGmail}
            className="hover:text-slate-900 underline cursor-pointer"
          >
            Connect Gmail
          </button>
        </div>
      </footer>
    </div>
  );
};
