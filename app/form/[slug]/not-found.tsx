import Link from 'next/link'
import { ar as t } from '@/lib/translations'

export default function FormNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center bg-white rounded-2xl shadow-xl p-8 sm:p-12 max-w-md w-full">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">
          {t.formNotFound}
        </h1>
        <p className="text-base sm:text-xl text-gray-600 mb-8">
          {t.formNotFoundDesc}
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium"
        >
          {t.home}
        </Link>
      </div>
    </div>
  )
}
