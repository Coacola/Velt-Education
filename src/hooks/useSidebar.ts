"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "velt_sidebar_collapsed";

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) setCollapsed(stored === "true");
    } catch {}
  }, []);

  const toggle = () => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
      return next;
    });
  };

  return { collapsed, toggle, mounted };
}