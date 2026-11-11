import { localDate } from './tasks';
export function formatDate(value, now = new Date()) {
  if (!value) return 'No due date';
  if (value === localDate(now)) return 'Today';
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (value === localDate(tomorrow)) return 'Tomorrow';
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(value.slice(0, 4) !== String(now.getFullYear()) ? {
      year: 'numeric'
    } : {})
  });
}
export function categoryColor(category) {
  return [...category].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 5;
}
