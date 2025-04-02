import { useState } from "react"

function TaskFilter({ categories, onFilterChange }) {
  const [category, setCategory] = useState("All Categories")
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("")

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

  const handleCategoryChange = (e) => {
    setCategory(e.target.value)
    onFilterChange({
      category: e.target.value,
      month: month,
      year: year,
    })
  }

  const handleMonthChange = (e) => {
    setMonth(e.target.value)
    onFilterChange({
      category: category,
      month: e.target.value,
      year: year,
    })
  }

  const handleYearChange = (e) => {
    setYear(e.target.value)
    onFilterChange({
      category: category,
      month: month,
      year: e.target.value,
    })
  }

  const clearFilters = () => {
    setCategory("All Categories")
    setMonth("")
    setYear("")
    onFilterChange({
      category: "All Categories",
      month: "",
      year: "",
    })
  }

  return (
    <div className="filter-container">
      <div className="filter-select">
        <select value={category} onChange={handleCategoryChange}>
          <option value="All Categories">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-select">
        <select value={month} onChange={handleMonthChange}>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-select">
        <select value={year} onChange={handleYearChange}>
          {years.map((y) => (
            <option key={y.value} value={y.value}>
              {y.label}
            </option>
          ))}
        </select>
      </div>

      <button className="btn btn-sm" onClick={clearFilters}>
        Clear Filters
      </button>
    </div>
  )
}

export default TaskFilter