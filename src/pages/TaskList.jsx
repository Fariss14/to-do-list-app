import { useState, useEffect } from "react"
import AddTask from "../components/AddTask"
import Task from "../components/Task"
import TaskFilter from "../components/TaskFilter"
import { CheckSquare, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"

function TaskList({ tasks, categories, onAddTask, onAddCategory, onComplete, onDelete, onEdit }) {
  const [filteredTasks, setFilteredTasks] = useState(tasks)
  const [filter, setFilter] = useState({
    category: "All Categories",
    month: "",
    year: "",
    status: "All",
  })

  // Check if a task is overdue
  const isTaskOverdue = (task) => {
    if (!task.date) return false

    const now = new Date()
    const taskDateTime = new Date(task.date)

    // If time is set, add it to the date
    if (task.time) {
      const [hours, minutes] = task.time.split(":").map(Number)
      taskDateTime.setHours(hours, minutes)
    } else {
      // If no time set, default to end of day
      taskDateTime.setHours(23, 59, 59)
    }

    return taskDateTime < now
  }

  useEffect(() => {
    let result = [...tasks]

    // Filter by category
    if (filter.category !== "All Categories") {
      result = result.filter((task) => task.category === filter.category)
    }

    // Filter by status
    if (filter.status !== "All") {
      if (filter.status === "Overdue") {
        result = result.filter((task) => isTaskOverdue(task))
      } else if (filter.status === "Active") {
        result = result.filter((task) => !isTaskOverdue(task))
      }
    }

    // Filter by month and year
    if (filter.month || filter.year) {
      result = result.filter((task) => {
        if (!task.date) return false

        const taskDate = new Date(task.date)
        const taskMonth = String(taskDate.getMonth() + 1).padStart(2, "0")
        const taskYear = String(taskDate.getFullYear())

        // If both month and year are specified
        if (filter.month && filter.year) {
          return taskMonth === filter.month && taskYear === filter.year
        }
        // If only month is specified
        else if (filter.month) {
          return taskMonth === filter.month
        }
        // If only year is specified
        else if (filter.year) {
          return taskYear === filter.year
        }

        return true
      })
    }

    setFilteredTasks(result)
  }, [tasks, filter])

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
  }

  return (
    <div className="container">
      <div className="task-container">
        <h2>My To Do List</h2>

        <div className="add-task-container">
          <AddTask categories={categories} onAddTask={onAddTask} onAddCategory={onAddCategory} />
        </div>

        <div className="tasks-list-container">
          <div className="tasks-list-header">
            <TaskFilter categories={categories} onFilterChange={handleFilterChange} />
          </div>

          <div className="tasks-list">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <Task
                  key={task.id}
                  task={task}
                  categories={categories}
                  onComplete={onComplete}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))
            ) : (
              <p className="empty-message">No tasks to show</p>
            )}
          </div>
        </div>

        <div className="view-links">
          <Link to="/completed" className="view-link">
            <CheckSquare size={20} />
            <span>View Completed</span>
          </Link>
          <Link to="/deleted" className="view-link">
            <Trash2 size={20} />
            <span>View Deleted</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TaskList
