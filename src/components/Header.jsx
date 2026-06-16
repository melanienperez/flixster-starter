import Logo from './Logo'

const Header = () => {
  return (
    <header className="app-header">
      <h1 className="app-header__title">
        <Logo className="app-header__logo" />
        <span className="visually-hidden">QueuedUp</span>
      </h1>
      <p className="app-header__tagline">Discover what to watch tonight.</p>
    </header>
  )
}

export default Header
