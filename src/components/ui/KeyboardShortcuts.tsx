"use client";

import { useEffect, useState } from "react";
import { Command, Key, HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const SHORTCUTS = [
  { keys: ["⌘", "K"], description: "Open global search", category: "Navigation" },
  { keys: ["⌘", "D"], description: "Go to dashboard", category: "Navigation" },
  { keys: ["⌘", "T"], description: "Go to timetable", category: "Navigation" },
  { keys: ["⌘", "S"], description: "Go to students", category: "Navigation" },
  { keys: ["⌘", "H"], description: "Go to HR/Staff", category: "Navigation" },
  { keys: ["⌘", "F"], description: "Go to fees", category: "Navigation" },
  { keys: ["⌘", "E"], description: "Go to exams", category: "Navigation" },
  { keys: ["⌘", "B"], description: "Go to analytics", category: "Navigation" },
  { keys: ["?"], description: "Show keyboard shortcuts", category: "Help" },
  { keys: ["Esc"], description: "Close modal/dialog", category: "General" },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen(true);
      }
      
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case "d":
            e.preventDefault();
            router.push("/admin/dashboard");
            break;
          case "t":
            e.preventDefault();
            router.push("/timetable");
            break;
          case "s":
            e.preventDefault();
            router.push("/students");
            break;
          case "h":
            e.preventDefault();
            router.push("/hr/directory");
            break;
          case "f":
            e.preventDefault();
            router.push("/fees");
            break;
          case "e":
            e.preventDefault();
            router.push("/exams");
            break;
          case "b":
            e.preventDefault();
            router.push("/analytics");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const categories = [...new Set(SHORTCUTS.map((s) => s.category))];

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <HelpCircle className="h-4 w-4 mr-1" />
        <span className="text-xs">?</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Command className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  {category}
                </h3>
                <div className="space-y-2">
                  {SHORTCUTS.filter((s) => s.category === category).map((shortcut, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <kbd
                            key={keyIdx}
                            className="px-2 py-1 bg-muted rounded text-xs font-mono"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-muted-foreground text-center pt-4 border-t">
            Press <kbd className="px-1 bg-muted rounded">?</kbd> anytime to show this help
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}