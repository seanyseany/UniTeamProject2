
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type WidgetKey =
  | "taskBoard"
  | "calendar"
  | "groupChat"
  | "privateMessages"
  | "workload"
  | "aiSummary"
  | "deadlines"
  | "activity";

type WidgetConfig = {
  key: WidgetKey;
  title: string;
  description: string;
};

const allWidgets: WidgetConfig[] = [
  {
    key: "taskBoard",
    title: "Task Board",
    description: "Show assigned tasks, workflow stages, and progress overview.",
  },
  {
    key: "calendar",
    title: "Availability Calendar",
    description: "Display the shared weekly timetable for meeting planning.",
  },
  {
    key: "groupChat",
    title: "Group Chat",
    description: "Keep the main project conversation visible on the home page.",
  },
  {
    key: "privateMessages",
    title: "Private Messages",
    description: "Quick access to one-to-one conversations with group members.",
  },
  {
    key: "workload",
    title: "Workload Balance",
    description: "Compare task allocation and help keep work distribution fair.",
  },
  {
    key: "aiSummary",
    title: "AI Summary",
    description: "Highlight key updates and reduce chat clutter on the dashboard.",
  },
  {
    key: "deadlines",
    title: "Upcoming Deadlines",
    description: "Pin the most urgent tasks and milestone reminders.",
  },
  {
    key: "activity",
    title: "Recent Activity",
    description: "Show task edits, chat reactions, and project updates.",
  },
];

const defaultVisible: WidgetKey[] = [
  "taskBoard",
  "deadlines",
  "calendar",
  "groupChat",
  "workload",
  "aiSummary",
];

const mockLayout = {
  left: ["taskBoard", "groupChat", "activity"],
  right: ["deadlines", "calendar", "workload", "aiSummary", "privateMessages"],
};

export default function CustomiseHomePage() {
  const [visibleWidgets, setVisibleWidgets] =
    useState<WidgetKey[]>(defaultVisible);
  const [density, setDensity] = useState<"Comfortable" | "Compact">(
    "Comfortable"
  );
  const [priorityView, setPriorityView] = useState<
    "Deadlines first" | "Tasks first" | "Balanced"
  >("Balanced");
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleWidget = (key: WidgetKey) => {
    setVisibleWidgets((prev) =>
      prev.includes(key)
        ? prev.filter((item) => item !== key)
        : [...prev, key]
    );
  };

  const selectedCount = visibleWidgets.length;

  const visibleCards = useMemo(() => {
    return allWidgets.filter((widget) => visibleWidgets.includes(widget.key));
  }, [visibleWidgets]);

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2200);
  };

  const handleReset = () => {
    setVisibleWidgets(defaultVisible);
    setDensity("Comfortable");
    setPriorityView("Balanced");
  };

  const renderPreviewCard = (title: string, subtitle: string, tall = false) => (
    <div
      className={`rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ${
        tall ? "min-h-[150px]" : "min-h-[110px]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
          Widget
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <div className="h-2 rounded-full bg-slate-100" />
        <div className="h-2 w-4/5 rounded-full bg-slate-100" />
        <div className="h-2 w-3/5 rounded-full bg-slate-100" />
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Feather / Dashboard</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Customise Home
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Personalise the home screen by choosing which widgets appear first.
              This supports your design goal of making important information easy
              to view while still keeping the interface flexible for different
              user preferences.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-slate-100"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">Customisation Settings</h2>
              <p className="mt-1 text-sm text-slate-500">
                Select the modules users want to see on the main screen.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Visible Widgets
                  </h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {selectedCount} selected
                  </span>
                </div>

                <div className="grid gap-3">
                  {allWidgets.map((widget) => {
                    const active = visibleWidgets.includes(widget.key);

                    return (
                      <button
                        key={widget.key}
                        type="button"
                        onClick={() => toggleWidget(widget.key)}
                        className={`rounded-3xl border p-4 text-left transition ${
                          active
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-bold ${
                                  active
                                    ? "border-white/40 bg-white/10 text-white"
                                    : "border-slate-300 text-slate-500"
                                }`}
                              >
                                {active ? "✓" : ""}
                              </span>
                              <h4 className="text-sm font-semibold">
                                {widget.title}
                              </h4>
                            </div>
                            <p
                              className={`mt-2 text-xs leading-5 ${
                                active ? "text-slate-200" : "text-slate-500"
                              }`}
                            >
                              {widget.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 p-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-900">
                    Information Density
                  </label>
                  <select
                    value={density}
                    onChange={(e) =>
                      setDensity(e.target.value as "Comfortable" | "Compact")
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  >
                    <option>Comfortable</option>
                    <option>Compact</option>
                  </select>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Choose whether the dashboard should feel more spacious or
                    show more content at once.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 p-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-900">
                    Home Screen Priority
                  </label>
                  <select
                    value={priorityView}
                    onChange={(e) =>
                      setPriorityView(
                        e.target.value as
                          | "Deadlines first"
                          | "Tasks first"
                          | "Balanced"
                      )
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  >
                    <option>Deadlines first</option>
                    <option>Tasks first</option>
                    <option>Balanced</option>
                  </select>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Control what appears most prominently when users open the
                    dashboard.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Why this matters
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Different students care about different information. Some want
                  deadlines first, while others care more about missed messages,
                  meeting availability, or task balance. This page lets users
                  tailor the dashboard to their own workflow instead of forcing
                  everyone into one fixed layout.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Save Customisation
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-slate-100"
                >
                  Reset to Default
                </button>
              </div>

              {showSuccess && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Home screen preferences saved successfully.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">Live Home Preview</h2>
              <p className="mt-1 text-sm text-slate-500">
                Preview how the customised dashboard could look.
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div>
                  <p className="text-xs text-slate-500">Custom Dashboard</p>
                  <h3 className="text-base font-semibold">Welcome back, Jack</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {density}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {priorityView}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-4">
                  {mockLayout.left.map((item) => {
                    if (!visibleWidgets.includes(item as WidgetKey)) return null;

                    if (item === "taskBoard") {
                      return renderPreviewCard(
                        "Task Board",
                        "To Do, In Progress, Review, and Completed tasks at a glance.",
                        true
                      );
                    }

                    if (item === "groupChat") {
                      return renderPreviewCard(
                        "Group Chat",
                        "Main team messages, reactions, and quick discussion updates."
                      );
                    }

                    return renderPreviewCard(
                      "Recent Activity",
                      "Latest changes to tasks, member actions, and status updates."
                    );
                  })}
                </div>

                <div className="space-y-4">
                  {mockLayout.right.map((item) => {
                    if (!visibleWidgets.includes(item as WidgetKey)) return null;

                    if (item === "deadlines") {
                      return renderPreviewCard(
                        "Upcoming Deadlines",
                        "Most urgent deliverables and milestones appear first."
                      );
                    }

                    if (item === "calendar") {
                      return renderPreviewCard(
                        "Availability Calendar",
                        "Weekly timetable showing when members are free to meet."
                      );
                    }

                    if (item === "workload") {
                      return renderPreviewCard(
                        "Workload Balance",
                        "See whether tasks are evenly distributed across members."
                      );
                    }

                    if (item === "aiSummary") {
                      return renderPreviewCard(
                        "AI Summary",
                        "Summarises chat discussion and filters out less relevant updates."
                      );
                    }

                    return renderPreviewCard(
                      "Private Messages",
                      "Quick access to direct chats with individual members."
                    );
                  })}
                </div>
              </div>

              {visibleCards.length === 0 && (
                <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <h3 className="text-sm font-semibold text-slate-900">
                    No widgets selected
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Turn on at least one widget to preview the home screen.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Selected modules
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {visibleCards.length > 0 ? (
                  visibleCards.map((card) => (
                    <span
                      key={card.key}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
                    >
                      {card.title}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">
                    No modules selected yet.
                  </span>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}