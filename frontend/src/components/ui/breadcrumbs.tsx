import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm">
      <Link
        href="/"
        className="text-gray-500 hover:text-primary-600 transition-colors"
        aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </Link>

      {items.slice(1).map((item, index) => (
        <div key={item.href} className="flex items-center">
          <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
          {index === items.length - 2 ? (
            <span className="text-gray-900 font-medium truncate max-w-[200px]">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="text-gray-500 hover:text-primary-600 transition-colors truncate max-w-[200px]"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
