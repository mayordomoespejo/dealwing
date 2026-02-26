import { useEffect } from 'react'

/**
 * Attach a keyboard shortcut listener.
 * @param {string}   key      - e.g. 'Escape', '/', 'k'
 * @param {Function} handler  - callback(event)
 * @param {object}   options  - { ctrl, meta, shift, alt, enabled }
 */
export function useKeyboard(key, handler, { ctrl, meta, shift, alt, enabled = true } = {}) {
  useEffect(() => {
    if (!enabled) return

    function onKeyDown(e) {
      if (ctrl && !e.ctrlKey) return
      if (meta && !e.metaKey) return
      if (shift && !e.shiftKey) return
      if (alt && !e.altKey) return

      // Ignore when typing in inputs/textareas
      const tag = e.target?.tagName?.toLowerCase()
      if (
        key === '/' &&
        (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable)
      )
        return

      if (e.key === key) {
        handler(e)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [key, handler, ctrl, meta, shift, alt, enabled])
}
