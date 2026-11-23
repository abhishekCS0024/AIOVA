import { Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";

type Theme = "system" | "light" | "dark";
const KEY = "rca.theme";
const ORDER: Theme[] = ["system", "light", "dark"];
const ICON = { system: Monitor, light: Sun, dark: Moon };

function readTheme(): Theme {
  try {
    const t = localStorage.getItem(KEY);
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readTheme);
  const Icon = ICON[theme];

  function cycle() {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    setTheme(next);
    if (next === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = next;
    try {
      if (next === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  }

  return (
    <button className="btn btn--ghost btn--icon" onClick={cycle} aria-label={`Theme: ${theme}. Switch theme`} title={`Theme: ${theme}`}>
      <Icon size={18} aria-hidden />
    </button>
  );
}
