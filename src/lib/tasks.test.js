import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY, migrateLegacy, loadData, validateBackup, emptyData, localDate, validDate, isOverdue, transitionTask, toggleSubtask, selectTasks, getStats } from './tasks.js';
const now = new Date(2026, 10, 11, 12, 0);
const makeTask = (extra = {}) => ({
  id: '1',
  text: 'Design homepage',
  notes: 'Check spacing',
  category: 'Work',
  priority: 'medium',
  status: 'active',
  date: '2026-11-11',
  time: '',
  createdAt: null,
  completedAt: null,
  subtasks: [],
  ...extra
});
const storage = values => ({
  getItem: key => values[key] ?? null
});
const backup = tasks => ({
  version: 1,
  categories: ['Work'],
  tasks
});
test('migrates all three legacy lists and keeps historical completion dates unknown', () => {
  const result = migrateLegacy({
    tasks: [{
      id: 1,
      text: 'Active',
      category: 'Work'
    }],
    completedTasks: [{
      id: 2,
      text: 'Done',
      category: 'Personal'
    }],
    deletedTasks: [{
      id: 3,
      text: 'Deleted'
    }]
  });
  assert.deepEqual(result.tasks.map(t => t.status), ['active', 'completed', 'deleted']);
  assert.equal(result.tasks[1].completedAt, null);
  assert.equal(result.tasks[0].priority, 'medium');
  assert.deepEqual(result.tasks[0].subtasks, []);
  assert.doesNotThrow(() => validateBackup(result));
});
test('resolves duplicate IDs while retaining every task and category', () => {
  const result = migrateLegacy({
    categories: [' Work ', 'work'],
    tasks: [{
      id: 1,
      text: 'First',
      category: 'WORK'
    }],
    completedTasks: [{
      id: 1,
      text: 'Second',
      category: 'New'
    }]
  });
  assert.equal(new Set(result.tasks.map(t => t.id)).size, 2);
  assert.equal(result.tasks.length, 2);
  assert.equal(result.categories.length, 2);
  assert.equal(result.tasks[0].category, result.categories[0]);
});
test('loads versioned data in preference to legacy and makes no writes', () => {
  const data = backup([makeTask()]);
  const result = loadData(storage({
    [STORAGE_KEY]: JSON.stringify(data),
    tasks: 'broken'
  }));
  assert.equal(result.error, '');
  assert.deepEqual(result.data, data);
});
test('starts a fresh browser with default categories', () => {
  assert.deepEqual(loadData(storage({})).data, emptyData());
});
test('corrupt versioned data is blocked and retained for recovery', () => {
  const result = loadData(storage({
    [STORAGE_KEY]: '{broken'
  }));
  assert.ok(result.error);
  assert.equal(result.raw[STORAGE_KEY], '{broken');
  assert.deepEqual(result.data.tasks, []);
});
test('collects original legacy values before attempting to parse them', () => {
  const result = loadData(storage({
    tasks: 'broken',
    completedTasks: '[]',
    categories: '["Work"]'
  }));
  assert.ok(result.error);
  assert.equal(result.raw.tasks, 'broken');
  assert.equal(result.raw.categories, '["Work"]');
});
test('storage access failures return a recoverable error', () => {
  const result = loadData({
    getItem() {
      throw new Error('Access denied');
    }
  });
  assert.match(result.error, /Access denied/);
});
test('rejects damaged legacy tasks rather than silently dropping them', () => {
  assert.throws(() => migrateLegacy({
    tasks: [null]
  }));
  assert.throws(() => migrateLegacy({
    tasks: [{
      text: '  '
    }]
  }));
  assert.throws(() => migrateLegacy({
    tasks: [{
      text: 'Invalid date',
      date: '2026-02-30'
    }]
  }));
});
test('completion and restoration preserve content and subtask state', () => {
  const task = makeTask({
    subtasks: [{
      id: 's1',
      text: 'Sketch',
      completed: false
    }]
  });
  const done = transitionTask(task, 'completed', now);
  assert.equal(done.completedAt, now.toISOString());
  assert.equal(done.subtasks[0].completed, false);
  const restored = transitionTask(done, 'active', now);
  assert.equal(restored.completedAt, null);
  assert.equal(restored.text, task.text);
  assert.equal(task.status, 'active');
});
test('delete and restore never duplicate task identities', () => {
  const task = makeTask();
  assert.equal(transitionTask(transitionTask(task, 'deleted'), 'active').id, task.id);
  assert.throws(() => transitionTask(task, 'unknown'));
});
test('subtask completion is independent from its parent', () => {
  const task = makeTask({
    subtasks: [{
      id: 's1',
      text: 'Sketch',
      completed: false
    }]
  });
  const updated = toggleSubtask(task, 's1');
  assert.equal(updated.subtasks[0].completed, true);
  assert.equal(updated.status, 'active');
  assert.equal(task.subtasks[0].completed, false);
});
test('search, category, priority, and date filters work together', () => {
  const tasks = [makeTask({
    id: 'a',
    priority: 'high'
  }), makeTask({
    id: 'b',
    category: 'Personal',
    priority: 'high'
  }), makeTask({
    id: 'c',
    priority: 'low'
  })];
  assert.deepEqual(selectTasks(tasks, {
    search: ' SPACING ',
    category: 'Work',
    priority: 'high',
    due: 'today'
  }, now).map(t => t.id), ['a']);
  assert.equal(selectTasks(tasks, {
    search: 'missing'
  }, now).length, 0);
});
test('Today includes older overdue tasks; Upcoming excludes undated and archived tasks', () => {
  const tasks = [makeTask({
    id: 'past',
    date: '2026-11-10'
  }), makeTask({
    id: 'today'
  }), makeTask({
    id: 'future',
    date: '2026-11-12'
  }), makeTask({
    id: 'none',
    date: ''
  }), makeTask({
    id: 'done',
    status: 'completed'
  })];
  assert.deepEqual(selectTasks(tasks, {
    view: 'today'
  }, now).map(t => t.id), ['past', 'today']);
  assert.deepEqual(selectTasks(tasks, {
    view: 'upcoming'
  }, now).map(t => t.id), ['future']);
  assert.deepEqual(selectTasks(tasks, {
    view: 'completed'
  }, now).map(t => t.id), ['done']);
});
test('sorts dated tasks before undated tasks with priority as a tie breaker', () => {
  const tasks = [makeTask({
    id: 'none',
    date: ''
  }), makeTask({
    id: 'low',
    priority: 'low'
  }), makeTask({
    id: 'high',
    priority: 'high'
  })];
  assert.deepEqual(selectTasks(tasks, {}, now).map(t => t.id), ['high', 'low', 'none']);
  assert.equal(selectTasks(tasks, {
    sort: 'priority'
  }, now)[0].id, 'high');
});
test('sorts title alphabetically and creation timestamps newest first', () => {
  const tasks = [makeTask({
    id: 'a',
    text: 'Zebra',
    createdAt: '2026-11-10T00:00:00Z'
  }), makeTask({
    id: 'b',
    text: 'Apple',
    createdAt: '2026-11-11T00:00:00Z'
  }), makeTask({
    id: 'c',
    text: 'Middle'
  })];
  assert.deepEqual(selectTasks(tasks, {
    sort: 'title'
  }, now).map(t => t.id), ['b', 'c', 'a']);
  assert.deepEqual(selectTasks(tasks, {
    sort: 'newest'
  }, now).map(t => t.id), ['b', 'a', 'c']);
});
test('date-only deadlines expire at local midnight, including UTC-offset timezones', () => {
  const task = makeTask();
  assert.equal(localDate(new Date(2026, 10, 11, 0, 1)), '2026-11-11');
  assert.equal(isOverdue(task, new Date(2026, 10, 11, 23, 59, 59)), false);
  assert.equal(isOverdue(task, new Date(2026, 10, 12, 0, 0)), true);
  assert.equal(isOverdue(makeTask({
    time: '11:59'
  }), now), true);
  assert.equal(isOverdue(makeTask({
    status: 'completed',
    date: '2026-11-10'
  }), now), false);
  assert.equal(isOverdue(makeTask({
    date: ''
  }), now), false);
});
test('validates leap dates and rejects impossible dates', () => {
  assert.equal(validDate('2028-02-29'), true);
  for (const value of ['2026-02-29', '2026-13-01', '2026-04-31', '11/11/2026', null]) assert.equal(validDate(value), false);
});
test('backup round trip preserves every task field and subtask', () => {
  const original = backup([makeTask({
    subtasks: [{
      id: 's',
      text: 'Step',
      completed: true
    }]
  })]);
  assert.deepEqual(validateBackup(JSON.parse(JSON.stringify(original))), original);
});
test('rejects invalid backups atomically, including duplicate IDs and malformed subtasks', () => {
  const task = makeTask();
  const invalid = [null, {}, {
    ...backup([]),
    version: 2
  }, backup([task, task]), backup([makeTask({
    time: '25:00'
  })]), backup([makeTask({
    date: '',
    time: '12:00'
  })]), backup([makeTask({
    priority: 'urgent'
  })]), backup([makeTask({
    subtasks: [{
      id: 's',
      text: 'Step',
      completed: 'yes'
    }]
  })]), backup([makeTask({
    category: 'Missing'
  })]), {
    ...backup([]),
    categories: ['Work', 'work']
  }];
  for (const data of invalid) assert.throws(() => validateBackup(data));
});
test('progress counts known completions today and handles empty days', () => {
  const tasks = [makeTask(), makeTask({
    id: 'done',
    status: 'completed',
    completedAt: now.toISOString()
  }), makeTask({
    id: 'old',
    status: 'completed',
    completedAt: null
  }), makeTask({
    id: 'late',
    date: '2026-11-10'
  })];
  assert.deepEqual(getStats(tasks, now), {
    active: 2,
    dueToday: 1,
    overdue: 1,
    completedToday: 1,
    progress: 50
  });
  assert.equal(getStats([], now).progress, 0);
});

test('replaces blank legacy IDs with valid unique identities', () => {
  const data = migrateLegacy({ tasks: [{ id: '', text: 'Empty ID' }, { id: ' ', text: 'Space ID' }] });
  assert.equal(new Set(data.tasks.map(task => task.id)).size, 2);
  assert.doesNotThrow(() => validateBackup(data));
});
