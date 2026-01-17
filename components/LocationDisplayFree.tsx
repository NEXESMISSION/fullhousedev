'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { ar as t } from '@/lib/translations'

// Import CSS only - this won't execute on server
if (typeof window !== 'undefined') {
  require('leaflet/dist/leaflet.css')
}

// Dynamically import Leaflet components to prevent SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })

interface LocationDisplayProps {
  value: string
  fieldLabel: string
}

export default function LocationDisplayFree({ value, fieldLabel }: LocationDisplayProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    // Only initialize Leaflet in the browser
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        // Fix for default marker icon in Next.js
        delete (L.default.Icon.Default.prototype as any)._getIconUrl
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })
      })
      setMapReady(true)
    }
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

  if (!location) {
    return (
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm text-gray-500">لا يوجد موقع محدد</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {location.address && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-800 mb-1">{t.address}</p>
          <p className="text-sm text-gray-700">{location.address}</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
        <div>
          <span className="font-medium">{t.latitude}:</span> {location.lat.toFixed(6)}
        </div>
        <div>
          <span className="font-medium">{t.longitude}:</span> {location.lng.toFixed(6)}
        </div>
      </div>

      {mapReady && (
        <div className="w-full h-64 rounded-xl border-2 border-gray-200 overflow-hidden">
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[location.lat, location.lng]} />
          </MapContainer>
        </div>
      )}

      {!mapReady && (
        <div className="w-full h-64 rounded-xl border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">جاري تحميل الخريطة...</p>
          </div>
        </div>
      )}
    </div>
  )
}

