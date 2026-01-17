import { NextResponse } from 'next/server'

export async function GET() {
  const manifest = {
    name: "لوحة التحكم - Forms Builder",
    short_name: "لوحة التحكم",
    description: "إدارة النماذج والإرسالات",
    start_url: "/admin",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    orientation: "portrait",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

