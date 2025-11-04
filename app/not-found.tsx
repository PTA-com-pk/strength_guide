import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <Image
            src="/logo.png"
            alt="StrengthGuide Logo"
            width={200}
            height={120}
            className="mx-auto mb-8"
            priority
          />
          <h1 className="text-9xl font-black text-primary-600 mb-4">404</h1>
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or doesn't exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/articles"
            className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition-colors"
          >
            Browse Articles
          </Link>
          <Link
            href="/tools"
            className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition-colors"
          >
            Fitness Tools
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-black text-gray-900 mb-4">
            Popular Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <Link
              href="/category/muscle-building"
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <h4 className="font-bold text-gray-900 mb-1">Muscle Building</h4>
              <p className="text-sm text-gray-600">Expert tips and workouts</p>
            </Link>
            <Link
              href="/category/fat-loss"
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <h4 className="font-bold text-gray-900 mb-1">Fat Loss</h4>
              <p className="text-sm text-gray-600">Nutrition and training guides</p>
            </Link>
            <Link
              href="/category/nutrition"
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <h4 className="font-bold text-gray-900 mb-1">Nutrition</h4>
              <p className="text-sm text-gray-600">Diet plans and meal ideas</p>
            </Link>
            <Link
              href="/category/training"
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <h4 className="font-bold text-gray-900 mb-1">Training</h4>
              <p className="text-sm text-gray-600">Workout routines and programs</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


