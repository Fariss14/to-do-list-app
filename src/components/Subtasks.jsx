import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { uid, updateSubtask } from '../lib/tasks';

function AddSubtask({ parentText, parentId, onAdd }) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');
  function add() {
    if (!text.trim()) return;
    onAdd({ id: uid(), text: text.trim(), completed: false, subtasks: [] });
    setText('');
  }
  if (!adding) return <button type="button" className="subtask-add" aria-label={`Add subtask to ${parentText}`} onClick={() => setAdding(true)}><Plus size={14} />Add subtask</button>;
  return <div className="subtask-add-input inline-input">
    <input autoFocus name={`new-subtask:${parentId}`} maxLength={300} aria-label={`New subtask for ${parentText}`} placeholder="What’s the next small step?" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => {
      if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); add(); }
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setAdding(false); setText(''); }
    }} />
    <button type="button" className="subtask-add" disabled={!text.trim()} onClick={add}>Add</button>
    <button type="button" className="icon-button" aria-label={`Cancel adding subtask to ${parentText}`} onClick={() => { setAdding(false); setText(''); }}><X size={14} /></button>
  </div>;
}

export default function Subtasks({ subtasks, onChange, parentText, parentId = '', disabled = false, removable = false }) {
  return <div className="subtask-tree">
    <ul className="subtask-branches">
      {subtasks.map(sub => <li key={sub.id}>
        <div className="subtask-tree-row">
          <label className={sub.completed ? 'subtask checked' : 'subtask'}>
            <input type="checkbox" checked={sub.completed} disabled={disabled} onChange={() => onChange(updateSubtask(subtasks, sub.id, s => ({ ...s, completed: !s.completed })))} />
            <span>{sub.text}</span>
          </label>
          {removable && !disabled && <button type="button" className="icon-button delete-action" aria-label={`Remove ${sub.text} and its subtasks`} onClick={() => onChange(updateSubtask(subtasks, sub.id, () => null))}><Trash2 size={14} /></button>}
        </div>
        {(!disabled || sub.subtasks?.length > 0) && <div className="subtask-children">
          <Subtasks subtasks={sub.subtasks || []} parentText={sub.text} parentId={sub.id} disabled={disabled} removable={removable} onChange={children => onChange(updateSubtask(subtasks, sub.id, s => ({ ...s, subtasks: children })))} />
        </div>}
      </li>)}
    </ul>
    {!disabled && <AddSubtask parentText={parentText} parentId={parentId} onAdd={sub => onChange([...subtasks, sub])} />}
  </div>;
}
