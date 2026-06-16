import { useEffect, useMemo, useState } from 'react'
import './App.css'
import Footer from './components/Footer'
import Header from './components/Header'
import MovieList from './components/movie/MovieList'
import MovieModal from './components/movie/MovieModal'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

const App = () => {
  const [selectedMovieId, setSelectedMovieId] = useState(null)
  const [selectedMovieDetails, setSelectedMovieDetails] = useState(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [detailsError, setDetailsError] = useState(null)
  const [movies, setMovies] = useState([])
  const [favoriteMovieIds, setFavoriteMovieIds] = useState([])
  const [sortOption, setSortOption] = useState('popularity.desc') 

  const sortedMovies = useMemo(() => {
    const sorted = [...movies]

    switch (sortOption) {
      case 'title.asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'release_date.desc':
        sorted.sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
        break
      case 'vote_average.desc':
        sorted.sort((a, b) => b.vote_average - a.vote_average)
        break
      case 'popularity.desc':
      default:
        sorted.sort((a, b) => b.popularity - a.popularity)
        break
    }

    return sorted
  }, [movies, sortOption])

  useEffect(() => {
    const apiKey = import.meta.env.VITE_API_KEY

    if (!selectedMovieId) {
      setSelectedMovieDetails(null)
      setDetailsError(null)
      setIsLoadingDetails(false)
      return
    }

    if (!apiKey) {
      setDetailsError('Missing TMDb API key. Add VITE_API_KEY to a .env file.')
      return
    }

    const fetchMovieDetails = async () => {
      setIsLoadingDetails(true)
      setDetailsError(null)

      try {
        const response = await fetch(
          `${TMDB_BASE_URL}/movie/${selectedMovieId}?api_key=${apiKey}&language=en-US`
        )

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Movie details not found (404).')
          }
          if (response.status === 401 || response.status === 403) {
            throw new Error('Unauthorized request (401/403). Check your API key.')
          }
          throw new Error(`TMDb request failed (${response.status}).`)
        }

        const data = await response.json()
        setSelectedMovieDetails(data)
      } catch (error) {
        if (error instanceof TypeError) {
          setDetailsError('Network failure while loading movie details.')
        } else {
          setDetailsError(error.message || 'Failed to load movie details.')
        }
      } finally {
        setIsLoadingDetails(false)
      }
    }

    fetchMovieDetails()
  }, [selectedMovieId])

  const handleCloseModal = () => {
    setSelectedMovieId(null)
  }

  const handleToggleFavorite = (movieId) => {
    setFavoriteMovieIds((previousIds) =>
      previousIds.includes(movieId)
        ? previousIds.filter((id) => id !== movieId)
        : [...previousIds, movieId]
    )
  }

  return (
    <div className="App">
      <Header />
      <MovieList
        onMovieSelect={setSelectedMovieId}
        movies={sortedMovies}
        onMoviesChange={setMovies}
        sortOption={sortOption}
        onSortChange={setSortOption}
        favoriteMovieIds={favoriteMovieIds}
        onToggleFavorite={handleToggleFavorite}
      />
      <MovieModal
        isOpen={selectedMovieId !== null}
        movieDetails={selectedMovieDetails}
        isLoadingDetails={isLoadingDetails}
        detailsError={detailsError}
        onClose={handleCloseModal}
      />
      <Footer />
    </div>
  )
}

export default App
