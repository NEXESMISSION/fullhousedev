'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ar as t } from '@/lib/translations'

// Fix for default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Create numbered marker icon
function createNumberedIcon(number: number) {
  return L.divIcon({
    className: 'custom-numbered-marker',
    html: `<div style="
      background-color: #3b82f6;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    ">${number}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

interface Location {
  lat: number
  lng: number
  address?: string
  formName: string
  submissionId: string
  createdAt: string
  fieldLabel: string
}

interface TunisiaMapFreeProps {
  locations: Location[]
}

function FitBounds({ locations }: { locations: Location[] }) {
  const map = useMap()
  
  useEffect(() => {
    if (locations.length === 0) {
      // Always show all of Tunisia if no locations
      const tunisiaBounds = L.latLngBounds(
        [30.2, 7.5], // Southwest corner
        [37.3, 11.6]  // Northeast corner
      )
      map.fitBounds(tunisiaBounds, { padding: [20, 20] })
    } else if (locations.length === 1) {
      // If only one location, center on it with zoom
      map.setView([locations[0].lat, locations[0].lng], 12)
    } else {
      // Fit bounds to show all locations
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng] as [number, number]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [locations, map])
  
  return null
}

export default function TunisiaMapFree({ locations }: TunisiaMapFreeProps) {
  const [mapReady, setMapReady] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [locationType, setLocationType] = useState<'all' | 'current' | 'desired'>('all')
  const tunisiaCenter: [number, number] = [33.8869, 10.1218]

  // Filter locations based on selected type
  const currentLocationLabel = 'موقع السكن الحالي'
  const desiredLocationLabel = 'الموقع المرغوب لاقتناء المسكن'
  
  const filteredLocations = locations.filter(loc => {
    if (locationType === 'all') return true
    if (locationType === 'current') return loc.fieldLabel === currentLocationLabel
    if (locationType === 'desired') return loc.fieldLabel === desiredLocationLabel
    return true
  })

  useEffect(() => {
    setMapReady(true)
  }, [])

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // Enter fullscreen
      const elem = document.documentElement
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if ((elem as any).webkitRequestFullscreen) {
        ;(elem as any).webkitRequestFullscreen()
      } else if ((elem as any).msRequestFullscreen) {
        ;(elem as any).msRequestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        ;(document as any).webkitExitFullscreen()
      } else if ((document as any).msExitFullscreen) {
        ;(document as any).msExitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!(document as any).webkitFullscreenElement || !!(document as any).msFullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('msfullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6'}`}>
      <div className={`${isFullscreen ? 'h-full w-full' : 'max-w-7xl mx-auto'}`}>
        {/* Header */}
        {!isFullscreen && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              خريطة المواقع - تونس
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              عرض جميع المواقع المحددة في النماذج على خريطة تونس
            </p>
            
            {/* Location Type Filter Buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">عرض:</span>
              </div>
              <button
                onClick={() => setLocationType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  locationType === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                الكل ({locations.length})
              </button>
              <button
                onClick={() => setLocationType('current')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  locationType === 'current'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                موقع السكن الحالي ({locations.filter(l => l.fieldLabel === currentLocationLabel).length})
              </button>
              <button
                onClick={() => setLocationType('desired')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  locationType === 'desired'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                الموقع المرغوب ({locations.filter(l => l.fieldLabel === desiredLocationLabel).length})
              </button>
            </div>
            
            <div className="mt-4 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">موقع محدد</span>
              </div>
              <div className="text-sm text-gray-600">
                <strong>عدد المواقع المعروضة:</strong> {filteredLocations.length}
              </div>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className={`relative bg-white ${isFullscreen ? 'h-full w-full' : 'rounded-2xl shadow-lg border border-gray-200 overflow-hidden'}`}>
          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 left-4 z-[1000] bg-white hover:bg-gray-100 text-gray-700 rounded-lg shadow-lg border border-gray-300 p-2.5 sm:p-3 transition-all duration-200 flex items-center justify-center gap-2"
            title={isFullscreen ? 'إغلاق ملء الشاشة' : 'ملء الشاشة'}
          >
            {isFullscreen ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-xs sm:text-sm font-medium">إغلاق</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span className="text-xs sm:text-sm font-medium">ملء الشاشة</span>
              </>
            )}
          </button>
          {mapReady ? (
            <MapContainer
              center={tunisiaCenter}
              zoom={7}
              minZoom={6}
              maxZoom={18}
              style={{ height: isFullscreen ? '100vh' : '600px', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds locations={filteredLocations} />
              {filteredLocations.map((location, index) => (
                <Marker 
                  key={index} 
                  position={[location.lat, location.lng]}
                  icon={createNumberedIcon(index + 1)}
                >
                  <Popup>
                    <div style={{ direction: 'rtl', textAlign: 'right', minWidth: '200px', padding: '8px' }}>
                      <div style={{ 
                        display: 'inline-block', 
                        backgroundColor: '#3b82f6', 
                        color: 'white', 
                        borderRadius: '50%', 
                        width: '24px', 
                        height: '24px', 
                        textAlign: 'center', 
                        lineHeight: '24px', 
                        fontWeight: 'bold',
                        marginLeft: '8px',
                        fontSize: '12px'
                      }}>
                        {index + 1}
                      </div>
                      <h3 style={{ margin: '8px 0', fontSize: '16px', fontWeight: 'bold', color: '#1f2937', display: 'inline-block' }}>
                        {location.formName}
                      </h3>
                      <div style={{ margin: '4px 0', fontSize: '12px', color: '#6b7280' }}>
                        {location.fieldLabel === currentLocationLabel ? (
                          <span style={{ display: 'inline-block', backgroundColor: '#10b981', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>السكن الحالي</span>
                        ) : (
                          <span style={{ display: 'inline-block', backgroundColor: '#a855f7', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>الموقع المرغوب</span>
                        )}
                      </div>
                      {location.address && (
                        <p style={{ margin: '8px 0', fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
                          {location.address}
                        </p>
                      )}
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                        <p style={{ margin: '4px 0', fontSize: '11px', color: '#6b7280' }}>
                          📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                        </p>
                        <p style={{ margin: '4px 0', fontSize: '11px', color: '#9ca3af' }}>
                          📅 {new Date(location.createdAt).toLocaleDateString('ar-TN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="w-full h-[600px] flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">جاري تحميل الخريطة...</p>
              </div>
            </div>
          )}
        </div>

        {/* Locations List - Simplified Table View - Hide in fullscreen */}
        {!isFullscreen && filteredLocations.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">قائمة المواقع ({filteredLocations.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">#</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">النموذج</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">العنوان</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">الإحداثيات</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLocations.map((location, index) => (
                    <tr 
                      key={index}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-gray-900">{location.formName}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {location.fieldLabel === currentLocationLabel ? (
                            <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 rounded">السكن الحالي</span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 rounded">الموقع المرغوب</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-700 max-w-xs">
                          {location.address ? (
                            <span className="line-clamp-2">{location.address}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs text-gray-600">
                          <div>📍 {location.lat.toFixed(6)}</div>
                          <div>📍 {location.lng.toFixed(6)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs text-gray-500">
                          {new Date(location.createdAt).toLocaleDateString('ar-TN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!isFullscreen && filteredLocations.length === 0 && locations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center mt-6">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 text-lg">لا توجد مواقع لعرضها للتصفية المختارة</p>
            <p className="text-gray-500 text-sm mt-2">جرب تغيير نوع الموقع لعرض مواقع أخرى</p>
          </div>
        )}

        {!isFullscreen && locations.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center mt-6">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-gray-600 text-lg">لا توجد مواقع محددة بعد</p>
            <p className="text-gray-500 text-sm mt-2">ابدأ بإنشاء نماذج مع حقول موقع للحصول على بيانات على الخريطة</p>
          </div>
        )}
      </div>
    </div>
  )
}
