import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Dialog from './Dialog';
import Subtasks from './Subtasks';
import { uid, validDate, TASK_STATUSES, updateSubtask } from '../lib/tasks';
export default function TaskEditor({
  task,
  categories,
  onSave,
  onClose,
  defaultDate = '',
  defaultStatus = 'active'
}) {
  const [draft, setDraft] = useState(() => task ? {
    ...task,
    subtasks: task.subtasks.map(s => ({
      ...s
    }))
  } : {
    text: '',
    notes: '',
    category: categories[0],
    date: defaultDate,
    time: '',
    priority: 'medium',
    status: defaultStatus,
    subtasks: []
  });
  const [newCategory, setNewCategory] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [error, setError] = useState('');
  const update = (key, value) => setDraft(d => ({
    ...d,
    [key]: value
  }));
  function save(e) {
    e.preventDefault();
    if (!draft.text.trim()) return setError('Give your task a title.');
    if (!e.currentTarget.checkValidity() || (draft.date && !validDate(draft.date))) return setError('Check the date and time fields before saving.');
    if (addingCategory && !newCategory.trim()) return setError('Enter a category name or choose an existing one.');
    const requested = newCategory.trim();
    const category = addingCategory ? categories.find(c => c.toLowerCase() === requested.toLowerCase()) || requested : draft.category;
    let subtasks = draft.subtasks;
    for (const [name, value] of new FormData(e.currentTarget)) {
      if (!name.startsWith('new-subtask:') || !value.trim()) continue;
      const sub = { id: uid(), text: value.trim(), completed: false, subtasks: [] };
      const parentId = name.slice('new-subtask:'.length);
      subtasks = parentId ? updateSubtask(subtasks, parentId, parent => ({ ...parent, subtasks: [...(parent.subtasks || []), sub] })) : [...subtasks, sub];
    }
    onSave({
      ...draft,
      text: draft.text.trim(),
      notes: draft.notes.trim(),
      category,
      subtasks
    });
  }
  return <Dialog title={task ? 'Make it your own.' : 'Make room for what matters.'} onClose={onClose}>
    <form noValidate onSubmit={save} className="task-form" aria-describedby={error ? 'task-form-error' : undefined}>
      <label>Task title{' '}
        <input autoFocus required maxLength={300} placeholder="What would you like to get done?" value={draft.text} onChange={e => update('text', e.target.value)} />
      </label>
      <label>Notes{' '}
        <span className="optional">optional</span>
        <textarea rows={3} placeholder="A little context, a link, or your next step…" value={draft.notes} onChange={e => update('notes', e.target.value)} />
      </label>
      <label>Status
        <select value={draft.status} onChange={e => update('status', e.target.value)}>
          {TASK_STATUSES.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
        </select>
      </label>
      <div className="form-grid">
        <label>Category
          <select value={addingCategory ? '__new' : draft.category} onChange={e => {
            setAddingCategory(e.target.value === '__new');
            if (e.target.value !== '__new') update('category', e.target.value);
          }}>
        {categories.map(c => <option key={c}>{c}</option>)}
            <option value="__new">+ New category</option>
      </select>
        </label>
        <label>Priority
          <select value={draft.priority} onChange={e => update('priority', e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>
      {addingCategory && <label>New category name
        <input autoFocus maxLength={50} value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="e.g. Side projects" />
      </label>}
      <div className="form-grid">
        <label>Due date{' '}
          <span className="optional">optional</span>
          <input type="date" max="9999-12-31" value={draft.date} onChange={e => setDraft(d => ({
            ...d,
            date: e.target.value,
            time: e.target.value ? d.time : ''
          }))} />
        </label>
        <label>Time{' '}
          <span className="optional">optional</span>
          <input type="time" disabled={!draft.date} value={draft.time} onChange={e => update('time', e.target.value)} />
        </label>
      </div>
      <fieldset className="subtask-editor">
        <legend>Small steps{' '}
          <span className="optional">optional</span>
        </legend>
        <Subtasks subtasks={draft.subtasks} parentText={draft.text || 'this task'} removable onChange={subtasks => update('subtasks', subtasks)} />
      </fieldset>
      {error && <p id="task-form-error" role="alert" className="form-error">{error}</p>}
      <div className="dialog-actions">
        <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
        <button className="button primary" type="submit">{task ? 'Save changes' : 'Create task'}
          <ArrowUpRight size={17} />
        </button>
      </div>
    </form>
  </Dialog>;
}
