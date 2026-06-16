import './MovieCard.css'
import PropTypes from 'prop-types'

/**
 * @typedef {Object} MovieSummary
 * @property {number} id
 * @property {string} title
 * @property {string} posterUrl
 * @property {string} releaseDate
 * @property {number} voteAverage
 * @property {string} [overview]
 */

/**
 * @param {{ movie: MovieSummary, onSelect: (movieId: number) => void, isFavorite: boolean, onToggleFavorite: (movieId: number) => void }} props
 */
const MovieCard = ({ movie, onSelect, isFavorite, onToggleFavorite }) => {
  return (
    <button
      className={`movie-card ${isFavorite ? 'movie-card--favorite' : ''}`}
      type="button"
      onClick={() => onSelect(movie.id)}
    >
      <img className="movie-card__poster" src={movie.posterUrl} alt={`${movie.title} poster`} />

      <div className="movie-card__content">
        <div className="movie-card__title-row">
          <h3 className="movie-card__title">{movie.title}</h3>
          <button
            className={`movie-card__favorite-button ${
              isFavorite ? 'movie-card__favorite-button--active' : ''
            }`}
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onToggleFavorite(movie.id)
            }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <i className={isFavorite ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} />
          </button>
        </div>

        <p className="movie-card__meta">
          <span>{movie.releaseDate}</span>
          <span>{movie.voteAverage.toFixed(1)}</span>
        </p>

        {movie.overview ? <p className="movie-card__overview">{movie.overview}</p> : null}
      </div>
    </button>
  )
}

MovieCard.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    posterUrl: PropTypes.string.isRequired,
    releaseDate: PropTypes.string.isRequired,
    voteAverage: PropTypes.number.isRequired,
    overview: PropTypes.string,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  isFavorite: PropTypes.bool.isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
}

export default MovieCard
