import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { CheckSquare, Trash2, ListTodo, Menu, X, Home } from "lucide-react"

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  const isActive = (path) => {
    return location.pathname === path ? "active" : ""
  }

  const getPageTitle = () => {
    if (location.pathname.includes("/completed")) {
      return "Completed Tasks"
    } else if (location.pathname.includes("/deleted")) {
      return "Deleted Tasks"
    } else {
      return "My Tasks"
    }
  }

  return (
    <>
      <div className="mobile-header">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3>PRANSXZY</h3>
          <h4>To-Do List</h4>
        </div>

        <nav className="sidebar-nav">
          <Link to="/" className={`sidebar-link ${isActive("/")}`} onClick={closeSidebar}>
            <ListTodo size={20} />
            <span>My Tasks</span>
          </Link>

          <Link to="/completed" className={`sidebar-link ${isActive("/completed")}`} onClick={closeSidebar}>
            <CheckSquare size={20} />
            <span>Completed</span>
          </Link>

          <Link to="/deleted" className={`sidebar-link ${isActive("/deleted")}`} onClick={closeSidebar}>
            <Trash2 size={20} />
            <span>Deleted</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <p>© Pransxzy 2025</p>
        </div>
      </div>

      {isOpen && <div className="sidebar-backdrop" onClick={closeSidebar}></div>}
    </>
  )
}

export default Sidebar
