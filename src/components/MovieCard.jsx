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
 * @param {{ movie: MovieSummary, onSelect: (movieId: number) => void }} props
 */
const MovieCard = ({ movie, onSelect }) => {
  return (
    <button className="movie-card" type="button" onClick={() => onSelect(movie.id)}>
      <img className="movie-card__poster" src={movie.posterUrl} alt={`${movie.title} poster`} />

      <div className="movie-card__content">
        <h3 className="movie-card__title">{movie.title}</h3>

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
}

export default MovieCard
