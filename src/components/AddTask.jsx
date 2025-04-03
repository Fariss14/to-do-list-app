import { useState, useRef, useEffect } from "react"
import { Calendar, Plus, Clock, X } from "lucide-react"

function AddTask({ categories, onAddTask, onAddCategory }) {
  const [text, setText] = useState("")
  const [category, setCategory] = useState("Personal")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [showCategoryInput, setShowCategoryInput] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [showDateTimePicker, setShowDateTimePicker] = useState(false)
  const dateTimePickerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dateTimePickerRef.current && !dateTimePickerRef.current.contains(event.target)) {
        setShowDateTimePicker(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dateTimePickerRef])

  const setDefaultDate = () => {
    const today = new Date()
    const formattedDate = today.toISOString().split("T")[0]
    setDate(formattedDate)
  }

  const setDefaultTime = () => {
    const now = new Date()
    now.setHours(now.getHours() + 1)
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    setTime(`${hours}:${minutes}`)
  }

  const toggleDateTimePicker = () => {
    if (!showDateTimePicker) {
      if (!date) setDefaultDate()
      if (!time) setDefaultTime()
    }
    setShowDateTimePicker(!showDateTimePicker)
  }

  const onSubmit = (e) => {
    e.preventDefault()

    if (!text) {
      alert("Please add a task")
      return
    }

    onAddTask({ text, category, date, time, completed: false })

    setText("")
    setDate("")
    setTime("")
  }

  const handleAddCategory = () => {
    if (newCategory.trim() !== "") {
      onAddCategory(newCategory.trim())
      setCategory(newCategory.trim())
      setNewCategory("")
      setShowCategoryInput(false)
    }
  }

  const formatDateTime = () => {
    if (!date && !time) return "Set date & time"

    const display = []
    if (date) {
      const dateObj = new Date(date)
      display.push(dateObj.toLocaleDateString())
    }
    if (time) {
      display.push(time)
    }
    return display.join(" at ")
  }

  return (
    <form className="add-form" onSubmit={onSubmit}>
      <div className="form-control">
        <input
          type="text"
          placeholder="Add a New Task..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="task-input"
        />
      </div>

      <div className="task-options">
        <div className="category-selector">
          {showCategoryInput ? (
            <div className="new-category-input">
              <input
                type="text"
                placeholder="New Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button type="button" className="btn btn-sm" onClick={handleAddCategory}>
                Add
              </button>
              <button type="button" className="btn btn-sm btn-cancel" onClick={() => setShowCategoryInput(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button type="button" className="btn btn-circle" onClick={() => setShowCategoryInput(true)}>
                <Plus size={20} />
              </button>
            </>
          )}
        </div>

        <div className="datetime-selector" ref={dateTimePickerRef}>
          <button type="button" className="datetime-button" onClick={toggleDateTimePicker}>
            <Calendar size={16} />
            <span>{formatDateTime()}</span>
          </button>

          {showDateTimePicker && (
            <div className="datetime-dropdown">
              <div className="datetime-dropdown-header">
                <h3>Set Date & Time</h3>
                <button type="button" className="close-button" onClick={() => setShowDateTimePicker(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="datetime-group">
                <label htmlFor="task-date" className="date-label">
                  <Calendar size={16} className="input-icon" />
                  <span>Date:</span>
                </label>
                <input
                  id="task-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="enhanced-date-input"
                />
              </div>

              <div className="datetime-group">
                <label htmlFor="task-time" className="time-label">
                  <Clock size={16} className="input-icon" />
                  <span>Time:</span>
                </label>
                <input
                  id="task-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="enhanced-time-input"
                />
              </div>

              <div className="datetime-actions">
                <button type="button" className="btn btn-sm" onClick={() => setShowDateTimePicker(false)}>
                  Done
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-cancel"
                  onClick={() => {
                    setDate("")
                    setTime("")
                    setShowDateTimePicker(false)
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <input type="submit" value="Add Task" className="btn btn-block same-height" />
    </form>
  )
}

export default AddTask
