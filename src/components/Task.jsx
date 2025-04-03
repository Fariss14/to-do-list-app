import { useState, useEffect } from "react"
import { Edit2, Calendar, Clock, AlertTriangle } from "lucide-react"

function Task({ task, categories, onComplete, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(task.text)
  const [editedCategory, setEditedCategory] = useState(task.category)
  const [editedDate, setEditedDate] = useState(task.date || "")
  const [editedTime, setEditedTime] = useState(task.time || "")
  const [isOverdue, setIsOverdue] = useState(false)

  useEffect(() => {
    if (task.date) {
      const now = new Date()
      const taskDateTime = new Date(task.date)

      if (task.time) {
        const [hours, minutes] = task.time.split(":").map(Number)
        taskDateTime.setHours(hours, minutes)
      } else {
        taskDateTime.setHours(23, 59, 59)
      }

      setIsOverdue(taskDateTime < now)
    } else {
      setIsOverdue(false)
    }
  }, [task])

  const handleSave = () => {
    if (editedText.trim() === "") {
      alert("Task text cannot be empty")
      return
    }

    onEdit(task.id, {
      text: editedText,
      category: editedCategory,
      date: editedDate,
      time: editedTime,
    })

    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedText(task.text)
    setEditedCategory(task.category)
    setEditedDate(task.date || "")
    setEditedTime(task.time || "")
    setIsEditing(false)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleDateString()
  }

  const getTaskStatusClass = () => {
    if (isOverdue) return "task-overdue"
    return ""
  }

  return (
    <div className={`task ${getTaskStatusClass()}`}>
      {isEditing ? (
        <div className="task-edit-form">
          <input
            type="text"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="edit-task-input"
          />

          <div className="edit-row">
            <div className="edit-field">
              <select value={editedCategory} onChange={(e) => setEditedCategory(e.target.value)}>
                {categories?.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="edit-field">
              <input type="date" value={editedDate} onChange={(e) => setEditedDate(e.target.value)} />
            </div>

            <div className="edit-field">
              <input type="time" value={editedTime} onChange={(e) => setEditedTime(e.target.value)} />
            </div>
          </div>

          <div className="edit-actions">
            <button className="btn btn-sm btn-success" onClick={handleSave}>
              <span>Save</span>
            </button>
            <button className="btn btn-sm btn-cancel" onClick={handleCancel}>
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="task-info">
            <h3>
              {task.text}
              {isOverdue && (
                <span className="overdue-indicator" title="This task is overdue">
                  <AlertTriangle size={16} />
                  Overdue
                </span>
              )}
            </h3>
            <div className="task-metadata">
              <span className="category-badge">{task.category}</span>

              <div className="datetime-badges">
                {task.date && (
                  <span className={`date-badge ${isOverdue ? "overdue" : ""}`}>
                    <Calendar size={14} className="badge-icon" />
                    {formatDate(task.date)}
                  </span>
                )}
                {task.time && (
                  <span className={`time-badge ${isOverdue ? "overdue" : ""}`}>
                    <Clock size={14} className="badge-icon" />
                    {task.time}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="task-actions">
            <button className="btn btn-edit" onClick={() => setIsEditing(true)} title="Edit task">
              <Edit2 size={18} />
            </button>
            <button className="btn btn-success" onClick={() => onComplete(task.id)} title="Mark as completed">
              Done
            </button>
            <button className="btn btn-danger" onClick={() => onDelete(task.id)} title="Delete task">
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Task
