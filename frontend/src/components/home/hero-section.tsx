import { BookOpen, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="relative px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/10 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-yellow-300 mr-2" />
            <span className="text-sm text-white">Powered by Ethical Scraping</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Discover Your Next
            <span className="text-yellow-300"> Great Read</span>
          </h1>
          
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Explore thousands of second-hand books from World of Books.
            Find hidden gems at amazing prices across every genre imaginable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/categories"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Browse Categories
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-400 transition-colors border border-primary-400"
            >
              <Search className="h-5 w-5 mr-2" />
              Search Books
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
