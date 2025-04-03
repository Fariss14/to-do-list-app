import { useState } from "react"
import { Calendar, Plus, Clock } from "lucide-react"

function AddTask({ categories, onAddTask, onAddCategory }) {
  const [text, setText] = useState("")
  const [category, setCategory] = useState("Personal")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [showCategoryInput, setShowCategoryInput] = useState(false)
  const [newCategory, setNewCategory] = useState("")

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

      <div className="category-control">
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

      <div className="datetime-control">
        <div className="date-control enhanced">
          <label htmlFor="task-date" className="date-label">
          </label>
          <div className="date-input-container">
            <input
              id="task-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="enhanced-date-input"
              onClick={() => !date && setDefaultDate()}
            />
          </div>
        </div>

        <div className="time-control enhanced">
          <label htmlFor="task-time" className="time-label">
          </label>
          <div className="time-input-container">
            <input
              id="task-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="enhanced-time-input"
              onClick={() => !time && setDefaultTime()}
            />
          </div>
        </div>
      </div>

      <input type="submit" value="Add" className="btn btn-block same-height" />
    </form>
  )
}

export default AddTask
