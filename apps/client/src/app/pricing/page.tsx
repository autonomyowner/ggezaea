'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLanguage } from '../../components/LanguageProvider';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [showBDLModal, setShowBDLModal] = useState(false);
  const { t, language } = useLanguage();

  const currency = language === 'en' ? '$' : '€';
  const monthlyPrice = language === 'en' ? '19' : '19';
  const yearlyPrice = language === 'en' ? '15' : '15';
  const yearlyTotal = language === 'en' ? '180' : '180';
  const yearlySavings = language === 'en' ? '48' : '48';

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream-50)' }}>
      {/* Beta Banner */}
      <div
        className="w-full py-3 px-4 text-center"
        style={{
          background: 'linear-gradient(135deg, var(--matcha-500) 0%, var(--matcha-600) 100%)',
          color: 'white',
        }}
      >
        <p className="text-sm font-medium">
          {language === 'en'
            ? "We're in Beta - Everything is FREE to use during this period!"
            : "Nous sommes en Bêta - Tout est GRATUIT pendant cette période !"}
        </p>
      </div>

      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] opacity-20"
          style={{
            background: 'radial-gradient(circle, var(--matcha-200) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(20%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-15"
          style={{
            background: 'radial-gradient(circle, var(--terra-300) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(-20%, 30%)',
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            className="text-4xl md:text-5xl mb-4"
            style={{
              fontFamily: 'var(--font-dm-serif), Georgia, serif',
              color: 'var(--text-primary)',
            }}
          >
            {t.pricing.title}
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t.pricing.subtitle}
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 rounded-full" style={{ background: 'var(--cream-200)' }}>
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-white/50'
              }`}
              style={{
                color: billingPeriod === 'monthly' ? 'var(--matcha-700)' : 'var(--text-secondary)',
              }}
            >
              {t.pricing.monthly}
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all relative ${
                billingPeriod === 'yearly'
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-white/50'
              }`}
              style={{
                color: billingPeriod === 'yearly' ? 'var(--matcha-700)' : 'var(--text-secondary)',
              }}
            >
              {t.pricing.yearly}
              <span
                className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  background: 'var(--terra-400)',
                  color: 'white',
                }}
              >
                -20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div
              className="rounded-3xl p-8 relative"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-soft)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div className="mb-6">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
                  style={{
                    background: 'var(--matcha-100)',
                    color: 'var(--matcha-700)',
                  }}
                >
                  {t.pricing.free}
                </span>
                <h2
                  className="text-2xl mb-2"
                  style={{
                    fontFamily: 'var(--font-dm-serif), Georgia, serif',
                    color: 'var(--text-primary)',
                  }}
                >
                  {t.pricing.discovery}
                </h2>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-4xl font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    0{currency}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>{t.pricing.perMonth}</span>
                </div>
                <p
                  className="mt-2 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t.pricing.freeDesc}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  t.pricing.freeFeature1,
                  t.pricing.freeFeature2,
                  t.pricing.freeFeature3,
                  t.pricing.freeFeature4,
                  t.pricing.freeFeature5,
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: 'var(--matcha-500)' }}
                    />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup?plan=gratuit"
                className="matcha-btn matcha-btn-secondary w-full justify-center"
              >
                {t.pricing.startFree}
              </Link>
            </div>

            {/* Pro Plan */}
            <div
              className="rounded-3xl p-8 relative"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-soft)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div className="mb-6">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
                  style={{
                    background: 'var(--matcha-100)',
                    color: 'var(--matcha-700)',
                  }}
                >
                  {t.pricing.pro}
                </span>
                <h2
                  className="text-2xl mb-2"
                  style={{
                    fontFamily: 'var(--font-dm-serif), Georgia, serif',
                    color: 'var(--text-primary)',
                  }}
                >
                  {t.pricing.transformation}
                </h2>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-4xl font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {billingPeriod === 'monthly' ? monthlyPrice : yearlyPrice}{currency}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>{t.pricing.perMonth}</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {t.pricing.billedYearly.replace('{amount}', yearlyTotal + currency).replace('{savings}', yearlySavings + currency)}
                  </p>
                )}
                <p
                  className="mt-2 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t.pricing.proDesc}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  t.pricing.proFeature1,
                  t.pricing.proFeature2,
                  t.pricing.proFeature3,
                  t.pricing.proFeature4,
                  t.pricing.proFeature5,
                  t.pricing.proFeature6,
                  t.pricing.proFeature7,
                  t.pricing.proFeature8,
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: 'var(--matcha-500)' }}
                    />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div
                className="inline-flex w-full items-center justify-center px-6 py-3 rounded-xl font-medium cursor-not-allowed opacity-60"
                style={{
                  background: 'var(--cream-200)',
                  color: 'var(--text-muted)',
                }}
              >
                {language === 'en' ? 'Coming Soon' : 'Bientôt disponible'}
              </div>
            </div>

            {/* Founding Member */}
            <div
              className="rounded-3xl p-8 relative"
              style={{
                background: 'linear-gradient(135deg, var(--matcha-500) 0%, var(--matcha-600) 100%)',
                boxShadow: '0 20px 60px rgba(104, 166, 125, 0.3)',
              }}
            >
              {/* Most Popular badge */}
              <div
                className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-semibold"
                style={{
                  background: 'var(--terra-400)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(224, 123, 76, 0.4)',
                }}
              >
                {t.pricing.mostPopular}
              </div>

              <div className="mb-6">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                  }}
                >
                  {language === 'en' ? 'Founding Member' : 'Membre Fondateur'}
                </span>
                <h2
                  className="text-2xl mb-2"
                  style={{
                    fontFamily: 'var(--font-dm-serif), Georgia, serif',
                    color: 'white',
                  }}
                >
                  {language === 'en' ? 'Lifetime Access' : 'Accès à Vie'}
                </h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">€39</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {language === 'en' ? 'one-time' : 'unique'}
                  </span>
                </div>
                <p
                  className="mt-2 text-sm"
                  style={{ color: 'rgba(255, 255, 255, 0.85)' }}
                >
                  {language === 'en'
                    ? "Be one of the first 50 to shape Matcha's future"
                    : "Soyez parmi les 50 premiers à façonner l'avenir de Matcha"}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  language === 'en' ? 'Lifetime Pro access' : 'Accès Pro à vie',
                  language === 'en' ? 'All future features' : 'Toutes les fonctionnalités futures',
                  language === 'en' ? 'Direct founder access' : 'Accès direct au fondateur',
                  language === 'en' ? 'Wall of Founders' : 'Mur des Fondateurs',
                  language === 'en' ? 'Vote on roadmap' : 'Votez sur la roadmap',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: 'white' }}
                    />
                    <span style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setShowBDLModal(true)}
                className="inline-flex w-full items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
                style={{
                  background: 'white',
                  color: 'var(--matcha-700)',
                }}
              >
                {/* Visa Icon */}
                <svg width="36" height="12" viewBox="0 0 40 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.5 1L14 13H11L13.5 1H16.5Z" fill="#1A1F71"/>
                  <path d="M26.5 1.2C25.8 0.9 24.7 0.6 23.3 0.6C20 0.6 17.7 2.3 17.7 4.7C17.7 6.5 19.3 7.5 20.6 8.1C21.9 8.7 22.4 9.1 22.4 9.7C22.4 10.6 21.3 11 20.3 11C18.8 11 18 10.8 16.7 10.2L16.2 10L15.7 13C16.7 13.4 18.4 13.8 20.1 13.8C23.6 13.8 25.8 12.1 25.8 9.5C25.8 8.1 24.9 7 23 6.1C21.8 5.5 21.1 5.1 21.1 4.5C21.1 4 21.7 3.4 23 3.4C24.1 3.4 24.9 3.6 25.5 3.9L25.8 4L26.5 1.2Z" fill="#1A1F71"/>
                  <path d="M31.5 1H29C28.2 1 27.6 1.2 27.3 2L22.5 13H26L26.7 11H30.9L31.3 13H34.5L31.5 1ZM27.7 8.5C28 7.7 29.2 4.5 29.2 4.5C29.2 4.5 29.5 3.7 29.7 3.2L29.9 4.4C29.9 4.4 30.6 7.5 30.8 8.5H27.7Z" fill="#1A1F71"/>
                  <path d="M10.5 1L7.2 9.4L6.8 7.5C6.2 5.5 4.3 3.3 2.1 2.2L5.1 13H8.6L14 1H10.5Z" fill="#1A1F71"/>
                  <path d="M5 1H0L0 1.2C4.1 2.2 6.8 4.7 7.8 7.5L6.7 2C6.5 1.3 6 1 5 1Z" fill="#F9A533"/>
                </svg>
                {/* BDL Icon */}
                <img src="/bdlicon.png" alt="BDL" className="h-6 w-auto" />
                <span>{language === 'en' ? 'Pay Now' : 'Payer'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section
        className="py-20 px-4"
        style={{ background: 'var(--cream-100)' }}
      >
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-3xl text-center mb-12"
            style={{
              fontFamily: 'var(--font-dm-serif), Georgia, serif',
              color: 'var(--text-primary)',
            }}
          >
            {t.pricing.compareTitle}
          </h2>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-soft)',
            }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  <th
                    className="text-left py-4 px-6 font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {t.pricing.feature}
                  </th>
                  <th
                    className="text-center py-4 px-6 font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {t.pricing.free}
                  </th>
                  <th
                    className="text-center py-4 px-6 font-medium"
                    style={{ color: 'var(--matcha-600)' }}
                  >
                    {t.pricing.pro}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: t.pricing.analysesPerMonth, free: '3', pro: t.pricing.unlimited },
                  { feature: t.pricing.psychProfile, free: t.pricing.basic, pro: t.pricing.complete },
                  { feature: t.pricing.biasesDetected, free: t.pricing.mainOnly, pro: t.pricing.all20Plus },
                  { feature: t.pricing.progressTracking, free: t.pricing.no, pro: t.pricing.yes },
                  { feature: t.pricing.personalizedReports, free: t.pricing.no, pro: t.pricing.weekly },
                  { feature: t.pricing.deepAIChat, free: t.pricing.no, pro: t.pricing.yes },
                  { feature: t.pricing.pdfExport, free: t.pricing.yes, pro: t.pricing.yes },
                  { feature: t.pricing.support, free: t.pricing.community, pro: t.pricing.priority },
                ].map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom:
                        i < 7 ? '1px solid var(--border-soft)' : 'none',
                    }}
                  >
                    <td
                      className="py-4 px-6"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {row.feature}
                    </td>
                    <td
                      className="text-center py-4 px-6"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {row.free}
                    </td>
                    <td
                      className="text-center py-4 px-6 font-medium"
                      style={{ color: 'var(--matcha-600)' }}
                    >
                      {row.pro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-3xl p-10 text-center"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-soft)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <h2
              className="text-2xl mb-4"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--text-primary)',
              }}
            >
              {t.pricing.guaranteeTitle}
            </h2>
            <p
              className="max-w-xl mx-auto mb-6"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
            >
              {t.pricing.guaranteeDesc}
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              {[
                t.pricing.cancelAnytime,
                t.pricing.noCommitment,
                t.pricing.immediateRefund,
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: 'var(--matcha-500)' }}
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        className="py-20 px-4"
        style={{ background: 'var(--cream-100)' }}
      >
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-3xl text-center mb-12"
            style={{
              fontFamily: 'var(--font-dm-serif), Georgia, serif',
              color: 'var(--text-primary)',
            }}
          >
            {t.pricing.faqTitle}
          </h2>

          <div className="space-y-4">
            {[
              { q: t.pricing.faq1Q, a: t.pricing.faq1A },
              { q: t.pricing.faq2Q, a: t.pricing.faq2A },
              { q: t.pricing.faq3Q, a: t.pricing.faq3A },
              { q: t.pricing.faq4Q, a: t.pricing.faq4A },
              { q: t.pricing.faq5Q, a: t.pricing.faq5A },
            ].map((faq, i) => (
              <details
                key={i}
                className="group rounded-2xl overflow-hidden"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-soft)',
                }}
              >
                <summary
                  className="cursor-pointer px-6 py-5 font-medium flex items-center justify-between"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {faq.q}
                  <span
                    className="ml-4 transition-transform group-open:rotate-45"
                    style={{ color: 'var(--matcha-500)' }}
                  >
                    +
                  </span>
                </summary>
                <div
                  className="px-6 pb-5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
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
                {t.landing.footerTagline}
              </p>
            </div>
            <div className="flex gap-8">
              <Link
                href="/"
                className="text-sm hover:text-[var(--matcha-600)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.header.home}
              </Link>
              <Link
                href="/login"
                className="text-sm hover:text-[var(--matcha-600)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.header.login}
              </Link>
              <Link
                href="/signup"
                className="text-sm hover:text-[var(--matcha-600)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.common.signup}
              </Link>
            </div>
          </div>
          {/* Investor CTA */}
          <div
            className="mt-10 pt-8 border-t"
            style={{ borderColor: 'var(--border-soft)' }}
          >
            <div
              className="max-w-md mx-auto text-center p-6 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, var(--cream-100) 0%, var(--cream-200) 100%)',
                border: '1px solid var(--matcha-200)',
              }}
            >
              <p
                className="text-sm font-medium mb-2"
                style={{ color: 'var(--matcha-700)' }}
              >
                {t.landing.investorCta}
              </p>
              <p
                className="text-sm mb-4"
                style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
              >
                {t.landing.investorMsg}
              </p>
              <a
                href="https://wa.me/213797339451"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm font-medium px-5 py-2 rounded-lg transition-all hover:opacity-90"
                style={{
                  background: 'var(--matcha-600)',
                  color: 'white',
                }}
              >
                {t.landing.investorContact}
              </a>
            </div>
          </div>

          <div
            className="mt-8 pt-8 border-t text-center text-sm"
            style={{
              borderColor: 'var(--border-soft)',
              color: 'var(--text-muted)',
            }}
          >
            © 2024 Matcha. {t.landing.allRightsReserved}
          </div>
        </div>
      </footer>

      {/* BDL Payment Modal */}
      {showBDLModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowBDLModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl p-8 relative"
            style={{
              background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowBDLModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              ×
            </button>

            {/* BDL Logo/Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center mb-4">
                <img src="/bdlicon.png" alt="BDL" className="h-16 w-auto rounded-2xl" />
              </div>
              <h3
                className="text-xl font-semibold"
                style={{
                  fontFamily: 'var(--font-dm-serif), Georgia, serif',
                  color: 'var(--text-primary)',
                }}
              >
                {language === 'en' ? 'Banque de Développement Local' : 'Banque de Développement Local'}
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {language === 'en' ? 'Secure Payment Gateway' : 'Passerelle de paiement sécurisée'}
              </p>
              {/* Accepted Cards */}
              <div className="flex items-center justify-center gap-3 mt-4">
                {/* Visa Icon */}
                <div className="px-3 py-1.5 rounded-md" style={{ background: '#1A1F71' }}>
                  <svg width="40" height="14" viewBox="0 0 40 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.5 1L14 13H11L13.5 1H16.5Z" fill="white"/>
                    <path d="M26.5 1.2C25.8 0.9 24.7 0.6 23.3 0.6C20 0.6 17.7 2.3 17.7 4.7C17.7 6.5 19.3 7.5 20.6 8.1C21.9 8.7 22.4 9.1 22.4 9.7C22.4 10.6 21.3 11 20.3 11C18.8 11 18 10.8 16.7 10.2L16.2 10L15.7 13C16.7 13.4 18.4 13.8 20.1 13.8C23.6 13.8 25.8 12.1 25.8 9.5C25.8 8.1 24.9 7 23 6.1C21.8 5.5 21.1 5.1 21.1 4.5C21.1 4 21.7 3.4 23 3.4C24.1 3.4 24.9 3.6 25.5 3.9L25.8 4L26.5 1.2Z" fill="white"/>
                    <path d="M31.5 1H29C28.2 1 27.6 1.2 27.3 2L22.5 13H26L26.7 11H30.9L31.3 13H34.5L31.5 1ZM27.7 8.5C28 7.7 29.2 4.5 29.2 4.5C29.2 4.5 29.5 3.7 29.7 3.2L29.9 4.4C29.9 4.4 30.6 7.5 30.8 8.5H27.7Z" fill="white"/>
                    <path d="M10.5 1L7.2 9.4L6.8 7.5C6.2 5.5 4.3 3.3 2.1 2.2L5.1 13H8.6L14 1H10.5Z" fill="white"/>
                    <path d="M5 1H0L0 1.2C4.1 2.2 6.8 4.7 7.8 7.5L6.7 2C6.5 1.3 6 1 5 1Z" fill="#F9A533"/>
                  </svg>
                </div>
                {/* BDL Icon */}
                <img src="/bdlicon.png" alt="BDL" className="h-8 w-auto rounded-md" />
                {/* Mastercard Icon */}
                <div className="px-2 py-1.5 rounded-md" style={{ background: '#f5f5f5', border: '1px solid #e0e0e0' }}>
                  <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="10" r="8" fill="#EB001B"/>
                    <circle cx="21" cy="10" r="8" fill="#F79E1B"/>
                    <path d="M16 3.5C17.8 5 19 7.3 19 10C19 12.7 17.8 15 16 16.5C14.2 15 13 12.7 13 10C13 7.3 14.2 5 16 3.5Z" fill="#FF5F00"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div
              className="rounded-xl p-4 mb-6"
              style={{ background: 'var(--cream-100)' }}
            >
              <div className="flex justify-between items-center mb-2">
                <span style={{ color: 'var(--text-secondary)' }}>
                  {language === 'en' ? 'Founding Member - Lifetime' : 'Membre Fondateur - À vie'}
                </span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  5,850 DZD
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: 'var(--text-muted)' }}>
                  {language === 'en' ? '(Approx. €39)' : '(Environ 39€)'}
                </span>
              </div>
            </div>

            {/* Card Form (Mockup) */}
            <form onSubmit={(e) => { e.preventDefault(); alert(language === 'en' ? 'This is a mockup - Payment integration coming soon!' : 'Ceci est une maquette - Intégration du paiement bientôt disponible!'); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {language === 'en' ? 'Card Number' : 'Numéro de carte'}
                  </label>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    className="w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--matcha-500)]"
                    style={{
                      borderColor: 'var(--border-soft)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      {language === 'en' ? 'Expiry Date' : 'Date d\'expiration'}
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--matcha-500)]"
                      style={{
                        borderColor: 'var(--border-soft)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      CVC
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--matcha-500)]"
                      style={{
                        borderColor: 'var(--border-soft)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {language === 'en' ? 'Cardholder Name' : 'Nom du titulaire'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'en' ? 'AHMED BENALI' : 'AHMED BENALI'}
                    className="w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--matcha-500)]"
                    style={{
                      borderColor: 'var(--border-soft)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-medium transition-all hover:opacity-90"
                  style={{
                    background: '#006233',
                    color: 'white',
                  }}
                >
                  {language === 'en' ? 'Pay 5,850 DZD' : 'Payer 5 850 DZD'}
                </button>
              </div>
            </form>

            {/* Security badges */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                {language === 'en' ? 'SSL Secured' : 'Sécurisé SSL'}
              </span>
              <span className="flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                {language === 'en' ? 'BDL Protected' : 'Protégé par BDL'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
