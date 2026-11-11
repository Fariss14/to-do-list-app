import { useState } from 'react';
import { Check, CalendarDays, Flag, Pencil, Trash2, RotateCcw, ChevronDown, ChevronRight, Clock3 } from 'lucide-react';
import { isOverdue, localDate } from '../lib/tasks';
import { formatDate, categoryColor } from '../lib/presentation';
export default function Task({
  task,
  now,
  onComplete,
  onDelete,
  onEdit,
  onRestore,
  onPermanentDelete,
  onSubtask
}) {
  const [expanded, setExpanded] = useState(false);
  const overdue = isOverdue(task, now);
  const completed = task.status === 'completed';
  const active = task.status === 'active';
  const steps = task.subtasks.filter(s => s.completed).length;
  return <article className={`task-card ${completed ? 'is-completed' : ''}`}>
    <div className="task-main-row">
      {active ? <button className="task-check" aria-label={`Complete ${task.text}`} onClick={() => onComplete(task)}>
        <Check size={15} />
      </button> : <span className={`status-symbol ${completed ? 'done' : 'trashed'}`}>{completed ? <Check size={16} /> : <Trash2 size={16} />}</span>}
      <div className="task-content">
        <h3>{task.text}</h3>
        {task.notes && <p className="task-notes">{task.notes}</p>}
        <div className="task-meta">
          <span className={`category-pill color-${categoryColor(task.category)}`}>
            <i />{task.category}</span>
          <span className={`priority ${task.priority}`}>
            <Flag size={12} />{task.priority}</span>
          {task.date && <span className={overdue ? 'due overdue' : 'due'}>
            <CalendarDays size={13} />{formatDate(task.date, now)}{task.time && ` · ${task.time}`}{overdue && ' · Overdue'}</span>}
          {task.subtasks.length > 0 && <button className="steps-toggle" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}{steps}/{task.subtasks.length} steps</button>}
          {completed && task.completedAt && <span className="due">
            <Clock3 size={12} />Completed {formatDate(localDate(new Date(task.completedAt)), now)}</span>}
        </div>
      </div>
      <div className="task-actions">{active ? <><button className="icon-button" onClick={() => onEdit(task)} aria-label={`Edit ${task.text}`} title="Edit task">
          <Pencil size={16} />
        </button><button className="icon-button delete-action" onClick={() => onDelete(task)} aria-label={`Move ${task.text} to trash`} title="Move to trash">
          <Trash2 size={16} />
        </button></> : <><button className="restore-button" onClick={() => onRestore(task)}>
          <RotateCcw size={14} />
          <span>Restore</span>
        </button>{!completed && <button className="icon-button delete-action" onClick={() => onPermanentDelete(task)} aria-label={`Permanently delete ${task.text}`} title="Delete forever">
          <Trash2 size={16} />
        </button>}</>}</div>
    </div>
    {expanded && <div className="subtask-list">{task.subtasks.map(s => <label className={s.completed ? 'subtask checked' : 'subtask'} key={s.id}>
        <input type="checkbox" checked={s.completed} disabled={!active} onChange={() => onSubtask(task.id, s.id)} />
        <span>{s.text}</span>
      </label>)}</div>}
  </article>;
}
