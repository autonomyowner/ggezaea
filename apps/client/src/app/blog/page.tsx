import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { articles } from '../../lib/blog-data';
import { BlogArticleList } from './BlogArticleList';

export default function BlogPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--cream-50)' }}>
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1
            className="text-4xl md:text-5xl mb-4"
            style={{
              fontFamily: 'var(--font-dm-serif), Georgia, serif',
              color: 'var(--text-primary)'
            }}
          >
            Research &amp; Insights
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Evidence-based articles on mental health, trauma treatment, and the science of healing.
          </p>
        </div>
      </section>

      {/* Articles Grid - Client component for language switching */}
      <BlogArticleList articles={articles} />

      {/* CTA Section */}
      <section
        className="py-16 px-4"
        style={{ background: 'var(--cream-100)' }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-2xl md:text-3xl mb-4"
            style={{
              fontFamily: 'var(--font-dm-serif), Georgia, serif',
              color: 'var(--text-primary)'
            }}
          >
            Experience Evidence-Based Healing
          </h2>
          <p
            className="mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            Matcha combines proven techniques like EMDR and Flash to support your mental wellness journey.
          </p>
          <SignedOut>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-medium transition-all"
              style={{
                background: 'var(--matcha-500)',
                color: 'white',
              }}
            >
              Get Started Free
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/chat"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-medium transition-all"
              style={{
                background: 'var(--matcha-500)',
                color: 'white',
              }}
            >
              Chat Now
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-12 px-4 border-t"
        style={{
          background: 'var(--cream-50)',
          borderColor: 'var(--border-soft)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <p
                className="text-xl font-semibold mb-1"
                style={{
                  fontFamily: 'var(--font-dm-serif), Georgia, serif',
                  color: 'var(--matcha-600)',
                }}
              >
                Matcha
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Your companion for mental wellness
              </p>
            </div>
            <div className="flex gap-8">
              <Link
                href="/"
                className="text-sm hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
              >
                Home
              </Link>
              <Link
                href="/pricing"
                className="text-sm hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
              >
                Pricing
              </Link>
              <Link
                href="/login"
                className="text-sm hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
              >
                Login
              </Link>
            </div>
          </div>
          <div
            className="mt-8 pt-8 border-t text-center text-sm"
            style={{
              borderColor: 'var(--border-soft)',
              color: 'var(--text-muted)',
            }}
          >
            &copy; 2025 Matcha. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
