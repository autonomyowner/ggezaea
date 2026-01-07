'use client';

import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { articles } from '../../lib/blog-data';
import { BlogArticleList } from './BlogArticleList';
import { useLanguage } from '../../components/LanguageProvider';

export default function BlogPage() {
  const { t } = useLanguage();

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
            {t.blog.title}
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t.blog.subtitle}
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
            {t.blog.ctaTitle}
          </h2>
          <p
            className="mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t.blog.ctaSubtitle}
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
              {t.blog.getStarted}
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
              {t.blog.chatNow}
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
                {t.blog.footerTagline}
              </p>
            </div>
            <div className="flex gap-8">
              <Link
                href="/"
                className="text-sm hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.common.home}
              </Link>
              <Link
                href="/pricing"
                className="text-sm hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.common.pricing}
              </Link>
              <Link
                href="/login"
                className="text-sm hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.common.login}
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
