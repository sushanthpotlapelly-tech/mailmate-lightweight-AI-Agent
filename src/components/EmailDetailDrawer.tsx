import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Users,
  CheckCircle2,
  Circle,
  MessageSquare,
  Send,
  AlertTriangle,
  ExternalLink,
  Check,
  Tag,
} from 'lucide-react';
import {
  EmailMessage,
  ActionItem,
  ALL_CATEGORIES,
  ChatMessage,
} from '../types';

interface EmailDetailDrawerProps {
  email: EmailMessage | null;
  onClose: () => void;
  actionItems: ActionItem[];
  onToggleTask: (taskId: string) => void;
  onUpdateCategory: (emailId: string, newCategory: string) => void;
  onAnalyzeSingleEmail: (email: EmailMessage) => Promise<void>;
  isAnalyzingEmail: boolean;
  allEmails: EmailMessage[];
}

export const EmailDetailDrawer: React.FC<EmailDetailDrawerProps> = ({
  email,
  onClose,
  actionItems,
  onToggleTask,
  onUpdateCategory,
  onAnalyzeSingleEmail,
  isAnalyzingEmail,
  allEmails,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'chat'>('summary');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  // Explicit confirmation modal state for Recommended Next Actions (e.g., Draft a reply / Confirm meeting)
  const [pendingActionModal, setPendingActionModal] = useState<{
    actionTitle: string;
    draftText: string;
  } | null>(null);
  const [actionConfirmedMessage, setActionConfirmedMessage] = useState<string | null>(
    null
  );

  if (!email) return null;

  const relatedTasks = actionItems.filter((item) => item.emailId === email.id);
  const effectiveCategory =
    email.customCategory || email.analysis?.category || 'General Information';

  const handleAskQuestion = async (presetQuestion?: string) => {
    const q = (presetQuestion ?? question).trim();
    if (!q || isAsking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toISOString(),
    };
    setChatHistory((prev) => [...prev, userMsg]);
    if (!presetQuestion) setQuestion('');
    setIsAsking(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          emails: allEmails,
          history: [...chatHistory, userMsg],
        }),
      });
      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content:
          data.answer ||
          data.error ||
          'Unable to retrieve an answer from the authorized emails.',
        timestamp: new Date().toISOString(),
      };
      setChatHistory((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Error contacting the MailMate AI assistant. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const triggerRecommendedAction = (actionLabel: string) => {
    setActionConfirmedMessage(null);
    const defaultDraft = `Hi ${email.senderName.split(' ')[0]},\n\nThank you for your email regarding "${email.subject}". I have reviewed the details and wanted to follow up.\n\nBest regards`;
    setPendingActionModal({
      actionTitle: actionLabel,
      draftText: defaultDraft,
    });
  };

  const confirmActionExecution = () => {
    if (!pendingActionModal) return;
    setActionConfirmedMessage(
      `Confirmed "${pendingActionModal.actionTitle}" for ${email.senderEmail}. Draft prepared for your review (no email was sent automatically).`
    );
    setPendingActionModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-[1px]">
      <div className="w-full max-w-4xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>{email.isDemo ? 'Demo Sample Email' : 'Live Gmail Message'}</span>
              <span>·</span>
              <span className="font-mono tabular-nums">
                {new Date(email.timestamp).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {email.isImportant && (
                <>
                  <span>·</span>
                  <span className="text-amber-700 font-semibold">Important</span>
                </>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900 truncate">
              {email.subject}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
            aria-label="Close email details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Split: Left Original Message | Right AI Insights & Grounded Chat */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto lg:overflow-hidden">
          {/* Left Column: Original Email Message */}
          <div className="lg:col-span-6 p-6 border-b lg:border-b-0 lg:border-r border-slate-200 lg:overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {email.senderName}
                </p>
                <p className="text-xs text-slate-500 font-mono">{email.senderEmail}</p>
              </div>

              {/* Category selector allowing users to correct categories */}
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <select
                  aria-label="Email Category"
                  value={effectiveCategory}
                  onChange={(e) => onUpdateCategory(email.id, e.target.value)}
                  className="text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {ALL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-400 mb-2">
                Original Message Content
              </p>
              <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50/70 p-4 rounded-lg border border-slate-200/80">
                {email.body}
              </div>
            </div>

            {/* Recommended Next Actions Bar */}
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-700 mb-2.5">
                Recommended Next Actions (Requires Confirmation)
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  email.analysis?.recommendedNextAction || 'Draft a reply',
                  'Review a deadline',
                  'Confirm a meeting',
                  'Prepare an assignment',
                  'Review an opportunity',
                ]
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .slice(0, 4)
                  .map((actionLabel) => (
                    <button
                      key={actionLabel}
                      onClick={() => triggerRecommendedAction(actionLabel)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {actionLabel}
                    </button>
                  ))}
              </div>

              {actionConfirmedMessage && (
                <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{actionConfirmedMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: AI Summary, Extracted Tasks & AI Assistant Chat */}
          <div className="lg:col-span-6 flex flex-col h-full bg-slate-50/50 lg:overflow-hidden">
            {/* Segmented Mode Switch */}
            <div className="px-6 pt-4 pb-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'summary'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  AI Summary & Tasks
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'chat'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ask MailMate AI
                </button>
              </div>

              <button
                onClick={() => onAnalyzeSingleEmail(email)}
                disabled={isAnalyzingEmail}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isAnalyzingEmail
                    ? 'Analyzing with Gemini...'
                    : email.analysis
                    ? 'Re-Analyze with Gemini'
                    : 'Analyze with Gemini'}
                </span>
              </button>
            </div>

            {activeTab === 'summary' ? (
              <div className="flex-1 p-6 space-y-5 lg:overflow-y-auto">
                {email.analysis ? (
                  <>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-indigo-700 mb-1">
                          Concise AI Summary (Grounded in Email)
                        </p>
                        <p className="text-sm text-slate-900 leading-relaxed">
                          {email.analysis.summary}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="font-semibold text-slate-500 block mb-0.5">
                            Main Purpose
                          </span>
                          <span className="text-slate-800">
                            {email.analysis.mainPurpose}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-500 block mb-0.5">
                            Requested Follow-Up
                          </span>
                          <span className="text-slate-800">
                            {email.analysis.requestedFollowUp}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Important Dates & Key People */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Dates, Deadlines & Times</span>
                        </div>
                        {email.analysis.importantDates.length > 0 ? (
                          <ul className="space-y-1.5 text-xs text-slate-700 font-mono tabular-nums">
                            {email.analysis.importantDates.map((d, i) => (
                              <li key={i}>· {d}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-400">
                            No explicit dates or deadlines stated in this email.
                          </p>
                        )}
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                          <Users className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Key People & Organizations</span>
                        </div>
                        {email.analysis.keyEntities.length > 0 ? (
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {email.analysis.keyEntities.join(' · ')}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400">None specified.</p>
                        )}
                      </div>
                    </div>

                    {/* Extracted Action Items for this Email */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <h3 className="text-xs font-semibold text-slate-700 mb-3">
                        Extracted Action Items ({relatedTasks.length})
                      </h3>
                      {relatedTasks.length > 0 ? (
                        <div className="space-y-3">
                          {relatedTasks.map((task) => (
                            <div
                              key={task.id}
                              className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-3"
                            >
                              <button
                                onClick={() => onToggleTask(task.id)}
                                className="mt-0.5 text-slate-400 hover:text-indigo-600 cursor-pointer shrink-0"
                              >
                                {task.status === 'Completed' ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Circle className="w-4 h-4" />
                                )}
                              </button>
                              <div className="min-w-0 flex-1">
                                <p
                                  className={`text-xs font-semibold ${
                                    task.status === 'Completed'
                                      ? 'line-through text-slate-400'
                                      : 'text-slate-900'
                                  }`}
                                >
                                  {task.title}
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                  Next step: {task.suggestedNextStep}
                                </p>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1.5 font-mono tabular-nums">
                                  <span>Priority: {task.priority}</span>
                                  <span>·</span>
                                  <span>Deadline: {task.deadline}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">
                          No action items required for this message.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
                    <Sparkles className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-900 mb-1">
                      AI Summary Not Generated Yet
                    </p>
                    <p className="text-xs text-slate-500 mb-4">
                      Click below to analyze this email with Gemini 3.8 Flash and
                      extract summaries, dates, and action items.
                    </p>
                    <button
                      onClick={() => onAnalyzeSingleEmail(email)}
                      disabled={isAnalyzingEmail}
                      className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer disabled:opacity-50"
                    >
                      {isAnalyzingEmail
                        ? 'Analyzing Email...'
                        : 'Generate AI Summary Now'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* AI Assistant Chat Panel */
              <div className="flex-1 flex flex-col p-6 overflow-hidden">
                <div className="mb-3">
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    Ask MailMate across your authorized inbox:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'What are my most important emails today?',
                      'Which assignments are due this week?',
                      'Summarize emails from my professor.',
                      'Which messages need a reply?',
                      'What should I focus on first?',
                    ].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handleAskQuestion(preset)}
                        disabled={isAsking}
                        className="px-2.5 py-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 bg-white p-4 rounded-xl border border-slate-200 mb-3">
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      <MessageSquare className="w-5 h-5 mx-auto mb-2 text-slate-300" />
                      Select a suggested question above or ask anything about your
                      loaded emails. Answers are strictly grounded in your inbox.
                    </div>
                  ) : (
                    chatHistory.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-slate-900 text-white ml-8'
                            : 'bg-slate-100 text-slate-800 mr-4'
                        }`}
                      >
                        <div className="font-semibold mb-1 text-[10px] opacity-75">
                          {msg.role === 'user' ? 'You' : 'MailMate AI Assistant'}
                        </div>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    ))
                  )}
                  {isAsking && (
                    <div className="text-xs text-slate-500 italic p-2">
                      MailMate is checking your authorized emails...
                    </div>
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskQuestion();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question about your emails..."
                    className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <button
                    type="submit"
                    disabled={isAsking || !question.trim()}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ask</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Explicit User Confirmation Modal before executing any action/draft */}
        {pendingActionModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-xl">
              <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Explicit User Confirmation Required</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Confirm Action: {pendingActionModal.actionTitle}
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                MailMate never sends, replies to, or modifies emails
                automatically. Review the prepared response note below before
                confirming:
              </p>
              <textarea
                rows={4}
                value={pendingActionModal.draftText}
                onChange={(e) =>
                  setPendingActionModal({
                    ...pendingActionModal,
                    draftText: e.target.value,
                  })
                }
                className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setPendingActionModal(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmActionExecution}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                >
                  Confirm & Save Action
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
