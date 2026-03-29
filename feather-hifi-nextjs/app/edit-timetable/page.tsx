"use client";

import { useState } from "react";
import NextLink from "next/link";
import { CalendarDays, ChevronLeft, Clock3, Save } from "lucide-react";

type SlotStatus = "Unavailable" | "Available" | "Preferred";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const times = [
  "8:00",
  "9:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const initialGrid: Record<string, SlotStatus> = {};
for (const day of days) {
  for (const time of times) {
    initialGrid[`${day}-${time}`] = "Unavailable";
  }
}

const statusCycle: SlotStatus[] = ["Unavailable", "Available", "Preferred"];

const statusStyles: Record<SlotStatus, string> = {
  Unavailable: "bg-slate-100 text-slate-400 border-slate-200",
  Available: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Preferred: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

export default function EditTimetablePage() {
  const [grid, setGrid] = useState<Record<string, SlotStatus>>(initialGrid);
  const [selectedStatus, setSelectedStatus] = useState<SlotStatus>("Available");
  const [showSaved, setShowSaved] = useState(false);

  const updateSlot = (day: string, time: string) => {
    const key = `${day}-${time}`;
    setGrid((prev) => ({
      ...prev,
      [key]: selectedStatus,
    }));
  };

  const cycleSlot = (day: string, time: string) => {
    const key = `${day}-${time}`;
    const current = grid[key];
    const next = statusCycle[(statusCycle.indexOf(current) + 1) % statusCycle.length];
    setGrid((prev) => ({
      ...prev,
      [key]: next,
    }));
  };

  const countStatus = (status: SlotStatus) =>
    Object.values(grid).filter((value) => value === status).length;

  const handleSave = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2200);
  };

  const handleReset = () => {
    setGrid(initialGrid);
  };

  return (
    <main className="page-shell">
      <div className="dashboard">
        <div className="stack">
          <section className="panel panel-padding">
            <div className="section-head">
              <div>
                <p className="muted">Availability feature</p>
                <h1 className="text-3xl font-bold">Edit timetable</h1>
                <p className="muted mt-2">
                  Mark when you are unavailable, available, or preferred for group meetings.
                </p>
              </div>

              <NextLink href="/" className="ghost-btn">
                <ChevronLeft size={16} />
                Back to dashboard
              </NextLink>
            </div>
          </section>

          <section className="panel panel-padding">
            <div className="section-head">
              <div>
                <p className="muted">Editing tools</p>
                <h2>Weekly availability</h2>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="ghost-btn"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="primary-btn"
                >
                  <Save size={16} />
                  Save timetable
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <button
                type="button"
                onClick={() => setSelectedStatus("Unavailable")}
                className={`rounded-2xl border p-4 text-left transition ${
                  selectedStatus === "Unavailable"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Clock3 size={16} />
                  <strong>Unavailable</strong>
                </div>
                <p className={`${selectedStatus === "Unavailable" ? "text-slate-200" : "muted"}`}>
                  Use this for classes, work shifts, or times you cannot attend.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus("Available")}
                className={`rounded-2xl border p-4 text-left transition ${
                  selectedStatus === "Available"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <CalendarDays size={16} />
                  <strong>Available</strong>
                </div>
                <p className={`${selectedStatus === "Available" ? "text-slate-200" : "muted"}`}>
                  Use this for normal free time when you can join a meeting.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus("Preferred")}
                className={`rounded-2xl border p-4 text-left transition ${
                  selectedStatus === "Preferred"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <CalendarDays size={16} />
                  <strong>Preferred</strong>
                </div>
                <p className={`${selectedStatus === "Preferred" ? "text-slate-200" : "muted"}`}>
                  Use this for your best meeting times with light workload.
                </p>
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm">
                Unavailable: {countStatus("Unavailable")}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
                Available: {countStatus("Available")}
              </span>
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm text-indigo-700">
                Preferred: {countStatus("Preferred")}
              </span>
            </div>

            {showSaved && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Timetable saved successfully.
              </div>
            )}

            <div className="mt-6 overflow-x-auto">
              <div className="min-w-[920px]">
                <div className="grid grid-cols-[90px_repeat(7,minmax(110px,1fr))] gap-3">
                  <div />
                  {days.map((day) => (
                    <div
                      key={day}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-semibold"
                    >
                      {day}
                    </div>
                  ))}

                  {times.map((time) => (
                    <>
                      <div
                        key={`label-${time}`}
                        className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium"
                      >
                        {time}
                      </div>

                      {days.map((day) => {
                        const status = grid[`${day}-${time}`];
                        return (
                          <button
                            key={`${day}-${time}`}
                            type="button"
                            onClick={() => updateSlot(day, time)}
                            onDoubleClick={() => cycleSlot(day, time)}
                            className={`min-h-[58px] rounded-2xl border text-xs font-semibold transition hover:scale-[1.02] ${statusStyles[status]}`}
                            title={`${day} ${time}: ${status}`}
                          >
                            {status === "Unavailable" && "Busy"}
                            {status === "Available" && "Free"}
                            {status === "Preferred" && "Best"}
                          </button>
                        );
                      })}
                    </>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold">How to use</h3>
              <p className="muted mt-2">
                First choose a status above, then click cells in the timetable to apply it. Double-clicking a cell
                will cycle through all three states.
              </p>
            </div>
          </section>
        </div>

        <div className="stack">
          <section className="panel panel-padding">
            <div className="section-head">
              <div>
                <p className="muted">Preview</p>
                <h2>Summary card</h2>
              </div>
            </div>

            <div className="summary-grid">
              <div className="summary-card">
                <span className="muted">Preferred slots</span>
                <strong>{countStatus("Preferred")}</strong>
                <p className="muted" style={{ marginTop: 8 }}>
                  Best times for scheduling
                </p>
              </div>

              <div className="summary-card">
                <span className="muted">Available slots</span>
                <strong>{countStatus("Available")}</strong>
                <p className="muted" style={{ marginTop: 8 }}>
                  General free periods
                </p>
              </div>
            </div>
          </section>

          <section className="panel panel-padding">
            <div className="section-head">
              <div>
                <p className="muted">Design note</p>
                <h2>Why this page matters</h2>
              </div>
            </div>

            <p className="muted">
              This screen supports your availability feature by allowing each group member to submit their weekly
              timetable directly inside the app. Compared with generic shared calendars, it makes meeting coordination
              simpler and better suited to university group work.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}