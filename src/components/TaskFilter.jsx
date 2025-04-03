import { useState, useRef, useEffect } from "react"
import { Filter, X } from "lucide-react"

function TaskFilter({ categories, onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [category, setCategory] = useState("All Categories")
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("")
  const [status, setStatus] = useState("All")
  const filterRef = useRef(null)

  const months = [
    { value: "", label: "All Months" },
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  const currentYear = new Date().getFullYear()
  const years = [
    { value: "", label: "All Years" },
    ...Array.from({ length: 6 }, (_, i) => ({
      value: String(currentYear - i),
      label: String(currentYear - i),
    })),
  ]


  const statuses = [
    { value: "All", label: "All Tasks" },
    { value: "Active", label: "Active Tasks" },
    { value: "Overdue", label: "Overdue Tasks" },
  ]

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [filterRef])

  const toggleFilter = () => {
    setIsOpen(!isOpen)
  }

  const applyFilters = () => {
    onFilterChange({
      category,
      month,
      year,
      status,
    })
    setIsOpen(false)
  }

  const clearFilters = () => {
    setCategory("All Categories")
    setMonth("")
    setYear("")
    setStatus("All")
    onFilterChange({
      category: "All Categories",
      month: "",
      year: "",
      status: "All",
    })
    setIsOpen(false)
  }

  const activeFilterCount = [category !== "All Categories", month !== "", year !== "", status !== "All"].filter(
    Boolean,
  ).length

  return (
    <div className="filter-dropdown" ref={filterRef}>
      <button
        className={`filter-button ${activeFilterCount > 0 ? "has-filters" : ""}`}
        onClick={toggleFilter}
        title="Filter tasks"
      >
        <Filter size={20} />
        {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
      </button>

      {isOpen && (
        <div className="filter-dropdown-content">
          <div className="filter-dropdown-header">
            <h3>Filter Tasks</h3>
            <button className="close-button" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="All Categories">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Month</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              {years.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <button className="btn btn-sm" onClick={applyFilters}>
              Apply Filters
            </button>
            <button className="btn btn-sm btn-cancel" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskFilter
