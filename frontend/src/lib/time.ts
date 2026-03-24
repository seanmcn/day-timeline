export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDuration(minutes: number, includeSeconds = true): string {
  const totalSeconds = Math.floor(Math.abs(minutes) * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (mins > 0 || hours > 0) {
    parts.push(`${mins}m`);
  }

  if (includeSeconds && (secs > 0 || parts.length === 0)) {
    parts.push(`${secs}s`);
  }

  // Fallback for 0 duration without seconds
  if (parts.length === 0) {
    return '0m';
  }

  return parts.join(' ');
}

export function formatDelta(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '-';
  return `${sign}${formatDuration(Math.abs(minutes), false)}`;
}

export function formatLiveTimer(minutes: number): string {
  const totalSeconds = Math.floor(minutes * 60);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getTimeInputValue(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function setTimeFromInput(dateString: string, timeValue: string): string {
  const [hours, minutes] = timeValue.split(':').map(Number);
  const date = new Date(dateString);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

/**
 * Parse a human-friendly duration string into minutes.
 * Supports: "1h 30m", "1h30m", "2h", "45m", "1.5h", "90" (plain number = minutes)
 */
export function parseDuration(input: string): number {
  const s = input.trim().toLowerCase();
  if (!s) return 0;

  // Plain number → treat as minutes
  const asNum = Number(s);
  if (!isNaN(asNum)) return Math.max(0, Math.round(asNum));

  let total = 0;
  const hourMatch = s.match(/([\d.]+)\s*h/);
  const minMatch = s.match(/([\d.]+)\s*m/);

  if (hourMatch) total += parseFloat(hourMatch[1]) * 60;
  if (minMatch) total += parseFloat(minMatch[1]);

  return Math.max(0, Math.round(total));
}

/** Format minutes as a human-readable duration string for input display. */
export function formatMinutesAsDuration(minutes: number): string {
  if (minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}
