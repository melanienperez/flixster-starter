import { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import MovieCard from './MovieCard'
import SearchBar from '../search/SearchBar'
import SortControl from '../sort/SortControl'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'
const normalizeMovies = (results) =>
  (results || []).map((movie) => ({
    id: movie.id,
    title: movie.title || movie.original_title || 'Untitled movie',
    posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : '',
    releaseDate: movie.release_date || 'Unknown release date',
    voteAverage: typeof movie.vote_average === 'number' ? movie.vote_average : 0,
    release_date: movie.release_date || '',
    vote_average: typeof movie.vote_average === 'number' ? movie.vote_average : 0,
    popularity: typeof movie.popularity === 'number' ? movie.popularity : 0,
    overview: movie.overview || '',
  }))

const MovieList = ({ onMovieSelect, movies, onMoviesChange, sortOption, onSortChange }) => {
  const [fetchedMovies, setFetchedMovies] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeMode, setActiveMode] = useState('nowPlaying')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMovies = useCallback(async ({ mode, query = '', page = 1, append = false }) => {
    const apiKey = import.meta.env.VITE_API_KEY

    if (!apiKey) {
      setError('Missing TMDb API key. Add VITE_API_KEY to a .env file.')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const endpoint =
        mode === 'search'
          ? `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}`
          : `${TMDB_BASE_URL}/movie/now_playing?api_key=${apiKey}&page=${page}&language=en-US`

      const response = await fetch(endpoint)

      if (!response.ok) {
        throw new Error(`TMDb request failed (${response.status})`)
      }

      const data = await response.json()
      const normalizedMovies = normalizeMovies(data.results)

      setTotalPages(data.total_pages || 1)
      setCurrentPage(page)
      setFetchedMovies((previousMovies) =>
        append ? [...previousMovies, ...normalizedMovies] : normalizedMovies
      )
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to load movies.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMovies({ mode: 'nowPlaying', page: 1 })
  }, [fetchMovies])

  useEffect(() => {
    if (activeMode === 'search' && searchQuery.trim() === '') {
      setActiveMode('nowPlaying')
      fetchMovies({ mode: 'nowPlaying', page: 1, append: false })
    }
  }, [activeMode, fetchMovies, searchQuery])

  useEffect(() => {
    onMoviesChange(fetchedMovies)
  }, [fetchedMovies, onMoviesChange])

  const handleSearchSubmit = () => {
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) {
      return
    }

    setActiveMode('search')
    fetchMovies({ mode: 'search', query: trimmedQuery, page: 1, append: false })
  }

  const handleNowPlaying = () => {
    setSearchQuery('')
    setActiveMode('nowPlaying')
    fetchMovies({ mode: 'nowPlaying', page: 1, append: false })
  }

  const handleLoadMore = () => {
    const nextPage = currentPage + 1
    if (nextPage > totalPages) {
      return
    }

    if (activeMode === 'search') {
      fetchMovies({ mode: 'search', query: searchQuery.trim(), page: nextPage, append: true })
      return
    }
    fetchMovies({ mode: 'nowPlaying', page: nextPage, append: true })
  }

  const hasMorePages = currentPage < totalPages
  const displayedMovies = movies || fetchedMovies

  return (
    <section aria-label="Movies">
      <SearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onNowPlaying={handleNowPlaying}
        isLoading={isLoading}
      />
      <SortControl sortOption={sortOption} onSortChange={onSortChange} />

      {isLoading && displayedMovies.length === 0 ? <p>Loading movies...</p> : null}
      {error ? <p>{error}</p> : null}
      {!isLoading && !error && displayedMovies.length === 0 ? <p>No movies found.</p> : null}

      <div className="movie-list">
        {displayedMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onSelect={onMovieSelect} />
        ))}
      </div>

      {displayedMovies.length > 0 ? (
        <button
          className="load-more-button"
          type="button"
          onClick={handleLoadMore}
          disabled={isLoading || !hasMorePages}
        >
          {hasMorePages ? 'Load More' : 'No More Results'}
        </button>
      ) : null}
    </section>
  )
}

MovieList.propTypes = {
  onMovieSelect: PropTypes.func.isRequired,
  movies: PropTypes.arrayOf(PropTypes.object),
  onMoviesChange: PropTypes.func,
  sortOption: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
}

MovieList.defaultProps = {
  movies: null,
  onMoviesChange: () => {},
}

export default MovieList
