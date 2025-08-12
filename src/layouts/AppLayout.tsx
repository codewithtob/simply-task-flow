import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/AppSidebar";
import { TasksProvider } from "@/context/TasksContext";
import { TaskQuickAdd } from "@/components/tasks/TaskQuickAdd";
import { CommandMenu } from "@/components/CommandMenu";

export default function AppLayout() {
  const [openAdd, setOpenAdd] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA"].includes(target?.tagName || "");

      // Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
        return;
      }

      // Quick add
      if (!isTyping && e.key === "n" && !e.altKey && !e.metaKey && !e.ctrlKey) {
        setOpenAdd(true);
        return;
      }

      // Search
      if (!isTyping && e.key === "/") {
        e.preventDefault();
        navigate("/search");
        setTimeout(() => {
          const el = document.getElementById("search-input");
          if (el) (el as HTMLInputElement).focus();
        }, 50);
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate]);
  return (
    <TasksProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset>
            <header className="sticky top-0 z-20 h-14 flex items-center gap-3 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3">
              <SidebarTrigger />
              <div className="text-sm text-muted-foreground">TaskFlow</div>
            </header>
            <div className="relative flex-1">
              <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} onNewTask={() => setOpenAdd(true)} />
              <Outlet />
              <Button
                aria-label="Add task"
                variant="cta"
                size="fab"
                className="fixed bottom-6 right-6 shadow-[var(--shadow-glow)] hover:scale-105 transition-transform"
                onClick={() => setOpenAdd(true)}
              >
                <Plus />
              </Button>
              <TaskQuickAdd open={openAdd} onOpenChange={setOpenAdd} />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TasksProvider>
  );
}

// keyboard shortcuts
// placed outside of return using useEffect

