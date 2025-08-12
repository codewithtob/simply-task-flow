import { createContext, useContext, useMemo, useState, ReactNode, useEffect } from "react";
import { addDays, isToday, isBefore, parseISO } from "date-fns";

export type Priority = "Low" | "Medium" | "High";
export type Task = {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  dueDate?: string; // ISO date
  notes?: string;
  completed: boolean;
  createdAt: string; // ISO
  completedAt?: string; // ISO
};

export type TasksContextType = {
  tasks: Task[];
  categories: string[];
  addCategory: (name: string) => void;
  removeCategory: (name: string) => void;
  addTask: (t: Omit<Task, "id" | "createdAt" | "completed">) => string;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleComplete: (id: string) => void;
  deleteTask: (id: string) => void;
  todayTasks: Task[];
  overdueTasks: Task[];
  streak: number;
  exportData: () => { tasks: Task[]; categories: string[] };
  importData: (data: { tasks: Task[]; categories: string[] }) => void;
};

const TasksContext = createContext<TasksContextType | null>(null);

const defaultCategories = ["Work", "Home", "Shopping", "Study"];

const seedTasks: Task[] = [
  {
    id: crypto.randomUUID(),
    title: "Outline weekly report",
    category: "Work",
    priority: "High",
    dueDate: new Date().toISOString().slice(0, 10),
    notes: "Focus on Q3 KPIs",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Buy groceries",
    category: "Shopping",
    priority: "Medium",
    dueDate: addDays(new Date(), 1).toISOString().slice(0, 10),
    notes: "Veggies, fruits, eggs",
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export function TasksProvider({ children }: { children: ReactNode }) {
  const STORAGE_KEY = "taskflow.state.v1";
  type Persisted = { tasks: Task[]; categories: string[] };

  const loadState = (): Persisted | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Persisted) : null;
    } catch {
      return null;
    }
  };

  const initial = loadState();

  const [tasks, setTasks] = useState<Task[]>(initial?.tasks ?? seedTasks);
  const [categories, setCategories] = useState<string[]>(initial?.categories ?? defaultCategories);

  const addCategory = (name: string) => {
    setCategories((prev) => (prev.includes(name) ? prev : [...prev, name]));
  };

  const removeCategory = (name: string) => {
    setCategories((prev) => prev.filter((c) => c !== name));
    setTasks((prev) => prev.map((t) => (t.category === name ? { ...t, category: "General" } : t)));
  };

  const addTask: TasksContextType["addTask"] = (t) => {
    const id = crypto.randomUUID();
    const newTask: Task = {
      id,
      createdAt: new Date().toISOString(),
      completed: false,
      ...t,
    };
    setTasks((prev) => [newTask, ...prev]);
    return id;
  };

  const updateTask: TasksContextType["updateTask"] = (id, patch) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const toggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
  };

  const deleteTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const todayTasks = useMemo(
    () => tasks.filter((t) => t.dueDate && isToday(parseISO(t.dueDate))),
    [tasks]
  );

  const overdueTasks = useMemo(
    () => tasks.filter((t) => t.dueDate && isBefore(parseISO(t.dueDate), new Date()) && !isToday(parseISO(t.dueDate)) && !t.completed),
    [tasks]
  );

  const exportData = () => ({ tasks, categories });

  const importData = (data: { tasks: Task[]; categories: string[] }) => {
    setTasks(Array.isArray(data.tasks) ? data.tasks : []);
    setCategories(Array.isArray(data.categories) ? data.categories : []);
  };

  useEffect(() => {
    try {
      const persist = { tasks, categories };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
    } catch {
      // ignore
    }
  }, [tasks, categories]);

  // naive streak: consecutive days with any completion
  const streak = useMemo(() => {
    const days = new Set(
      tasks
        .filter((t) => t.completedAt)
        .map((t) => (t.completedAt as string).slice(0, 10))
    );
    let s = 0;
    let day = new Date();
    while (days.has(day.toISOString().slice(0, 10))) {
      s += 1;
      day = addDays(day, -1);
    }
    return s;
  }, [tasks]);

  return (
    <TasksContext.Provider
      value={{
        tasks,
        categories,
        addCategory,
        removeCategory,
        addTask,
        updateTask,
        toggleComplete,
        deleteTask,
        todayTasks,
        overdueTasks,
        streak,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
}
