'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    __sbcPlausibleInitialized?: boolean
  }
}

interface Props {
  domain: string
}

export function PlausibleTracker({ domain }: Props) {
  useEffect(() => {
    if (window.location.hostname !== domain || window.__sbcPlausibleInitialized) {
      return
    }

    let cancelled = false

    void import('@plausible-analytics/tracker').then(({ init }) => {
      if (cancelled || window.__sbcPlausibleInitialized) {
        return
      }

      init({ domain })
      window.__sbcPlausibleInitialized = true
    })

    return () => {
      cancelled = true
    }
  }, [domain])

  return null
}
