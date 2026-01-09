import Link from 'next/link';
import { BookOpen, Github, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary-400" />
              <span className="text-lg font-bold text-white">Book Explorer</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              A demonstration project showcasing ethical web scraping and modern
              full-stack development. All book data is sourced from World of Books.
            </p>
            <p className="text-xs text-gray-500">
              This project is for educational purposes only.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-primary-400 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-primary-400 transition-colors">
                  All Books
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary-400 transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Information</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about#ethical-scraping" className="hover:text-primary-400 transition-colors">
                  Ethical Scraping
                </Link>
              </li>
              <li>
                <a
                  href="https://www.worldofbooks.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-400 transition-colors"
                >
                  World of Books ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Book Explorer Demo. For educational purposes only.
          </p>
          <p className="text-sm text-gray-500 flex items-center mt-4 md:mt-0">
            Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> using Next.js & NestJS
          </p>
        </div>
      </div>
    </footer>
  );
}
