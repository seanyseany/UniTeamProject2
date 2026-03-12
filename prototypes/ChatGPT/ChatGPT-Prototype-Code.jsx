import { useMemo, useState } from 'react';

export default function StudentGroupCollabPrototype() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('Dashboard');
  const [meetingInput, setMeetingInput] = useState(
    'Team agreed to split the report into introduction, methodology, results, and conclusion. Noah will finish the slides. Ava will draft the conclusion and review the readings. Tia will complete the methodology section tonight. Liam will check references before submission. Everyone will meet again Friday at 3 PM.'
  );
  const [showSummary, setShowSummary] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Tia', time: '10:02 AM', text: 'Let’s finalise the intro and methods section today.' },
    { sender: 'Ava', time: '10:05 AM', text: 'I uploaded the journal article notes to Files.' },
    { sender: 'Noah', time: '10:08 AM', text: 'I can handle the presentation slides after lunch.' },
  ]);

  const members = [
    { name: 'Tia', role: 'Project Lead', status: 'Online' },
    { name: 'Ava', role: 'Research', status: 'Away' },
    { name: 'Noah', role: 'Slides', status: 'Online' },
    { name: 'Liam', role: 'Data Analysis', status: 'Offline' },
  ];

  const [columns, setColumns] = useState({
    'To Do': [
      { title: 'Write conclusion', assignee: 'Ava', due: 'Fri' },
      { title: 'Check references', assignee: 'Liam', due: 'Sat' },
    ],
    'In Progress': [
      { title: 'Prepare slides', assignee: 'Noah', due: 'Today' },
      { title: 'Draft methodology', assignee: 'Tia', due: 'Today' },
    ],
    Completed: [
      { title: 'Choose topic', assignee: 'Group', due: 'Done' },
      { title: 'Allocate roles', assignee: 'Group', due: 'Done' },
    ],
  });

  const files = [
    { name: 'Assignment_Brief.pdf', meta: 'Uploaded by Tia · 2 MB' },
    { name: 'Research_Notes.docx', meta: 'Uploaded by Ava · 540 KB' },
    { name: 'Draft_Slides.pptx', meta: 'Uploaded by Noah · 3.1 MB' },
  ];

  const activity = [
    'Noah moved “Prepare slides” to In Progress',
    'Ava uploaded Research_Notes.docx',
    'Tia assigned “Write conclusion” to Ava',
  ];

  const navItems = ['Dashboard', 'Group Chat', 'Tasks', 'Files', 'AI Summary'];

  const stats = useMemo(() => {
    const openTasks = columns['To Do'].length + columns['In Progress'].length;
    return {
      openTasks,
      filesShared: files.length,
      unreadMessages: Math.max(0, chatMessages.length - 1),
    };
  }, [columns, chatMessages]);

  const moveTask = (fromColumn, taskIndex, direction) => {
    const order = ['To Do', 'In Progress', 'Completed'];
    const currentIndex = order.indexOf(fromColumn);
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= order.length) return;

    const targetColumn = order[targetIndex];
    const task = columns[fromColumn][taskIndex];

    setColumns((prev) => {
      const updated = {
        ...prev,
        [fromColumn]: prev[fromColumn].filter((_, i) => i !== taskIndex),
        [targetColumn]: [...prev[targetColumn], task],
      };
      return updated;
    });
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: 'You', time: 'Now', text: chatInput.trim() },
    ]);
    setChatInput('');
  };

  const summaryBlocks = [
    {
      title: 'Key Points',
      items: [
        'Report sections have been divided among the team.',
        'Slides and references are being completed in parallel.',
        'The next check-in meeting is scheduled for Friday at 3 PM.',
      ],
    },
    {
      title: 'Action Items',
      items: [
        'Christina: Complete methodology tonight.',
        'Noah: Finish slides.',
        'Ava: Draft conclusion and review readings.',
        'Liam: Check references before submission.',
      ],
    },
  ];

  const renderHeader = () => (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">UniGroup Prototype</h1>
        <p className="text-slate-600 mt-1">Clickable multi-screen flow for student group assignments</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {!isLoggedIn ? (
          <span className="px-4 py-2 rounded-xl bg-white border text-sm text-slate-600">Start at Login</span>
        ) : (
          <>
            <span className="px-4 py-2 rounded-xl bg-white border text-sm text-slate-600">Current Screen: {currentScreen}</span>
            <button
              onClick={() => {
                setIsLoggedIn(false);
                setCurrentScreen('Dashboard');
              }}
              className="px-4 py-2 rounded-xl border bg-white text-sm hover:bg-slate-50"
            >
              Log out
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderLogin = () => (
    <section className="bg-white rounded-3xl shadow-sm border p-8 min-h-[700px] flex items-center">
      <div className="grid md:grid-cols-2 gap-10 items-center w-full">
        <div>
          <div className="text-sm font-medium text-blue-600 mb-2">Screen 1</div>
          <h2 className="text-3xl font-semibold mb-3">Login Screen</h2>
          <p className="text-slate-600 max-w-lg">
            A simple entry point for students to access their group workspace, messages, shared files, and task board.
          </p>
          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 border px-4 py-3">Quick access to all group tools after login</div>
            <div className="rounded-2xl bg-slate-50 border px-4 py-3">Clean, minimal form for early usability testing</div>
            <div className="rounded-2xl bg-slate-50 border px-4 py-3">Single primary action to continue into the app</div>
          </div>
        </div>

        <div className="bg-slate-50 border rounded-3xl p-6 max-w-md w-full mx-auto shadow-sm">
          <h3 className="text-xl font-semibold mb-5">Welcome back</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-600 block mb-1">Student email</label>
              <input
                defaultValue="name@uni.edu.au"
                className="h-11 rounded-xl border bg-white px-4 w-full outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-slate-600 block mb-1">Password</label>
              <input
                defaultValue="password123"
                type="password"
                className="h-11 rounded-xl border bg-white px-4 w-full outline-none"
              />
            </div>
            <button
              onClick={() => setIsLoggedIn(true)}
              className="w-full h-11 rounded-xl bg-slate-900 text-white font-medium hover:opacity-95"
            >
              Log in
            </button>
            <p className="text-xs text-slate-500 text-center">
              Demo login takes the user straight into the dashboard
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  const renderSidebar = () => (
    <aside className="border-r bg-slate-50 p-5">
      <div className="text-lg font-semibold mb-6">GroupSpace</div>
      <nav className="space-y-2 text-sm">
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => setCurrentScreen(item)}
            className={`w-full text-left px-4 py-3 rounded-xl transition ${
              currentScreen === item
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 bg-transparent hover:bg-white border border-transparent'
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="mt-8 p-4 rounded-2xl bg-white border">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Current Group</div>
        <div className="font-medium">ABCD1234 Group 4</div>
        <div className="text-sm text-slate-500 mt-1">Assignment 2 · Due Monday</div>
      </div>

      <div className="mt-4 p-4 rounded-2xl bg-white border">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Prototype Flow</div>
        <div className="text-sm text-slate-600 space-y-2">
          <div>1. Log in</div>
          <div>2. View dashboard</div>
          <div>3. Move between chat, tasks, files, and AI summary</div>
        </div>
      </div>
    </aside>
  );

  const renderDashboard = () => (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-medium text-blue-600 mb-2">Screen 2</div>
        <h2 className="text-2xl font-semibold">Group Dashboard</h2>
        <p className="text-slate-600 mt-1">
          Overview of group members, deadlines, recent activity, and quick links into key tools.
        </p>
      </div>

      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-5 bg-slate-50">
          <div className="text-sm text-slate-500">Upcoming deadline</div>
          <div className="text-2xl font-semibold mt-2">Mon 11:59 PM</div>
          <div className="text-sm text-slate-600 mt-1">Final report submission</div>
        </div>
        <button
          onClick={() => setCurrentScreen('Tasks')}
          className="rounded-2xl border p-5 bg-slate-50 text-left hover:bg-white"
        >
          <div className="text-sm text-slate-500">Open tasks</div>
          <div className="text-2xl font-semibold mt-2">{stats.openTasks}</div>
          <div className="text-sm text-slate-600 mt-1">Tap to open task board</div>
        </button>
        <button
          onClick={() => setCurrentScreen('Group Chat')}
          className="rounded-2xl border p-5 bg-slate-50 text-left hover:bg-white"
        >
          <div className="text-sm text-slate-500">Unread chat messages</div>
          <div className="text-2xl font-semibold mt-2">{stats.unreadMessages}</div>
          <div className="text-sm text-slate-600 mt-1">Tap to open group chat</div>
        </button>
        <button
          onClick={() => setCurrentScreen('Files')}
          className="rounded-2xl border p-5 bg-slate-50 text-left hover:bg-white"
        >
          <div className="text-sm text-slate-500">Files shared</div>
          <div className="text-2xl font-semibold mt-2">{stats.filesShared}</div>
          <div className="text-sm text-slate-600 mt-1">Tap to open files</div>
        </button>
      </div>

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
        <div className="rounded-2xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Group Members</h3>
            <button className="text-sm px-3 py-2 rounded-lg border">Invite</button>
          </div>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-slate-500">{member.role}</div>
                </div>
                <div className="text-sm text-slate-600">{member.status}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-5">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm text-slate-700">
            {activity.map((item) => (
              <div key={item} className="rounded-xl bg-slate-50 px-4 py-3">{item}</div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <button
              onClick={() => setCurrentScreen('Tasks')}
              className="rounded-xl bg-slate-900 text-white px-4 py-3 text-sm"
            >
              Open Tasks
            </button>
            <button
              onClick={() => setCurrentScreen('AI Summary')}
              className="rounded-xl border px-4 py-3 text-sm"
            >
              Open AI Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium text-blue-600 mb-2">Screen 3</div>
        <h2 className="text-2xl font-semibold">Group Chat</h2>
        <p className="text-slate-600 mt-1">Real-time messaging for discussion, coordination, and quick updates.</p>
      </div>

      <div className="rounded-2xl border overflow-hidden">
        <div className="border-b px-5 py-4 flex items-center justify-between bg-slate-50">
          <div>
            <div className="font-semibold">ABCD1234 Group Chat</div>
            <div className="text-sm text-slate-500">4 members online now</div>
          </div>
          <button
            onClick={() => setCurrentScreen('AI Summary')}
            className="text-sm px-3 py-2 rounded-lg border"
          >
            Summarise chat
          </button>
        </div>
        <div className="p-5 space-y-4 bg-white min-h-[420px]">
          {chatMessages.map((message, idx) => (
            <div key={idx} className="max-w-2xl rounded-2xl bg-slate-50 px-4 py-3 border">
              <div className="flex items-center gap-2 text-sm mb-1">
                <span className="font-medium">{message.sender}</span>
                <span className="text-slate-400">{message.time}</span>
              </div>
              <div className="text-slate-700">{message.text}</div>
            </div>
          ))}
        </div>
        <div className="border-t p-4 bg-slate-50 flex gap-3">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 h-11 rounded-xl bg-white border px-4 outline-none"
          />
          <button onClick={sendMessage} className="px-5 rounded-xl bg-slate-900 text-white">
            Send
          </button>
        </div>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium text-blue-600 mb-2">Screen 4</div>
        <h2 className="text-2xl font-semibold">Task Management Board</h2>
        <p className="text-slate-600 mt-1">
          Lightweight Kanban board where tasks can be assigned and moved across stages.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {Object.entries(columns).map(([column, tasks]) => (
          <div key={column} className="rounded-2xl border bg-slate-50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{column}</h3>
              <span className="text-xs rounded-full bg-white border px-2 py-1">{tasks.length}</span>
            </div>
            <div className="space-y-3">
              {tasks.map((task, i) => (
                <div key={i} className="rounded-2xl bg-white border p-4 shadow-sm space-y-3">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-slate-500 mt-2">Assigned to: {task.assignee}</div>
                    <div className="text-sm text-slate-500">Due: {task.due}</div>
                  </div>
                  <div className="flex gap-2">
                    {column !== 'To Do' && (
                      <button
                        onClick={() => moveTask(column, i, -1)}
                        className="px-3 py-2 rounded-lg border text-sm bg-white"
                      >
                        ← Back
                      </button>
                    )}
                    {column !== 'Completed' && (
                      <button
                        onClick={() => moveTask(column, i, 1)}
                        className="px-3 py-2 rounded-lg border text-sm bg-white"
                      >
                        Next →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 rounded-xl border border-dashed bg-white px-4 py-3 text-sm text-slate-600">
              + Add task
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFiles = () => (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium text-blue-600 mb-2">Screen 5</div>
        <h2 className="text-2xl font-semibold">File Sharing Section</h2>
        <p className="text-slate-600 mt-1">
          Simple shared space for storing assignment briefs, research notes, drafts, and final files.
        </p>
      </div>

      <div className="rounded-2xl border p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <div className="font-semibold">Shared Files</div>
            <div className="text-sm text-slate-500">Upload, organise, and access common documents</div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl border">Create folder</button>
            <button className="px-4 py-2 rounded-xl bg-slate-900 text-white">Upload file</button>
          </div>
        </div>
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.name} className="flex items-center justify-between rounded-xl bg-slate-50 border px-4 py-4">
              <div>
                <div className="font-medium">{file.name}</div>
                <div className="text-sm text-slate-500">{file.meta}</div>
              </div>
              <button className="text-sm px-3 py-2 rounded-lg border bg-white">Download</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAISummary = () => (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-medium text-blue-600 mb-2">Screen 6</div>
        <h2 className="text-2xl font-semibold">AI Meeting Summary Feature</h2>
        <p className="text-slate-600 mt-1">
          Integrated AI tool that turns discussions into clear key points, action items, and responsibilities.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6">
        <div className="rounded-2xl border p-5 bg-slate-50">
          <h3 className="font-semibold mb-3">Meeting Input</h3>
          <textarea
            value={meetingInput}
            onChange={(e) => setMeetingInput(e.target.value)}
            className="rounded-2xl bg-white border p-4 text-sm text-slate-700 leading-6 min-h-[240px] w-full outline-none resize-none"
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowSummary(true)}
              className="rounded-xl bg-slate-900 text-white px-4 py-3 text-sm"
            >
              Generate AI Summary
            </button>
            <button
              onClick={() => setCurrentScreen('Tasks')}
              className="rounded-xl border px-4 py-3 text-sm"
            >
              Open task board
            </button>
          </div>
        </div>

        <div className="rounded-2xl border p-5">
          <h3 className="font-semibold mb-4">AI Summary Output</h3>
          {!showSummary ? (
            <div className="rounded-xl bg-slate-50 p-6 border text-sm text-slate-500 min-h-[240px] flex items-center">
              Generate a summary to display key points, action items, and suggested task updates.
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              {summaryBlocks.map((block) => (
                <div key={block.title} className="rounded-xl bg-slate-50 p-4 border">
                  <div className="font-medium mb-2">{block.title}</div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="rounded-xl bg-slate-50 p-4 border">
                <div className="font-medium mb-2">Suggested Task Updates</div>
                <div className="text-slate-700">
                  Convert the action items into task cards and assign deadlines automatically.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'Group Chat':
        return renderChat();
      case 'Tasks':
        return renderTasks();
      case 'Files':
        return renderFiles();
      case 'AI Summary':
        return renderAISummary();
      case 'Dashboard':
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {renderHeader()}

        {!isLoggedIn ? (
          renderLogin()
        ) : (
          <section className="bg-white rounded-3xl shadow-sm border overflow-hidden">
            <div className="grid lg:grid-cols-[220px_1fr] min-h-[900px]">
              {renderSidebar()}
              <main className="p-6">{renderCurrentScreen()}</main>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
