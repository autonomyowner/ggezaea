'use client';

import Link from 'next/link';
import { useLanguage } from '../../components/LanguageProvider';
import type { BlogArticle } from '../../lib/blog-data';

interface BlogArticleListProps {
  articles: BlogArticle[];
}

export function BlogArticleList({ articles }: BlogArticleListProps) {
  const { language, t } = useLanguage();

  const getLocale = () => {
    switch (language) {
      case 'fr': return 'fr-FR';
      case 'ar': return 'ar-SA';
      default: return 'en-US';
    }
  };

  const getTitle = (article: BlogArticle) => {
    // Arabic falls back to English since articles don't have Arabic content yet
    return language === 'fr' ? article.titleFr : article.titleEn;
  };

  const getExcerpt = (article: BlogArticle) => {
    // Arabic falls back to English since articles don't have Arabic content yet
    return language === 'fr' ? article.excerptFr : article.excerptEn;
  };

  return (
    <section className="pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg block"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-soft)',
              }}
            >
              <article>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: 'var(--matcha-100)',
                      color: 'var(--matcha-700)'
                    }}
                  >
                    {article.category}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {article.readTime} {t.blog.minRead}
                  </span>
                </div>
                <h2
                  className="text-xl mb-3"
                  style={{
                    fontFamily: 'var(--font-dm-serif), Georgia, serif',
                    color: 'var(--text-primary)',
                    lineHeight: 1.3
                  }}
                >
                  {getTitle(article)}
                </h2>
                <p
                  className="text-sm mb-4"
                  style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
                >
                  {getExcerpt(article)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(article.date).toLocaleDateString(getLocale(), {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--matcha-600)' }}
                  >
                    {t.blog.readMore}
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
