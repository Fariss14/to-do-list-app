import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, RefreshCw } from "lucide-react"

function CompletedTasks({ tasks, onRestore }) {
  const [filteredTasks, setFilteredTasks] = useState(tasks)
  const [category, setCategory] = useState("All Categories")

  const categories = ["All Categories", ...new Set(tasks.map((task) => task.category))]

  useEffect(() => {
    if (category === "All Categories") {
      setFilteredTasks(tasks)
    } else {
      setFilteredTasks(tasks.filter((task) => task.category === category))
    }
  }, [category, tasks])

  const formatDate = (dateStr) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleDateString()
  }

  return (
    <div className="container">
      <div className="task-container">
        <h2>Completed Tasks</h2>

        <div className="tasks-list-container">
          <div className="tasks-list-header">
      
            <div className="filter-select">
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="tasks-list">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div key={task.id} className="task completed-task">
                  <div className="task-info">
                    <h3>{task.text}</h3>
                    <p>
                      <span className="category-badge">{task.category}</span>
                      {task.date && <span className="date-badge">{formatDate(task.date)}</span>}
                      {task.time && <span className="time-badge">{task.time}</span>}
                    </p>
                  </div>
                  <div className="task-actions">
                    <button
                      className="btn btn-restore"
                      onClick={() => onRestore(task.id)}
                      title="Restore to active tasks"
                    >
                      <span>Undo</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-message">No completed tasks</p>
            )}
          </div>
        </div>

        <Link to="/" className="back-link">
          <ArrowLeft size={20} />
          <span>Back to Tasks</span>
        </Link>
      </div>
    </div>
  )
}

export default CompletedTasks