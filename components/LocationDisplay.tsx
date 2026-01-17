'use client'

import { useEffect, useRef, useState } from 'react'
import { ar as t } from '@/lib/translations'
import { useGoogleMaps } from '@/lib/hooks/useGoogleMaps'

interface LocationDisplayProps {
  value: string
  fieldLabel: string
}

export default function LocationDisplay({ value, fieldLabel }: LocationDisplayProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null)
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
    if (mapLoaded && mapRef.current && location && !mapInstanceRef.current && window.google?.maps?.Map) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: location.lat, lng: location.lng },
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      })

      markerRef.current = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: mapInstanceRef.current,
        title: fieldLabel,
      })
    } else if (mapInstanceRef.current && location) {
      mapInstanceRef.current.setCenter({ lat: location.lat, lng: location.lng })
      markerRef.current?.setPosition({ lat: location.lat, lng: location.lng })
    }
  }, [mapLoaded, location, fieldLabel])

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

      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-xl border-2 border-gray-200 overflow-hidden"
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
    </div>
  )
}

