# Flixster Project Spec

## 1) Component Architecture

### Parent-child hierarchy
- `App`
  - `Header`
  - `SearchBar`
  - `SortControl`
  - `MovieList`
    - `MovieCard` (repeated for each movie)
  - `MovieModal` (conditionally rendered when a movie is selected)
  - `Footer`

### Component definitions

#### `App`
- Responsibility: Own global UI state, orchestrate API calls, and coordinate child components.
- Renders: Top-level page layout with `Header`, controls (`SearchBar`, `SortControl`), `MovieList`, conditional `MovieModal`, and `Footer`.
- Props received: None (root component).
- Manages state: Yes (movies, query, page, selected movie, sorting, loading, errors, modal AI text).

#### `Header`
- Responsibility: Display app branding/title and optional context text.
- Renders: App title (for example, "Flixster") and a short subtitle/tagline.
- Props received: `title: string`, `subtitle?: string`.
- Manages state: No.

#### `SearchBar`
- Responsibility: Capture user search input and submit/reset actions.
- Renders: Text input, submit button, and optional clear button.
- Props received: `query: string`, `onQueryChange: (value: string) => void`, `onSearchSubmit: () => void`, `onSearchClear: () => void`, `isLoading: boolean`.
- Manages state: Optional local temporary input state; otherwise controlled entirely by `App`.

#### `SortControl`
- Responsibility: Let user choose sorting for visible movie list.
- Renders: Select/dropdown (for example, "Popularity", "Rating", "Release Date", "Title").
- Props received: `sortOption: SortOption`, `onSortChange: (option: SortOption) => void`.
- Manages state: No (controlled by `App`).

#### `MovieList`
- Responsibility: Render movies in a responsive grid and surface empty/loading/error states from parent data.
- Renders: Grid of `MovieCard` components; empty-state message when no movies.
- Props received: `movies: MovieSummary[]`, `onMovieSelect: (movieId: number) => void`, `isLoading: boolean`, `errorMessage: string | null`.
- Manages state: No.

#### `MovieCard`
- Responsibility: Present summary information for one movie and notify parent when selected.
- Renders: Poster image, title, release date, vote average, and optional overview snippet.
- Props received: `movie: MovieSummary`, `onSelect: (movieId: number) => void`.
- Manages state: No.

#### `MovieModal`
- Responsibility: Show detailed movie info (and later AI insight) for the selected movie.
- Renders: Modal overlay with title, poster/backdrop, runtime, genres, overview, release date, rating, close button, and AI insight section.
- Props received: `isOpen: boolean`, `movieDetails: MovieDetails | null`, `isLoadingDetails: boolean`, `detailsError: string | null`, `aiInsight: string | null`, `isLoadingAi: boolean`, `onClose: () => void`.
- Manages state: No (or minimal UI-only local state such as animation flag).

#### `Footer`
- Responsibility: Show attribution and project metadata.
- Renders: Footer text and TMDb attribution note.
- Props received: `year?: number`.
- Manages state: No.

## 2) API Contracts

Base URL: `https://api.themoviedb.org/3`  
Auth: API key passed as query param (`api_key`) for this project phase.

### A) Now Playing
- Endpoint URL: `GET /movie/now_playing`
- Full URL example: `https://api.themoviedb.org/3/movie/now_playing?api_key=...&page=1`
- Required params:
  - `api_key` (string)
  - `page` (number, default 1)
  - `language` (optional, default `en-US`)
- Response fields used:
  - `results[].id`
  - `results[].title`
  - `results[].poster_path`
  - `results[].release_date`
  - `results[].vote_average`
  - `results[].overview`
  - `results[].popularity` (optional, if used for sorting)
  - `page`, `total_pages` (for pagination behavior)
- Error cases to handle:
  - 401/403 invalid key or auth issue
  - 429 rate-limited
  - 5xx TMDb server failure
  - Network timeout/offline
  - Empty `results` for a valid page

### B) Search Movies
- Endpoint URL: `GET /search/movie`
- Full URL example: `https://api.themoviedb.org/3/search/movie?api_key=...&query=inception&page=1&include_adult=false`
- Required params:
  - `api_key` (string)
  - `query` (string, URL-encoded)
  - `page` (number, default 1)
  - `include_adult` (boolean, default false)
  - `language` (optional)
- Response fields used:
  - Same summary fields as now playing for card rendering:
    - `results[].id`, `title`, `poster_path`, `release_date`, `vote_average`, `overview`, `popularity`
  - `page`, `total_pages`
- Error cases to handle:
  - Empty query (client-side validation before request)
  - 422 invalid query format (if returned)
  - 401/403 auth issues
  - 429 rate-limited
  - 5xx server failure
  - Valid request but zero results

### C) Movie Details (for modal)
- Endpoint URL: `GET /movie/{movie_id}`
- Full URL example: `https://api.themoviedb.org/3/movie/550?api_key=...&language=en-US`
- Required params:
  - Path param: `movie_id` (number)
  - Query param: `api_key` (string)
  - `language` (optional)
- Response fields used:
  - `id`
  - `title`
  - `overview`
  - `runtime`
  - `genres[]` (`id`, `name`)
  - `poster_path`, `backdrop_path`
  - `release_date`
  - `vote_average`
  - `tagline` (optional)
- Error cases to handle:
  - 404 invalid/nonexistent movie id
  - 401/403 auth issues
  - 429 rate-limited
  - 5xx server failure
  - Null/empty detail fields (for example missing runtime/poster)

## 3) State Architecture

For Milestone 2, list/search/pagination state is owned by `MovieList` and passed to child controls/cards.

- `movies: MovieSummary[]`
  - Initial value: `[]`
  - Owner: `App`
  - Updates when: now-playing fetch succeeds, search fetch succeeds, sort option changes (sorted projection), page/query changes.

- `searchQuery: string`
  - Initial value: `""`
  - Owner: `MovieList` (controlled by `SearchBar`)
  - Updates when: user types in search input, clears search, or toggles back to now playing.

- `currentPage: number`
  - Initial value: `1`
  - Owner: `MovieList`
  - Updates when: user clicks Load More (increment), starts a new search (reset to 1), or returns to now playing (reset to 1).

- `totalPages: number`
  - Initial value: `1`
  - Owner: `MovieList`
  - Updates when: TMDb list/search response returns `total_pages`; used to hide/disable Load More when `currentPage >= totalPages`.

- `activeMode: "nowPlaying" | "search"`
  - Initial value: `"nowPlaying"`
  - Owner: `MovieList`
  - Updates when: search submit switches to `"search"`; clearing query or clicking Now Playing switches to `"nowPlaying"`.

- `selectedMovieId: number | null`
  - Initial value: `null`
  - Owner: `App`
  - Updates when: user clicks `MovieCard` (set id), closes modal (set null).

- `selectedMovieDetails: MovieDetails | null`
  - Initial value: `null`
  - Owner: `App`
  - Updates when: details fetch for `selectedMovieId` succeeds, modal closes (clear).

- `sortOption: "popularity.desc" | "vote_average.desc" | "release_date.desc" | "title.asc"`
  - Initial value: `"popularity.desc"`
  - Owner: `App`
  - Updates when: user selects a new value in `SortControl`.

- `isLoadingList: boolean`
  - Initial value: `false`
  - Owner: `App`
  - Updates when: list fetch starts/completes (now playing or search).

- `isLoadingDetails: boolean`
  - Initial value: `false`
  - Owner: `App`
  - Updates when: detail fetch starts/completes for modal.

- `listError: string | null`
  - Initial value: `null`
  - Owner: `App`
  - Updates when: list fetch fails (set error) or retry/success (clear).

- `detailsError: string | null`
  - Initial value: `null`
  - Owner: `App`
  - Updates when: details fetch fails (set error) or modal re-open/success (clear).

- `aiInsight: string | null` (Milestone 8+)
  - Initial value: `null`
  - Owner: `App` (displayed in `MovieModal`)
  - Updates when: AI request returns or when modal closes/selects a new movie (clear/reset).

- `isLoadingAi: boolean` (Milestone 8+)
  - Initial value: `false`
  - Owner: `App`
  - Updates when: AI generation starts/completes/fails.

## 4) Data Flow

On first load, `App` fetches TMDb now-playing movies and stores raw results after a light normalization step into `movies` (for example, mapping `poster_path` to a full poster URL and providing fallbacks for missing values). `App` passes `movies` to `MovieList`, which maps each item into `MovieCard` props for rendering. `SearchBar` updates `searchQuery`; on submit, `App` calls the search endpoint and replaces `movies` with search results. `SortControl` updates `sortOption`, and `App` derives the displayed order (either by sorting in state or via a memoized derived list). When a user clicks a `MovieCard`, it calls `onSelect(movie.id)` back to `App`, which sets `selectedMovieId`; that id triggers a movie-details fetch (`/movie/{id}`), stores `selectedMovieDetails`, and opens `MovieModal` with runtime/genres/overview from the details response.

## 4.1) Responsive Breakpoint Targets (Milestone 3)

- Desktop (`>= 1024px`): 4 movie cards per row with consistent gaps.
- Tablet (`600px - 1023px`): 2 movie cards per row.
- Mobile (`<= 599px`): 1 movie card per row (full-width card slot).

## 5) AI Feature Spec (Pre-Milestone 8 Draft)

- Display location: `MovieModal` (below core movie details in a dedicated "AI Insight" section).
- Input context sent to AI:
  - `title`
  - `genres` (names array)
  - `overview`
  - Optional extras if available: `runtime`, `vote_average`.
- Expected AI output:
  - A concise 2-3 sentence watch recommendation explaining likely audience fit and viewing mood.
  - Tone: helpful, non-spoiler, plain language.
- AI state location:
  - `aiInsight` and `isLoadingAi` in `App`, passed to `MovieModal`.
  - Reset insight when selected movie changes or modal closes.
- Failure behavior:
  - If AI call fails, modal still renders normal movie details and shows a non-blocking "AI insight unavailable" message.