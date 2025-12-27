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
