import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Inbox,
  Sparkles,
  CheckSquare,
  Star,
  Settings,
  Search,
  Bell,
  LogOut,
  RefreshCw,
  FileText,
  CheckCircle2,
  Circle,
  Calendar,
  ArrowUpRight,
  AlertCircle,
  Filter,
  ShieldCheck,
  Mail,
  BookOpen,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  EmailMessage,
  ActionItem,
  DailyDigest,
  ALL_CATEGORIES,
  PriorityLevel,
} from './types';
import { DEMO_EMAILS, DEMO_DAILY_DIGEST } from './data/demoEmails';
import { initAuth, googleSignIn, logout, getAccessToken } from './lib/auth';
import { LandingPage } from './components/LandingPage';
import { EmailDetailDrawer } from './components/EmailDetailDrawer';

type NavPage =
  | 'dashboard'
  | 'inbox'
  | 'summaries'
  | 'actions'
  | 'important'
  | 'digest'
  | 'settings';

const STORAGE_KEY_TASKS = 'mailmate_tasks_v1';
const STORAGE_KEY_CATEGORIES = 'mailmate_custom_categories_v1';

function extractTasksFromEmails(
  emails: EmailMessage[],
  savedStatusMap: Record<string, 'Pending' | 'Completed'>
): ActionItem[] {
  const items: ActionItem[] = [];
  emails.forEach((email) => {
    const rawTasks = email.analysis?.actionItems || [];
    rawTasks.forEach((t, index) => {
      const id = `${email.id}-task-${index}`;
      const priority: PriorityLevel =
        t.priority === 'High' || t.priority === 'Medium' || t.priority === 'Low'
          ? t.priority
          : 'Medium';
      items.push({
        id,
        emailId: email.id,
        emailSubject: email.subject,
        senderName: email.senderName,
        title: t.title,
        deadline: t.deadline || 'No explicit deadline',
        priority,
        status: savedStatusMap[id] || 'Pending',
        suggestedNextStep: t.suggestedNextStep || 'Review the original email.',
      });
    });
  });
  return items;
}

export default function App() {
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [activePage, setActivePage] = useState<NavPage>('dashboard');

  // Auth & Mode state
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Data state
  const [emails, setEmails] = useState<EmailMessage[]>(DEMO_EMAILS);
  const [digest, setDigest] = useState<DailyDigest | null>(DEMO_DAILY_DIGEST);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  // Loading & feedback state
  const [isFetchingGmail, setIsFetchingGmail] = useState<boolean>(false);
  const [isSummarizingInbox, setIsSummarizingInbox] = useState<boolean>(false);
  const [isAnalyzingSingle, setIsAnalyzingSingle] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Persisted user preferences: task completion map & custom category overrides
  const [taskStatusMap, setTaskStatusMap] = useState<
    Record<string, 'Pending' | 'Completed'>
  >(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TASKS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [customCategories, setCustomCategories] = useState<
    Record<string, string>
  >(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [importanceFilter, setImportanceFilter] = useState<'all' | 'important'>(
    'all'
  );
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week'>('all');
  const [taskSortBy, setTaskSortBy] = useState<'priority' | 'deadline'>(
    'priority'
  );
  const [showNotificationsPopover, setShowNotificationsPopover] =
    useState<boolean>(false);

  // Save task completion status
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(taskStatusMap));
    } catch {
      // ignore storage errors
    }
  }, [taskStatusMap]);

  // Save custom categories
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_CATEGORIES,
        JSON.stringify(customCategories)
      );
    } catch {
      // ignore storage errors
    }
  }, [customCategories]);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser, token) => {
        setUser(authedUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Merge custom categories into emails
  const enrichedEmails = useMemo(() => {
    return emails.map((e) => ({
      ...e,
      customCategory: customCategories[e.id] || e.customCategory,
    }));
  }, [emails, customCategories]);

  // Extract all action items
  const actionItems = useMemo(() => {
    return extractTasksFromEmails(enrichedEmails, taskStatusMap);
  }, [enrichedEmails, taskStatusMap]);

  // Sorted action items
  const sortedActionItems = useMemo(() => {
    const priorityRank: Record<PriorityLevel, number> = {
      High: 1,
      Medium: 2,
      Low: 3,
    };
    return [...actionItems].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'Pending' ? -1 : 1;
      }
      if (taskSortBy === 'priority') {
        return priorityRank[a.priority] - priorityRank[b.priority];
      }
      return a.deadline.localeCompare(b.deadline);
    });
  }, [actionItems, taskSortBy]);

  // Filtered emails for Inbox & Views
  const filteredEmails = useMemo(() => {
    return enrichedEmails.filter((email) => {
      const effectiveCat =
        email.customCategory ||
        email.analysis?.category ||
        'General Information';

      if (categoryFilter !== 'All' && effectiveCat !== categoryFilter) {
        return false;
      }
      if (
        importanceFilter === 'important' &&
        !(email.isImportant || email.analysis?.isImportant)
      ) {
        return false;
      }
      if (dateFilter === 'today') {
        const emailDate = new Date(email.timestamp).toDateString();
        const refToday = isDemoMode
          ? new Date('2026-10-10T12:00:00-07:00').toDateString()
          : new Date().toDateString();
        if (emailDate !== refToday) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSubject = email.subject.toLowerCase().includes(q);
        const matchSender =
          email.senderName.toLowerCase().includes(q) ||
          email.senderEmail.toLowerCase().includes(q);
        const matchBody =
          email.snippet.toLowerCase().includes(q) ||
          (email.analysis?.summary || '').toLowerCase().includes(q);
        if (!matchSubject && !matchSender && !matchBody) return false;
      }
      return true;
    });
  }, [
    enrichedEmails,
    categoryFilter,
    importanceFilter,
    dateFilter,
    searchQuery,
    isDemoMode,
  ]);

  const selectedEmail = useMemo(
    () => enrichedEmails.find((e) => e.id === selectedEmailId) || null,
    [enrichedEmails, selectedEmailId]
  );

  // Fetch real Gmail messages
  const fetchGmailInbox = async (tokenToUse?: string) => {
    const token = tokenToUse || accessToken || (await getAccessToken());
    if (!token) {
      setAuthError('Please connect your Gmail account to fetch live messages.');
      return;
    }

    setIsFetchingGmail(true);
    setAuthError(null);
    setStatusBanner({
      type: 'info',
      message: 'Fetching your recent emails from Gmail API...',
    });

    try {
      const response = await fetch('/api/gmail/messages?maxResults=10', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        setAuthError(
          'Gmail authorization expired or permissions were revoked. Please reconnect your Gmail account.'
        );
        setStatusBanner({
          type: 'error',
          message:
            'Gmail authentication failed or permissions were revoked. Please sign in again.',
        });
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load Gmail messages.');
      }

      const fetched: EmailMessage[] = data.messages || [];
      setEmails(fetched);
      setIsDemoMode(false);
      setShowLanding(false);

      if (fetched.length > 0) {
        setStatusBanner({
          type: 'success',
          message: `Connected to Gmail. Loaded ${fetched.length} real emails. Analyzing top messages with Gemini...`,
        });
        // Automatically analyze the top 5 emails & generate digest
        await analyzeBatchAndDigest(fetched);
      } else {
        setDigest(null);
        setStatusBanner({
          type: 'info',
          message: 'Connected to Gmail. Your inbox has no recent messages.',
        });
      }
    } catch (error: any) {
      setAuthError(error.message || 'Unable to connect to Gmail API.');
      setStatusBanner({
        type: 'error',
        message: error.message || 'Failed to load messages from Gmail.',
      });
    } finally {
      setIsFetchingGmail(false);
    }
  };

  // Analyze top emails and generate digest via Gemini API
  const analyzeBatchAndDigest = async (targetEmails: EmailMessage[]) => {
    setIsSummarizingInbox(true);
    try {
      const updated = [...targetEmails];
      // Analyze up to 5 unanalyzed emails first
      const toAnalyze = updated.filter((e) => !e.analysis).slice(0, 5);
      for (const emailItem of toAnalyze) {
        try {
          const res = await fetch('/api/ai/analyze-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailItem }),
          });
          if (res.ok) {
            const { analysis } = await res.json();
            const idx = updated.findIndex((item) => item.id === emailItem.id);
            if (idx !== -1 && analysis) {
              updated[idx] = {
                ...updated[idx],
                analysis,
                isImportant: updated[idx].isImportant || analysis.isImportant,
              };
            }
          }
        } catch {
          // continue on individual failure
        }
      }
      setEmails([...updated]);

      // Generate inbox digest
      const digestRes = await fetch('/api/ai/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: updated }),
      });
      if (digestRes.ok) {
        const { digest: newDigest } = await digestRes.json();
        if (newDigest) {
          setDigest(newDigest);
        }
      }
      setStatusBanner({
        type: 'success',
        message: 'Gemini AI completed summarizing your inbox and extracting tasks.',
      });
    } catch (error: any) {
      setStatusBanner({
        type: 'error',
        message: error.message || 'Failed to generate AI inbox digest.',
      });
    } finally {
      setIsSummarizingInbox(false);
    }
  };

  // Handle Connect Gmail click
  const handleConnectGmail = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        await fetchGmailInbox(result.accessToken);
      }
    } catch (error: any) {
      setAuthError(
        error.message ||
          'Google OAuth sign-in was cancelled or failed. You can retry or test with Demo Mode.'
      );
      setStatusBanner({
        type: 'error',
        message:
          'Google sign-in did not complete. Never pretending to be connected—switched to clearly labeled Demo Mode.',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Switch to Demo Mode with 9 sample emails
  const handleStartDemo = () => {
    setIsDemoMode(true);
    setEmails(DEMO_EMAILS);
    setDigest(DEMO_DAILY_DIGEST);
    setShowLanding(false);
    setActivePage('dashboard');
    setStatusBanner({
      type: 'info',
      message:
        'Demo Mode active: Displaying 9 sample emails with pre-computed and live Gemini AI insights.',
    });
  };

  // Disconnect Gmail account
  const handleDisconnectGmail = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setIsDemoMode(true);
    setEmails(DEMO_EMAILS);
    setDigest(DEMO_DAILY_DIGEST);
    setStatusBanner({
      type: 'info',
      message:
        'Gmail account disconnected and access token cleared from memory. Reverted to Demo Mode.',
    });
  };

  // Analyze single email with Gemini
  const handleAnalyzeSingleEmail = async (email: EmailMessage) => {
    setIsAnalyzingSingle(true);
    try {
      const res = await fetch('/api/ai/analyze-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze email.');
      }
      if (data.analysis) {
        setEmails((prev) =>
          prev.map((item) =>
            item.id === email.id
              ? {
                  ...item,
                  analysis: data.analysis,
                  isImportant: item.isImportant || data.analysis.isImportant,
                }
              : item
          )
        );
        setStatusBanner({
          type: 'success',
          message: `Updated AI summary and extracted tasks for "${email.subject}".`,
        });
      }
    } catch (err: any) {
      setStatusBanner({
        type: 'error',
        message: err.message || 'Error analyzing email with Gemini.',
      });
    } finally {
      setIsAnalyzingSingle(false);
    }
  };

  // Toggle task Pending / Completed
  const handleToggleTask = (taskId: string) => {
    setTaskStatusMap((prev) => {
      const current = prev[taskId] || 'Pending';
      return {
        ...prev,
        [taskId]: current === 'Pending' ? 'Completed' : 'Pending',
      };
    });
  };

  // Override email category
  const handleUpdateCategory = (emailId: string, newCategory: string) => {
    setCustomCategories((prev) => ({
      ...prev,
      [emailId]: newCategory,
    }));
    setStatusBanner({
      type: 'success',
      message: `Category updated to "${newCategory}".`,
    });
  };

  // Dashboard metrics
  const totalProcessed = enrichedEmails.length;
  const unreadCount = enrichedEmails.filter((e) => e.unread).length;
  const importantCount = enrichedEmails.filter(
    (e) => e.isImportant || e.analysis?.isImportant
  ).length;
  const pendingTasksCount = actionItems.filter(
    (t) => t.status === 'Pending'
  ).length;
  const upcomingDeadlinesCount =
    digest?.upcomingDeadlines.length ||
    enrichedEmails.reduce(
      (acc, e) => acc + (e.analysis?.importantDates.length || 0),
      0
    );

  if (showLanding) {
    return (
      <LandingPage
        onConnectGmail={handleConnectGmail}
        onStartDemo={handleStartDemo}
        isLoggingIn={isLoggingIn}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Left Sidebar ($260px) */}
      <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div>
          {/* Brand Header */}
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setShowLanding(true)}
              className="text-left cursor-pointer group"
            >
              <span className="text-lg font-bold tracking-tight text-white block">
                MailMate
              </span>
              <span className="text-[11px] text-indigo-300 block">
                Less reading. More doing.
              </span>
            </button>
          </div>

          {/* Connection / Demo Mode Status Box */}
          <div className="px-4 py-4 border-b border-slate-800">
            {isDemoMode ? (
              <div className="p-3 rounded-lg bg-slate-800/90 border border-slate-700 text-xs">
                <div className="font-semibold text-amber-300 mb-1">
                  Demo Mode (Sample Data)
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed mb-2.5">
                  Viewing 9 sample emails. Connect Gmail via Google OAuth 2.0 to
                  analyze your real inbox.
                </p>
                <button
                  onClick={handleConnectGmail}
                  disabled={isLoggingIn}
                  className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-md transition-colors text-xs cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? 'Authorizing...' : 'Connect Gmail'}
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-800/90 border border-slate-700 text-xs">
                <div className="font-semibold text-emerald-400 mb-0.5">
                  Gmail Connected
                </div>
                <p className="text-slate-300 truncate font-mono text-[11px] mb-2">
                  {user?.email}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchGmailInbox()}
                    disabled={isFetchingGmail}
                    className="flex-1 py-1 px-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-[11px] font-medium cursor-pointer"
                  >
                    {isFetchingGmail ? 'Syncing...' : 'Sync Inbox'}
                  </button>
                  <button
                    onClick={handleDisconnectGmail}
                    className="py-1 px-2 text-rose-300 hover:text-white hover:bg-rose-900/40 rounded text-[11px] cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {[
              {
                id: 'dashboard',
                label: 'Dashboard',
                icon: LayoutDashboard,
                count: undefined,
              },
              {
                id: 'inbox',
                label: 'Inbox',
                icon: Inbox,
                count: totalProcessed,
              },
              {
                id: 'digest',
                label: 'Daily Digest',
                icon: BookOpen,
                count: undefined,
              },
              {
                id: 'summaries',
                label: 'AI Summaries',
                icon: Sparkles,
                count: enrichedEmails.filter((e) => e.analysis).length,
              },
              {
                id: 'actions',
                label: 'Action Items',
                icon: CheckSquare,
                count: pendingTasksCount,
              },
              {
                id: 'important',
                label: 'Important Emails',
                icon: Star,
                count: importantCount,
              },
              {
                id: 'settings',
                label: 'Settings',
                icon: Settings,
                count: undefined,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id as NavPage)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5 whitespace-nowrap">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  {item.count !== undefined && (
                    <span
                      className={`font-mono text-[11px] tabular-nums ${
                        isActive ? 'text-indigo-100' : 'text-slate-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Demo / Landing Switcher */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
          {!isDemoMode && (
            <button
              onClick={handleStartDemo}
              className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium cursor-pointer"
            >
              Switch to Demo Emails
            </button>
          )}
          <div className="flex items-center justify-between text-[11px]">
            <span>Gemini 3.8 Flash</span>
            <button
              onClick={() => setShowLanding(true)}
              className="text-indigo-300 hover:underline cursor-pointer"
            >
              About MailMate
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar with Search, Summarize Button, Notifications, and User Profile */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-6">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (
                  activePage !== 'inbox' &&
                  activePage !== 'summaries' &&
                  activePage !== 'important'
                ) {
                  setActivePage('inbox');
                }
              }}
              placeholder="Search emails by sender, subject, or AI summary..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {/* Right Actions: Summarize My Inbox + Notifications + User Profile */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => analyzeBatchAndDigest(enrichedEmails)}
              disabled={isSummarizingInbox || enrichedEmails.length === 0}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isSummarizingInbox
                  ? 'Summarizing Inbox...'
                  : 'Summarize My Inbox'}
              </span>
            </button>

            {/* Notifications Button & Popover */}
            <div className="relative">
              <button
                onClick={() =>
                  setShowNotificationsPopover(!showNotificationsPopover)
                }
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer relative"
                aria-label="Notifications and Deadlines"
              >
                <Bell className="w-4 h-4" />
                {pendingTasksCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600" />
                )}
              </button>

              {showNotificationsPopover && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-40">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">
                      Pending Deadlines & Alerts
                    </span>
                    <button
                      onClick={() => setShowNotificationsPopover(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {sortedActionItems
                      .filter((t) => t.status === 'Pending')
                      .slice(0, 4)
                      .map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedEmailId(item.emailId);
                            setShowNotificationsPopover(false);
                          }}
                          className="p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs border border-slate-100"
                        >
                          <p className="font-semibold text-slate-800 truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Due: {item.deadline} · {item.priority}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Indicator */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 text-xs">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-xs">
                {user?.displayName
                  ? user.displayName.charAt(0).toUpperCase()
                  : isDemoMode
                  ? 'D'
                  : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-semibold text-slate-900 leading-none">
                  {user?.displayName || (isDemoMode ? 'Demo User' : 'Gmail User')}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {isDemoMode ? 'Sample Workspace' : user?.email}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Clearly Labeled Mode / Status Banner */}
        <div className="px-6 pt-4">
          {isDemoMode && (
            <div className="mb-3 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900">
              <div>
                <span className="font-semibold">Demo Mode Active:</span> These
                9 emails and statistics are realistic sample data for testing
                MailMate without Gmail credentials.
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => analyzeBatchAndDigest(enrichedEmails)}
                  disabled={isSummarizingInbox}
                  className="font-semibold underline hover:text-amber-950 cursor-pointer"
                >
                  {isSummarizingInbox
                    ? 'Running Live Gemini Analysis...'
                    : 'Re-run Live Gemini Analysis on Demo Emails'}
                </button>
                <span>·</span>
                <button
                  onClick={handleConnectGmail}
                  className="font-semibold text-indigo-700 underline hover:text-indigo-900 cursor-pointer"
                >
                  Connect Real Gmail
                </button>
              </div>
            </div>
          )}

          {statusBanner && (
            <div
              className={`mb-3 px-4 py-2.5 rounded-lg border flex items-center justify-between text-xs ${
                statusBanner.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : statusBanner.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-800'
              }`}
            >
              <span>{statusBanner.message}</span>
              <button
                onClick={() => setStatusBanner(null)}
                className="text-[11px] underline ml-4 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Main Viewport Switch */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6 max-w-[1440px] w-full mx-auto">
          {/* 1. DASHBOARD VIEW */}
          {activePage === 'dashboard' && (
            <>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Workspace Overview
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    {isDemoMode
                      ? 'Displaying sample demo inbox metrics (9 sample emails processed)'
                      : `Live Gmail account metrics for ${user?.email}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActivePage('digest')}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
                  >
                    Open Full Daily Digest
                  </button>
                </div>
              </div>

              {/* 5 Key Metric Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block">
                    Total Emails Processed
                  </span>
                  <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1 block">
                    {totalProcessed}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block">
                    Unread Emails
                  </span>
                  <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1 block">
                    {unreadCount}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block">
                    Important Detected
                  </span>
                  <span className="text-2xl font-bold text-indigo-700 font-mono tabular-nums mt-1 block">
                    {importantCount}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block">
                    Pending Action Items
                  </span>
                  <span className="text-2xl font-bold text-amber-600 font-mono tabular-nums mt-1 block">
                    {pendingTasksCount}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 block">
                    Upcoming Deadlines
                  </span>
                  <span className="text-2xl font-bold text-rose-600 font-mono tabular-nums mt-1 block">
                    {upcomingDeadlinesCount}
                  </span>
                </div>
              </div>

              {/* Today's AI-Generated Email Summary Card */}
              {digest && (
                <section className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-semibold text-indigo-300 block">
                        {isDemoMode
                          ? 'Example Demo Data · Today’s AI-Generated Email Summary'
                          : 'Live Gmail · Today’s AI-Generated Email Summary'}
                      </span>
                      <h2 className="text-lg font-bold text-white mt-0.5">
                        AI Email Summary — Today
                      </h2>
                    </div>
                    <div className="text-xs font-mono text-slate-300 tabular-nums">
                      <span>Total emails processed: {totalProcessed}</span>
                      <span className="mx-2">·</span>
                      <span className="text-indigo-300">
                        Items requiring attention:{' '}
                        {digest.itemsRequiringAttention}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed mb-6">
                    {digest.headlineSummary}
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 mb-2.5">
                        Key Updates (Extracted from Emails)
                      </h3>
                      <ul className="space-y-2 text-xs text-slate-200">
                        {digest.keyUpdates.map((u, idx) => (
                          <li
                            key={idx}
                            onClick={() => setSelectedEmailId(u.emailId)}
                            className="p-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 flex items-start justify-between gap-3 cursor-pointer"
                          >
                            <span>· {u.factualUpdate}</span>
                            <span className="text-slate-400 font-mono whitespace-nowrap shrink-0">
                              {u.sourceSender}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold text-indigo-300 mb-2.5">
                        Action Items (AI-Recommended Priorities)
                      </h3>
                      <ul className="space-y-2 text-xs text-slate-200">
                        {digest.actionItems.slice(0, 3).map((item, idx) => (
                          <li
                            key={idx}
                            onClick={() => setSelectedEmailId(item.emailId)}
                            className="p-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 flex items-start justify-between gap-3 cursor-pointer"
                          >
                            <div>
                              <span className="font-semibold block">
                                · {item.task}
                              </span>
                              <span className="text-slate-400 text-[11px] block mt-0.5">
                                AI Advice: {item.aiRecommendation}
                              </span>
                            </div>
                            <span className="text-amber-300 font-mono whitespace-nowrap shrink-0 tabular-nums">
                              {item.deadline}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
              )}

              {/* "Your Inbox at a Glance" Section */}
              <section className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Your Inbox at a Glance
                    </h2>
                    <p className="text-xs text-slate-500">
                      Understand the most important information, dates, and
                      recommended next actions without opening every message.
                    </p>
                  </div>
                  <button
                    onClick={() => setActivePage('inbox')}
                    className="text-xs font-semibold text-indigo-700 hover:underline cursor-pointer"
                  >
                    View All {totalProcessed} Emails
                  </button>
                </div>

                <div className="divide-y divide-slate-200">
                  {enrichedEmails.slice(0, 6).map((email) => {
                    const effectiveCategory =
                      email.customCategory ||
                      email.analysis?.category ||
                      'General Information';
                    return (
                      <div
                        key={email.id}
                        onClick={() => setSelectedEmailId(email.id)}
                        className="py-4 first:pt-0 last:pb-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/80 -mx-3 px-3 rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-slate-900">
                              {email.senderName}
                            </span>
                            <span>·</span>
                            <span>{effectiveCategory}</span>
                            <span>·</span>
                            <span className="font-mono tabular-nums">
                              {new Date(email.timestamp).toLocaleDateString(
                                [],
                                {
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )}
                            </span>
                            {(email.isImportant ||
                              email.analysis?.isImportant) && (
                              <>
                                <span>·</span>
                                <span className="text-amber-700 font-semibold">
                                  Important
                                </span>
                              </>
                            )}
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {email.subject}
                          </h3>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            <span className="font-semibold text-indigo-700">
                              AI Summary:{' '}
                            </span>
                            {email.analysis?.summary || email.snippet}
                          </p>

                          {email.analysis?.importantDates &&
                            email.analysis.importantDates.length > 0 && (
                              <p className="text-[11px] font-mono text-slate-500 tabular-nums">
                                Key Date: {email.analysis.importantDates[0]}
                              </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {email.analysis?.recommendedNextAction && (
                            <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md whitespace-nowrap">
                              Next: {email.analysis.recommendedNextAction}
                            </span>
                          )}
                          <ArrowUpRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {/* 2. INBOX / IMPORTANT EMAILS / AI SUMMARIES VIEW */}
          {(activePage === 'inbox' ||
            activePage === 'important' ||
            activePage === 'summaries') && (
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-200">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    {activePage === 'important'
                      ? 'Important Emails'
                      : activePage === 'summaries'
                      ? 'AI Email Summaries'
                      : 'Smart Inbox'}
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any email to inspect its full text, grounded Gemini
                    summary, extracted tasks, and AI assistant chat.
                  </p>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label="Filter by Category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="All">All Categories</option>
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Filter by Date"
                    value={dateFilter}
                    onChange={(e) =>
                      setDateFilter(e.target.value as 'all' | 'today' | 'week')
                    }
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today Only</option>
                  </select>

                  <button
                    onClick={() =>
                      setImportanceFilter(
                        importanceFilter === 'all' ? 'important' : 'all'
                      )
                    }
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      importanceFilter === 'important' ||
                      activePage === 'important'
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Important Only
                  </button>
                </div>
              </div>

              {/* Email Rows */}
              {filteredEmails.filter((e) =>
                activePage === 'important'
                  ? e.isImportant || e.analysis?.isImportant
                  : true
              ).length === 0 ? (
                <div className="py-12 text-center">
                  <Mail className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-800">
                    No matching emails found
                  </p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Try clearing your search query or category filter.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('All');
                      setImportanceFilter('all');
                      setDateFilter('all');
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredEmails
                    .filter((e) =>
                      activePage === 'important'
                        ? e.isImportant || e.analysis?.isImportant
                        : true
                    )
                    .map((email) => {
                      const effectiveCat =
                        email.customCategory ||
                        email.analysis?.category ||
                        'General Information';

                      return (
                        <div
                          key={email.id}
                          onClick={() => setSelectedEmailId(email.id)}
                          className="py-4 px-3 -mx-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer flex flex-col gap-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span
                                className={`font-semibold ${
                                  email.unread
                                    ? 'text-slate-900'
                                    : 'text-slate-700'
                                }`}
                              >
                                {email.senderName}
                              </span>
                              <span>·</span>
                              <span className="font-mono text-[11px]">
                                {email.senderEmail}
                              </span>
                              <span>·</span>
                              <span className="text-indigo-700 font-medium">
                                {effectiveCat}
                              </span>
                              {(email.isImportant ||
                                email.analysis?.isImportant) && (
                                <>
                                  <span>·</span>
                                  <span className="text-amber-700 font-semibold">
                                    Important
                                  </span>
                                </>
                              )}
                            </div>

                            <span className="text-xs font-mono text-slate-500 tabular-nums">
                              {new Date(email.timestamp).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between gap-4">
                            <h3
                              className={`text-sm ${
                                email.unread
                                  ? 'font-bold text-slate-900'
                                  : 'font-semibold text-slate-800'
                              }`}
                            >
                              {email.subject}
                            </h3>
                          </div>

                          {email.analysis ? (
                            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                              <p className="text-slate-800 leading-relaxed">
                                <span className="font-semibold text-indigo-700">
                                  AI Summary:{' '}
                                </span>
                                {email.analysis.summary}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                                <span>
                                  <strong className="text-slate-700">
                                    Purpose:
                                  </strong>{' '}
                                  {email.analysis.mainPurpose}
                                </span>
                                {email.analysis.importantDates.length > 0 && (
                                  <span className="font-mono tabular-nums text-amber-800">
                                    Deadline/Date:{' '}
                                    {email.analysis.importantDates[0]}
                                  </span>
                                )}
                                <span>
                                  <strong className="text-slate-700">
                                    Recommended Next Action:
                                  </strong>{' '}
                                  {email.analysis.recommendedNextAction}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 truncate">
                              {email.snippet}
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </section>
          )}

          {/* 3. ACTION ITEMS VIEW */}
          {activePage === 'actions' && (
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-200">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    Extracted Action Items & Deadlines
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tasks automatically identified from your emails. Mark tasks
                    completed, reopen them, or sort by priority and deadline.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Sort by:</span>
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                    <button
                      onClick={() => setTaskSortBy('priority')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md cursor-pointer ${
                        taskSortBy === 'priority'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600'
                      }`}
                    >
                      Priority
                    </button>
                    <button
                      onClick={() => setTaskSortBy('deadline')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md cursor-pointer ${
                        taskSortBy === 'deadline'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600'
                      }`}
                    >
                      Deadline
                    </button>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-200">
                {sortedActionItems.map((task) => (
                  <div
                    key={task.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className="mt-0.5 text-slate-400 hover:text-indigo-600 cursor-pointer shrink-0"
                        aria-label={`Mark ${task.title} as ${
                          task.status === 'Pending' ? 'Completed' : 'Pending'
                        }`}
                      >
                        {task.status === 'Completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-0.5">
                          <span
                            className={`font-semibold ${
                              task.priority === 'High'
                                ? 'text-rose-600'
                                : task.priority === 'Medium'
                                ? 'text-amber-600'
                                : 'text-slate-600'
                            }`}
                          >
                            {task.priority} Priority
                          </span>
                          <span>·</span>
                          <span>Status: {task.status}</span>
                          <span>·</span>
                          <span className="font-mono tabular-nums">
                            Deadline: {task.deadline}
                          </span>
                        </div>

                        <h3
                          className={`text-sm font-bold ${
                            task.status === 'Completed'
                              ? 'line-through text-slate-400'
                              : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </h3>

                        <p className="text-xs text-slate-600 mt-1">
                          <strong className="text-slate-700">
                            Suggested Next Step:
                          </strong>{' '}
                          {task.suggestedNextStep}
                        </p>

                        <p className="text-[11px] text-slate-400 mt-1">
                          Source: {task.senderName} — “{task.emailSubject}”
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 sm:self-center">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                      >
                        {task.status === 'Completed'
                          ? 'Reopen Task'
                          : 'Complete'}
                      </button>
                      <button
                        onClick={() => setSelectedEmailId(task.emailId)}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer"
                      >
                        Open Email
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. DAILY AI DIGEST PAGE */}
          {activePage === 'digest' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-indigo-700 block">
                    {isDemoMode
                      ? 'Demo Sample Digest (9 Sample Emails)'
                      : 'Live Gmail Daily Digest'}
                  </span>
                  <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
                    Daily AI Digest
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Clearly distinguishes factual updates extracted directly
                    from emails vs. AI-generated recommendations.
                  </p>
                </div>

                <button
                  onClick={() => analyzeBatchAndDigest(enrichedEmails)}
                  disabled={isSummarizingInbox}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      isSummarizingInbox ? 'animate-spin' : ''
                    }`}
                  />
                  <span>
                    {isSummarizingInbox
                      ? 'Regenerating Digest...'
                      : 'Regenerate Digest with Gemini'}
                  </span>
                </button>
              </div>

              {digest ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Section 1: Key Updates */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-base font-bold text-slate-900 mb-1">
                      1. Key Updates
                    </h2>
                    <p className="text-xs text-slate-500 mb-4">
                      Factual updates extracted directly from your incoming
                      messages.
                    </p>
                    <div className="space-y-3">
                      {digest.keyUpdates.map((item, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedEmailId(item.emailId)}
                          className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-indigo-300 cursor-pointer"
                        >
                          <div className="text-[11px] font-semibold text-slate-500 mb-1">
                            Extracted Fact · From {item.sourceSender}
                          </div>
                          <p className="text-sm font-medium text-slate-900">
                            {item.factualUpdate}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: Action Items */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-base font-bold text-slate-900 mb-1">
                      2. Action Items
                    </h2>
                    <p className="text-xs text-slate-500 mb-4">
                      Extracted responsibilities paired with AI-generated
                      recommendations.
                    </p>
                    <div className="space-y-3">
                      {digest.actionItems.map((item, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedEmailId(item.emailId)}
                          className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-indigo-300 cursor-pointer"
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 font-mono tabular-nums">
                            <span>Priority: {item.priority}</span>
                            <span>Deadline: {item.deadline}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">
                            Extracted Task: {item.task}
                          </p>
                          <p className="text-xs text-indigo-700 mt-1">
                            <strong>AI Recommendation:</strong>{' '}
                            {item.aiRecommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 3: Upcoming Deadlines & Meetings */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 mb-1">
                        3. Upcoming Deadlines & Schedule Changes
                      </h2>
                      <p className="text-xs text-slate-500 mb-4">
                        Explicitly stated dates, exams, and rescheduled
                        meetings.
                      </p>
                      <div className="space-y-2.5">
                        {digest.upcomingDeadlines.map((d, i) => (
                          <div
                            key={i}
                            onClick={() => setSelectedEmailId(d.emailId)}
                            className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 cursor-pointer"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-900">
                                {d.eventOrTask}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {d.sourceSubject}
                              </p>
                            </div>
                            <span className="text-xs font-mono font-semibold text-rose-700 whitespace-nowrap tabular-nums">
                              {d.dateOrTime}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {digest.meetingsAndSchedule.length > 0 && (
                      <div className="pt-4 border-t border-slate-200">
                        <h3 className="text-xs font-bold text-slate-700 mb-2.5">
                          Meetings & Schedule Updates
                        </h3>
                        <div className="space-y-2">
                          {digest.meetingsAndSchedule.map((m, i) => (
                            <div
                              key={i}
                              onClick={() => setSelectedEmailId(m.emailId)}
                              className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs cursor-pointer"
                            >
                              <div className="font-semibold text-slate-900">
                                {m.title}
                              </div>
                              <div className="font-mono text-indigo-700 text-[11px] mt-0.5">
                                {m.when}
                              </div>
                              <div className="text-slate-600 text-[11px] mt-0.5">
                                {m.statusNote}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 4: Needs Reply & Can Wait */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 mb-1">
                        4. Messages Needing a Reply & Can Wait
                      </h2>
                      <p className="text-xs text-slate-500 mb-4">
                        Separate urgent follow-ups from low-priority newsletters
                        and promotions.
                      </p>

                      <h3 className="text-xs font-bold text-slate-700 mb-2">
                        May Need a Reply
                      </h3>
                      <div className="space-y-2 mb-5">
                        {digest.needsReply.map((r, i) => (
                          <div
                            key={i}
                            onClick={() => setSelectedEmailId(r.emailId)}
                            className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 text-xs cursor-pointer"
                          >
                            <div className="font-semibold text-slate-900">
                              {r.senderName} — {r.subject}
                            </div>
                            <div className="text-slate-600 text-[11px] mt-0.5">
                              {r.reason}
                            </div>
                          </div>
                        ))}
                      </div>

                      <h3 className="text-xs font-bold text-slate-700 mb-2">
                        Can Wait (Lower-Priority Emails)
                      </h3>
                      <div className="space-y-2">
                        {digest.canWait.map((c, i) => (
                          <div
                            key={i}
                            onClick={() => setSelectedEmailId(c.emailId)}
                            className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs cursor-pointer"
                          >
                            <div className="font-semibold text-slate-800">
                              {c.subject}
                            </div>
                            <div className="text-slate-500 text-[11px] mt-0.5">
                              {c.senderName} · {c.reason}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <p className="text-sm font-semibold text-slate-800 mb-2">
                    No Daily Digest Generated Yet
                  </p>
                  <button
                    onClick={() => analyzeBatchAndDigest(enrichedEmails)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg cursor-pointer"
                  >
                    Generate Digest Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 5. SETTINGS & PRIVACY VIEW */}
          {activePage === 'settings' && (
            <div className="max-w-3xl space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h1 className="text-xl font-bold text-slate-900 mb-1">
                  Account, Privacy & Security Settings
                </h1>
                <p className="text-xs text-slate-500 mb-6">
                  Manage your Gmail OAuth 2.0 connection, stored task
                  preferences, and security controls.
                </p>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">
                        Gmail Connection Status
                      </p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                        {isDemoMode
                          ? 'Not Connected (Running in Demo Mode)'
                          : `Connected as ${user?.email}`}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Permission scope:{' '}
                        <code className="font-mono">
                          https://www.googleapis.com/auth/gmail.readonly
                        </code>
                      </p>
                    </div>

                    {isDemoMode ? (
                      <button
                        onClick={handleConnectGmail}
                        className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                      >
                        Connect Gmail Account
                      </button>
                    ) : (
                      <button
                        onClick={handleDisconnectGmail}
                        className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Disconnect Gmail Account</span>
                      </button>
                    )}
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Reset Task & Category Customizations
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Clear locally saved task completion states and manual
                        category overrides.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setTaskStatusMap({});
                        setCustomCategories({});
                        localStorage.removeItem(STORAGE_KEY_TASKS);
                        localStorage.removeItem(STORAGE_KEY_CATEGORIES);
                        setStatusBanner({
                          type: 'success',
                          message:
                            'Cleared saved task statuses and category overrides.',
                        });
                      }}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Reset Local Preferences
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-base font-bold text-slate-900 mb-2">
                  Security & Untrusted Email Data Architecture
                </h2>
                <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                  <li>
                    · <strong>Server-Side Gemini API:</strong> All requests to
                    Gemini 3.8 Flash execute on the backend Express server so
                    API keys are never exposed in client code.
                  </li>
                  <li>
                    · <strong>Prompt-Injection Defense:</strong> Email subjects,
                    senders, and bodies are wrapped in untrusted data delimiters
                    and never interpreted as system instructions.
                  </li>
                  <li>
                    · <strong>In-Memory OAuth Token:</strong> Your Google OAuth
                    access token is stored strictly in memory and wiped as soon
                    as you disconnect or close the session.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Email Details & Grounded AI Chat Drawer */}
      <EmailDetailDrawer
        email={selectedEmail}
        onClose={() => setSelectedEmailId(null)}
        actionItems={actionItems}
        onToggleTask={handleToggleTask}
        onUpdateCategory={handleUpdateCategory}
        onAnalyzeSingleEmail={handleAnalyzeSingleEmail}
        isAnalyzingEmail={isAnalyzingSingle}
        allEmails={enrichedEmails}
      />
    </div>
  );
}
