import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";

export interface TabDef<K extends string> {
  key: K;
  label: string;
  icon?: ReactNode;
  count?: number;
  countTone?: "warn";
}

interface TabsProps<K extends string> {
  tabs: TabDef<K>[];
  active: K;
  onChange: (key: K) => void;
  idPrefix: string;
  label: string;
}

/** WAI-ARIA tabs with roving focus (arrow keys, Home, End). */
export default function Tabs<K extends string>({ tabs, active, onChange, idPrefix, label }: TabsProps<K>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keep the active tab visible when the strip scrolls horizontally (narrow screens, deep links).
  useEffect(() => {
    refs.current[tabs.findIndex((t) => t.key === active)]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active, tabs]);

  function onKeyDown(e: KeyboardEvent, index: number) {
    const last = tabs.length - 1;
    const next =
      e.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    onChange(tabs[next].key);
    refs.current[next]?.focus();
  }

  return (
    <div role="tablist" aria-label={label} className="tabs">
      {tabs.map((t, i) => (
        <button
          key={t.key}
          ref={(el) => (refs.current[i] = el)}
          role="tab"
          id={`${idPrefix}-tab-${t.key}`}
          aria-selected={t.key === active}
          aria-controls={`${idPrefix}-panel`}
          tabIndex={t.key === active ? 0 : -1}
          className="tab"
          onClick={() => onChange(t.key)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          {t.icon}
          {t.label}
          {t.count !== undefined && (
            <span className={`tab__count ${t.countTone === "warn" ? "tab__count--warn" : ""}`} aria-label={`${t.count} items`}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
