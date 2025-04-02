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
  })

  useEffect(() => {

    let result = [...tasks]


    if (filter.category !== "All Categories") {
      result = result.filter((task) => task.category === filter.category)
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

