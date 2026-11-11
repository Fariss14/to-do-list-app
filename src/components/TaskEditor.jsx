import { useState } from 'react';
import { Plus, Trash2, ArrowUpRight } from 'lucide-react';
import Dialog from './Dialog';
import { uid, validDate } from '../lib/tasks';
export default function TaskEditor({
  task,
  categories,
  onSave,
  onClose,
  defaultDate = ''
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
    subtasks: []
  });
  const [newCategory, setNewCategory] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [subtask, setSubtask] = useState('');
  const [error, setError] = useState('');
  const update = (key, value) => setDraft(d => ({
    ...d,
    [key]: value
  }));
  function addSubtask() {
    if (!subtask.trim()) return;
    update('subtasks', [...draft.subtasks, {
      id: uid(),
      text: subtask.trim(),
      completed: false
    }]);
    setSubtask('');
  }
  function save(e) {
    e.preventDefault();
    if (!draft.text.trim()) return setError('Give your task a title.');
    if (!e.currentTarget.checkValidity() || (draft.date && !validDate(draft.date))) return setError('Check the date and time fields before saving.');
    if (addingCategory && !newCategory.trim()) return setError('Enter a category name or choose an existing one.');
    const requested = newCategory.trim();
    const category = addingCategory ? categories.find(c => c.toLowerCase() === requested.toLowerCase()) || requested : draft.category;
    const subtasks = subtask.trim() ? [...draft.subtasks, {
      id: uid(),
      text: subtask.trim(),
      completed: false
    }] : draft.subtasks;
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
        {draft.subtasks.map(s => <div className="subtask-edit-row" key={s.id}>
          <input aria-label={`Complete ${s.text}`} type="checkbox" checked={s.completed} onChange={() => update('subtasks', draft.subtasks.map(item => item.id === s.id ? {
            ...item,
            completed: !item.completed
          } : item))} />
          <span>{s.text}</span>
          <button type="button" className="icon-button" aria-label={`Remove ${s.text}`} onClick={() => update('subtasks', draft.subtasks.filter(item => item.id !== s.id))}>
            <Trash2 size={16} />
          </button>
        </div>)}
        <div className="inline-input">
          <input value={subtask} placeholder="Break it into a smaller step" aria-label="New subtask" onChange={e => setSubtask(e.target.value)} onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addSubtask();
            }
          }} />
          <button type="button" className="icon-button" aria-label="Add subtask" onClick={addSubtask}>
            <Plus size={19} />
          </button>
        </div>
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
