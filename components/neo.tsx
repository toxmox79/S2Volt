import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function NeoPanel({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <section className={`neo-panel ${className}`} {...props} />;
}

export function NeoCard({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`neo-card ${className}`} {...props} />;
}

export function NeoButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`neo-button ${className}`} {...props} />;
}

export function NeoIconButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`neo-icon-button ${className}`} {...props} />;
}

export function NeoInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`neo-input ${className}`} {...props} />;
}

export function NeoTextarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`neo-input neo-textarea ${className}`} {...props} />;
}

export function NeoSelect({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`neo-input neo-select ${className}`} {...props} />;
}

export function NeoBadge({ tone = "neutral", children }: { tone?: "success" | "warning" | "danger" | "info" | "neutral"; children: React.ReactNode }) {
  return <span className={`neo-badge badge-${tone}`}>{children}</span>;
}

export function NeoMetric({ value, label, trend, icon }: { value: string; label: string; trend?: string; icon?: React.ReactNode }) {
  return (
    <NeoCard className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div><strong>{value}</strong><span>{label}</span>{trend && <small>{trend}</small>}</div>
    </NeoCard>
  );
}

export function NeoSwitch({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <label className="switch-row">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="switch-track" aria-hidden="true"><span /></span>
    </label>
  );
}
