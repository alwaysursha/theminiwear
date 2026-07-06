import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AccountPanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-coral/90">
          Your dashboard
        </p>
        <h2 className="font-display text-lg font-extrabold leading-tight text-white">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-white/55">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function AccountPanelCard({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  const classes = cn("account-panel-card block", className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <div className={classes}>{children}</div>;
}

export function AccountPanelEmpty({
  message,
  actionLabel,
  actionHref,
}: {
  message: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="account-panel-empty">
      <p className="text-sm text-white/60">{message}</p>
      <Link href={actionHref} className="account-panel-link mt-2 inline-block text-xs">
        {actionLabel}
      </Link>
    </div>
  );
}

export function AccountPanelNotice({ children }: { children: ReactNode }) {
  return <div className="account-panel-notice mb-3 text-xs">{children}</div>;
}

export function AccountPanelSkeleton() {
  return (
    <div className="animate-pulse space-y-2.5 py-1">
      <div className="h-6 w-32 rounded-md bg-white/10" />
      <div className="account-panel-card h-14" />
      <div className="account-panel-card h-14" />
    </div>
  );
}

export function AccountPanelLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("account-panel-link text-xs", className)}>
      {children}
    </Link>
  );
}

const orderStatusTone: Record<string, string> = {
  DELIVERED: "account-panel-status--success",
  CANCELLED: "account-panel-status--warning",
  REFUNDED: "account-panel-status--warning",
  SHIPPED: "account-panel-status--info",
  PROCESSING: "account-panel-status--info",
};

const messageStatusTone: Record<string, string> = {
  OPEN: "account-panel-status--coral",
  IN_PROGRESS: "account-panel-status--info",
  RESOLVED: "account-panel-status--success",
  CLOSED: "account-panel-status--muted",
};

export function AccountPanelStatus({
  label,
  kind = "order",
}: {
  label: string;
  kind?: "order" | "message";
}) {
  const toneMap = kind === "message" ? messageStatusTone : orderStatusTone;
  const tone = toneMap[label] ?? "account-panel-status--muted";

  return (
    <span className={cn("account-panel-status", tone)}>
      {label.replace("_", " ")}
    </span>
  );
}
