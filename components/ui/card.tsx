import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function Card({
  title,
  description,
  action,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm shadow-slate-900/5",
        className,
      )}
      {...props}
    >
      {(title || description || action) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title ? (
              <h2 className="text-base font-semibold tracking-tight text-slate-900">{title}</h2>
            ) : null}
            {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
          </div>
          {action ? <div>{action}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}
