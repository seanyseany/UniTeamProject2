"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Stage = "To Do" | "In Progress" | "Review" | "Completed";
type Priority = "Low" | "Medium" | "High";
type Difficulty = "Easy" | "Medium" | "Hard";

const members = ["Jack", "Ava", "Mia", "Noah", "Ethan"];

export default function AddTaskPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState<Stage>("To Do");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [expectedTime, setExpectedTime] = useState("2");
  const [actualTime, setActualTime] = useState("0");
  const [progress, setProgress] = useState(0);
  const [assignee, setAssignee] = useState("Jack");
  const [showSuccess, setShowSuccess] = useState(false);

  const preview = useMemo(() => {
    return {
      title: title || "New task title",
      description: description || "Task description will appear here.",
      stage,
      deadline: deadline || "No deadline set",
      priority,
      difficulty,
      expectedTime,
      actualTime,
      progress,
      assignee,
    };
  }, [
    title,
    description,
    stage,
    deadline,
    priority,
    difficulty,
    expectedTime,
    actualTime,
    progress,
    assignee,
  ]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Feather / Task Management</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Create a New Task
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Use this page to create a new task with deadline, priority,
              workload estimate, and assignee. This page is designed as a
              hi-fi prototype flow for your group project app.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-slate-100"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">Task Details</h2>
              <p className="mt-1 text-sm text-slate-500">
                Fill in the fields below to set up a new project task.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Task Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Finish interview analysis"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the task requirements..."
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Workflow Stage
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as Stage)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                  >
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Review</option>
                    <option>Completed</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Assignee
                  </label>
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                  >
                    {members.map((member) => (
                      <option key={member} value={member}>
                        {member}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(e.target.value as Difficulty)
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Expected Time (hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={expectedTime}
                    onChange={(e) => setExpectedTime(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Actual Time (hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={actualTime}
                    onChange={(e) => setActualTime(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium">Progress</label>
                  <span className="text-sm text-slate-500">{progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Create Task
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTitle("");
                    setDescription("");
                    setStage("To Do");
                    setDeadline("");
                    setPriority("Medium");
                    setDifficulty("Medium");
                    setExpectedTime("2");
                    setActualTime("0");
                    setProgress(0);
                    setAssignee("Jack");
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-slate-100"
                >
                  Reset
                </button>
              </div>

              {showSuccess && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Task created successfully. In a full implementation, this task
                  would now be added to the board.
                </div>
              )}
            </form>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Live Preview</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Preview how the task card will look on the dashboard.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">{preview.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {preview.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                    {preview.stage}
                  </span>
                </div>

                <div className="grid gap-3 text-sm text-slate-600">
                  <div className="flex justify-between rounded-2xl bg-white px-3 py-2">
                    <span>Assignee</span>
                    <span className="font-medium text-slate-900">
                      {preview.assignee}
                    </span>
                  </div>

                  <div className="flex justify-between rounded-2xl bg-white px-3 py-2">
                    <span>Deadline</span>
                    <span className="font-medium text-slate-900">
                      {preview.deadline}
                    </span>
                  </div>

                  <div className="flex justify-between rounded-2xl bg-white px-3 py-2">
                    <span>Priority</span>
                    <span className="font-medium text-slate-900">
                      {preview.priority}
                    </span>
                  </div>

                  <div className="flex justify-between rounded-2xl bg-white px-3 py-2">
                    <span>Difficulty</span>
                    <span className="font-medium text-slate-900">
                      {preview.difficulty}
                    </span>
                  </div>

                  <div className="flex justify-between rounded-2xl bg-white px-3 py-2">
                    <span>Expected Time</span>
                    <span className="font-medium text-slate-900">
                      {preview.expectedTime}h
                    </span>
                  </div>

                  <div className="flex justify-between rounded-2xl bg-white px-3 py-2">
                    <span>Actual Time</span>
                    <span className="font-medium text-slate-900">
                      {preview.actualTime}h
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-medium text-slate-900">
                      {preview.progress}%
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-slate-900 transition-all"
                      style={{ width: `${preview.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Design Note</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This subpage supports your hi-fi prototype by showing a clear
                task creation flow. It reflects your feature list: structured
                task allocation, tracking expected and actual time, assigning
                work to members, and moving tasks through a review stage before
                completion.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}