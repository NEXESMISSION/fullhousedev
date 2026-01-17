'use client'

import { useState } from 'react'

interface MediaDisplayProps {
  mediaType: 'none' | 'image' | 'video' | 'logo'
  mediaUrl: string | null
  formName: string
}

export default function MediaDisplay({ mediaType, mediaUrl, formName }: MediaDisplayProps) {
  const [imageError, setImageError] = useState(false)

  if (mediaType === 'none' || !mediaUrl) {
    return null
  }

  // Check if it's a YouTube URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  // Check if it's a Vimeo URL
  const getVimeoId = (url: string) => {
    const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i
    const match = url.match(regExp)
    return match ? match[1] : null
  }

  const youtubeId = getYouTubeId(mediaUrl)
  const vimeoId = getVimeoId(mediaUrl)

  if (mediaType === 'video' && (youtubeId || vimeoId)) {
    return (
      <div className="w-full mb-6 rounded-2xl overflow-hidden shadow-lg">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          {youtubeId ? (
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
              title={formName}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : vimeoId ? (
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://player.vimeo.com/video/${vimeoId}`}
              title={formName}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : null}
        </div>
      </div>
    )
  }

  if (mediaType === 'image' || mediaType === 'logo') {
    if (imageError) {
      return (
        <div className="w-full mb-6 rounded-2xl bg-gray-100 flex items-center justify-center h-48">
          <p className="text-gray-400">فشل تحميل الصورة</p>
        </div>
      )
    }

    return (
      <div className="w-full mb-6 rounded-2xl overflow-hidden shadow-lg">
        <img
          src={mediaUrl}
          alt={formName}
          className={`w-full object-cover ${
            mediaType === 'logo' ? 'h-32 object-contain bg-white' : 'h-64 sm:h-80'
          }`}
          onError={() => setImageError(true)}
        />
      </div>
    )
  }

  if (mediaType === 'video' && !youtubeId && !vimeoId) {
    return (
      <div className="w-full mb-6 rounded-2xl overflow-hidden shadow-lg bg-black">
        <video
          src={mediaUrl}
          controls
          className="w-full h-auto max-h-96"
          onError={(e) => {
            console.error('Video load error:', e)
          }}
        >
          متصفحك لا يدعم تشغيل الفيديو
        </video>
      </div>
    )
  }

  return null
}

