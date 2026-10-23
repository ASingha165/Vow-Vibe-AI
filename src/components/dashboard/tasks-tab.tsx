"use client";

import * as React from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  PlusCircle,
  Filter,
  Search,
  Trash2,
  Edit2,
  AlertCircle,
  Calendar,
  Tag,
} from "lucide-react";
import { EventPlan, EventTask, TaskPriority, TaskStatus } from "@/types/event";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { calculateTaskMetrics, filterAndSortTasks } from "@/services/timelineEngine";
import { StorageService } from "@/services/storageService";

interface TasksTabProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

export function TasksTab({ event, onUpdateEvent }: TasksTabProps) {
  const { toast } = useToast();

  const [filterStatus, setFilterStatus] = React.useState<"all" | TaskStatus>("all");
  const [filterPriority, setFilterPriority] = React.useState<"all" | TaskPriority>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<EventTask | null>(null);

  // Form State
  const [taskForm, setTaskForm] = React.useState<{
    title: string;
    description: string;
    dueDate: string;
    priority: TaskPriority;
    status: TaskStatus;
    relatedCategory: string;
  }>({
    title: "",
    description: "",
    dueDate: event.eventDate || "",
    priority: "medium",
    status: "todo",
    relatedCategory: "Venue & Lawns",
  });

  const taskMetrics = calculateTaskMetrics(event.timeline.tasks);
  const filteredTasks = filterAndSortTasks(event.timeline.tasks, filterStatus, filterPriority, searchQuery);

  const percentComplete = taskMetrics.total > 0
    ? Math.round((taskMetrics.completed / taskMetrics.total) * 100)
    : 0;

  // SVG Radial Gauge offset (circumference = 2 * PI * 30 = ~188.5)
  const circumference = 188.5;
  const strokeDashoffset = circumference - (percentComplete / 100) * circumference;

  const handleToggleTaskStatus = (task: EventTask) => {
    const nextStatus: TaskStatus = task.status === "completed" ? "todo" : "completed";
    const updatedTasks = event.timeline.tasks.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t));

    const updatedEvent: EventPlan = {
      ...event,
      timeline: { tasks: updatedTasks },
    };

    onUpdateEvent(updatedEvent);
    StorageService.saveEvent(updatedEvent);
    toast({
      type: "success",
      title: nextStatus === "completed" ? "Task Completed" : "Task Reopened",
      message: task.title,
    });
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      toast({ type: "error", title: "Title Required", message: "Enter a task title." });
      return;
    }

    let updatedTasks = [...event.timeline.tasks];

    if (editingTask) {
      updatedTasks = updatedTasks.map((t) =>
        t.id === editingTask.id
          ? {
              ...t,
              title: taskForm.title,
              description: taskForm.description,
              dueDate: taskForm.dueDate,
              priority: taskForm.priority,
              status: taskForm.status,
              relatedCategory: taskForm.relatedCategory,
            }
          : t
      );
      toast({ type: "success", title: "Task Updated", message: taskForm.title });
    } else {
      const newTask: EventTask = {
        id: `task-custom-${Date.now().toString(36)}`,
        title: taskForm.title,
        description: taskForm.description,
        dueDate: taskForm.dueDate,
        priority: taskForm.priority,
        status: taskForm.status,
        relatedCategory: taskForm.relatedCategory,
        isCustom: true,
      };
      updatedTasks.push(newTask);
      toast({ type: "success", title: "Task Created", message: taskForm.title });
    }

    const updatedEvent: EventPlan = {
      ...event,
      timeline: { tasks: updatedTasks },
    };

    onUpdateEvent(updatedEvent);
    StorageService.saveEvent(updatedEvent);
    setIsModalOpen(false);
    setEditingTask(null);
    resetForm();
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = event.timeline.tasks.filter((t) => t.id !== taskId);
    const updatedEvent: EventPlan = {
      ...event,
      timeline: { tasks: updatedTasks },
    };
    onUpdateEvent(updatedEvent);
    StorageService.saveEvent(updatedEvent);
    toast({ type: "info", title: "Task Deleted", message: "Task removed from timeline." });
  };

  const openEditModal = (task: EventTask) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      relatedCategory: task.relatedCategory || "Venue & Lawns",
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setTaskForm({
      title: "",
      description: "",
      dueDate: event.eventDate || "",
      priority: "medium",
      status: "todo",
      relatedCategory: "Venue & Lawns",
    });
  };

  const [todayStr, setTodayStr] = React.useState("");
  React.useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Stitch Progress Metrics Glass Bento */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-primary-container/10 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          {/* Radial SVG Progress Gauge */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
                <circle
                  className="text-surface-container"
                  cx="36"
                  cy="36"
                  fill="none"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="6"
                />
                <circle
                  className="text-secondary transition-all duration-700 ease-out"
                  cx="36"
                  cy="36"
                  fill="none"
                  r="30"
                  stroke="currentColor"
                  strokeDasharray="188.5"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  strokeWidth="6"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-serif font-bold text-lg text-primary leading-none">
                  {percentComplete}%
                </span>
                <span className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5 font-bold">
                  Done
                </span>
              </div>
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-sans text-xs font-semibold inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-secondary">auto_awesome</span>
                <span>Celebration Velocity</span>
              </span>
              <h3 className="font-serif font-bold text-lg text-primary mt-1">Every Detail, Right on Time</h3>
              <p className="font-sans text-xs text-on-surface-variant">Harmonizing timeless rituals with structured milestones.</p>
            </div>
          </div>

          {/* Metric Stat Tiles */}
          <div className="grid grid-cols-3 gap-2.5 w-full sm:w-auto">
            <div className="bg-surface-container-low rounded-xl p-3 flex flex-col items-center text-center min-w-[85px] border border-primary-container/5">
              <span className="font-sans text-[11px] text-on-surface-variant font-medium">Pending</span>
              <span className="font-serif text-xl font-bold text-primary my-0.5">{taskMetrics.todo}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            </div>
            <div className="bg-surface-container-low rounded-xl p-3 flex flex-col items-center text-center min-w-[85px] border border-primary-container/5">
              <span className="font-sans text-[11px] text-on-surface-variant font-medium">In Progress</span>
              <span className="font-serif text-xl font-bold text-[#C5A059] my-0.5">{taskMetrics.inProgress}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]"></span>
            </div>
            <div className="bg-surface-container-low rounded-xl p-3 flex flex-col items-center text-center min-w-[85px] border border-primary-container/5">
              <span className="font-sans text-[11px] text-on-surface-variant font-medium">Completed</span>
              <span className="font-serif text-xl font-bold text-emerald-700 my-0.5">{taskMetrics.completed}</span>
              <span className="material-symbols-outlined text-secondary text-[12px]">check_circle</span>
            </div>
          </div>
        </div>

        {/* Action & Filter Ribbon */}
        <div className="pt-2 border-t border-surface-container flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search tasks, milestones, rituals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-primary-container/15 bg-surface pl-9 pr-3 py-1.5 text-xs text-primary focus:outline-none focus:border-primary-container"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Status Chips */}
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-full">
              <button
                type="button"
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  filterStatus === "all"
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                All ({taskMetrics.total})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("todo")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  filterStatus === "todo"
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Pending ({taskMetrics.todo})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("completed")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  filterStatus === "completed"
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Done ({taskMetrics.completed})
              </button>
            </div>

            {/* Add Task Button */}
            <button
              onClick={() => {
                setEditingTask(null);
                resetForm();
                setIsModalOpen(true);
              }}
              className="px-4 py-1.5 rounded-full bg-primary-container text-on-primary text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add_task</span>
              <span>+ Add Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Task List / Timeline Spine View */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-surface-container-lowest border border-primary-container/10">
            <CheckCircle2 className="h-8 w-8 text-secondary mx-auto mb-2 opacity-60" />
            <p className="font-serif text-sm font-bold text-primary">No tasks found matching your filters.</p>
            <p className="font-sans text-xs text-on-surface-variant mt-0.5">Adjust your search term or add a new milestone task.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === "completed";
            const isOverdue = !isCompleted && task.dueDate && task.dueDate < todayStr;

            return (
              <article
                key={task.id}
                className={`bg-surface-container-lowest p-4 sm:p-5 rounded-xl border transition-all flex flex-col gap-3 ${
                  isCompleted
                    ? "border-primary-container/5 bg-surface-container-low/40 opacity-75"
                    : isOverdue
                    ? "border-error/30 shadow-xs"
                    : "border-primary-container/10 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <label className="flex items-start gap-3 flex-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => handleToggleTaskStatus(task)}
                      className="mt-1 w-4 h-4 rounded text-primary-container accent-[#35213D] cursor-pointer"
                    />
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`font-serif text-base font-bold leading-snug transition-all ${
                          isCompleted ? "line-through text-on-surface-variant/70" : "text-primary"
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.description && (
                        <p className="font-sans text-xs text-on-surface-variant mt-1 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </label>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        task.priority === "critical"
                          ? "bg-error/15 text-error"
                          : task.priority === "high"
                          ? "bg-secondary-container text-on-secondary-container"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      {task.priority}
                    </span>

                    {isOverdue && (
                      <span className="px-2 py-0.5 rounded-full bg-error/15 text-error text-[10px] font-bold flex items-center gap-1">
                        <AlertCircle className="h-2.5 w-2.5" />
                        <span>Overdue</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Task Footer / Metadata Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-container/60 bg-surface-container-low/50 px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-secondary">event</span>
                        <span>Due {formatDate(task.dueDate)}</span>
                      </div>
                    )}
                    {task.relatedCategory && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-on-surface-variant text-[11px] font-medium border border-primary-container/10">
                          {task.relatedCategory}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-1 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                      title="Edit Task"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 rounded-md text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Add / Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? "Edit Milestone Task" : "Add Milestone Task"}
        description="Schedule key preparation deadlines and assign categories."
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <Input
            label="Task Name *"
            placeholder="e.g. Finalize Bengali typography & RSVP cards layout"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          />

          <Textarea
            label="Description & Instructions"
            placeholder="Provide specific notes or point-of-contact details..."
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Due Date"
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Priority
              </label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                className="flex h-11 w-full rounded-xl border border-primary-container/20 bg-surface px-3.5 py-2 text-sm text-primary"
              >
                <option value="critical">Critical (Mandatory)</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Status
              </label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as TaskStatus })}
                className="flex h-11 w-full rounded-xl border border-primary-container/20 bg-surface px-3.5 py-2 text-sm text-primary"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Related Category
              </label>
              <select
                value={taskForm.relatedCategory}
                onChange={(e) => setTaskForm({ ...taskForm, relatedCategory: e.target.value })}
                className="flex h-11 w-full rounded-xl border border-primary-container/20 bg-surface px-3.5 py-2 text-sm text-primary"
              >
                {event.budget.categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2 border-t border-surface-container">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingTask ? "Save Changes" : "Create Task"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

