import { useEffect, useState } from 'react'

let mapsScriptLoaded = false
let mapsScriptLoading = false
const loadingCallbacks: Array<() => void> = []

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // If already loaded and Map constructor is available
    if (window.google?.maps?.Map) {
      setIsLoaded(true)
      return
    }

    // If already loading, add callback
    if (mapsScriptLoading) {
      loadingCallbacks.push(() => setIsLoaded(true))
      return
    }

    // If script already exists in DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      mapsScriptLoading = true
      existingScript.addEventListener('load', () => {
        mapsScriptLoaded = true
        mapsScriptLoading = false
        setIsLoaded(true)
        loadingCallbacks.forEach(cb => cb())
        loadingCallbacks.length = 0
      })
      return
    }

    // Start loading
    mapsScriptLoading = true
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    
    if (!apiKey) {
      console.error('[Google Maps] API Key is missing. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local')
      mapsScriptLoading = false
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=ar&loading=async`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      // Wait a bit to ensure Google Maps is fully initialized
      const checkGoogleMaps = () => {
        if (window.google?.maps?.Map) {
          mapsScriptLoaded = true
          mapsScriptLoading = false
          setIsLoaded(true)
          loadingCallbacks.forEach(cb => cb())
          loadingCallbacks.length = 0
        } else {
          // Retry after a short delay
          setTimeout(checkGoogleMaps, 100)
        }
      }
      checkGoogleMaps()
    }

    script.onerror = () => {
      console.error('[Google Maps] Failed to load script')
      mapsScriptLoading = false
      loadingCallbacks.length = 0
    }

    document.head.appendChild(script)
  }, [])

  return isLoaded
}

