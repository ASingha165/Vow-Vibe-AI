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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Header & Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5E4B66]">Total Tasks</p>
          <p className="font-serif text-2xl font-bold text-[#22092C]">{taskMetrics.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5E4B66]">Completed</p>
          <p className="font-serif text-2xl font-bold text-emerald-700">{taskMetrics.completed}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5E4B66]">In Progress</p>
          <p className="font-serif text-2xl font-bold text-[#C5A059]">{taskMetrics.inProgress}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5E4B66]">Pending</p>
          <p className="font-serif text-2xl font-bold text-[#3B1242]">{taskMetrics.todo}</p>
        </Card>
      </div>

      {/* Controls Bar: Search, Filters & Add Task */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#7A6B80]" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#E5D5B5] bg-white pl-9 pr-3 py-1.5 text-xs text-[#22092C] focus:outline-none focus:border-[#3B1242]"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="rounded-xl border border-[#E5D5B5] bg-white px-2.5 py-1.5 text-xs text-[#22092C]"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="rounded-xl border border-[#E5D5B5] bg-white px-2.5 py-1.5 text-xs text-[#22092C]"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <Button
              onClick={() => {
                setEditingTask(null);
                resetForm();
                setIsModalOpen(true);
              }}
              size="sm"
              className="gap-1.5"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Task</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Task List / Timeline View */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card className="p-10 text-center text-[#7A6B80]">
            <CheckCircle2 className="h-8 w-8 text-[#C5A059] mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold">No tasks found matching your filters.</p>
            <p className="text-xs">Adjust your search term or add a new milestone task.</p>
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === "completed";
            const isOverdue = !isCompleted && task.dueDate && task.dueDate < todayStr;

            return (
              <div
                key={task.id}
                className={`flex items-start justify-between rounded-2xl border p-4 sm:p-5 transition-all bg-white ${
                  isCompleted
                    ? "border-[#FAF0F3] bg-[#FAF8F5]/50 opacity-75"
                    : isOverdue
                    ? "border-rose-200 shadow-xs"
                    : "border-[#E5D5B5]/60 hover:shadow-md"
                }`}
              >
                {/* Left check and details */}
                <div className="flex items-start space-x-3.5 flex-1 pr-4">
                  <button
                    onClick={() => handleToggleTaskStatus(task)}
                    className="mt-0.5 text-[#5E4B66] hover:text-[#3B1242] transition-colors cursor-pointer shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="h-5 w-5 text-[#C5A059] hover:stroke-[#3B1242]" />
                    )}
                  </button>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`font-semibold text-sm leading-snug ${
                          isCompleted ? "line-through text-[#7A6B80]" : "text-[#22092C]"
                        }`}
                      >
                        {task.title}
                      </h4>

                      <Badge
                        variant={
                          task.priority === "critical"
                            ? "danger"
                            : task.priority === "high"
                            ? "warning"
                            : "default"
                        }
                        className="text-[9px] uppercase py-0"
                      >
                        {task.priority}
                      </Badge>

                      {isOverdue && (
                        <Badge variant="danger" className="text-[9px] flex items-center gap-1 py-0">
                          <AlertCircle className="h-2.5 w-2.5" />
                          <span>Overdue</span>
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-[#5E4B66] leading-relaxed">{task.description}</p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#7A6B80]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-[#C5A059]" />
                        <span>Due: {formatDate(task.dueDate)}</span>
                      </span>

                      {task.relatedCategory && (
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3 text-[#D95B72]" />
                          <span>{task.relatedCategory}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => openEditModal(task)}
                    className="p-1.5 rounded-lg text-[#5E4B66] hover:bg-[#FAF0F3] hover:text-[#22092C] transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded-lg text-[#5E4B66] hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
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
            placeholder="e.g. Schedule Bridal Mehndi & Sangeet Rehearsal"
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E4B66] mb-1.5">
                Priority
              </label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                className="flex h-11 w-full rounded-xl border border-[#E5D5B5] bg-white px-3.5 py-2 text-sm text-[#22092C]"
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E4B66] mb-1.5">
                Status
              </label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as TaskStatus })}
                className="flex h-11 w-full rounded-xl border border-[#E5D5B5] bg-white px-3.5 py-2 text-sm text-[#22092C]"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E4B66] mb-1.5">
                Related Category
              </label>
              <select
                value={taskForm.relatedCategory}
                onChange={(e) => setTaskForm({ ...taskForm, relatedCategory: e.target.value })}
                className="flex h-11 w-full rounded-xl border border-[#E5D5B5] bg-white px-3.5 py-2 text-sm text-[#22092C]"
              >
                {event.budget.categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2 border-t border-[#FAF0F3]">
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
