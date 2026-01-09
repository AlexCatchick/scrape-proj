import Link from 'next/link';
import { BookOpen, Search, Menu } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">
              Book Explorer
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/categories"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/products"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              All Books
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Search and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Link
              href="/products"
              className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
              aria-label="Search books"
            >
              <Search className="h-5 w-5" />
            </Link>
            <button
              className="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
