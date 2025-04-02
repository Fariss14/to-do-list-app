import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import TaskList from "./pages/TaskList"
import CompletedTasks from "./pages/CompletedTasks"
import DeletedTasks from "./pages/DeletedTasks"
import "./App.css"

function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks")
    return savedTasks ? JSON.parse(savedTasks) : []
  })

  const [completedTasks, setCompletedTasks] = useState(() => {
    const savedCompletedTasks = localStorage.getItem("completedTasks")
    return savedCompletedTasks ? JSON.parse(savedCompletedTasks) : []
  })

  const [deletedTasks, setDeletedTasks] = useState(() => {
    const savedDeletedTasks = localStorage.getItem("deletedTasks")
    return savedDeletedTasks ? JSON.parse(savedDeletedTasks) : []
  })

  const [categories, setCategories] = useState(() => {
    const savedCategories = localStorage.getItem("categories")
    return savedCategories ? JSON.parse(savedCategories) : ["Personal", "Hobby", "Work", "Acads", "Shopping"]
  })

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks))
    localStorage.setItem("deletedTasks", JSON.stringify(deletedTasks))
    localStorage.setItem("categories", JSON.stringify(categories))
  }, [tasks, completedTasks, deletedTasks, categories])

  const addTask = (task) => {
    const id = Math.floor(Math.random() * 10000) + 1
    const newTask = { id, ...task }
    setTasks([...tasks, newTask])
  }

  const addCategory = (category) => {
    if (!categories.includes(category)) {
      setCategories([...categories, category])
    }
  }

  const completeTask = (id) => {
    const taskToComplete = tasks.find((task) => task.id === id)
    setCompletedTasks([...completedTasks, taskToComplete])
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const deleteTask = (id) => {
    const taskToDelete = tasks.find((task) => task.id === id)
    setDeletedTasks([...deletedTasks, taskToDelete])
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const restoreCompletedTask = (id) => {
    const taskToRestore = completedTasks.find((task) => task.id === id)
    setTasks([...tasks, taskToRestore])
    setCompletedTasks(completedTasks.filter((task) => task.id !== id))
  }

  const restoreDeletedTask = (id) => {
    const taskToRestore = deletedTasks.find((task) => task.id === id)
    setTasks([...tasks, taskToRestore])
    setDeletedTasks(deletedTasks.filter((task) => task.id !== id))
  }

  const editTask = (id, updatedTask) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, ...updatedTask } : task)))
  }

  return (
    <Router>
      <div className="app-container">
        <Header />
        <div className="content-container">
          <Routes>
            <Route
              path="/"
              element={
                <TaskList
                  tasks={tasks}
                  categories={categories}
                  onAddTask={addTask}
                  onAddCategory={addCategory}
                  onComplete={completeTask}
                  onDelete={deleteTask}
                  onEdit={editTask}
                />
              }
            />
            <Route
              path="/completed"
              element={<CompletedTasks tasks={completedTasks} onRestore={restoreCompletedTask} />}
            />
            <Route path="/deleted" element={<DeletedTasks tasks={deletedTasks} onRestore={restoreDeletedTask} />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App