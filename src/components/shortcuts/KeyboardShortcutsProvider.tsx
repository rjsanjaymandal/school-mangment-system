"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  action: string;
  href?: string;
  callback?: () => void;
}

const shortcuts: KeyboardShortcut[] = [
  { key: "g d", ctrl: true, action: "Go to Dashboard", href: "/dashboard" },
  { key: "g s", ctrl: true, action: "Go to Students", href: "/students" },
  { key: "g f", ctrl: true, action: "Go to Finance", href: "/finance" },
  { key: "g h", ctrl: true, action: "Go to HR/Staff", href: "/hr" },
  { key: "g a", ctrl: true, action: "Go to Academics", href: "/academics" },
  { key: "n s", ctrl: true, action: "New Student", href: "/students/enroll" },
  { key: "n f", ctrl: true, action: "Collect Fee", href: "/fees/collect" },
  { key: "n a", ctrl: true, action: "Mark Attendance", href: "/attendance" },
  { key: "k", ctrl: true, action: "Search (Global)", href: "/search" },
  { key: "?", shift: true, action: "Show Keyboard Shortcuts" },
  { key: "Escape", action: "Close Dialog/Panel" },
];

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || 
        (e.target as HTMLElement).isContentEditable) {
      return;
    }

    const key = e.key.toLowerCase();
    const keys: string[] = [];
    
    if (e.ctrlKey || e.metaKey) keys.push("ctrl");
    if (e.shiftKey) keys.push("shift");
    if (e.altKey) keys.push("alt");
    keys.push(key);
    
    setPressedKeys(keys);

    // Find matching shortcut
    const match = shortcuts.find(s => {
      const shortcutKeys = s.key.split(" ");
      if (s.ctrl && !e.ctrlKey && !e.metaKey) return false;
      if (s.shift && !e.shiftKey) return false;
      return shortcutKeys.every(k => keys.includes(k));
    });

    if (match) {
      e.preventDefault();
      if (match.href) {
        router.push(match.href);
      }
      if (match.callback) {
        match.callback();
      }
      if (match.key === "?" && e.shiftKey) {
        setShowShortcuts(true);
      }
    }

    // Close shortcuts modal on escape
    if (key === "escape" && showShortcuts) {
      setShowShortcuts(false);
    }

    // Clear pressed keys after delay
    setTimeout(() => setPressedKeys([]), 1000);
  }, [pathname, router, showShortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      {children}
      
      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowShortcuts(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-500 uppercase pb-2 border-b">
                <div className="col-span-4">Shortcut</div>
                <div className="col-span-8">Action</div>
              </div>
              
              {shortcuts.map((s, i) => {
                const shortcutDisplay = s.ctrl ? "Ctrl + " : (s.shift ? "Shift + " : "");
                const keys = s.key.split(" ").map(k => k === "?" ? "?" : k.toUpperCase()).join(" + ");
                
                return (
                  <div key={i} className="grid grid-cols-12 gap-2 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className="col-span-4">
                      <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                        {shortcutDisplay}{keys}
                      </kbd>
                    </div>
                    <div className="col-span-8 text-sm text-slate-600 dark:text-slate-400">
                      {s.action}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <p className="text-xs text-slate-400 mt-4 text-center">
              Press anywhere outside or Esc to close
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// Hook for components to expose shortcuts
export function useKeyboardShortcut(key: string, callback: () => void, ctrl = false) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key.toLowerCase() === key.toLowerCase() && (!ctrl || e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      callback();
    }
  }, [key, callback, ctrl]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}