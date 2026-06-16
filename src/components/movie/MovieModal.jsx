import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import './MovieModal.css'

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_MODEL = 'google/gemma-4-26b-a4b-it:free'
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const AI_FALLBACK_MESSAGE =
  "We couldn't generate a recommendation for this one - check out the overview above!"

const MovieModal = ({
  isOpen,
  movieDetails,
  isLoadingDetails,
  detailsError,
  onClose,
}) => {
  const [aiInsight, setAiInsight] = useState(null)
  const [loadingInsight, setLoadingInsight] = useState(false)
  const [trailerKey, setTrailerKey] = useState(null)
  const [loadingTrailer, setLoadingTrailer] = useState(false)

  const getTrailerKey = async (movieId) => {
    const apiKey = import.meta.env.VITE_API_KEY

    if (!apiKey) {
      return null
    }

    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${apiKey}&language=en-US`
      )

      if (!response.ok) {
        throw new Error(`Trailer request failed (${response.status})`)
      }

      const data = await response.json()
      const videos = data?.results || []
      const youtubeVideos = videos.filter((video) => video.site === 'YouTube')

      const officialTrailer = youtubeVideos.find(
        (video) => video.type === 'Trailer' && video.official
      )
      if (officialTrailer?.key) {
        return officialTrailer.key
      }

      const trailer = youtubeVideos.find((video) => video.type === 'Trailer')
      if (trailer?.key) {
        return trailer.key
      }

      return youtubeVideos[0]?.key || null
    } catch (error) {
      console.error('Trailer lookup failed:', error)
      return null
    }
  }

  const getMovieInsight = async (title, genres, overview) => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY

    if (!apiKey) {
      return AI_FALLBACK_MESSAGE
    }

    try {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            {
              role: 'system',
              content:
                'You are an enthusiastic but honest film critic. Write plain text only, 2-3 sentences, with no spoilers, no first-person statements, and no generic filler phrases.',
            },
            {
              role: 'user',
              content: `Write a watch recommendation for this movie.\nTitle: ${title}\nGenres: ${genres}\nOverview: ${overview}\nKeep it specific, concise, and helpful.`,
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenRouter error: ${response.status}`)
      }

      const data = await response.json()
      return data?.choices?.[0]?.message?.content?.trim() || AI_FALLBACK_MESSAGE
    } catch (error) {
      console.error('AI insight failed:', error)
      return AI_FALLBACK_MESSAGE
    }
  }

  useEffect(() => {
    if (!isOpen || !movieDetails) {
      setAiInsight(null)
      setLoadingInsight(false)
      setTrailerKey(null)
      setLoadingTrailer(false)
      return
    }

    const title = movieDetails.title || 'Unknown title'
    const genres =
      movieDetails.genres && movieDetails.genres.length > 0
        ? movieDetails.genres.map((genre) => genre.name).join(', ')
        : 'Unknown'
    const overview = movieDetails.overview || 'No overview available.'

    const runInsight = async () => {
      setLoadingInsight(true)
      const insight = await getMovieInsight(title, genres, overview)
      setAiInsight(insight)
      setLoadingInsight(false)
    }

    runInsight()
  }, [isOpen, movieDetails])

  useEffect(() => {
    if (!isOpen || !movieDetails?.id) {
      setTrailerKey(null)
      setLoadingTrailer(false)
      return
    }

    const runTrailerLookup = async () => {
      setLoadingTrailer(true)
      const key = await getTrailerKey(movieDetails.id)
      setTrailerKey(key)
      setLoadingTrailer(false)
    }

    runTrailerLookup()
  }, [isOpen, movieDetails])

  if (!isOpen) {
    return null
  }

  return (
    <div className="movie-modal__overlay">
      <div className="movie-modal">
        <button type="button" className="load-more-button movie-modal__close" onClick={onClose}>
          Close
        </button>

        {isLoadingDetails ? <p>Loading movie details...</p> : null}
        {detailsError ? <p>{detailsError}</p> : null}

        {!isLoadingDetails && !detailsError && movieDetails ? (
          <div>
            <h2>{movieDetails.title}</h2>
            <div className="movie-modal__details-layout">
              {movieDetails.poster_path ? (
                <img
                  className="movie-modal__poster"
                  src={`${IMAGE_BASE_URL}${movieDetails.poster_path}`}
                  alt={`${movieDetails.title} poster`}
                />
              ) : null}
              <div className="movie-modal__info">
                <p>Release Date: {movieDetails.release_date || 'Unknown'}</p>
                <p>Runtime: {movieDetails.runtime ? `${movieDetails.runtime} minutes` : 'Unknown'}</p>
                <p>Rating: {movieDetails.vote_average ? movieDetails.vote_average.toFixed(1) : 'N/A'}</p>
                <p>
                  Genres:{' '}
                  {movieDetails.genres && movieDetails.genres.length > 0
                    ? movieDetails.genres.map((genre) => genre.name).join(', ')
                    : 'N/A'}
                </p>
                <p>{movieDetails.overview || 'No overview available.'}</p>
                <div>
                  <h3>Watch Recommendation</h3>
                  {loadingInsight ? <p>Getting a recommendation...</p> : <p>{aiInsight || AI_FALLBACK_MESSAGE}</p>}
                </div>
                <div className="movie-modal__trailer">
                  <h3>Trailer</h3>
                  {loadingTrailer ? <p>Loading trailer...</p> : null}
                  {!loadingTrailer && trailerKey ? (
                    <iframe
                      title={`${movieDetails.title} trailer`}
                      src={`https://www.youtube.com/embed/${trailerKey}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : null}
                  {!loadingTrailer && !trailerKey ? <p>Trailer unavailable for this movie.</p> : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

MovieModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  movieDetails: PropTypes.shape({
    title: PropTypes.string,
    id: PropTypes.number,
    poster_path: PropTypes.string,
    release_date: PropTypes.string,
    runtime: PropTypes.number,
    vote_average: PropTypes.number,
    overview: PropTypes.string,
    genres: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
      })
    ),
  }),
  isLoadingDetails: PropTypes.bool.isRequired,
  detailsError: PropTypes.string,
  onClose: PropTypes.func.isRequired,
}

MovieModal.defaultProps = {
  movieDetails: null,
  detailsError: null,
}

export default MovieModal
