"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface CommandPaletteContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const CommandPaletteContext = createContext<CommandPaletteContextType>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
});

export function useCommandPalette() {
  return useContext(CommandPaletteContext);
}

export function useCommandPaletteState() {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen(p => !p), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle]);

  return { open, setOpen, toggle };
}