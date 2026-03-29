export type Task = {
  title: string;
  due: string;
  assignees: string[];
  priority: 'High' | 'Medium' | 'Low';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  expected: string;
  actual: string;
  progress: number;
  notes?: string;
};

export const columns: Record<string, Task[]> = {
  'To Do': [
    {
      title: 'Prepare final report',
      due: '07 Jan 2026',
      assignees: ['ME', 'TM'],
      priority: 'High',
      difficulty: 'Hard',
      expected: '5h',
      actual: '0h',
      progress: 10,
      notes: 'Outline, integrate charts, and finalise citations.'
    },
    {
      title: 'Draft conclusion slides',
      due: '06 Jan 2026',
      assignees: ['MR'],
      priority: 'Medium',
      difficulty: 'Medium',
      expected: '2h',
      actual: '0.5h',
      progress: 22,
      notes: 'Condense key findings into 4 clean slides.'
    }
  ],
  'In Progress': [
    {
      title: 'Organise dataset',
      due: '03 Jan 2026',
      assignees: ['ME'],
      priority: 'High',
      difficulty: 'Medium',
      expected: '4h',
      actual: '3h',
      progress: 72,
      notes: 'Cleaning, tagging, and creating variable descriptions.'
    },
    {
      title: 'Interpret results',
      due: '05 Jan 2026',
      assignees: ['AV'],
      priority: 'Medium',
      difficulty: 'Hard',
      expected: '3h',
      actual: '1.5h',
      progress: 48,
      notes: 'Focus on patterns, anomalies, and policy implications.'
    }
  ],
  Review: [
    {
      title: 'Collect relevant economic data',
      due: '02 Jan 2026',
      assignees: ['TM'],
      priority: 'Medium',
      difficulty: 'Medium',
      expected: '3h',
      actual: '3.2h',
      progress: 92,
      notes: 'Waiting for peer review before moving to completed.'
    }
  ],
  Completed: [
    {
      title: 'Research',
      due: '31 Dec 2025',
      assignees: ['ME', 'AV'],
      priority: 'Low',
      difficulty: 'Easy',
      expected: '2h',
      actual: '1.8h',
      progress: 100,
      notes: 'Background reading done and shared in project notes.'
    },
    {
      title: 'Analyse requirements',
      due: '30 Dec 2025',
      assignees: ['MR'],
      priority: 'Low',
      difficulty: 'Easy',
      expected: '1.5h',
      actual: '1.4h',
      progress: 100,
      notes: 'Requirements aligned and approved by the group.'
    }
  ]
};

export const team = [
  { initials: 'ME', name: 'You', color: '#4357ff', load: '3 tasks', planned: '9h', actual: '6.5h', status: 'Balanced' },
  { initials: 'TM', name: 'Tom', color: '#28b16d', load: '2 tasks', planned: '6h', actual: '6.2h', status: 'Slightly overloaded' },
  { initials: 'MR', name: 'Maria', color: '#7955f6', load: '2 tasks', planned: '4h', actual: '3.1h', status: 'Balanced' },
  { initials: 'AV', name: 'Ava', color: '#ffb648', load: '1 task', planned: '3h', actual: '1.5h', status: 'Available' }
];

export const groupMessages = [
  {
    author: 'Tom',
    time: '10:12',
    text: 'I have uploaded the updated dataset. The variables are now grouped by source and year.',
    reactions: ['❤️ 2', '👍 3']
  },
  {
    author: 'Maria',
    time: '10:20',
    text: 'The literature review section is ready for someone to proofread before tonight.',
    reactions: ['👍 1']
  },
  {
    author: 'You',
    time: '10:31',
    text: 'Great. I will review it after I finish the dashboard draft and assign the remaining report sections.',
    reactions: ['❤️ 1']
  }
];

export const privateMessages = [
  {
    author: 'Ava',
    time: '09:48',
    text: 'Can you check whether the regression interpretation matches the tutor feedback?',
    reactions: ['👀 1']
  },
  {
    author: 'You',
    time: '09:50',
    text: 'Yes — send me the latest paragraph and I will annotate it before lunch.',
    reactions: ['❤️ 1']
  }
];
