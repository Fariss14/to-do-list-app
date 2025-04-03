function Header() {

  const getPageTitle = () => {
    const path = window.location.pathname

    if (path.includes("/completed")) {
      return "Completed Tasks"
    } else if (path.includes("/deleted")) {
      return "Deleted Tasks"
    } else {
      return "My Tasks"
    }
  }

  return (
    <header className="page-header">
      <h1>{getPageTitle()}</h1>
    </header>
  )
}

export default Header
