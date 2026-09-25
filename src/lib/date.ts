// src/lib/date.ts

const SANTIAGO_TZ = "America/Santiago";

function santiagoOffsetMs(instant: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: SANTIAGO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts: Record<string, string> = {};
  for (const part of dtf.formatToParts(instant)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second)
  );

  return asUtc - instant.getTime();
}

/**
 * Convierte una fecha naive de MySQL (hora local de Chile) a Date real.
 * Las cadenas con zona horaria explícita se respetan tal cual.
 */
export function parseDbDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return value;

  const str = String(value).trim();

  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(str)) {
    const explicit = new Date(str);
    return Number.isNaN(explicit.getTime()) ? null : explicit;
  }

  const match = str.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/
  );

  if (!match) {
    const fallback = new Date(str);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  const [, year, month, day, hour = "0", minute = "0", second = "0"] = match;
  const guess = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );

  const firstOffset = santiagoOffsetMs(new Date(guess));
  let adjusted = new Date(guess - firstOffset);
  const secondOffset = santiagoOffsetMs(adjusted);

  if (secondOffset !== firstOffset) {
    adjusted = new Date(guess - secondOffset);
  }

  return adjusted;
}

export function timeAgo(value: unknown): string {
  const date = parseDbDate(value);
  if (!date) return "—";

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Hace un momento";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  return `Hace ${diffD} día${diffD > 1 ? "s" : ""}`;
}
