import { useNavigate } from "react-router-dom";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Home, ListTodo, Search, Settings, CalendarDays, Plus } from "lucide-react";
import { useCallback } from "react";

export function CommandMenu({ open, onOpenChange, onNewTask }: { open: boolean; onOpenChange: (open: boolean) => void; onNewTask: () => void }) {
  const navigate = useNavigate();

  const go = useCallback((path: string) => {
    navigate(path);
    onOpenChange(false);
  }, [navigate, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => { onNewTask(); onOpenChange(false); }}>
              <Plus className="mr-2 h-4 w-4" /> New Task
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigate">
            <CommandItem onSelect={() => go("/")}>
              <Home className="mr-2 h-4 w-4" /> Home
            </CommandItem>
            <CommandItem onSelect={() => go("/lists")}>
              <ListTodo className="mr-2 h-4 w-4" /> Lists
            </CommandItem>
            <CommandItem onSelect={() => go("/calendar")}>
              <CalendarDays className="mr-2 h-4 w-4" /> Calendar
            </CommandItem>
            <CommandItem onSelect={() => go("/search")}>
              <Search className="mr-2 h-4 w-4" /> Search
            </CommandItem>
            <CommandItem onSelect={() => go("/settings")}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
