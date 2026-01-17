'use client'

import { useEffect, useRef } from 'react'
import { ar as t } from '@/lib/translations'
import { useGoogleMaps } from '@/lib/hooks/useGoogleMaps'

interface Location {
  lat: number
  lng: number
  address?: string
  formName: string
  submissionId: string
  createdAt: string
}

interface TunisiaMapProps {
  locations: Location[]
}

export default function TunisiaMap({ locations }: TunisiaMapProps) {
  const mapLoaded = useGoogleMaps()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (mapLoaded && mapRef.current && window.google?.maps?.Map) {
      // Tunisia center coordinates
      const tunisiaCenter = { lat: 33.8869, lng: 10.1218 }

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: tunisiaCenter,
          zoom: 7, // Show all of Tunisia
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        })

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow()

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null))
        markersRef.current = []

        // Add markers for each location
        locations.forEach((location, index) => {
          const marker = new window.google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: mapInstanceRef.current,
            title: location.formName,
            animation: window.google.maps.Animation.DROP,
          })

          // Create info window content
          const content = `
            <div style="padding: 10px; min-width: 200px; direction: rtl; text-align: right;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1f2937;">
                ${location.formName}
              </h3>
              ${location.address ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #4b5563;">${location.address}</p>` : ''}
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">
                <strong>خط العرض:</strong> ${location.lat.toFixed(6)}
              </p>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">
                <strong>خط الطول:</strong> ${location.lng.toFixed(6)}
              </p>
              <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                ${new Date(location.createdAt).toLocaleDateString('ar-TN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          `

          marker.addListener('click', () => {
            infoWindow.setContent(content)
            infoWindow.open(mapInstanceRef.current, marker)
          })

          markersRef.current.push(marker)
        })

        // Fit bounds to show all markers
        if (locations.length > 0) {
          const bounds = new window.google.maps.LatLngBounds()
          locations.forEach(location => {
            bounds.extend(new window.google.maps.LatLng(location.lat, location.lng))
          })
          mapInstanceRef.current.fitBounds(bounds)
          
          // Don't zoom in too much if there's only one location
          if (locations.length === 1) {
            mapInstanceRef.current.setZoom(15)
          }
        }
      }
    }
  }, [mapLoaded, locations])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            خريطة المواقع - تونس
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            عرض جميع المواقع المحددة في النماذج على خريطة تونس
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">موقع محدد</span>
            </div>
            <div className="text-sm text-gray-600">
              <strong>عدد المواقع:</strong> {locations.length}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div 
            ref={mapRef} 
            className="w-full h-[600px] sm:h-[700px]"
            style={{ minHeight: '600px' }}
          >
            {!mapLoaded && (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg">جاري تحميل الخريطة...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Locations List */}
        {locations.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">قائمة المواقع</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((location, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-blue-300 transition-all cursor-pointer"
                  onClick={() => {
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setCenter({ lat: location.lat, lng: location.lng })
                      mapInstanceRef.current.setZoom(15)
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{location.formName}</h3>
                      {location.address && (
                        <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                      )}
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>خط العرض: {location.lat.toFixed(6)}</div>
                        <div>خط الطول: {location.lng.toFixed(6)}</div>
                        <div>
                          {new Date(location.createdAt).toLocaleDateString('ar-TN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {locations.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-gray-600 text-lg">لا توجد مواقع محددة بعد</p>
            <p className="text-gray-500 text-sm mt-2">ابدأ بإنشاء نماذج مع حقول موقع للحصول على بيانات على الخريطة</p>
          </div>
        )}
      </div>
    </div>
  )
}

