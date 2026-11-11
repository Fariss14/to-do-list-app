export const STORAGE_KEY = 'pransxzy.tasks.v1';
export const DEFAULT_CATEGORIES = ['Personal', 'Hobby', 'Work', 'Acads', 'Shopping'];
export const STATUSES = ['active', 'completed', 'deleted'];
export const PRIORITIES = ['low', 'medium', 'high'];
export const uid = () => globalThis.crypto.randomUUID();
export const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && localDate(new Date(`${value}T12:00:00`)) === value;
const validTime = value => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const validStamp = value => value === null || typeof value === 'string' && Number.isFinite(Date.parse(value));
export const emptyData = () => ({
  version: 1,
  tasks: [],
  categories: [...DEFAULT_CATEGORIES]
});
export function validateBackup(data) {
  if (!data || data.version !== 1 || !Array.isArray(data.tasks) || !Array.isArray(data.categories)) throw new Error('Choose a version 1 Todolio JSON backup.');
  if (!data.categories.length || data.categories.some(c => typeof c !== 'string' || !c.trim() || c !== c.trim()) || new Set(data.categories.map(c => c.toLowerCase())).size !== data.categories.length) throw new Error('The backup has invalid or duplicate categories.');
  const ids = new Set();
  for (const task of data.tasks) {
    if (!task || typeof task.id !== 'string' || !task.id || ids.has(task.id) || typeof task.text !== 'string' || !task.text.trim() || typeof task.notes !== 'string' || !data.categories.includes(task.category) || !STATUSES.includes(task.status) || !PRIORITIES.includes(task.priority) || task.date !== '' && !validDate(task.date) || task.time !== '' && !validTime(task.time) || task.time && !task.date || !validStamp(task.createdAt) || !validStamp(task.completedAt) || !Array.isArray(task.subtasks)) throw new Error('The backup contains an invalid task. No data has been changed.');
    ids.add(task.id);
    const subIds = new Set();
    for (const sub of task.subtasks) {
      if (!sub || typeof sub.id !== 'string' || !sub.id || subIds.has(sub.id) || typeof sub.text !== 'string' || !sub.text.trim() || typeof sub.completed !== 'boolean') throw new Error('The backup contains an invalid subtask.');
      subIds.add(sub.id);
    }
  }
  // Select known fields so imported files cannot introduce unrelated state.
  return {
    version: 1,
    categories: [...data.categories],
    tasks: data.tasks.map(t => ({
      id: t.id,
      text: t.text.trim(),
      category: t.category,
      date: t.date,
      time: t.time,
      status: t.status,
      priority: t.priority,
      notes: t.notes,
      createdAt: t.createdAt,
      completedAt: t.completedAt,
      subtasks: t.subtasks.map(s => ({
        id: s.id,
        text: s.text.trim(),
        completed: s.completed
      }))
    }))
  };
}
export function migrateLegacy(values) {
  const result = emptyData();
  const categories = values.categories ?? DEFAULT_CATEGORIES;
  if (!Array.isArray(categories) || categories.some(c => typeof c !== 'string' || !c.trim())) throw new Error('Your saved categories could not be read.');
  result.categories = [...new Map(categories.map(c => [c.trim().toLowerCase(), c.trim()])).values()];
  if (!result.categories.length) result.categories = [...DEFAULT_CATEGORIES];
  const ids = new Set();
  for (const [key, status] of [['tasks', 'active'], ['completedTasks', 'completed'], ['deletedTasks', 'deleted']]) {
    const list = values[key] ?? [];
    if (!Array.isArray(list)) throw new Error('Your saved tasks could not be read.');
    for (const task of list) {
      if (!task || typeof task.text !== 'string' || !task.text.trim() || task.date && !validDate(task.date) || task.time && !validTime(task.time)) throw new Error('A saved task is damaged. Export a recovery copy before replacing your data.');
      let id = task.id == null || String(task.id).trim() === '' ? uid() : String(task.id);
      if (ids.has(id)) id = uid();
      ids.add(id);
      const category = typeof task.category === 'string' && task.category.trim() ? task.category.trim() : result.categories[0];
      const canonical = result.categories.find(c => c.toLowerCase() === category.toLowerCase());
      if (!canonical) result.categories.push(category);
      result.tasks.push({
        id,
        text: task.text.trim(),
        category: canonical || category,
        date: task.date || '',
        time: task.date ? task.time || '' : '',
        status,
        notes: '',
        priority: 'medium',
        subtasks: [],
        createdAt: null,
        completedAt: null
      });
    }
  }
  return result;
}
export function loadData(storage) {
  const raw = {};
  try {
    const current = storage.getItem(STORAGE_KEY);
    if (current !== null) {
      raw[STORAGE_KEY] = current;
      return {
        data: validateBackup(JSON.parse(current)),
        error: '',
        raw
      };
    }
    for (const key of ['tasks', 'completedTasks', 'deletedTasks', 'categories']) {
      const value = storage.getItem(key);
      if (value !== null) raw[key] = value;
    }
    const legacy = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, JSON.parse(value)]));
    return {
      data: migrateLegacy(legacy),
      error: '',
      raw
    };
  } catch (error) {
    return {
      data: emptyData(),
      error: `Saved data is unavailable: ${error.message}`,
      raw
    };
  }
}
export function isOverdue(task, now = new Date()) {
  if (task.status !== 'active' || !task.date) return false;
  const due = new Date(`${task.date}T${task.time || '23:59:59.999'}`);
  return due < now;
}
export function transitionTask(task, status, now = new Date()) {
  if (!STATUSES.includes(status)) throw new Error('Invalid task status');
  return {
    ...task,
    status,
    completedAt: status === 'completed' ? now.toISOString() : null
  };
}
export function toggleSubtask(task, id) {
  return {
    ...task,
    subtasks: task.subtasks.map(s => s.id === id ? {
      ...s,
      completed: !s.completed
    } : s)
  };
}
export function selectTasks(tasks, {
  view = 'all',
  search = '',
  category = '',
  priority = '',
  due = '',
  sort = 'due'
} = {}, now = new Date()) {
  const today = localDate(now);
  const query = search.trim().toLowerCase();
  const ranks = {
    high: 0,
    medium: 1,
    low: 2
  };
  return tasks.filter(t => {
    const inView = view === 'completed' ? t.status === 'completed' : view === 'deleted' ? t.status === 'deleted' : t.status === 'active' && (view === 'today' ? t.date && t.date <= today : view === 'upcoming' ? t.date > today : true);
    return inView && (!query || `${t.text} ${t.notes}`.toLowerCase().includes(query)) && (!category || t.category === category) && (!priority || t.priority === priority) && (!due || (due === 'overdue' ? isOverdue(t, now) : due === 'today' ? t.date === today : due === 'undated' ? !t.date : t.date > today));
  }).sort((a, b) => {
    if (sort === 'title') return a.text.localeCompare(b.text) || a.id.localeCompare(b.id);
    if (sort === 'priority') return ranks[a.priority] - ranks[b.priority] || a.text.localeCompare(b.text);
    if (sort === 'newest') return (b.createdAt || '').localeCompare(a.createdAt || '') || a.id.localeCompare(b.id);
    return (a.date || '9999-12-31').localeCompare(b.date || '9999-12-31') || (a.time || '23:59').localeCompare(b.time || '23:59') || ranks[a.priority] - ranks[b.priority] || a.text.localeCompare(b.text);
  });
}
export function getStats(tasks, now = new Date()) {
  const today = localDate(now);
  const active = tasks.filter(t => t.status === 'active');
  const dueToday = active.filter(t => t.date === today).length;
  const completedToday = tasks.filter(t => t.status === 'completed' && t.completedAt && localDate(new Date(t.completedAt)) === today).length;
  return {
    active: active.length,
    dueToday,
    overdue: active.filter(t => isOverdue(t, now)).length,
    completedToday,
    progress: dueToday + completedToday ? Math.round(completedToday / (dueToday + completedToday) * 100) : 0
  };
}
