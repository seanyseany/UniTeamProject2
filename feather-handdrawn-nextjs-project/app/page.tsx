'use client';

import { useMemo, useState, type ReactNode } from 'react';
import styles from './page.module.css';

type FilterType = 'All' | 'Priority' | 'People' | 'Deadline';
type MessageMode = 'Group' | 'PM';

type BoardCard = {
  title: string;
  due: string;
  expected: string;
  actual: string;
  assignee: string;
  priority: string;
};

type MessageItem = {
  sender?: string;
  owner?: string;
  text?: string;
  title?: string;
  time: string;
  priority?: string;
  tag?: string;
};

const navItems = [
  'Dashboard',
  'Create Group Chat',
  'Tasks',
  'Workspace',
  'Availability',
  'Workload',
];

const summaryCards = [
  { label: 'Tasks', value: '5' },
  { label: 'Messages', value: '4' },
  { label: 'Progress', value: '40%' },
];

const workspaceNotes = [
  'Weekly goal: finish the draft and organise references.',
  'Shared files and pictures stay attached to this workspace.',
  'Data collection summary is ready for review.',
];

const attachments = [
  'draft_report.docx',
  'research_sources.pdf',
  'meeting-board.png',
];

const boardColumns: { title: string; cards: BoardCard[] }[] = [
  {
    title: 'To Do',
    cards: [
      {
        title: 'Literature draft',
        due: 'Due 29 Mar',
        expected: '8h',
        actual: '0h',
        assignee: 'Bob',
        priority: 'High',
      },
    ],
  },
  {
    title: 'In Progress',
    cards: [
      {
        title: 'Key points',
        due: 'Due 31 Mar',
        expected: '4h',
        actual: '30min',
        assignee: 'Sarah',
        priority: 'Medium',
      },
    ],
  },
  {
    title: 'Review',
    cards: [
      {
        title: 'Data analysis',
        due: 'Due 30 Mar',
        expected: '3h',
        actual: '3.2h',
        assignee: 'Tom',
        priority: 'Medium',
      },
    ],
  },
  {
    title: 'Completed',
    cards: [
      {
        title: 'Paragraph & revision',
        due: 'Due 25 Mar',
        expected: '2h',
        actual: '1.5h',
        assignee: 'Alex',
        priority: 'Low',
      },
    ],
  },
];

const availabilityGrid = [
  ['9:00', true, false, false, true, false],
  ['11:00', true, true, false, false, false],
  ['13:00', false, true, true, false, true],
  ['15:00', false, false, true, true, true],
  ['17:00', true, false, true, false, false],
] as const;

const people = [
  { name: 'Sam', className: styles.dotBlue },
  { name: 'Sarah', className: styles.dotYellow },
  { name: 'Bob', className: styles.dotPurple },
];

const teamLoad = [
  { name: 'You', load: 3, available: '20h', planned: '7h', actual: '6.5h', progress: 68 },
  { name: 'Tom', load: 5, available: '30h', planned: '8.5h', actual: '9h', progress: 54 },
  { name: 'Sarah', load: 2, available: '16h', planned: '5h', actual: '4.2h', progress: 74 },
];

const messageFeed: MessageItem[] = [
  {
    sender: 'Bob',
    text: 'Can we finalise the data collection section today?',
    time: '10:42',
    priority: 'High',
    tag: 'task',
  },
  {
    sender: 'Alex',
    text: 'Can we meet at 1pm tomorrow?',
    time: '11:06',
    priority: 'Medium',
    tag: 'meeting',
  },
  {
    sender: 'Tom',
    text: 'Can you send me the workspace link?',
    time: '11:20',
    priority: 'Medium',
    tag: 'link',
  },
];

const actionableSummary: MessageItem[] = [
  {
    title: 'Finalise data collection',
    owner: 'Sam',
    time: '10:42',
  },
  {
    title: 'Find research papers',
    owner: 'Bob',
    time: '11:06',
  },
  {
    title: 'Write executive summary',
    owner: 'You',
    time: '11:20',
  },
];

const weeklyPriority = [
  {
    title: 'Due 2 Apr',
    note: '3 days left',
    status: 'On track',
  },
  {
    title: 'Due 3 Apr',
    note: '4 days left',
    status: 'Urgent',
  },
];

const refinedIdeas = [
  ['Priority based message filtering', 'Shows only task-linked or high-priority messages.'],
  ['AI task extraction', 'Detects discussed tasks and converts them into task items.'],
  ['Track responses / activeness', 'Highlights unread members and recent activity.'],
  ['Actionable summary of chat', 'Summarises only relevant actionable content.'],
  ['AI meeting scheduler', 'Suggests best time slots from availability.'],
  ['Priority escalation', 'Raises task priority as deadline risk increases.'],
  ['Smart task allocation', 'Balances skill, workload and availability.'],
  ['Availability + task allocation', 'Shows fairness with planned vs actual time.'],
  ['Weekly update', 'Displays what needs focus this week.'],
  ['Deadline risk prediction', 'Warns which task may become late soon.'],
];

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>{title}</h2>
        {action}
      </div>
      <div className={styles.panelBody}>{children}</div>
    </section>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className={styles.progressTrack}>
      <div className={styles.progressFill} style={{ width: `${value}%` }} />
    </div>
  );
}

export default function Page() {
  const [filter, setFilter] = useState<FilterType>('All');
  const [messageMode, setMessageMode] = useState<MessageMode>('Group');
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [analysis, setAnalysis] = useState('PhD');
  const [busyReason, setBusyReason] = useState('work');

  const filteredMessages = useMemo(() => {
    if (filter === 'Priority') return messageFeed.filter((item) => item.priority === 'High');
    if (filter === 'People') return messageFeed.filter((item) => item.sender === 'Bob' || item.sender === 'Alex');
    if (filter === 'Deadline') return actionableSummary;
    return messageFeed;
  }, [filter]);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.profileCard}>
              <div className={styles.avatar}>BOB</div>
              <div>
                <div className={styles.profileTitle}>Main Screen</div>
                <div className={styles.profileSubtitle}>Customisable dashboard</div>
              </div>
            </div>

            <nav className={styles.nav}>
              {navItems.map((item, index) => (
                <button
                  key={item}
                  className={index === 0 ? styles.navButtonActive : styles.navButton}
                  type="button"
                >
                  <span>{item}</span>
                  <span className={styles.navArrow}>›</span>
                </button>
              ))}
            </nav>

            <div className={styles.sidebarNote}>
              <div className={styles.sidebarNoteTitle}>Access all features from the sidebar</div>
              <p>
                This follows your sketch: one entry point for workspace, tasks, availability,
                messages and workload.
              </p>
            </div>
          </aside>

          <div className={styles.mainArea}>
            <section className={styles.hero}>
              <div className={styles.heroTop}>
                <div className={styles.heroTitleWrap}>
                  <button className={styles.iconButton} type="button">
                    ☰
                  </button>
                  <div>
                    <div className={styles.breadcrumb}>Main Screen → customise</div>
                    <h1 className={styles.heroTitle}>Dashboard overview</h1>
                  </div>
                </div>

                <div className={styles.heroActions}>
                  <button className={styles.secondaryButton} type="button">Search</button>
                  <button className={styles.secondaryButton} type="button">Updates</button>
                  <button className={styles.primaryButton} type="button">Customise</button>
                </div>
              </div>

              <div className={styles.summaryGrid}>
                {summaryCards.map((card) => (
                  <div key={card.label} className={styles.summaryCard}>
                    <div className={styles.summaryLabel}>{card.label}</div>
                    <div className={styles.summaryValue}>{card.value}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.topSection}>
              <Panel title="Workspace overview">
                <div className={styles.noteStack}>
                  {workspaceNotes.map((note) => (
                    <div key={note} className={styles.softCard}>{note}</div>
                  ))}
                </div>

                <div className={styles.docLinkCard}>
                  <div className={styles.inlineLabel}>Link to docs</div>
                  <div className={styles.docLink}>https://workspace-link.example/project</div>
                </div>

                <div className={styles.attachmentsWrap}>
                  <div className={styles.inlineLabel}>Attachments</div>
                  <div className={styles.attachmentList}>
                    {attachments.map((item) => (
                      <span key={item} className={styles.attachmentItem}>{item}</span>
                    ))}
                  </div>
                </div>
              </Panel>

              <Panel
                title="Task board"
                action={
                  <div className={styles.taskHeaderActions}>
                    <div className={styles.filterRow}>
                      {(['All', 'Priority', 'People', 'Deadline'] as const).map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setFilter(item)}
                          className={filter === item ? styles.chipActive : styles.chip}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    <button className={styles.filterButton} type="button">Filter</button>
                  </div>
                }
              >
                <div className={styles.boardGrid}>
                  {boardColumns.map((column) => (
                    <div key={column.title} className={styles.boardColumn}>
                      <div className={styles.boardColumnHeader}>
                        <span>{column.title}</span>
                        <span className={styles.muted}>⋯</span>
                      </div>
                      <div className={styles.boardCardStack}>
                        {column.cards.map((card) => (
                          <div key={card.title} className={styles.taskCard}>
                            <div className={styles.taskCardTop}>
                              <div>
                                <div className={styles.taskCardTitle}>{card.title}</div>
                                <div className={styles.taskCardAssignee}>{card.assignee}</div>
                              </div>
                              <span className={styles.badge}>{card.priority}</span>
                            </div>
                            <div className={styles.taskMeta}> 
                              <div>{card.due}</div>
                              <div>Expected: {card.expected}</div>
                              <div>Actual: {card.actual}</div>
                            </div>
                            <button className={styles.cardButton} type="button">+ Add / move</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Chat summary">
                <div className={styles.noteStack}>
                  <div className={styles.softCard}>
                    <div className={styles.softCardTitle}>Overview of missed messages</div>
                    <p className={styles.softCardText}>
                      AI summary only shows actionable or important information and reduces clutter.
                    </p>
                  </div>
                  {actionableSummary.map((item) => (
                    <div key={item.title} className={styles.summaryEntry}>
                      <div className={styles.summaryEntryRow}>
                        <span className={styles.summaryEntryTitle}>{item.title}</span>
                        <button className={styles.timeButton} type="button">{item.time}</button>
                      </div>
                      <div className={styles.mutedSmall}>Owner: {item.owner}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>

            <section className={styles.middleSection}>
              <Panel title="Availability">
                <div className={styles.availabilityLayout}>
                  <div>
                    <div className={styles.tableWrap}>
                      <div className={styles.tableHeader}>
                        <div className={styles.tableCellLeft}>Time</div>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                          <div key={day} className={styles.tableCell}>{day}</div>
                        ))}
                      </div>
                      {availabilityGrid.map((row) => (
                        <div key={row[0]} className={styles.tableRow}>
                          <div className={styles.tableCellLeft}>{row[0]}</div>
                          {row.slice(1).map((filled, index) => (
                            <div key={`${row[0]}-${index}`} className={styles.tableCell}>
                              <span
                                className={filled ? people[index % people.length].className : styles.dotEmpty}
                              />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    <div className={styles.legend}>
                      {people.map((person) => (
                        <div key={person.name} className={styles.legendItem}>
                          <span className={person.className} />
                          <span>{person.name}</span>
                        </div>
                      ))}
                    </div>

                    <button className={styles.primaryButtonWide} type="button">
                      Organise best meeting time
                    </button>
                  </div>

                  <div className={styles.formCard}>
                    <div className={styles.formTitle}>Edit / update my availability</div>
                    <label className={styles.field}>
                      <span>Day</span>
                      <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </label>
                    <label className={styles.field}>
                      <span>Time</span>
                      <input value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} />
                    </label>
                    <label className={styles.field}>
                      <span>Analysis</span>
                      <input value={analysis} onChange={(e) => setAnalysis(e.target.value)} />
                    </label>
                    <label className={styles.field}>
                      <span>Why? (optional)</span>
                      <input value={busyReason} onChange={(e) => setBusyReason(e.target.value)} />
                    </label>
                    <button className={styles.secondaryButtonWide} type="button">Update</button>
                  </div>
                </div>
              </Panel>

              <Panel title="Workload distribution">
                <div className={styles.workloadLayout}>
                  <div>
                    <div className={styles.visibilityCard}>
                      <div className={styles.visibilityHeader}>
                        <span className={styles.inlineLabel}>Visibility board</span>
                        <button className={styles.filterButton} type="button">View</button>
                      </div>
                      <div className={styles.visibilityColumns}>
                        <span>Name</span>
                        <span>Load</span>
                        <span>Planned</span>
                        <span>Actual</span>
                      </div>
                    </div>

                    <div className={styles.memberList}>
                      {teamLoad.map((member) => (
                        <div key={member.name} className={styles.memberCard}>
                          <div className={styles.memberGrid}>
                            <div>
                              <div className={styles.memberName}>{member.name}</div>
                              <div className={styles.mutedSmall}>Avail: {member.available}</div>
                            </div>
                            <div>{member.load}</div>
                            <div>{member.planned}</div>
                            <div>{member.actual}</div>
                          </div>
                          <div className={styles.memberProgressWrap}>
                            <ProgressBar value={member.progress} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.assignCard}>
                    <div className={styles.formTitle}>Auto assign</div>
                    <div className={styles.assignBox}>
                      <div className={styles.mutedSmall}>Suggested</div>
                      <div className={styles.assignName}>Sarah</div>
                      <ul className={styles.assignList}>
                        <li>Medium workload</li>
                        <li>Available Wed PM</li>
                        <li>Good at research</li>
                      </ul>
                    </div>
                    <button className={styles.primaryButtonWide} type="button">Assign</button>
                    <p className={styles.mutedParagraph}>
                      AI analyses availability, strengths and current workload before suggesting an assignee.
                    </p>
                  </div>
                </div>
              </Panel>

              <Panel title="Weekly update — priority centred">
                <div className={styles.weeklyBox}>
                  <div className={styles.weeklyHeader}>
                    <span className={styles.inlineLabel}>Current progress</span>
                    <span className={styles.mutedSmall}>40%</span>
                  </div>
                  <ProgressBar value={40} />
                </div>
                <div className={styles.weeklyList}>
                  {weeklyPriority.map((item) => (
                    <div key={item.title} className={styles.weeklyItem}>
                      <div>
                        <div className={styles.summaryEntryTitle}>{item.title}</div>
                        <div className={styles.mutedSmall}>{item.note}</div>
                      </div>
                      <span className={item.status === 'Urgent' ? styles.statusUrgent : styles.statusNormal}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>

            <section className={styles.bottomSection}>
              <Panel
                title="Chat"
                action={
                  <div className={styles.modeSwitch}>
                    {(['Group', 'PM'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setMessageMode(mode)}
                        className={messageMode === mode ? styles.modeButtonActive : styles.modeButton}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                }
              >
                <div className={styles.chatLayout}>
                  <div className={styles.chatFeed}>
                    {filteredMessages.map((message, index) => (
                      <div key={`${message.sender ?? message.owner}-${index}`} className={styles.messageCard}>
                        <div className={styles.messageRow}>
                          <div className={styles.messageLeft}>
                            <div className={styles.messageAvatar}>{(message.sender ?? message.owner ?? 'A').charAt(0)}</div>
                            <div>
                              <div className={styles.messageSender}>{message.sender ?? message.owner}</div>
                              <div className={styles.messageText}>{message.text ?? message.title}</div>
                            </div>
                          </div>
                          <span className={styles.timeChip}>{message.time}</span>
                        </div>
                        <div className={styles.messageFooter}>
                          <div className={styles.messageTags}>
                            <span className={styles.messageTag}>{message.tag ?? 'task'}</span>
                            <span className={styles.messageTag}>{message.priority ?? 'Action'}</span>
                          </div>
                          <button className={styles.replyButton} type="button">Reply</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.chatSummaryBox}>
                    <div className={styles.formTitle}>Summary</div>
                    <div className={styles.mutedSmall}>Important</div>
                    <div className={styles.chatSummaryList}>
                      {actionableSummary.map((item) => (
                        <div key={item.title} className={styles.chatSummaryItem}>
                          <div className={styles.summaryEntryTitle}>{item.title}</div>
                          <div className={styles.chatSummaryMeta}>
                            <button className={styles.timeButton} type="button">{item.time}</button>
                            <span className={styles.mutedSmall}>{item.owner}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={styles.dashedNote}>
                      Actions can become tasks which the user can accept or decline.
                    </div>
                  </div>
                </div>
              </Panel>

              <Panel title="Refined design ideas">
                <div className={styles.ideaGrid}>
                  {refinedIdeas.map(([title, text], index) => (
                    <div key={title} className={styles.ideaCard}>
                      <div className={styles.ideaNumber}>{index + 1}</div>
                      <div>
                        <div className={styles.ideaTitle}>{title}</div>
                        <div className={styles.ideaText}>{text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
