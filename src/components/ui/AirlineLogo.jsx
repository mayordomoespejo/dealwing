const AIRLINE_LOGO_BASE = 'https://content.r9cdn.net/rimg/provider-logos/airlines/v/symbols'

/**
 * Renders an airline logo and hides the image if the asset fails to load.
 *
 * @param {object} props
 * @param {string} [props.code] - airline IATA code used to build the fallback CDN URL
 * @param {string|null} [props.src] - explicit airline logo URL
 * @param {string} props.alt - accessible airline name
 * @param {string} [props.className] - optional CSS class for the image element
 * @returns {JSX.Element | null}
 */
export function AirlineLogo({ code, src, alt, className = '' }) {
  const resolvedSrc = src || (code ? `${AIRLINE_LOGO_BASE}/${code}.png` : '')
  if (!resolvedSrc) return null

  return (
    <img
      className={className}
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
      onError={event => {
        event.currentTarget.style.display = 'none'
      }}
    />
  )
}
