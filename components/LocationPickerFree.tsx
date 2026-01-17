'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ar as t } from '@/lib/translations'

// Dynamically import map components only on client side
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })

// CSS will be loaded when the component mounts on client

// Create a separate component for map events that only renders on client
const MapClickHandler = dynamic(() => {
  if (typeof window === 'undefined') {
    return Promise.resolve(() => null)
  }
  
  return import('react-leaflet').then(({ useMapEvents }) => {
    return ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
      useMapEvents({
        click: (e: any) => {
          onLocationSelect(e.latlng.lat, e.latlng.lng)
        },
      })
      return null
    }
  })
}, { ssr: false })

interface LocationPickerProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
}

export default function LocationPickerFree({ value, onChange, required }: LocationPickerProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [markerIcon, setMarkerIcon] = useState<any>(undefined)

  // Tunisia center coordinates
  const tunisiaCenter: [number, number] = [33.8869, 10.1218]

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    setIsClient(true)
    
    // Load Leaflet CSS via link tag to avoid HMR issues
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      link.crossOrigin = ''
      document.head.appendChild(link)
    }
    
    // Fix for default marker icon in Next.js
    import('leaflet').then((L) => {
      delete (L.default.Icon.Default.prototype as any)._getIconUrl
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
    }).catch((e) => {
      console.log('Error loading Leaflet:', e)
    })
  }, [])

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

  // Create marker icon when location is available
  useEffect(() => {
    if (isClient && typeof window !== 'undefined' && location) {
      import('leaflet').then((L) => {
        const icon = L.default.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
        setMarkerIcon(icon)
      })
    } else {
      setMarkerIcon(undefined)
    }
  }, [isClient, location])

  const handleLocationSelect = async (lat: number, lng: number) => {
    const loc = { lat, lng }
    setLocation(loc)
    onChange(JSON.stringify(loc))

    // Try to get address using Nominatim (OpenStreetMap geocoding - free)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
        {
          headers: {
            'User-Agent': 'FormBuilder/1.0'
          }
        }
      )
      const data = await response.json()
      if (data.display_name) {
        const locationWithAddress = { ...loc, address: data.display_name }
        setLocation(locationWithAddress)
        onChange(JSON.stringify(locationWithAddress))
      }
    } catch (error) {
      console.log('Could not fetch address:', error)
    }
  }

  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
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
        handleLocationSelect(loc.lat, loc.lng)
        setLoading(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('فشل الحصول على موقعك الحالي')
        setLoading(false)
      }
    )
  }

  const initialCenter: [number, number] = location 
    ? [location.lat, location.lng] 
    : tunisiaCenter

  if (!isClient) {
    return (
      <div className="mt-2 w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-200">
        <p className="text-gray-500">جاري تحميل الخريطة...</p>
      </div>
    )
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
              <span>{t.useCurrentLocation || 'استخدام موقعي الحالي'}</span>
            </>
          )}
        </button>
        <div className="flex-1 px-4 py-2.5 bg-green-50 text-green-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border-2 border-green-200">
          <span>🗺️</span>
          <span>انقر على الخريطة لاختيار الموقع</span>
        </div>
      </div>

      {location && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
            <span>✅</span>
            {t.locationSelected || 'تم اختيار الموقع'}
          </p>
          {location.address && (
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-medium">{t.address || 'العنوان'}:</span> {location.address}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <span className="font-medium">{t.latitude || 'خط العرض'}:</span> {location.lat.toFixed(6)}
            </div>
            <div>
              <span className="font-medium">{t.longitude || 'خط الطول'}:</span> {location.lng.toFixed(6)}
            </div>
          </div>
        </div>
      )}

      <div className="w-full h-64 rounded-xl overflow-hidden border-2 border-gray-200">
        {isClient && (
          <MapContainer
            center={initialCenter}
            zoom={location ? 15 : 7}
            style={{ height: '100%', width: '100%' }}
            key={location ? `${location.lat}-${location.lng}` : 'default'}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapClickHandler onLocationSelect={handleLocationSelect} />
            {location && markerIcon && (
              <Marker position={[location.lat, location.lng]} icon={markerIcon}>
              </Marker>
            )}
          </MapContainer>
        )}
      </div>
    </div>
  )
}