import { useState } from 'react'

const AIRLINE_LOGO_CDN = 'https://www.gstatic.com/flights/airline_logos/70px'

/**
 * Renders an airline logo with a text-code fallback if the image fails to load.
 *
 * @param {object} props
 * @param {string} [props.code] - airline IATA code used to build the CDN URL and text fallback
 * @param {string|null} [props.src] - explicit airline logo URL (takes priority)
 * @param {string} props.alt - accessible airline name
 * @param {string} [props.className] - optional CSS class for the image element
 * @returns {JSX.Element | null}
 */
export function AirlineLogo({ code, src, alt, className = '' }) {
  const [failed, setFailed] = useState(false)
  const resolvedSrc = src || (code ? `${AIRLINE_LOGO_CDN}/${code}.png` : '')

  if (!resolvedSrc || failed) {
    if (!code) return null
    return (
      <span
        className={className}
        title={alt}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '9px',
          fontWeight: 700,
          letterSpacing: '0.02em',
          color: 'var(--color-text-secondary)',
          background: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border)',
          borderRadius: '3px',
          width: '18px',
          height: '18px',
          flexShrink: 0,
          userSelect: 'none',
        }}
        aria-label={alt}
      >
        {code}
      </span>
    )
  }

  return (
    <img
      className={className}
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
