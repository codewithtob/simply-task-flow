import { useMemo, useState } from "react";
import { Seo } from "@/components/Seo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTasks, Priority } from "@/context/TasksContext";

const chips: Priority[] = ["Low", "Medium", "High"];

const SearchPage = () => {
  const { tasks } = useTasks();
  const [q, setQ] = useState("");
  const [priority, setPriority] = useState<Priority | "All">("All");

  const results = useMemo(() => {
    return tasks.filter((t) => {
      const text = `${t.title} ${t.notes ?? ""}`.toLowerCase();
      const matchQ = q ? text.includes(q.toLowerCase()) : true;
      const matchP = priority === "All" ? true : t.priority === priority;
      return matchQ && matchP;
    });
  }, [tasks, q, priority]);

  return (
    <div className="px-4 py-6 md:px-6">
      <Seo title="TaskFlow – Search" description="Find tasks quickly with smart filters and sorting." />
      <h1 className="text-2xl font-semibold mb-4">TaskFlow Search</h1>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <Input id="search-input" placeholder="Search tasks..." value={q} onChange={(e) => setQ(e.target.value)} className="md:max-w-sm" />
        <div className="flex items-center gap-2">
          <Button variant={priority === "All" ? "cta" : "outline"} onClick={() => setPriority("All")}>All</Button>
          {chips.map((p) => (
            <Button key={p} variant={priority === p ? "cta" : "outline"} onClick={() => setPriority(p)}>
              {p}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {results.map((t) => (
          <Card key={t.id} className="hover-scale">
            <CardContent className="p-4">
              <div className="font-medium">{t.title}</div>
              <div className="text-xs text-muted-foreground">{t.category} • {t.priority}</div>
            </CardContent>
          </Card>
        ))}
        {results.length === 0 && (
          <p className="text-sm text-muted-foreground">No results</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
