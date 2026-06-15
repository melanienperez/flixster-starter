import PropTypes from 'prop-types'
import './SearchBar.css'

const SearchBar = ({
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  onNowPlaying,
  isLoading,
}) => {
  const handleSubmit = (event) => {
    event.preventDefault()
    onSearchSubmit()
  }

  return (
    <div className="search-bar">
      <form className="search-bar__form" onSubmit={handleSubmit}>
        <input
          className="search-bar__input"
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder="Search movies..."
          aria-label="Search movies"
        />
        <button className="search-bar__button" type="submit" disabled={isLoading}>
          Search
        </button>
      </form>
      <button className="search-bar__button search-bar__button--secondary" type="button" onClick={onNowPlaying} disabled={isLoading}>
        Now Playing
      </button>
    </div>
  )
}

SearchBar.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchQueryChange: PropTypes.func.isRequired,
  onSearchSubmit: PropTypes.func.isRequired,
  onNowPlaying: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
}

export default SearchBar
