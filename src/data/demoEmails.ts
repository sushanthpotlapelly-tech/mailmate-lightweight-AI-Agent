import { EmailMessage, DailyDigest, EmailCategory } from '../types';

export const DEMO_EMAILS: EmailMessage[] = [
  {
    id: 'demo-1',
    subject: 'Fall Semester Final Exam Schedule Released — Computer Science Department',
    senderName: 'Office of the Registrar',
    senderEmail: 'registrar@crestview.edu',
    timestamp: '2026-10-10T09:15:00-07:00',
    snippet: 'The official final examination timetable for Fall 2026 has been published. Please verify your course exam dates and report conflicts by October 16.',
    body: `Dear Students,

The official final examination schedule for the Fall 2026 semester has been released by the College Registrar's Office.

Key Dates & Details for Your Registered Courses:
- CS 402 (Distributed Systems): Monday, December 14, 2026, from 9:00 AM to 12:00 PM in Hall B-204.
- CS 455 (Machine Learning Foundations): Wednesday, December 16, 2026, from 1:30 PM to 4:30 PM in Science Center Room 110.
- MATH 310 (Applied Linear Algebra): Friday, December 18, 2026, from 9:00 AM to 11:00 AM in Hall A-102.

Important Policy:
Students with two exams scheduled at the same time or three exams within a single 24-hour period must submit the Exam Conflict Resolution Form via the Student Portal no later than Friday, October 16, 2026 at 5:00 PM.

Please review the schedule carefully and plan your study blocks ahead of time.

Sincerely,
Office of the University Registrar
Crestview University`,
    unread: true,
    isImportant: true,
    isDemo: true,
    analysis: {
      summary: 'The college registrar has published the Fall 2026 final exam schedule for CS 402, CS 455, and MATH 310, with a deadline of October 16 to report any scheduling conflicts.',
      mainPurpose: 'Announce final examination dates, locations, and the conflict reporting deadline.',
      category: EmailCategory.URGENT_IMPORTANT,
      isImportant: true,
      importantDates: [
        'October 16, 2026 at 5:00 PM (Exam Conflict Form Deadline)',
        'December 14, 2026, 9:00 AM – 12:00 PM (CS 402 Exam)',
        'December 16, 2026, 1:30 PM – 4:30 PM (CS 455 Exam)',
        'December 18, 2026, 9:00 AM – 11:00 AM (MATH 310 Exam)',
      ],
      keyEntities: ['Office of the University Registrar', 'Crestview University', 'CS 402', 'CS 455', 'MATH 310'],
      requestedFollowUp: 'Verify course exam times and submit the Exam Conflict Resolution Form by October 16 if any conflicts exist.',
      recommendedNextAction: 'Review a deadline',
      actionItems: [
        {
          title: 'Check the exam schedule and plan study time',
          deadline: 'October 16, 2026, 5:00 PM',
          priority: 'High',
          suggestedNextStep: 'Add December 14, 16, and 18 exam slots to your calendar and verify no conflicts exist.',
        },
      ],
    },
  },
  {
    id: 'demo-2',
    subject: 'Action Required: Q4 Architecture & Project File Review before Client Handoff',
    senderName: 'Elena Rostova (Product Lead)',
    senderEmail: 'elena.rostova@nexuslabs.io',
    timestamp: '2026-10-10T10:42:00-07:00',
    snippet: 'Could you review the updated Q4 system architecture deck and share the finalized project specification file by tomorrow at 2:00 PM?',
    body: `Hi team,

We are finalizing our technical deliverables for the Meridian client handoff. Before we lock the repository, I need your sign-off on the updated API throughput benchmarks and the deployment topology diagram.

Could you please:
1. Review the Q4 System Architecture specification file attached in the shared workspace.
2. Share the updated project file with your latency profiling notes by tomorrow, October 11 at 2:00 PM PDT.

Let me know if you spot any discrepancies in the staging cluster metrics so we can adjust the slides before the executive briefing.

Best,
Elena Rostova
Lead Product Manager, Nexus Labs`,
    unread: true,
    isImportant: true,
    isDemo: true,
    analysis: {
      summary: 'Elena Rostova requested a review of the Q4 System Architecture specification and asked you to share the updated project file with latency profiling notes by October 11 at 2:00 PM.',
      mainPurpose: 'Request review and delivery of the finalized project specification file prior to client handoff.',
      category: EmailCategory.WORK_PROJECTS,
      isImportant: true,
      importantDates: ['October 11, 2026 at 2:00 PM PDT (Project file delivery deadline)'],
      keyEntities: ['Elena Rostova', 'Nexus Labs', 'Meridian Client'],
      requestedFollowUp: 'Reply with the updated project file and confirm whether staging cluster metrics match.',
      recommendedNextAction: 'Draft a reply',
      actionItems: [
        {
          title: 'Share the project file by the stated deadline',
          deadline: 'October 11, 2026, 2:00 PM',
          priority: 'High',
          suggestedNextStep: 'Verify latency profiling notes in the Q4 specification and send the updated file to Elena.',
        },
      ],
    },
  },
  {
    id: 'demo-3',
    subject: 'Software Engineering Summer Internship Opportunity — AI Platform Team',
    senderName: 'Maya Lin — Talent Acquisition (HR)',
    senderEmail: 'maya.lin@lumina-ai.com',
    timestamp: '2026-10-10T11:20:00-07:00',
    snippet: 'Following your university career fair submission, our HR team invites you to apply for the Summer 2027 AI Platform Engineering Internship by October 18.',
    body: `Hello,

Thank you for speaking with our engineering ambassadors at the Fall Technical Career Showcase. Our HR and University Recruiting team was impressed by your background in full-stack TypeScript systems and applied AI.

We are pleased to invite you to fast-track your application for the Summer 2027 Software Engineering Internship on our Core AI Platform Team in San Francisco (hybrid option available).

Role Highlights:
- 12-week paid internship ($52/hr + housing stipend)
- Direct mentorship from Staff Engineers building distributed inference pipelines
- Priority interview window closes on Sunday, October 18, 2026 at 11:59 PM PDT.

If you would like to be considered for the first-round technical screen, please upload your latest resume and transcript through our candidate link and reply to confirm your availability.

Warm regards,
Maya Lin
Senior University Recruiter, Human Resources
Lumina AI`,
    unread: true,
    isImportant: true,
    isDemo: true,
    analysis: {
      summary: 'Maya Lin from Lumina AI HR invited you to fast-track your application for the Summer 2027 AI Platform Software Engineering Internship before the October 18 priority deadline.',
      mainPurpose: 'Extend a fast-track internship opportunity and request resume/transcript submission.',
      category: EmailCategory.OPPORTUNITIES_INTERNSHIPS,
      isImportant: true,
      importantDates: ['October 18, 2026 at 11:59 PM PDT (Priority application deadline)'],
      keyEntities: ['Maya Lin', 'Lumina AI', 'Core AI Platform Team'],
      requestedFollowUp: 'Upload latest resume and transcript and reply to confirm interview availability.',
      recommendedNextAction: 'Review an opportunity',
      actionItems: [
        {
          title: 'Review the internship opportunity and decide whether to apply',
          deadline: 'October 18, 2026, 11:59 PM',
          priority: 'High',
          suggestedNextStep: 'Update your resume, gather your unofficial transcript, and reply to Maya Lin.',
        },
      ],
    },
  },
  {
    id: 'demo-4',
    subject: 'Updated Invitation: Sprint Planning & API Sync Moved to Thursday 3:30 PM',
    senderName: 'Marcus Vance',
    senderEmail: 'm.vance@nexuslabs.io',
    timestamp: '2026-10-10T12:05:00-07:00',
    snippet: 'Heads up — moving our weekly Sprint Planning & API Sync from Wednesday morning to Thursday, October 15 at 3:30 PM PDT due to the security audit.',
    body: `Hi everyone,

Due to a scheduling conflict with the quarterly infrastructure security audit on Wednesday morning, we are rescheduling our Sprint Planning & API Sync meeting.

New Meeting Time:
- Date: Thursday, October 15, 2026
- Time: 3:30 PM – 4:15 PM PDT
- Location: Conference Room 4B / Google Meet link in calendar invite

Please confirm if the new Thursday afternoon slot works for your schedule, or flag any blockers in the team channel today.

Thanks,
Marcus Vance
Engineering Manager, Nexus Labs`,
    unread: false,
    isImportant: true,
    isDemo: true,
    analysis: {
      summary: 'Marcus Vance rescheduled the weekly Sprint Planning & API Sync from Wednesday morning to Thursday, October 15, from 3:30 PM to 4:15 PM PDT.',
      mainPurpose: 'Notify the team of a rescheduled work meeting and request attendance confirmation.',
      category: EmailCategory.MEETINGS_EVENTS,
      isImportant: true,
      importantDates: ['Thursday, October 15, 2026, 3:30 PM – 4:15 PM PDT'],
      keyEntities: ['Marcus Vance', 'Nexus Labs'],
      requestedFollowUp: 'Confirm whether the new Thursday 3:30 PM time slot works for your schedule.',
      recommendedNextAction: 'Confirm a meeting',
      actionItems: [
        {
          title: 'Confirm attendance for rescheduled Thursday 3:30 PM Sprint Sync',
          deadline: 'October 14, 2026',
          priority: 'Medium',
          suggestedNextStep: 'Check your Thursday afternoon calendar and accept the updated meeting invite.',
        },
      ],
    },
  },
  {
    id: 'demo-5',
    subject: 'CS 402 Assignment 3: Raft Consensus Implementation Due October 14',
    senderName: 'Prof. David Chen',
    senderEmail: 'dchen@cs.crestview.edu',
    timestamp: '2026-10-10T08:30:00-07:00',
    snippet: 'Reminder that Assignment 3 (Raft Leader Election & Log Replication) is due Wednesday, October 14 at 11:59 PM on Gradescope.',
    body: `Hello CS 402 class,

This is a reminder that Assignment 3: Raft Leader Election and Log Replication is due on Wednesday, October 14, 2026 at 11:59 PM PDT via Gradescope.

Submission Checklist:
1. Pass all 18 unit and network-partition tests in the test harness.
2. Include a brief 2-page design writeup (PDF) explaining how your implementation handles split votes and stale leaders.
3. Ensure your partner's student ID is linked on the Gradescope submission.

Office hours will be held on Monday and Tuesday from 4:00 PM to 6:00 PM in Gates 302.

Best,
Prof. David Chen
Department of Computer Science`,
    unread: true,
    isImportant: true,
    isDemo: true,
    analysis: {
      summary: 'Professor David Chen sent a reminder that CS 402 Assignment 3 (Raft Consensus Implementation and 2-page PDF design writeup) is due Wednesday, October 14 at 11:59 PM.',
      mainPurpose: 'Remind students of the upcoming CS 402 coding assignment deadline and submission checklist.',
      category: EmailCategory.TASKS_ASSIGNMENTS,
      isImportant: true,
      importantDates: [
        'Wednesday, October 14, 2026 at 11:59 PM PDT (Assignment 3 Deadline)',
        'Monday & Tuesday, 4:00 PM – 6:00 PM (Office Hours)',
      ],
      keyEntities: ['Prof. David Chen', 'CS 402', 'Gradescope'],
      requestedFollowUp: 'None explicitly requested (submit assignment via Gradescope).',
      recommendedNextAction: 'Prepare an assignment',
      actionItems: [
        {
          title: 'Complete CS 402 Assignment 3 Raft tests and 2-page PDF writeup',
          deadline: 'October 14, 2026, 11:59 PM',
          priority: 'High',
          suggestedNextStep: 'Run the network-partition test suite and draft the 2-page split-vote design document.',
        },
      ],
    },
  },
  {
    id: 'demo-6',
    subject: 'Saturday Rooftop Dinner & Board Games for Priya’s Birthday!',
    senderName: 'Liam & Chloe',
    senderEmail: 'liam.parker@gmail.com',
    timestamp: '2026-10-09T19:45:00-07:00',
    snippet: 'We are hosting a small rooftop dinner this Saturday, October 17 at 6:30 PM to celebrate Priya’s birthday. Let us know by Wednesday if you can make it!',
    body: `Hey!

Chloe and I are putting together a cozy rooftop dinner and board game night at our apartment this Saturday, October 17 starting at 6:30 PM to celebrate Priya's birthday!

We're ordering wood-fired pizzas and making sangria. Feel free to bring a favorite board game or dessert if you'd like (totally optional).

Could you reply by Wednesday evening to let us know if you can make it and if you have any dietary restrictions?

Hope to see you Saturday!
— Liam & Chloe`,
    unread: false,
    isImportant: false,
    isDemo: true,
    analysis: {
      summary: 'Liam and Chloe invited you to a rooftop dinner and board game night for Priya’s birthday on Saturday, October 17 at 6:30 PM, asking for an RSVP by Wednesday evening.',
      mainPurpose: 'Personal invitation to a friend’s birthday dinner with an RSVP request.',
      category: EmailCategory.PERSONAL_MESSAGES,
      isImportant: false,
      importantDates: [
        'Wednesday, October 14, 2026 evening (RSVP deadline)',
        'Saturday, October 17, 2026 at 6:30 PM (Birthday dinner)',
      ],
      keyEntities: ['Liam & Chloe', 'Priya'],
      requestedFollowUp: 'Reply by Wednesday evening with your RSVP and any dietary restrictions.',
      recommendedNextAction: 'Draft a reply',
      actionItems: [
        {
          title: 'RSVP to Liam & Chloe for Priya’s Saturday birthday dinner',
          deadline: 'October 14, 2026',
          priority: 'Low',
          suggestedNextStep: 'Reply to Liam confirming attendance and noting any dietary preferences.',
        },
      ],
    },
  },
  {
    id: 'demo-7',
    subject: 'TypeScript Weekly #412: Compiler Speedups, React 19 Patterns & Vite 8',
    senderName: 'TypeScript Weekly Digest',
    senderEmail: 'newsletter@typescriptweekly.com',
    timestamp: '2026-10-09T14:00:00-07:00',
    snippet: 'In this week’s issue: Exploring isolated declarations, faster monorepo builds, and zero-bundle server actions.',
    body: `TypeScript Weekly — Issue #412

Top Picks This Week:
1. Isolated Declarations in Practice: How large teams cut typecheck times by 60% across multi-package repositories.
2. React 19 & Server Actions: Practical patterns for optimistic UI updates without boilerplate.
3. Vite 8 Release Notes: Native bundler optimizations and improved SSR cold starts.

Sponsor: CloudTrace — Zero-config observability for Node.js microservices.

Read the full articles on our web archive anytime. No action needed.`,
    unread: false,
    isImportant: false,
    isDemo: true,
    analysis: {
      summary: 'Weekly developer newsletter covering TypeScript isolated declarations, React 19 patterns, and Vite 8 performance improvements.',
      mainPurpose: 'Share curated software engineering articles and release news.',
      category: EmailCategory.NEWSLETTERS_PROMOTIONS,
      isImportant: false,
      importantDates: [],
      keyEntities: ['TypeScript Weekly', 'CloudTrace'],
      requestedFollowUp: 'None explicitly requested',
      recommendedNextAction: 'Read the full email',
      actionItems: [],
    },
  },
  {
    id: 'demo-8',
    subject: 'Campus Library Extended 24/7 Study Hours & Maintenance Window',
    senderName: 'Crestview Library Services',
    senderEmail: 'library-notices@crestview.edu',
    timestamp: '2026-10-09T11:10:00-07:00',
    snippet: 'Starting October 19, the Main Engineering Library will remain open 24/7 for midterms and finals. Online catalog maintenance occurs Sunday 2 AM–4 AM.',
    body: `Hello Campus Community,

To support students during midterm projects and final exam preparation, the Main Engineering Library (Floors 1–3) will transition to 24/7 access starting Monday, October 19, 2026. Valid student ID badge tap is required after 10:00 PM.

Scheduled System Notice:
The online interlibrary loan catalog will undergo routine maintenance this Sunday from 2:00 AM to 4:00 AM. Digital journal access will remain uninterrupted.

Best regards,
Crestview University Library Services`,
    unread: false,
    isImportant: false,
    isDemo: true,
    analysis: {
      summary: 'Crestview Library announced 24/7 study hours for the Main Engineering Library starting October 19 and a brief catalog maintenance window this Sunday from 2:00 AM to 4:00 AM.',
      mainPurpose: 'Inform students of extended 24/7 library hours and scheduled catalog maintenance.',
      category: EmailCategory.GENERAL_INFORMATION,
      isImportant: false,
      importantDates: ['Monday, October 19, 2026 (24/7 Library access begins)'],
      keyEntities: ['Crestview University Library Services', 'Main Engineering Library'],
      requestedFollowUp: 'None explicitly requested',
      recommendedNextAction: 'Read the full email',
      actionItems: [],
    },
  },
  {
    id: 'demo-9',
    subject: '40% Off Autumn Ergonomic Desk & Monitor Arm Flash Sale',
    senderName: 'WorkSpace Studio Deals',
    senderEmail: 'offers@workspacestudio.shop',
    timestamp: '2026-10-08T16:20:00-07:00',
    snippet: 'Upgrade your home study setup with 40% off dual monitor arms, mechanical keycaps, and task lighting through Sunday.',
    body: `Autumn Workspace Upgrade Event

Save up to 40% on our flagship aluminum monitor arms, felt desk mats, and warm LED task bars. Use promo code FOCUS40 at checkout. Offer valid while supplies last.

Unsubscribe anytime from promotional preferences.`,
    unread: false,
    isImportant: false,
    isDemo: true,
    analysis: {
      summary: 'Promotional marketing email offering 40% off ergonomic desk accessories and monitor arms with code FOCUS40.',
      mainPurpose: 'Advertise a seasonal retail sale on workspace accessories.',
      category: EmailCategory.NEWSLETTERS_PROMOTIONS,
      isImportant: false,
      importantDates: [],
      keyEntities: ['WorkSpace Studio Deals'],
      requestedFollowUp: 'None explicitly requested',
      recommendedNextAction: 'Read the full email',
      actionItems: [],
    },
  },
];

export const DEMO_DAILY_DIGEST: DailyDigest = {
  headlineSummary:
    'You have 9 emails processed today, with 3 high-priority items requiring attention: the Fall final exam schedule, an urgent Q4 project file review due tomorrow, and a fast-track AI engineering internship invitation from HR.',
  itemsRequiringAttention: 3,
  keyUpdates: [
    {
      factualUpdate: 'Exam schedule released by the college Registrar for CS 402, CS 455, and MATH 310.',
      sourceSender: 'Office of the Registrar',
      emailId: 'demo-1',
    },
    {
      factualUpdate: 'Project file review requested by the team prior to the Meridian client handoff.',
      sourceSender: 'Elena Rostova (Product Lead)',
      emailId: 'demo-2',
    },
    {
      factualUpdate: 'Internship opportunity announced by HR for the Summer 2027 AI Platform Team.',
      sourceSender: 'Maya Lin — Talent Acquisition (HR)',
      emailId: 'demo-3',
    },
  ],
  actionItems: [
    {
      task: 'Check the exam schedule and plan study time.',
      aiRecommendation: 'Cross-check Dec 14, 16, and 18 exam slots today so any conflict form can be filed well before the Oct 16 cutoff.',
      deadline: 'October 16, 2026, 5:00 PM',
      priority: 'High',
      emailId: 'demo-1',
    },
    {
      task: 'Share the project file by the stated deadline.',
      aiRecommendation: 'Prioritize this first since the Q4 specification with latency notes is due tomorrow at 2:00 PM PDT.',
      deadline: 'October 11, 2026, 2:00 PM',
      priority: 'High',
      emailId: 'demo-2',
    },
    {
      task: 'Review the internship opportunity and decide whether to apply.',
      aiRecommendation: 'Upload your resume and transcript early before the October 18 fast-track window closes.',
      deadline: 'October 18, 2026, 11:59 PM',
      priority: 'High',
      emailId: 'demo-3',
    },
    {
      task: 'Complete CS 402 Assignment 3 Raft tests and 2-page PDF writeup.',
      aiRecommendation: 'Block out study time before Wednesday night and attend Monday/Tuesday office hours if needed.',
      deadline: 'October 14, 2026, 11:59 PM',
      priority: 'High',
      emailId: 'demo-5',
    },
  ],
  upcomingDeadlines: [
    {
      eventOrTask: 'Share Q4 Architecture & Latency Project File',
      dateOrTime: 'Tomorrow, Oct 11 at 2:00 PM',
      sourceSubject: 'Action Required: Q4 Architecture & Project File Review',
      emailId: 'demo-2',
    },
    {
      eventOrTask: 'CS 402 Assignment 3 (Raft Implementation) Submission',
      dateOrTime: 'Wednesday, Oct 14 at 11:59 PM',
      sourceSubject: 'CS 402 Assignment 3: Raft Consensus Implementation',
      emailId: 'demo-5',
    },
    {
      eventOrTask: 'Final Exam Conflict Resolution Form Cutoff',
      dateOrTime: 'Friday, Oct 16 at 5:00 PM',
      sourceSubject: 'Fall Semester Final Exam Schedule Released',
      emailId: 'demo-1',
    },
    {
      eventOrTask: 'Lumina AI Summer Internship Priority Application',
      dateOrTime: 'Sunday, Oct 18 at 11:59 PM',
      sourceSubject: 'Software Engineering Summer Internship Opportunity',
      emailId: 'demo-3',
    },
  ],
  meetingsAndSchedule: [
    {
      title: 'Sprint Planning & API Sync (Rescheduled)',
      when: 'Thursday, Oct 15, 3:30 PM – 4:15 PM PDT',
      statusNote: 'Moved from Wednesday morning due to quarterly security audit.',
      emailId: 'demo-4',
    },
    {
      title: 'Priya’s Birthday Rooftop Dinner & Board Games',
      when: 'Saturday, Oct 17 at 6:30 PM',
      statusNote: 'Personal invitation from Liam & Chloe; RSVP requested by Wednesday.',
      emailId: 'demo-6',
    },
  ],
  needsReply: [
    {
      senderName: 'Elena Rostova (Product Lead)',
      subject: 'Action Required: Q4 Architecture & Project File Review before Client Handoff',
      reason: 'Awaiting your updated project specification file and staging metric confirmation by tomorrow 2:00 PM.',
      emailId: 'demo-2',
    },
    {
      senderName: 'Marcus Vance',
      subject: 'Updated Invitation: Sprint Planning & API Sync Moved to Thursday 3:30 PM',
      reason: 'Requested confirmation that the new Thursday 3:30 PM meeting slot works for you.',
      emailId: 'demo-4',
    },
    {
      senderName: 'Liam & Chloe',
      subject: 'Saturday Rooftop Dinner & Board Games for Priya’s Birthday!',
      reason: 'Asked for an RSVP and any dietary restrictions by Wednesday evening.',
      emailId: 'demo-6',
    },
  ],
  canWait: [
    {
      subject: 'TypeScript Weekly #412: Compiler Speedups, React 19 Patterns & Vite 8',
      senderName: 'TypeScript Weekly Digest',
      reason: 'Informational developer newsletter with no deadline.',
      emailId: 'demo-7',
    },
    {
      subject: 'Campus Library Extended 24/7 Study Hours & Maintenance Window',
      senderName: 'Crestview Library Services',
      reason: 'General campus announcement regarding 24/7 study hours starting Oct 19.',
      emailId: 'demo-8',
    },
    {
      subject: '40% Off Autumn Ergonomic Desk & Monitor Arm Flash Sale',
      senderName: 'WorkSpace Studio Deals',
      reason: 'Promotional retail newsletter.',
      emailId: 'demo-9',
    },
  ],
};
