import { CalendarDays, Clock3, Flag, Gauge, Plus } from 'lucide-react';
import { columns, team } from './data';
import Link from "next/link";

function avatarStyle(initials: string) {
  const person = team.find((member) => member.initials === initials);
  return { background: person?.color ?? '#4357ff' };
}

function priorityClass(priority: string) {
  return priority === 'High' ? 'priority-high' : priority === 'Medium' ? 'priority-medium' : 'priority-low';
}

export function TaskBoard() {
  return (
    <section className="panel panel-padding">
      <div className="board-head">
        <div>
          <p className="muted">Task board · ECON1001</p>
          <h2>Track work from planning to review</h2>
        </div>
        <div className="topbar-actions">
          <button className="ghost-btn">Filter by member</button>
          <Link href="/add_task">
            <button className="primary-btn"><Plus size={18} /> Add task</button>
          </Link>
          
        </div>
      </div>

      <div className="board-columns">
        {Object.entries(columns).map(([columnName, tasks]) => {
          const color =
            columnName === 'To Do' ? '#8a96aa' :
            columnName === 'In Progress' ? '#28b16d' :
            columnName === 'Review' ? '#7955f6' : '#4357ff';

          return (
            <div className="column" key={columnName}>
              <div className="column-header">
                <div className="column-title">
                  <span className="dot" style={{ background: color }} />
                  <span>{columnName}</span>
                </div>
                <span className="column-count">{tasks.length}</span>
              </div>

              <div className="task-list">
                {tasks.map((task) => (
                  <article className="task-card" key={task.title}>
                    <div className="badge-row">
                      <span className={`badge ${priorityClass(task.priority)}`}>{task.priority} priority</span>
                      <span className="badge review">{task.difficulty}</span>
                    </div>

                    <div>
                      <h4>{task.title}</h4>
                      <p className="muted" style={{ marginTop: 6 }}>{task.notes}</p>
                    </div>

                    <div className="meta-row">
                      <span className="meta inline-row"><CalendarDays size={15} /> Due {task.due}</span>
                      <span className="meta inline-row"><Flag size={15} /> {task.priority}</span>
                    </div>

                    <div className="meta-row">
                      <span className="badge estimation"><Clock3 size={14} /> Expected {task.expected}</span>
                      <span className="badge estimation"><Gauge size={14} /> Actual {task.actual}</span>
                    </div>

                    <div>
                      <div className="inline-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                        <span className="meta">Completion</span>
                        <span className="meta">{task.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${task.progress}%` }} />
                      </div>
                    </div>

                    <div className="inline-row" style={{ justifyContent: 'space-between' }}>
                      <span className="meta">Assigned to</span>
                      <div className="avatar-row">
                        {task.assignees.map((initials) => (
                          <div className="avatar" key={initials} style={avatarStyle(initials)}>{initials}</div>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
