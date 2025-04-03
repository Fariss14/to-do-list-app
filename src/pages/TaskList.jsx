import { useState, useEffect } from "react"
import AddTask from "../components/AddTask"
import Task from "../components/Task"
import TaskFilter from "../components/TaskFilter"

function TaskList({ tasks, categories, onAddTask, onAddCategory, onComplete, onDelete, onEdit }) {
  const [filteredTasks, setFilteredTasks] = useState(tasks)
  const [filter, setFilter] = useState({
    category: "All Categories",
    month: "",
    year: "",
    status: "All",
  })

  const isTaskOverdue = (task) => {
    if (!task.date) return false

    const now = new Date()
    const taskDateTime = new Date(task.date)

    if (task.time) {
      const [hours, minutes] = task.time.split(":").map(Number)
      taskDateTime.setHours(hours, minutes)
    } else {
      taskDateTime.setHours(23, 59, 59)
    }

    return taskDateTime < now
  }

  useEffect(() => {
    let result = [...tasks]

    if (filter.category !== "All Categories") {
      result = result.filter((task) => task.category === filter.category)
    }

    if (filter.status !== "All") {
      if (filter.status === "Overdue") {
        result = result.filter((task) => isTaskOverdue(task))
      } else if (filter.status === "Active") {
        result = result.filter((task) => !isTaskOverdue(task))
      }
    }

    if (filter.month || filter.year) {
      result = result.filter((task) => {
        if (!task.date) return false

        const taskDate = new Date(task.date)
        const taskMonth = String(taskDate.getMonth() + 1).padStart(2, "0")
        const taskYear = String(taskDate.getFullYear())

        if (filter.month && filter.year) {
          return taskMonth === filter.month && taskYear === filter.year
        }
        else if (filter.month) {
          return taskMonth === filter.month
        }
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
    <div className="page-container">
      <div className="section-header">
        <h2>My To Do List</h2>
      </div>

      <div className="add-task-container">
        <AddTask categories={categories} onAddTask={onAddTask} onAddCategory={onAddCategory} />
      </div>

      <div className="filter-section">
        <h3>To Do Tasks</h3>
        <TaskFilter categories={categories} onFilterChange={handleFilterChange} />
      </div>

      <div className="tasks-list-container">
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
    </div>
  )
}

export default TaskList
