type DateInput = Date | string | number;

function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value);
}

const formatters = {
  "MMM d, yyyy": new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }),
  "MMMM d, yyyy": new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }),
  "MMM yyyy": new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }),
  "MMM d, yyyy h:mm a": new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }),
  "MMMM d, yyyy 'at' h:mm a": new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }),
  "MMM d, h:mm a": new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }),
} as const;

type DatePattern = keyof typeof formatters;

export function formatDate(value: DateInput, pattern: DatePattern): string {
  return formatters[pattern].format(toDate(value));
}

export function subMonths(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() - amount);
  return next;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}
