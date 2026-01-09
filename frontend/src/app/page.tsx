import Link from 'next/link';
import { getNavigation } from '@/lib/api';
import { NavigationCard } from '@/components/navigation/navigation-card';
import { HeroSection } from '@/components/home/hero-section';

export default async function HomePage() {
  const navigation = await getNavigation();

  return (
    <div className="space-y-12">
      <HeroSection />

      <section>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Browse by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our extensive collection of second-hand books across various categories.
            Find your next great read at amazing prices.
          </p>
        </div>

        {navigation.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Loading categories... The first load may take a moment as we fetch fresh data.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {navigation.map((item) => (
              <NavigationCard key={item.id} navigation={item} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-lg p-8 shadow-sm">
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            About This Project
          </h3>
          <p className="text-gray-600 max-w-3xl mx-auto mb-6">
            This is a demonstration of a production-minded product exploration platform
            that scrapes and displays books from World of Books. Built with Next.js,
            NestJS, and ethical scraping practices.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            Learn more about this project →
          </Link>
        </div>
      </section>
    </div>
  );
}
