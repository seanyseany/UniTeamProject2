import { AvailabilityPanel } from '@/components/AvailabilityPanel';
import { ChatPanel } from '@/components/ChatPanel';
import { CustomizationPanel } from '@/components/CustomizationPanel';
import { TaskBoard } from '@/components/TaskBoard';
import NextLink from 'next/link';
import { Bell, LayoutGrid, Search, Settings2, SlidersHorizontal } from 'lucide-react';

const summary = [
  { label: 'Tasks this week', value: '7', note: '+2 in review' },
  { label: 'Unread updates', value: '5', note: '2 direct messages' },
  { label: 'Next meeting', value: 'Thu 3pm', note: 'All members free' },
  { label: 'Project progress', value: '68%', note: 'On track' },
];

export default function Page() {
  return (
    <main className="page-shell">
      <div className="dashboard">
        <div className="stack">
          <section className="panel panel-padding">
            <div className="topbar">
              <div className="brand">
                <div className="brand-mark">F</div>
                <div>
                  <p className="muted">Hi-fi prototype · university group work app</p>
                  <h1>Feather dashboard</h1>
                </div>
              </div>

              <div className="topbar-actions">
                <button className="icon-btn"><Search size={18} /></button>
                <button className="icon-btn"><Bell size={18} /></button>
                <button className="icon-btn"><Settings2 size={18} /></button>
                <NextLink
                  href="/customise-home"
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  <button className="primary-btn"><LayoutGrid size={18} /> Customise home</button>
                </NextLink>
                
              </div>
            </div>

            <div style={{ height: 20 }} />

            <div className="summary-grid">
              {summary.map((item) => (
                <div className="summary-card" key={item.label}>
                  <span className="muted">{item.label}</span>
                  <strong>{item.value}</strong>
                  <p className="muted" style={{ marginTop: 8 }}>{item.note}</p>
                </div>
              ))}
            </div>
          </section>

          <TaskBoard />
          <AvailabilityPanel />
          <CustomizationPanel />
          <p className="footer-note">Designed from your paper sketch: one glance shows tasks, progress, communication, and team availability.</p>
        </div>

        <div className="stack">
          <section className="panel panel-padding">
            <div className="section-head">
              <div>
                <p className="muted">Project space</p>
                <h2>ECON1001</h2>
              </div>
              <button className="ghost-btn"><SlidersHorizontal size={16} /> Board settings</button>
            </div>
            <p className="muted">
              This hi-fi version keeps your original four-column task board, but upgrades it with clear visual hierarchy,
              accountability metrics, private messaging, AI summaries, and an editable dashboard.
            </p>
          </section>

          <ChatPanel />
        </div>
      </div>
    </main>
  );
}
