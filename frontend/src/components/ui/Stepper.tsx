import { Check } from "lucide-react";

interface StepperProps {
  steps: { key: string; label: string }[];
  current: string;
  label: string;
}

export default function Stepper({ steps, current, label }: StepperProps) {
  const currentIndex = steps.findIndex((s) => s.key === current);
  return (
    <ol className="stepper" aria-label={label}>
      {steps.map((s, i) => {
        const state = i < currentIndex ? "done" : i === currentIndex ? "current" : "todo";
        return (
          <li key={s.key} style={{ display: "contents" }}>
            {i > 0 && <span className="stepper__sep" aria-hidden />}
            <span className={`stepper__item stepper__item--${state}`} aria-current={state === "current" ? "step" : undefined}>
              <span className="stepper__dot" aria-hidden>
                {state === "done" ? <Check /> : i + 1}
              </span>
              {s.label}
              {state === "done" && <span className="sr-only">(completed)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
