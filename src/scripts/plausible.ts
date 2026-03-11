import { init } from '@plausible-analytics/tracker'

declare global {
  interface Window {
    __sbcPlausibleInitialized?: boolean
  }
}

const siteDomain = document.documentElement.dataset.siteDomain

if (!siteDomain || window.__sbcPlausibleInitialized || window.location.hostname !== siteDomain) {
  // Skip local development, preview hosts, and duplicate initialization.
} else {
  init({ domain: siteDomain })
  window.__sbcPlausibleInitialized = true
}
