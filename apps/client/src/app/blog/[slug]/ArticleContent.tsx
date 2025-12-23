'use client';

import { useLanguage } from '../../../components/LanguageProvider';
import type { BlogArticle } from '../../../lib/blog-data';

interface ArticleContentProps {
  article: BlogArticle;
  section: 'header' | 'body';
}

export function ArticleContent({ article, section }: ArticleContentProps) {
  const { language } = useLanguage();

  if (section === 'header') {
    return (
      <>
        <h1
          className="text-3xl md:text-4xl mb-4"
          style={{
            fontFamily: 'var(--font-dm-serif), Georgia, serif',
            color: 'var(--text-primary)',
            lineHeight: 1.3
          }}
        >
          {language === 'en' ? article.titleEn : article.titleFr}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {new Date(article.date).toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </>
    );
  }

  const content = language === 'en' ? article.contentEn : article.contentFr;

  return (
    <div
      className="prose max-w-none"
      style={{ color: 'var(--text-secondary)' }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
