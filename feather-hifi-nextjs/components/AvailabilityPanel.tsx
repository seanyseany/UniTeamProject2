import { team } from './data';
import Link from "next/link";

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const slots = [
  ['09:00', ['', 'Class', 'Free', 'Busy', 'Free']],
  ['11:00', ['Preferred', 'Class', 'Preferred', 'Busy', 'Free']],
  ['13:00', ['Free', 'Free', 'Busy', 'Preferred', 'Preferred']],
  ['15:00', ['Busy', 'Free', 'Free', 'Free', 'Busy']],
] as const;

function pillClass(value: string) {
  if (value === 'Class') return 'pill-class';
  if (value === 'Preferred') return 'pill-preferred';
  if (value === 'Busy') return 'pill-busy';
  return 'pill-free';
}

export function AvailabilityPanel() {
  return (
    <section className="split-grid">
      <div className="calendar-card panel-padding">
        <div className="section-head">
          <div>
            <p className="muted">Availability feature</p>
            <h3>Shared weekly availability</h3>
          </div>
          <Link href="/edit-timetable">
            <button className="ghost-btn">Edit timetable</button>
          </Link>
        </div>

        <div className="calendar-grid">
          <div className="calendar-cell header">Time</div>
          {days.map((day) => <div className="calendar-cell header" key={day}>{day}</div>)}
          {slots.map(([time, row]) => (
            <>
              <div className="calendar-cell time" key={`${time}-label`}>{time}</div>
              {row.map((value, index) => (
                <div className="calendar-cell" key={`${time}-${days[index]}`}>
                  {value ? <span className={`calendar-pill ${pillClass(value)}`}>{value}</span> : <span className="muted">—</span>}
                </div>
              ))}
            </>
          ))}
        </div>
      </div>

      <div className="accountability-card panel-padding">
        <div className="section-head">
          <div>
            <p className="muted">Accountability feature</p>
            <h3>Fair workload view</h3>
          </div>
        </div>

        <div className="accountability-list">
          {team.map((member) => (
            <div className="member-row" key={member.initials}>
              <div className="member-name">
                <div className="avatar" style={{ background: member.color }}>{member.initials}</div>
                <div>
                  <div>{member.name}</div>
                  <div className="muted">{member.status}</div>
                </div>
              </div>
              <div className="metric-box">Load: {member.load}</div>
              <div className="metric-box">Planned: {member.planned}</div>
              <div className="metric-box">Actual: {member.actual}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
