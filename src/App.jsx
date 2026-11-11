import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, NavLink, useLocation, Link } from 'react-router-dom';
import { LayoutGrid, CalendarDays, CalendarRange, CircleCheck, Trash2, Plus, Search, Sun, Moon, Menu, X, ArrowUpRight, ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal, Check, Circle, Clock3, Sparkles, ArrowRight, AlertCircle, RotateCcw } from 'lucide-react';
import Task from './components/Task';
import { formatDate, categoryColor } from './lib/presentation';
import TaskEditor from './components/TaskEditor';
import Dialog from './components/Dialog';
import { STORAGE_KEY, loadData, validateBackup, uid, localDate, transitionTask, toggleSubtask, selectTasks, getStats, emptyData } from './lib/tasks';
import './App.css';
const navigation = [{
  path: '/',
  view: 'all',
  label: 'All tasks',
  icon: LayoutGrid
}, {
  path: '/today',
  view: 'today',
  label: 'Today',
  icon: CalendarDays
}, {
  path: '/upcoming',
  view: 'upcoming',
  label: 'Upcoming',
  icon: CalendarRange
}, {
  path: '/completed',
  view: 'completed',
  label: 'Completed',
  icon: CircleCheck
}, {
  path: '/deleted',
  view: 'deleted',
  label: 'Trash',
  icon: Trash2
}];
const titles = {
  all: ['Big plans.\nSmall steps.', 'A home for your ideas, your errands, and your next big thing.'],
  today: ['Today has\npotential.', 'Pick your next move. Make a little room for progress.'],
  upcoming: ['Good things\nahead.', 'Meet your future plans. Give them a little head start.'],
  completed: ['Look at\nyou go.', 'A collection of small wins. You made these happen.'],
  deleted: ['Room for\na rethink.', 'Bring a task back or make space for something new.']
};
const defaultFilters = {
  search: '',
  category: '',
  priority: '',
  due: '',
  sort: 'due'
};
function download(value, name) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], {
    type: 'application/json'
  }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function Workspace() {
  const [initial] = useState(() => {
    try {
      return loadData(window.localStorage);
    } catch (e) {
      return {
        data: emptyData(),
        error: e.message,
        raw: {}
      };
    }
  });
  const [data, setData] = useState(initial.data);
  const [storageError, setStorageError] = useState(initial.error);
  const [writeBlocked, setWriteBlocked] = useState(Boolean(initial.error));
  const [now, setNow] = useState(() => new Date());
  const [filters, setFilters] = useState(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [editor, setEditor] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [pendingImport, setPendingImport] = useState(null);
  const [importError, setImportError] = useState('');
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('pransxzy.theme') || 'system';
    } catch {
      return 'system';
    }
  });
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const importRef = useRef(null);
  const closeNavRef = useRef(null);
  const location = useLocation();
  const page = navigation.find(n => n.path === location.pathname) || navigation[0];
  const view = page.view;
  const stats = getStats(data.tasks, now);
  const dark = theme === 'dark' || theme === 'system' && systemDark;
  const visible = selectTasks(data.tasks, {
    ...filters,
    view
  }, now);
  const locked = writeBlocked;
  useEffect(() => {
    if (!mobileNav) return;
    const previous = document.activeElement;
    closeNavRef.current?.focus();
    const escape = e => {
      if (e.key === 'Escape') setMobileNav(false);
    };
    window.addEventListener('keydown', escape);
    return () => {
      window.removeEventListener('keydown', escape);
      previous?.focus();
    };
  }, [mobileNav]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const change = e => setSystemDark(e.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    try {
      localStorage.setItem('pransxzy.theme', theme);
    } catch {/* Theme is still usable for this session. */}
  }, [dark, theme]);
  useEffect(() => {
    if (writeBlocked) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setStorageError('');
    } catch {
      setStorageError('Your latest changes could not be saved in this browser. Export a backup before closing this tab.');
    }
  }, [data, writeBlocked]);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const timer = setInterval(tick, 30000);
    window.addEventListener('focus', tick);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', tick);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 8000);
    return () => clearTimeout(timer);
  }, [toast]);
  function saveTask(draft) {
    const task = editor.task ? draft : {
      ...draft,
      id: uid(),
      status: 'active',
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    setData(current => ({
      ...current,
      categories: current.categories.includes(task.category) ? current.categories : [...current.categories, task.category],
      tasks: editor.task ? current.tasks.map(t => t.id === task.id ? task : t) : [...current.tasks, task]
    }));
    setEditor(null);
    setToast({
      message: editor.task ? 'Changes saved.' : 'A fresh task. A fresh start.'
    });
  }
  function changeStatus(task, status) {
    const updated = transitionTask(task, status);
    setData(d => ({
      ...d,
      tasks: d.tasks.map(t => t.id === task.id ? updated : t)
    }));
    setToast({
      message: status === 'completed' ? 'Nice work. Task completed!' : status === 'deleted' ? 'Task moved to trash.' : 'Task restored to All tasks.',
      before: task,
      status
    });
  }
  function undo() {
    const {
      before,
      status
    } = toast;
    setData(d => ({
      ...d,
      tasks: d.tasks.map(t => t.id === before.id && t.status === status ? {
        ...t,
        status: before.status,
        completedAt: before.completedAt
      } : t)
    }));
    setToast({
      message: 'Action undone.'
    });
  }
  function exportBackup() {
    download({
      ...data,
      exportedAt: new Date().toISOString()
    }, `todolio-backup-${localDate()}.json`);
  }
  async function readImport(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('Choose a backup smaller than 10 MB.');
      const parsed = validateBackup(JSON.parse(await file.text()));
      setImportError('');
      setPendingImport(parsed);
    } catch (e) {
      setImportError(e instanceof SyntaxError ? 'That file is not valid JSON. Your existing tasks are unchanged.' : e.message);
    }
  }
  function confirmImport() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingImport));
    } catch {
      setImportError('The backup could not be saved. Free browser storage and try again. Your current tasks are unchanged.');
      setPendingImport(null);
      return;
    }
    setData(pendingImport);
    setPendingImport(null);
    setWriteBlocked(false);
    setStorageError('');
    setToast({
      message: 'Backup imported successfully.'
    });
    setFilters(defaultFilters);
  }
  function switchView() {
    setMobileNav(false);
    setFilters(defaultFilters);
  }
  function selectCategory(category) {
    setFilters({
      ...defaultFilters,
      category
    });
    setMobileNav(false);
  }
  function newTask() {
    if (!locked) setEditor({
      task: null
    });
  }
  const counts = Object.fromEntries(navigation.map(n => [n.view, selectTasks(data.tasks, {
    view: n.view
  }, now).length]));
  const activeFilters = Boolean(filters.category || filters.priority || filters.due);
  const groups = view === 'upcoming' ? [...new Set(visible.map(t => t.date))].sort().map(date => ({
    title: formatDate(date, now),
    tasks: visible.filter(t => t.date === date)
  })) : view === 'today' ? [{
    title: 'Overdue',
    tasks: visible.filter(t => t.date < localDate(now))
  }, {
    title: 'Today',
    tasks: visible.filter(t => t.date === localDate(now))
  }] : [{
    title: '',
    tasks: visible
  }];
  return <div className="workspace">
    <a className="skip-link" href="#main">Skip to tasks</a>
    {mobileNav && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
    <aside className={`sidebar ${mobileNav ? 'open' : ''}`} aria-label="Main navigation">
      <Link className="brand" to="/" onClick={switchView}>
        <span className="brand-mark">
          <Check size={23} strokeWidth={3} />
        </span>
        <span>Todolio
          <span className="brand-caption">Make your next move.</span>
        </span>
      </Link>
      <button ref={closeNavRef} className="icon-button mobile-close" aria-label="Close navigation" onClick={() => setMobileNav(false)}>
        <X size={21} />
      </button>
      <button className="button primary sidebar-add" disabled={locked} onClick={() => {
        newTask();
        setMobileNav(false);
      }}>
        <Plus size={18} />New task
        <span className="add-hint">＋</span>
      </button>
      <span className="nav-label">WORKSPACE</span>
      <nav>{navigation.map(item => {
          const {
            path,
            view: itemView,
            label,
            icon: Icon
          } = item;
          return <NavLink end to={path} key={path} onClick={switchView} className={({
            isActive
          }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Icon size={18} />
          <span>{label}</span>
          <span className="nav-count">{counts[itemView]}</span>
        </NavLink>;
        })}</nav>
      <div className="category-heading">
        <span className="nav-label">MY CATEGORIES</span>
        <span className="muted">{data.categories.length}</span>
      </div>
      <div className="category-nav">{data.categories.map(c => <Link to="/" className={`category-link ${filters.category === c ? 'selected' : ''}`} key={c} onClick={() => selectCategory(c)}>
          <span className={`category-dot color-${categoryColor(c)}`} />{c}
          <span className="category-count">{data.tasks.filter(t => t.status === 'active' && t.category === c).length}</span>
        </Link>)}</div>
      <div className="sidebar-bottom">
        <div className="local-note">
          <span className="local-dot" />
          <span>Your space. Saved on this browser.</span>
        </div>
        <div className="backup-actions">
          <button onClick={exportBackup} disabled={locked}>
            <ArrowDownToLine size={15} />Export</button>
          <button onClick={() => importRef.current.click()}>
            <ArrowUpFromLine size={15} />Import</button>
        </div>
        <div className="sidebar-profile">
          <span className="avatar">T</span>
          <span>
            <strong>Personal workspace</strong>
            <small>Small steps, every day.</small>
          </span>
          <button className="icon-button" aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`} title={`Switch to ${dark ? 'light' : 'dark'} theme`} onClick={() => setTheme(dark ? 'light' : 'dark')}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
        </div>
      </div>
    </aside>
    <div className="main-shell" inert={mobileNav || undefined}>
      <header className="topbar">
        <div className="breadcrumb">
          <button className="icon-button mobile-menu" aria-label="Open navigation" aria-expanded={mobileNav} onClick={() => setMobileNav(true)}>
            <Menu size={21} />
          </button>
          <span className="breadcrumb-home">Workspace</span>
          <ChevronSeparator />
          <strong>{page.label}</strong>
        </div>
        <div className="topbar-date">
          <CalendarDays size={15} />{now.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })}
          <span className="topbar-avatar">T</span>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        {storageError && <div className="notice" role="alert">
          <AlertCircle size={20} />
          <div>
            <strong>{writeBlocked ? 'Your saved data needs attention.' : 'Changes are only available in this tab.'}</strong>
            <p>{storageError}</p>
            <div className="notice-actions">{writeBlocked ? <><button onClick={() => download(initial.raw, `todolio-recovery-${localDate()}.json`)}>Export recovery copy</button><button onClick={() => importRef.current.click()}>Import a valid backup</button><button onClick={() => setConfirmation({
                  type: 'reset'
                })}>Start fresh…</button></> : <><button onClick={exportBackup}>Export current tasks</button><button onClick={() => {
                  try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                    setStorageError('');
                  } catch {
                    setToast({
                      message: 'Storage is still unavailable. Please export a backup.'
                    });
                  }
                }}>Retry saving</button></>}</div>
          </div>
        </div>}
        {importError && <div className="notice" role="alert">
          <AlertCircle size={20} />
          <p>{importError}</p>
          <button className="icon-button" aria-label="Dismiss import error" onClick={() => setImportError('')}>
            <X size={17} />
          </button>
        </div>}
        <section className="page-heading">
          <div className="hero-copy">
            <div className="eyebrow greeting">
              <span />LESS CHAOS. MORE CHECKED OFF.</div>
            <h1>{titles[view][0]}</h1>
            <p>{titles[view][1]}</p>
          </div>
          <button className="button primary heading-add" disabled={locked} onClick={newTask}>
            <Plus size={18} />Let’s do this<ArrowUpRight size={17} /></button>
          <div className="hero-art" aria-hidden="true">
            <span className="hero-spark">✳</span>
            <div className="art-note"><span>NOTE TO SELF</span><strong>You don’t have<br />to do it all.<br /><em>Just start.</em></strong><span className="note-lines" /></div>
            <div className="art-check"><Check size={31} strokeWidth={3} /><span>one thing at a time.</span></div>
            <span className="hero-loop">↳</span>
          </div>
        </section>
        <section className="overview" aria-label="Task overview">
          {[{
            label: 'Active tasks',
            value: stats.active,
            icon: LayoutGrid,
            tone: 'indigo',
            note: 'A world of possibility'
          }, {
            label: 'Due today',
            value: stats.dueToday,
            icon: CalendarDays,
            tone: 'amber',
            note: 'A little focus goes a long way'
          }, {
            label: 'Overdue',
            value: stats.overdue,
            icon: Clock3,
            tone: 'rose',
            note: stats.overdue ? 'Ready for a fresh start' : 'You’re right on track'
          }, {
            label: 'Completed today',
            value: stats.completedToday,
            icon: CircleCheck,
            tone: 'green',
            note: 'Every small win counts'
          }].map(item => {
            const {
              label,
              value,
              icon: Icon,
              tone,
              note
            } = item;
            return <div className={`stat-card ${tone}`} key={label}>
            <div className="stat-top">
              <span>{label}</span>
              <span className="stat-icon">
                <Icon size={17} />
              </span>
            </div>
            <strong>{value.toString().padStart(2, '0')}</strong>
            <small>{note}</small>
          </div>;
          })}
        </section>
        <section className="focus-banner" aria-label="Today’s progress">
          <span className="focus-icon">
            <Sparkles size={22} />
          </span>
          <div className="focus-copy">
            <strong>Momentum looks good on you.</strong>
            <p>{stats.completedToday ? `${stats.completedToday} task${stats.completedToday === 1 ? '' : 's'} completed today. Keep your momentum going.` : 'Start with one small task. The rest will follow.'}</p>
          </div>
          <div className="daily-progress">
            <div>
              <span>Today’s progress</span>
              <strong>{stats.progress}%</strong>
            </div>
            <progress value={stats.progress} max="100" aria-label="Today’s task progress" />
          </div>
          <Link to="/today" onClick={switchView} className="focus-link" aria-label="View Today">
            <ArrowRight size={20} />
          </Link>
        </section>
        <section className="task-section" aria-labelledby="tasks-title">
          <div className="section-heading">
            <div className="section-title">
              <h2 id="tasks-title">{page.label === 'All tasks' ? 'Your tasks' : page.label}</h2>
              <span className="result-count">{visible.length}</span>
            </div>
            <span className="section-caption">Less overthinking. More doing.</span>
          </div>
          <div className="task-toolbar">
            <label className="search-box">
              <Search size={17} />
              <input aria-label="Search tasks and notes" placeholder="Search tasks and notes…" value={filters.search} onChange={e => setFilters(f => ({
                ...f,
                search: e.target.value
              }))} />{filters.search && <button className="icon-button" aria-label="Clear search" onClick={() => setFilters(f => ({
                ...f,
                search: ''
              }))}>
                <X size={15} />
              </button>}</label>
            <div className="toolbar-controls">
              <button className={`button filter-button ${activeFilters ? 'selected' : ''}`} aria-expanded={showFilters} aria-controls="task-filters" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal size={16} />Filters{activeFilters && <span className="filter-dot" />}</button>
              <label className="sort-control">
                <span>Sort:</span>
                <select aria-label="Sort tasks" value={filters.sort} onChange={e => setFilters(f => ({
                  ...f,
                  sort: e.target.value
                }))}>
                  <option value="due">Due date</option>
                  <option value="priority">Priority</option>
                  <option value="newest">Newest first</option>
                  <option value="title">Title A–Z</option>
                </select>
              </label>
            </div>
          </div>
          {showFilters && <div className="filter-panel" id="task-filters">
            <label>Category
              <select value={filters.category} onChange={e => setFilters(f => ({
                ...f,
                category: e.target.value
              }))}>
                <option value="">All categories</option>{data.categories.map(c => <option key={c}>{c}</option>)}</select>
            </label>
            <label>Priority
              <select value={filters.priority} onChange={e => setFilters(f => ({
                ...f,
                priority: e.target.value
              }))}>
                <option value="">All priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label>Due date
              <select value={filters.due} onChange={e => setFilters(f => ({
                ...f,
                due: e.target.value
              }))}>
                <option value="">Any date</option>{!['completed', 'deleted'].includes(view) && <option value="overdue">Overdue</option>}
                <option value="today">Today</option>
                <option value="future">Future</option>
                <option value="undated">No date</option>
              </select>
            </label>
            <button className="text-button" onClick={() => setFilters(defaultFilters)}>Reset all</button>
          </div>}
          {activeFilters && <div className="active-filters">
            <span>Filtered by: {[filters.category, filters.priority && `${filters.priority} priority`, filters.due && `${filters.due} date`].filter(Boolean).join(' · ')}</span>
            <button onClick={() => setFilters(f => ({
              ...defaultFilters,
              search: f.search
            }))}>Clear filters{' '}
              <X size={12} />
            </button>
          </div>}
          <div className="task-list" aria-live="polite">{visible.length ? groups.filter(g => g.tasks.length).map(group => <div key={group.title}>{group.title && <h3 className="group-title">{group.title}
                <span>{group.tasks.length}</span>
              </h3>}{group.tasks.map(task => <Task key={task.id} task={task} now={now} onComplete={t => changeStatus(t, 'completed')} onDelete={t => changeStatus(t, 'deleted')} onRestore={t => changeStatus(t, 'active')} onEdit={t => setEditor({
                task: t
              })} onPermanentDelete={t => setConfirmation({
                type: 'delete',
                task: t
              })} onSubtask={(id, subId) => setData(d => ({
                ...d,
                tasks: d.tasks.map(t => t.id === id ? toggleSubtask(t, subId) : t)
              }))} />)}</div>) : <div className="empty-state">
              <span className="empty-icon">{filters.search || activeFilters ? <Search size={26} /> : view === 'completed' ? <CircleCheck size={28} /> : view === 'deleted' ? <Trash2 size={27} /> : <Circle size={28} />}</span>
              <h3>{filters.search || activeFilters ? 'No tasks match just yet.' : view === 'completed' ? 'Your next little win is waiting.' : view === 'deleted' ? 'Nothing in the trash.' : view === 'today' ? 'A little breathing room.' : view === 'upcoming' ? 'A clear horizon.' : 'Big things start with a small task.'}</h3>
              <p>{filters.search || activeFilters ? 'Try a different search or clear your filters.' : view === 'deleted' ? 'Tasks you remove will appear here for safekeeping.' : view === 'completed' ? 'Completed tasks will appear here. One step at a time.' : 'Add something you’d like to make happen.'}</p>{filters.search || activeFilters ? <button className="button secondary" onClick={() => setFilters(defaultFilters)}>Clear search & filters</button> : !['completed', 'deleted'].includes(view) && <button className="button primary" disabled={locked} onClick={newTask}>
                <Plus size={17} />Create a task</button>}</div>}</div>
          {!['completed', 'deleted'].includes(view) && visible.length > 0 && <button className="add-task-row" onClick={newTask} disabled={locked}>
            <Plus size={17} />Add another task
            <span>One small step forward
              <ArrowUpRight size={14} />
            </span>
          </button>}
        </section>
        <footer className="main-footer">
          <span>
            <span className="footer-spark">✳</span> Small steps. Big main-character energy.</span>
          <span>Made for your everyday.</span>
        </footer>
      </main>
    </div>
    <input ref={importRef} hidden type="file" accept="application/json,.json" aria-label="Import JSON backup" onChange={readImport} />
    {editor && <TaskEditor task={editor.task} categories={data.categories} defaultDate={view === 'today' ? localDate(now) : ''} onSave={saveTask} onClose={() => setEditor(null)} />}
    {pendingImport && <Dialog title="Bring your tasks back." onClose={() => setPendingImport(null)}>
      <p className="dialog-copy">This backup contains{' '}
        <strong>{pendingImport.tasks.length} tasks</strong> ({pendingImport.tasks.filter(t => t.status === 'active').length} active, {pendingImport.tasks.filter(t => t.status === 'completed').length} completed, {pendingImport.tasks.filter(t => t.status === 'deleted').length} in trash) and{' '}
        <strong>{pendingImport.categories.length} categories</strong>.</p>
      <p className="dialog-copy">Importing replaces all current tasks and categories. Export your current data first if you want to keep it.</p>
      <div className="dialog-actions">
        <button className="button secondary" onClick={() => setPendingImport(null)}>Cancel</button>{!locked && <button className="button secondary" onClick={exportBackup}>Export current</button>}
        <button className="button primary" onClick={confirmImport}>Replace & import</button>
      </div>
    </Dialog>}
    {confirmation && <Dialog title={confirmation.type === 'reset' ? 'Start with a clean slate?' : 'Let this task go?'} onClose={() => setConfirmation(null)}>
      <p className="dialog-copy">{confirmation.type === 'reset' ? 'This replaces the saved app data with an empty workspace. Export a recovery copy before continuing. Original legacy data is kept in its old storage keys.' : `“${confirmation.task.text}” and its subtasks will be permanently deleted. This cannot be undone.`}</p>
      <div className="dialog-actions">
        <button className="button secondary" onClick={() => setConfirmation(null)}>Cancel</button>{confirmation.type === 'reset' && <button className="button secondary" onClick={() => download(initial.raw, `todolio-recovery-${localDate()}.json`)}>Export recovery</button>}
        <button className="button danger" onClick={() => {
          if (confirmation.type === 'reset') {
            const fresh = emptyData();
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
              setData(fresh);
              setWriteBlocked(false);
              setStorageError('');
            } catch {
              setImportError('Browser storage is unavailable. Your saved data was not changed.');
            }
          } else {
            setData(d => ({
              ...d,
              tasks: d.tasks.filter(t => t.id !== confirmation.task.id)
            }));
            setToast({
              message: 'Task permanently deleted.'
            });
          }
          setConfirmation(null);
        }}>{confirmation.type === 'reset' ? 'Start fresh' : 'Delete forever'}</button>
      </div>
    </Dialog>}
    {toast && <div className="toast" role="status">
      <span className="toast-icon">
        <Check size={16} />
      </span>
      <span>{toast.message}</span>{toast.before && <button onClick={undo}>
        <RotateCcw size={14} />Undo</button>}
      <button className="icon-button" aria-label="Dismiss notification" onClick={() => setToast(null)}>
        <X size={16} />
      </button>
    </div>}
  </div>;
}
function ChevronSeparator() {
  return <span className="breadcrumb-separator">/</span>;
}
export default function App() {
  return <BrowserRouter>
    <Workspace />
  </BrowserRouter>;
}
