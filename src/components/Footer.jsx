const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="app-footer">
      <p>
        &copy; {year} QueuedUp. Movie data from{' '}
        <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
          TMDb
        </a>
        .
      </p>
    </footer>
  )
}

export default Footer
