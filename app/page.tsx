import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Form Builder Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create dynamic forms and manage submissions
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/admin"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Admin Dashboard
            </Link>
            <Link
              href="/admin/forms"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Manage Forms
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
