import PropTypes from 'prop-types'

const Logo = ({ className }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 240 160"
      role="img"
      aria-label="QueuedUp"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/*
        Flat line-art DVD player, à la the reference:
        - thick dark outlines
        - pink fill (uses the app's red palette)
        - a disc rising out of the top
        - "QueuedUp" sits inside the white tray window
        - round buttons on the face
      */}
      <g
        stroke="var(--rb-charcoal)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="var(--rb-red)"
      >
        {/* Disc poking up behind the player */}
        <circle cx="78" cy="58" r="44" />
        <circle cx="78" cy="58" r="20" fill="var(--rb-white)" />
        <circle cx="78" cy="58" r="6" fill="var(--rb-charcoal)" stroke="none" />

        {/* Player body */}
        <rect x="14" y="84" width="212" height="56" rx="8" />

        {/* Feet */}
        <path d="M44 140 v10 h26 v-10" fill="none" />
        <path d="M170 140 v10 h26 v-10" fill="none" />

        {/* Tray / display window */}
        <rect x="60" y="98" width="110" height="30" rx="5" fill="var(--rb-white)" />

        {/* Left eject button */}
        <rect x="26" y="106" width="22" height="14" rx="6" fill="var(--rb-white)" />

        {/* Round control buttons — 2x2 grid, evenly inset from the body edges */}
        <g fill="var(--rb-charcoal)" stroke="none">
          <circle cx="184" cy="103" r="6" />
          <circle cx="204" cy="103" r="6" />
          <circle cx="184" cy="121" r="6" />
          <circle cx="204" cy="121" r="6" />
        </g>
      </g>

      {/* Brand text inside the tray window */}
      <text
        x="115"
        y="119"
        textAnchor="middle"
        fontFamily="'Trebuchet MS', 'Segoe UI', Helvetica, Arial, sans-serif"
        fontSize="20"
        fontWeight="800"
        letterSpacing="-0.5"
      >
        <tspan fill="var(--rb-red)">Queued</tspan>
        <tspan fill="var(--rb-charcoal)">Up</tspan>
      </text>
    </svg>
  )
}

Logo.propTypes = {
  className: PropTypes.string,
}

Logo.defaultProps = {
  className: '',
}

export default Logo
