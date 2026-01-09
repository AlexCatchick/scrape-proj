import Link from 'next/link';
import { ChevronRight, Folder } from 'lucide-react';
import type { Navigation } from '@/lib/types';

interface NavigationCardProps {
  navigation: Navigation;
}

export function NavigationCard({ navigation }: NavigationCardProps) {
  return (
    <Link
      href={`/categories?navigationId=${navigation.id}`}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
            <Folder className="h-6 w-6 text-primary-600" />
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
          {navigation.title}
        </h3>
        
        <p className="text-sm text-gray-500 mt-2">
          Browse {navigation.title.toLowerCase()} books
        </p>
      </div>
    </Link>
  );
}
