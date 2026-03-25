import Link from "next/link";

interface ModuleHeaderProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export default function ModuleHeader({
  icon,
  title,
  subtitle,
}: ModuleHeaderProps) {
  return (
    <div className="mb-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary no-underline transition-colors hover:border-border-hover hover:text-accent-cyan"
      >
        ← Hub
      </Link>
      <div className="flex items-center gap-3.5">
        <span className="rounded-[14px] bg-accent-cyan-dim p-2.5 text-3xl">
          {icon}
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-text-muted">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
