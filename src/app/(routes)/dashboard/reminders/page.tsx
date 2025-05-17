'use client';

import { motion } from "framer-motion";
import { Bell, Plus, Clock, Calendar, CheckCircle2, AlertTriangle, Filter, BarChart3, ChevronDown, Trash2, Archive, Star, MoreVertical, User } from "lucide-react";
import { useState } from "react";

export default function RemindersPage() {
  const [filter, setFilter] = useState("all");
  const [selectedReminders, setSelectedReminders] = useState<number[]>([]);

  // Statistics
  const stats = [
    { title: "Total", value: 12, change: "+2 this week" },
    { title: "Completed", value: 8, change: "75% rate" },
    { title: "Upcoming", value: 4, change: "Next 24h" },
    { title: "Overdue", value: 1, change: "Action needed" },
  ];

  // This would be replaced with real data from your API
  const reminders = [
    {
      id: 1,
      title: "Review Q1 Goals",
      description: "Prepare quarterly review presentation",
      due: "2024-03-21T14:00:00",
      urgency: "high",
      status: "pending",
      category: "work",
      assignee: "You",
      progress: 65
    },
    {
      id: 2,
      title: "Team Sync Follow-up",
      description: "Send meeting notes and action items",
      due: "2024-03-21T16:00:00",
      urgency: "medium",
      status: "pending",
      category: "work",
      assignee: "Team",
      progress: 30
    },
    {
      id: 3,
      title: "Update Project Timeline",
      description: "Adjust milestones based on feedback",
      due: "2024-03-22T10:00:00",
      urgency: "low",
      status: "pending",
      category: "project",
      assignee: "You",
      progress: 0
    }
  ];

  const getTimeLeft = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 0 || minutes < 0) return "Overdue";
    if (hours === 0) return `${minutes}m left`;
    if (hours < 24) return `${hours}h ${minutes}m left`;
    return `${Math.floor(hours / 24)}d left`;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      default:
        return "text-green-500";
    }
  };

  const handleSelectReminder = (id: number) => {
    setSelectedReminders(prev =>
      prev.includes(id)
        ? prev.filter(r => r !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="p-6 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Reminders</h1>
              <p className="text-muted-foreground">Keep track of important tasks and deadlines</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedReminders.length > 0 && (
              <div className="flex items-center gap-2 pr-2 border-r">
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-2 rounded-lg hover:bg-muted/80 transition-colors"
                  title="Archive selected"
                >
                  <Archive size={18} />
                </motion.button>
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-2 rounded-lg hover:bg-muted/80 transition-colors text-red-500"
                  title="Delete selected"
                >
                  <Trash2 size={18} />
                </motion.button>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus size={18} />
              <span>Add Reminder</span>
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-card rounded-xl border p-4"
            >
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.title}</div>
              <div className="text-xs text-primary mt-1">{stat.change}</div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            {["all", "today", "upcoming", "completed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted/50"
                  }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-muted/50 transition-colors">
              <Filter size={16} />
              <span className="text-sm">Filter</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-muted/50 transition-colors">
              <BarChart3 size={16} />
              <span className="text-sm">Sort</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {reminders.map((reminder, index) => (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative flex gap-4 items-start group"
            >
              {index !== reminders.length - 1 && (
                <div className="absolute left-[15px] top-[28px] w-[2px] h-[calc(100%+1.5rem)] bg-border" />
              )}

              <div className="flex flex-col items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSelectReminder(reminder.id)}
                  className={`w-5 h-5 rounded border-2 transition-colors ${selectedReminders.includes(reminder.id)
                    ? "bg-primary border-primary"
                    : "border-muted-foreground hover:border-primary"
                    }`}
                >
                  {selectedReminders.includes(reminder.id) && (
                    <CheckCircle2 size={16} className="text-primary-foreground" />
                  )}
                </motion.button>
                <div className={`relative z-10 rounded-full p-1 ${reminder.urgency === "high"
                  ? "bg-red-500/10"
                  : reminder.urgency === "medium"
                    ? "bg-yellow-500/10"
                    : "bg-green-500/10"
                  }`}>
                  <div className={`w-6 h-6 rounded-full border-2 ${reminder.urgency === "high"
                    ? "border-red-500"
                    : reminder.urgency === "medium"
                      ? "border-yellow-500"
                      : "border-green-500"
                    }`} />
                </div>
              </div>

              <div className="flex-1 bg-card rounded-xl border p-4 group-hover:shadow-lg transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-medium flex items-center gap-2">
                      {reminder.title}
                      {reminder.urgency === "high" && (
                        <AlertTriangle size={14} className="text-red-500" />
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {reminder.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${getUrgencyColor(reminder.urgency)}`}>
                      {reminder.urgency.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1">
                      <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-muted transition-colors">
                        <Star size={14} className="text-muted-foreground hover:text-yellow-500 transition-colors" />
                      </button>
                      <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-muted transition-colors">
                        <MoreVertical size={14} className="text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{reminder.progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${reminder.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{getTimeLeft(reminder.due)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>
                        {new Date(reminder.due).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{reminder.assignee}</span>
                    </div>
                    {reminder.urgency === "high" && (
                      <div className="flex items-center gap-1 text-red-500">
                        <AlertTriangle size={14} />
                        <span>Urgent</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 
