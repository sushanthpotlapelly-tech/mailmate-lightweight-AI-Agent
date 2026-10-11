export enum EmailCategory {
  URGENT_IMPORTANT = 'Urgent and Important',
  TASKS_ASSIGNMENTS = 'Tasks and Assignments',
  MEETINGS_EVENTS = 'Meetings and Events',
  WORK_PROJECTS = 'Work and Projects',
  OPPORTUNITIES_INTERNSHIPS = 'Opportunities and Internships',
  PERSONAL_MESSAGES = 'Personal Messages',
  NEWSLETTERS_PROMOTIONS = 'Newsletters and Promotions',
  GENERAL_INFORMATION = 'General Information',
}

export const ALL_CATEGORIES: string[] = [
  EmailCategory.URGENT_IMPORTANT,
  EmailCategory.TASKS_ASSIGNMENTS,
  EmailCategory.MEETINGS_EVENTS,
  EmailCategory.WORK_PROJECTS,
  EmailCategory.OPPORTUNITIES_INTERNSHIPS,
  EmailCategory.PERSONAL_MESSAGES,
  EmailCategory.NEWSLETTERS_PROMOTIONS,
  EmailCategory.GENERAL_INFORMATION,
];

export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'Completed';

export interface ActionItem {
  id: string;
  emailId: string;
  emailSubject: string;
  senderName: string;
  title: string;
  deadline: string;
  priority: PriorityLevel;
  status: TaskStatus;
  suggestedNextStep: string;
}

export interface EmailAnalysis {
  summary: string;
  mainPurpose: string;
  category: string;
  isImportant: boolean;
  importantDates: string[];
  keyEntities: string[];
  requestedFollowUp: string;
  recommendedNextAction: string;
  actionItems: Array<{
    title: string;
    deadline: string;
    priority: PriorityLevel;
    suggestedNextStep: string;
  }>;
}

export interface EmailMessage {
  id: string;
  threadId?: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  timestamp: string;
  snippet: string;
  body: string;
  unread: boolean;
  isImportant: boolean;
  isDemo: boolean;
  analysis?: EmailAnalysis;
  customCategory?: string;
}

export interface DailyDigest {
  headlineSummary: string;
  itemsRequiringAttention: number;
  keyUpdates: Array<{
    factualUpdate: string;
    sourceSender: string;
    emailId: string;
  }>;
  actionItems: Array<{
    task: string;
    aiRecommendation: string;
    deadline: string;
    priority: string;
    emailId: string;
  }>;
  upcomingDeadlines: Array<{
    eventOrTask: string;
    dateOrTime: string;
    sourceSubject: string;
    emailId: string;
  }>;
  meetingsAndSchedule: Array<{
    title: string;
    when: string;
    statusNote: string;
    emailId: string;
  }>;
  needsReply: Array<{
    senderName: string;
    subject: string;
    reason: string;
    emailId: string;
  }>;
  canWait: Array<{
    subject: string;
    senderName: string;
    reason: string;
    emailId: string;
  }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
