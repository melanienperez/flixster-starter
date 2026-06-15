import PropTypes from 'prop-types'

const SortControl = ({ sortOption, onSortChange }) => {
  return (
    <div className="sort-control">
      <label htmlFor="sort-control-select">Sort by:</label>
      <select
        id="sort-control-select"
        value={sortOption}
        onChange={(event) => onSortChange(event.target.value)}
      >
        <option value="popularity.desc">Popularity</option>
        <option value="vote_average.desc">Vote Average (Highest)</option>
        <option value="release_date.desc">Release Date (Newest)</option>
        <option value="title.asc">Title (A-Z)</option>
      </select>
    </div>
  )
}

SortControl.propTypes = {
  sortOption: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
}

export default SortControl
