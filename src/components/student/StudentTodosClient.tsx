"use client";

import { useState, useTransition } from "react";
import { Plus, Check, Trash2, Calendar } from "lucide-react";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/glass/GlassCard";
import type { StudentTodo } from "@/lib/types/todo";
import { createTodo, toggleTodo, deleteTodo } from "@/lib/actions/student-todos";

interface StudentTodosClientProps {
  todos: StudentTodo[];
}

export function StudentTodosClient({ todos }: StudentTodosClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showCompleted, setShowCompleted] = useState(false);

  const pending = todos.filter(t => !t.isCompleted);
  const completed = todos.filter(t => t.isCompleted);

  const handleCreate = () => {
    if (!title.trim()) return;
    startTransition(async () => {
      await createTodo({ title: title.trim(), description: description.trim() || undefined, dueDate: dueDate || undefined });
      setTitle("");
      setDescription("");
      setDueDate("");
      setShowForm(false);
    });
  };

  const handleToggle = (id: string) => {
    startTransition(async () => {
      await toggleTodo(id);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteTodo(id);
    });
  };

  return (
    <AnimatedPage>
      <PageHeader
        title="My Todos"
        description="Personal task list"
        actions={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Todo
          </button>
        }
      />

      {/* Create Form */}
      {showForm && (
        <GlassCard className="mb-6">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="What do you need to do?"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-brand-500/50"
            />
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-brand-500/50 resize-none"
            />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white/30" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/90 focus:outline-none focus:border-brand-500/50"
                />
              </div>
              <div className="flex-1" />
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white/70 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim() || isPending}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Active Todos */}
      {pending.length === 0 && !showForm ? (
        <GlassCard className="mb-6">
          <p className="text-sm text-white/30 text-center py-8">
            No pending todos. Add one to get started!
          </p>
        </GlassCard>
      ) : (
        <div className={`space-y-2 mb-6 ${isPending ? "opacity-60" : ""}`}>
          {pending.map(todo => (
            <GlassCard key={todo.id} padding="sm">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggle(todo.id)}
                  disabled={isPending}
                  className="mt-0.5 w-5 h-5 rounded-md border border-white/20 hover:border-brand-500/50 flex items-center justify-center flex-shrink-0 transition-all"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white/90">{todo.title}</h4>
                  {todo.description && (
                    <p className="text-xs text-white/40 mt-0.5">{todo.description}</p>
                  )}
                  {todo.dueDate && (
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-white/30">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>{new Date(todo.dueDate).toLocaleDateString("el-GR", { day: "numeric", month: "short" })}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(todo.id)}
                  disabled={isPending}
                  className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Completed Section */}
      {completed.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-xs text-white/40 hover:text-white/60 transition-colors mb-3"
          >
            {showCompleted ? "Hide" : "Show"} completed ({completed.length})
          </button>
          {showCompleted && (
            <div className="space-y-2">
              {completed.map(todo => (
                <GlassCard key={todo.id} padding="sm" className="opacity-60">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggle(todo.id)}
                      disabled={isPending}
                      className="mt-0.5 w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center flex-shrink-0"
                    >
                      <Check className="w-3 h-3 text-emerald-400" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white/40 line-through">{todo.title}</h4>
                    </div>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}
    </AnimatedPage>
  );
}
