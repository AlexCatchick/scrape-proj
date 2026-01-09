import { BookOpen, Shield, Zap, Database, Code, Heart } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Book Explorer',
  description: 'Learn about the Book Explorer project, ethical scraping practices, and technology stack.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          About Book Explorer
        </h1>
        <p className="text-xl text-gray-600">
          A demonstration of production-minded web scraping and modern full-stack development.
        </p>
      </section>

      {/* Project Overview */}
      <section className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Project Overview
        </h2>
        <p className="text-gray-600 mb-4">
          Book Explorer is a product exploration platform that allows users to navigate
          from high-level navigation headings → categories → product grids → product
          detail pages, with all data powered by live, on-demand scraping of World of Books.
        </p>
        <p className="text-gray-600">
          The platform is designed to feel like a modern e-commerce discovery experience
          while being engineered with robust backend systems, ethical scraping practices,
          caching, and scalability in mind.
        </p>
      </section>

      {/* Key Features */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={Zap}
            title="On-Demand Scraping"
            description="Data is fetched dynamically when requested, ensuring fresh content while minimizing unnecessary requests."
          />
          <FeatureCard
            icon={Database}
            title="Smart Caching"
            description="Intelligent caching with expiry-based invalidation prevents redundant scraping and improves performance."
          />
          <FeatureCard
            icon={Shield}
            title="Ethical Practices"
            description="Rate limiting, delays between requests, and respect for the source site's resources."
          />
        </div>
      </section>

      {/* Ethical Scraping */}
      <section id="ethical-scraping" className="bg-primary-50 rounded-xl p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Ethical Scraping Disclaimer
        </h2>
        <div className="space-y-4 text-gray-700">
          <p>
            This project is built with ethical web scraping practices at its core.
            We take the following measures to ensure responsible data collection:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Rate Limiting:</strong> Requests are throttled to avoid
              overwhelming the source server
            </li>
            <li>
              <strong>Delays:</strong> Configurable delays between page loads
              simulate human browsing patterns
            </li>
            <li>
              <strong>Caching:</strong> Data is cached to prevent repeated
              requests for the same content
            </li>
            <li>
              <strong>Minimal Impact:</strong> Only necessary pages are scraped,
              avoiding unnecessary bandwidth usage
            </li>
            <li>
              <strong>Idempotent Jobs:</strong> Duplicate scrape requests are
              deduplicated to prevent redundant operations
            </li>
          </ul>
          <p className="mt-4 p-4 bg-white rounded-lg border border-primary-200">
            <strong>Note:</strong> This project is for educational and
            demonstration purposes only. All book data is sourced from{' '}
            <a
              href="https://www.worldofbooks.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 underline"
            >
              World of Books
            </a>
            . Users interested in purchasing books should visit the official
            World of Books website.
          </p>
        </div>
      </section>

      {/* Technology Stack */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Technology Stack
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TechCard
            title="Frontend"
            items={[
              'Next.js 14 with App Router',
              'React 18 with TypeScript',
              'Tailwind CSS for styling',
              'React Query for data fetching',
            ]}
          />
          <TechCard
            title="Backend"
            items={[
              'NestJS with TypeScript',
              'PostgreSQL database',
              'TypeORM for database operations',
              'BullMQ for job queuing',
            ]}
          />
          <TechCard
            title="Scraping"
            items={[
              'Crawlee framework',
              'Playwright for browser automation',
              'Headless Chrome',
              'Exponential backoff retries',
            ]}
          />
          <TechCard
            title="Infrastructure"
            items={[
              'Redis for job queue',
              'Swagger API documentation',
              'Winston logging',
              'Docker support',
            ]}
          />
        </div>
      </section>

      {/* Architecture */}
      <section className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Architecture
        </h2>
        <div className="bg-gray-50 rounded-lg p-6 font-mono text-sm overflow-x-auto">
          <pre>{`
[ Next.js Frontend ]
        |
        v
[ NestJS REST API ]
        |
        v
[ Job Queue / Worker ] ---> [ Crawlee + Playwright ] ---> [ World of Books ]
        |
        v
[ PostgreSQL Database ]
          `}</pre>
        </div>
      </section>

      {/* Footer */}
      <section className="text-center py-8">
        <p className="flex items-center justify-center text-gray-600">
          Made with <Heart className="h-5 w-5 text-red-500 mx-2" /> as a demonstration project
        </p>
        <p className="text-sm text-gray-500 mt-2">
          All book data © World of Books
        </p>
      </section>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
        <Icon className="h-6 w-6 text-primary-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function TechCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <Code className="h-5 w-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center text-gray-600 text-sm">
            <span className="w-2 h-2 bg-primary-400 rounded-full mr-3" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
