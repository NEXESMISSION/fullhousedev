'use client'

import { useState, useEffect, useRef } from 'react'
import { ar as t } from '@/lib/translations'
import { useGoogleMaps } from '@/lib/hooks/useGoogleMaps'

interface LocationPickerProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
}

export default function LocationPicker({ value, onChange, required }: LocationPickerProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const mapLoaded = useGoogleMaps()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value)
        setLocation(parsed)
      } catch {
        setLocation(null)
      }
    } else {
      setLocation(null)
    }
  }, [value])

  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      // Initialize map with Tunisia as default center
      const tunisiaCenter = { lat: 33.8869, lng: 10.1218 } // Tunis, Tunisia
      const initialCenter = location ? { lat: location.lat, lng: location.lng } : tunisiaCenter
      
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: initialCenter,
          zoom: location ? 15 : 7, // Zoom in if location exists, otherwise show Tunisia
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        })

        markerRef.current = new window.google.maps.Marker({
          map: mapInstanceRef.current,
          position: initialCenter,
          draggable: true,
        })

        mapInstanceRef.current.addListener('click', (e: any) => {
          const newLocation = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          }
          updateLocation(newLocation)
        })

        markerRef.current.addListener('dragend', (e: any) => {
          const newLocation = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          }
          updateLocation(newLocation)
        })
      } else if (location) {
        mapInstanceRef.current.setCenter({ lat: location.lat, lng: location.lng })
        mapInstanceRef.current.setZoom(15)
        markerRef.current.setPosition({ lat: location.lat, lng: location.lng })
      }
    }
  }, [mapLoaded, location])

  const updateLocation = async (loc: { lat: number; lng: number }) => {
    setLocation(loc)
    const valueStr = JSON.stringify(loc)
    onChange(valueStr)

    // Get address using Geocoding
    if (window.google) {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ location: loc }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address
          const locationWithAddress = { ...loc, address }
          setLocation(locationWithAddress)
          onChange(JSON.stringify(locationWithAddress))
        }
      })
    }
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('المتصفح لا يدعم تحديد الموقع')
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        updateLocation(loc)
        setLoading(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('فشل الحصول على موقعك الحالي')
        setLoading(false)
      }
    )
  }

  const handleSelectCustomLocation = () => {
    // Map is already initialized in useEffect, just focus on it
    if (mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>جاري التحميل...</span>
            </>
          ) : (
            <>
              <span>📍</span>
              <span>{t.useCurrentLocation}</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleSelectCustomLocation}
          className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
        >
          <span>🗺️</span>
          <span>{t.selectCustomLocation}</span>
        </button>
      </div>

      {location && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
            <span>✅</span>
            {t.locationSelected}
          </p>
          {location.address && (
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-medium">{t.address}:</span> {location.address}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <span className="font-medium">{t.latitude}:</span> {location.lat.toFixed(6)}
            </div>
            <div>
              <span className="font-medium">{t.longitude}:</span> {location.lng.toFixed(6)}
            </div>
          </div>
        </div>
      )}

      <div 
        ref={mapRef} 
        className="w-full h-64 sm:h-80 rounded-xl border-2 border-gray-200 overflow-hidden"
        style={{ minHeight: '256px' }}
      >
        {!mapLoaded && (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">جاري تحميل الخريطة...</p>
            </div>
          </div>
        )}
      </div>

      {location && (
        <div className="text-xs text-gray-500">
          💡 انقر على الخريطة أو اسحب العلامة لتغيير الموقع
        </div>
      )}
    </div>
  )
}

