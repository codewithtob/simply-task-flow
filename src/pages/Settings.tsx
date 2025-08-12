import { useEffect, useState } from "react";
import { Seo } from "@/components/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTasks } from "@/context/TasksContext";

const Settings = () => {
  const { categories, addCategory, exportData, importData } = useTasks();
  const [themeDark, setThemeDark] = useState<boolean>(false);
  const [newCat, setNewCat] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    if (themeDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [themeDark]);

  const onAddCategory = () => {
    if (!newCat.trim()) return;
    addCategory(newCat.trim());
    setNewCat("");
  };

  return (
    <div className="px-4 py-6 md:px-6">
      <Seo title="TaskFlow – Settings" description="Preferences, theme, and list management." />
      <h1 className="text-2xl font-semibold mb-4">TaskFlow Settings</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="theme">Dark mode</Label>
                <p className="text-xs text-muted-foreground">Switch between light and dark</p>
              </div>
              <Switch id="theme" checked={themeDark} onCheckedChange={setThemeDark} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <Input placeholder="New category" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
              <Button variant="cta" onClick={onAddCategory}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <span key={c} className="rounded-md bg-secondary px-2 py-1 text-xs">{c}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => {
                const data = exportData();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "taskflow-data.json";
                a.click();
                URL.revokeObjectURL(url);
              }}>Export JSON</Button>
              <Button variant="outline" onClick={() => document.getElementById("import-file")?.click()}>Import JSON</Button>
              <input id="import-file" type="file" accept="application/json" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const text = await file.text();
                  const parsed = JSON.parse(text);
                  if (parsed?.tasks && parsed?.categories) {
                    importData(parsed);
                  } else {
                    alert("Invalid file format");
                  }
                } catch {
                  alert("Failed to import JSON");
                } finally {
                  e.currentTarget.value = "";
                }
              }} />
            </div>
            <p className="text-xs text-muted-foreground">Export your data or import from a previous backup.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
