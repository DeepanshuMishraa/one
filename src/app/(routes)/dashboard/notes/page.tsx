"use client";

import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Tag,
  Folder,
  Star,
  Clock,
  Archive,
  Trash2,
  Edit3,
  Share2,
} from "lucide-react";
import { useState } from "react";

interface Note {
  title: string;
  content: string;
  isPinned: boolean;
  tags: string[];
  date: string | Date;
  lastEdited: string;
  color?: string;
}

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Categories with counts
  const categories = [
    { id: "all", name: "All Notes", count: 8 },
    { id: "personal", name: "Personal", count: 3 },
    { id: "work", name: "Work", count: 4 },
    { id: "archived", name: "Archived", count: 1 },
  ];

  const notes = [
    {
      id: 1,
      title: "Meeting Notes - Product Review",
      content:
        "Discussed new features for Q2. Key points: improve user onboarding, add calendar integrations...",
      date: "2024-03-20",
      tags: ["product", "meeting"],
      color: "bg-blue-500/10 border-blue-500/20",
      category: "work",
      isPinned: true,
      lastEdited: "2 hours ago",
    },
    {
      id: 2,
      title: "Project Timeline",
      content:
        "Phase 1: Research & Planning (2 weeks), Phase 2: Design (3 weeks), Phase 3: Development...",
      date: "2024-03-19",
      tags: ["planning", "timeline"],
      color: "bg-purple-500/10 border-purple-500/20",
      category: "work",
      isPinned: false,
      lastEdited: "5 hours ago",
    },
    {
      id: 3,
      title: "Team Feedback",
      content:
        "Positive feedback on new calendar features. Areas for improvement: notification system...",
      date: "2024-03-18",
      tags: ["feedback", "team"],
      color: "bg-green-500/10 border-green-500/20",
      category: "work",
      isPinned: false,
      lastEdited: "1 day ago",
    },
  ];

  const filteredNotes = notes.filter(
    (note) =>
      (selectedCategory === "all" || note.category === selectedCategory) &&
      (note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        )),
  );

  const quickActions = [
    { icon: Star, label: "Favorites" },
    { icon: Clock, label: "Recent" },
    { icon: Archive, label: "Archive" },
    { icon: Trash2, label: "Trash" },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notes</h1>
            <p className="text-muted-foreground mt-1">
              Capture your thoughts and ideas
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 transition-colors"
          >
            <Plus size={18} />
            <span>New Note</span>
          </motion.button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <div className="space-y-6">
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  whileHover={{ x: 4 }}
                  className="hover:bg-muted/80 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                >
                  <action.icon size={16} />
                  <span>{action.label}</span>
                </motion.button>
              ))}
            </div>

            <div className="bg-border h-px" />

            <div className="space-y-2">
              <h3 className="text-muted-foreground px-3 text-sm font-medium">
                Categories
              </h3>
              {categories.map((category, index) => (
                <motion.button
                  key={index}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder size={16} />
                    <span>{category.name}</span>
                  </div>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                    {category.count}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-muted/50 border-border focus:ring-primary/20 w-full rounded-lg border py-2 pr-4 pl-10 transition-all focus:ring-2 focus:outline-none"
                />
              </div>
              <button className="hover:bg-muted/50 flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors">
                <Tag size={18} />
                <span>Filter</span>
              </button>
            </div>

            {filteredNotes.some((note) => note.isPinned) && (
              <div className="space-y-3">
                <h3 className="text-muted-foreground text-sm font-medium">
                  Pinned Notes
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredNotes
                    .filter((note) => note.isPinned)
                    .map((note, index) => (
                      <NoteCard key={note.id} note={note} index={index} />
                    ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-muted-foreground text-sm font-medium">
                All Notes
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredNotes
                  .filter((note) => !note.isPinned)
                  .map((note, index) => (
                    <NoteCard key={note.id} note={note} index={index} />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Note Card Component
function NoteCard({ note, index }: { note: Note; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  const actions = [
    { icon: Edit3, label: "Edit" },
    { icon: Share2, label: "Share" },
    { icon: Star, label: "Pin" },
    { icon: Trash2, label: "Delete" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group relative rounded-xl border p-4 ${note.color} cursor-pointer transition-all hover:shadow-lg`}
    >
      <motion.div
        initial={false}
        animate={{ opacity: isHovered ? 1 : 0 }}
        className="bg-background absolute -top-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg border p-1 shadow-lg"
      >
        {actions.map((action, i) => (
          <button
            key={i}
            className="hover:bg-muted rounded-md p-1.5 transition-colors"
            title={action.label}
          >
            <action.icon size={14} />
          </button>
        ))}
      </motion.div>

      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="line-clamp-1 font-medium">{note.title}</h3>
          {note.isPinned && (
            <Star size={14} className="fill-yellow-500 text-yellow-500" />
          )}
        </div>
        <p className="text-muted-foreground line-clamp-3 text-sm">
          {note.content}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {note.tags.map((tag: string, i: number) => (
            <span
              key={i}
              className="text-muted-foreground rounded-full bg-white/5 px-2 py-1 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>
            {new Date(note.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span>Edited {note.lastEdited}</span>
        </div>
      </div>
    </motion.div>
  );
}
