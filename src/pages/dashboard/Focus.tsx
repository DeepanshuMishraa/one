import { motion } from "framer-motion";
import {
  Clock,
  Calendar,
  AlertCircle,
  Focus,
  BarChart3,
  BrainCircuit,
  Timer,
  Coffee,
  Zap,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export default function FocusPage() {
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [focusTimer, setFocusTimer] = useState(25); // minutes

  // This would be replaced with real data from your calendar API
  const todaysEvents = [
    {
      id: 1,
      title: "Team Standup",
      time: "10:00 AM",
      duration: "30min",
      priority: "high",
      type: "meeting",
    },
    {
      id: 2,
      title: "Project Review",
      time: "2:00 PM",
      duration: "1h",
      priority: "medium",
      type: "meeting",
    },
  ];

  const todaysTasks = [
    {
      id: 1,
      title: "Prepare presentation",
      deadline: "5:00 PM",
      priority: "high",
      status: "pending",
    },
    {
      id: 2,
      title: "Review PRs",
      deadline: "4:00 PM",
      priority: "medium",
      status: "pending",
    },
  ];

  // Productivity stats
  const productivityStats = [
    {
      title: "Focus Time",
      value: "4h 30m",
      icon: BrainCircuit,
      change: "+15%",
    },
    { title: "Tasks Done", value: "12/15", icon: CheckCircle, change: "+20%" },
    { title: "Break Time", value: "1h 15m", icon: Coffee, change: "-5%" },
    { title: "Productivity", value: "85%", icon: Zap, change: "+10%" },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Today&apos;s Focus</h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(), "EEEE, MMMM d")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-muted-foreground flex items-center gap-2">
              <Clock size={16} />
              <span>{format(new Date(), "h:mm a")}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFocusModeActive(!focusModeActive)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                focusModeActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <Focus size={18} />
              <span>{focusModeActive ? "Exit Focus" : "Enter Focus"}</span>
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {productivityStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-card rounded-xl border p-4 transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <stat.icon size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-muted-foreground text-sm font-medium">
                    {stat.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-semibold">{stat.value}</p>
                    <span
                      className={`text-xs ${
                        stat.change.startsWith("+")
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {focusModeActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border p-6 text-center"
          >
            <div className="flex items-center justify-center gap-6">
              <Timer size={24} className="text-primary" />
              <div className="text-4xl font-bold">{focusTimer}:00</div>
              <div className="flex gap-2">
                {[15, 25, 45].map((time) => (
                  <button
                    key={time}
                    onClick={() => setFocusTimer(time)}
                    className={`rounded-lg px-3 py-1 text-sm ${
                      focusTimer === time
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {time}m
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-card space-y-4 rounded-xl border p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-primary" />
                <h2 className="font-semibold">Upcoming Events</h2>
              </div>
              <span className="text-muted-foreground text-sm">
                {todaysEvents.length} events
              </span>
            </div>
            <div className="space-y-3">
              {todaysEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-muted/50 hover:bg-muted flex items-center gap-4 rounded-lg p-3 transition-colors"
                >
                  <div className="min-w-[60px] text-sm font-medium">
                    {event.time}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-muted-foreground text-sm">
                      {event.duration}
                    </div>
                  </div>
                  <div
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      event.priority === "high"
                        ? "bg-red-500/10 text-red-500"
                        : event.priority === "medium"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-green-500/10 text-green-500"
                    }`}
                  >
                    {event.priority}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-card space-y-4 rounded-xl border p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} className="text-primary" />
                <h2 className="font-semibold">Priority Tasks</h2>
              </div>
              <span className="text-muted-foreground text-sm">
                {todaysTasks.length} tasks
              </span>
            </div>
            <div className="space-y-3">
              {todaysTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-muted/50 hover:bg-muted flex items-center gap-4 rounded-lg p-3 transition-colors"
                >
                  <div className="min-w-[80px] text-sm font-medium">
                    {task.deadline}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-muted-foreground text-sm">
                      Due today
                    </div>
                  </div>
                  <div
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      task.priority === "high"
                        ? "bg-red-500/10 text-red-500"
                        : task.priority === "medium"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-green-500/10 text-green-500"
                    }`}
                  >
                    {task.priority}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-card rounded-xl border p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={20} className="text-primary" />
              <h2 className="font-semibold">Time Blocks</h2>
            </div>
            <button className="text-primary hover:text-primary/80 text-sm transition-colors">
              Manage blocks
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="bg-muted/50 hover:bg-muted cursor-pointer rounded-lg p-4 text-center transition-colors"
              >
                <div className="mb-1 text-sm font-medium">
                  Deep Work Block {i + 1}
                </div>
                <div className="text-muted-foreground text-xs">2 hours</div>
                <div className="bg-muted mt-2 h-1 w-full rounded-full">
                  <div
                    className="bg-primary h-1 rounded-full"
                    style={{ width: `${Math.random() * 100}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
