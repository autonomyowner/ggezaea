'use client';

import Link from 'next/link';

export default function MarketingStrategyPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a', color: 'white' }}>
      {/* Header */}
      <nav className="py-6 px-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/investors" className="text-xl font-bold" style={{ color: '#68a67d' }}>
            ← Back to Investor Deck
          </Link>
          <span className="text-gray-500 text-sm">Marketing Strategy</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]"
            style={{
              background: 'radial-gradient(circle, #68a67d 0%, transparent 60%)',
              filter: 'blur(120px)',
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span
            className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ background: 'rgba(104, 166, 125, 0.2)', color: '#68a67d' }}
          >
            Growth Strategy
          </span>
          <h1
            className="text-4xl md:text-6xl font-bold mb-6"
            style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }}
          >
            Marketing Strategy
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Data-driven acquisition across Algeria & Europe with focus on paid ads, organic growth, and community building
          </p>
        </div>
      </section>

      {/* Strategy Overview */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: '🎯', label: 'Paid Acquisition', value: '60%', desc: 'of initial budget' },
              { icon: '🌱', label: 'Organic Growth', value: '30%', desc: 'SEO & Content' },
              { icon: '🤝', label: 'Referrals', value: '10%', desc: 'Viral loops' },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl text-center"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <span className="text-4xl mb-3 block">{item.icon}</span>
                <p className="text-3xl font-bold text-[#68a67d] mb-1">{item.value}</p>
                <p className="text-white font-medium">{item.label}</p>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Paid Advertising */}
      <section className="py-16 px-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(104,166,125,0.2)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#68a67d" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Paid Advertising Strategy</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Algeria */}
            <div
              className="p-8 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🇩🇿</span>
                <h3 className="text-xl font-bold">Algeria Market</h3>
              </div>

              <div className="space-y-6">
                {/* Facebook & Instagram */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(66,103,178,0.1)', border: '1px solid rgba(66,103,178,0.3)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#4267B2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="font-medium">Facebook & Instagram</span>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li>• Target: 18-45 age group in major cities</li>
                    <li>• Focus: Mental health awareness, stress relief</li>
                    <li>• Format: Video ads, carousel, stories</li>
                    <li>• Budget: $2,000-5,000/month initially</li>
                  </ul>
                </div>

                {/* TikTok */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    <span className="font-medium">TikTok</span>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li>• Target: 18-30 Gen Z audience</li>
                    <li>• Content: Relatable mental health content</li>
                    <li>• Influencer partnerships with local creators</li>
                    <li>• Budget: $1,500-3,000/month</li>
                  </ul>
                </div>

                {/* Google */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.3)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-medium">Google Ads</span>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li>• Search ads: "علاج الاكتئاب", "مساعدة نفسية"</li>
                    <li>• Display network for retargeting</li>
                    <li>• YouTube pre-roll ads</li>
                    <li>• Budget: $1,500-3,000/month</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Europe */}
            <div
              className="p-8 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🇪🇺</span>
                <h3 className="text-xl font-bold">European Market</h3>
              </div>

              <div className="space-y-6">
                {/* Meta Ads */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(66,103,178,0.1)', border: '1px solid rgba(66,103,178,0.3)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#4267B2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="font-medium">Meta Ads (FB/IG)</span>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li>• Target: France, Belgium, Germany first</li>
                    <li>• Lookalike audiences from Algeria success</li>
                    <li>• A/B test messaging per country</li>
                    <li>• Budget: $10,000-20,000/month</li>
                  </ul>
                </div>

                {/* Google EU */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.3)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-medium">Google Ads</span>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li>• Search: "therapy app", "mental health support"</li>
                    <li>• Performance Max campaigns</li>
                    <li>• YouTube influencer collaborations</li>
                    <li>• Budget: $8,000-15,000/month</li>
                  </ul>
                </div>

                {/* LinkedIn */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(0,119,181,0.1)', border: '1px solid rgba(0,119,181,0.3)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#0077B5">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="font-medium">LinkedIn (B2B)</span>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li>• Target: Healthcare professionals, clinic owners</li>
                    <li>• Sponsored content & InMail</li>
                    <li>• White label solution promotion</li>
                    <li>• Budget: $3,000-5,000/month</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO & Organic Growth */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(104,166,125,0.2)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#68a67d" strokeWidth="2">
                <path d="M12 20V10" />
                <path d="M18 20V4" />
                <path d="M6 20v-4" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">SEO & Organic Growth</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Domain Authority */}
            <div
              className="p-8 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">🏆</span> Domain Authority Strategy
              </h3>

              <div className="space-y-4">
                {[
                  {
                    title: 'Quality Content Creation',
                    desc: 'In-depth articles on mental health topics in Arabic, French & English',
                  },
                  {
                    title: 'Backlink Building',
                    desc: 'Guest posts on health blogs, partnerships with mental health organizations',
                  },
                  {
                    title: 'Technical SEO',
                    desc: 'Optimized site structure, schema markup, fast loading times',
                  },
                  {
                    title: 'Local SEO',
                    desc: 'Google Business Profile, local citations for Algeria & Europe',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#68a67d]/20 flex items-center justify-center flex-shrink-0 text-[#68a67d] font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analytics Setup */}
            <div
              className="p-8 rounded-3xl"
              style={{ background: 'linear-gradient(135deg, rgba(66,133,244,0.1) 0%, rgba(234,67,53,0.1) 100%)', border: '1px solid rgba(66,133,244,0.3)' }}
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">📊</span> Analytics & Tracking
              </h3>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-black/30">
                  <div className="flex items-center gap-3 mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-medium">Google Search Console</span>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Monitor search rankings & impressions</li>
                    <li>• Track keyword performance</li>
                    <li>• Identify crawl issues</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-black/30">
                  <div className="flex items-center gap-3 mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#F9AB00">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span className="font-medium">Google Analytics 4</span>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• User behavior & journey analysis</li>
                    <li>• Conversion tracking & funnels</li>
                    <li>• Audience demographics & interests</li>
                    <li>• Real-time visitor data</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl" style={{ background: 'rgba(104,166,125,0.1)' }}>
                  <p className="text-sm text-[#68a67d] font-medium">Data-Driven Decisions</p>
                  <p className="text-sm text-gray-400 mt-1">
                    All visitor data feeds into our marketing strategy, allowing us to adjust campaigns in real-time based on actual user behavior.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Experience */}
      <section className="py-16 px-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(104,166,125,0.2)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#68a67d" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">User Experience Optimization</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Speed */}
            <div
              className="p-6 rounded-2xl text-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(104,166,125,0.2)' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#68a67d" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Lightning Fast</h3>
              <p className="text-gray-400 text-sm mb-4">
                Optimized for speed with Next.js, edge caching, and compressed assets
              </p>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#68a67d]">&lt;2s</p>
                  <p className="text-xs text-gray-500">Load Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#68a67d]">95+</p>
                  <p className="text-xs text-gray-500">PageSpeed</p>
                </div>
              </div>
            </div>

            {/* Responsive */}
            <div
              className="p-6 rounded-2xl text-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(104,166,125,0.2)' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#68a67d" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Fully Responsive</h3>
              <p className="text-gray-400 text-sm mb-4">
                Perfect experience on mobile, tablet, and desktop devices
              </p>
              <div className="flex justify-center gap-2">
                {['📱', '📲', '💻', '🖥️'].map((icon, i) => (
                  <span key={i} className="text-2xl">{icon}</span>
                ))}
              </div>
            </div>

            {/* Accessibility */}
            <div
              className="p-6 rounded-2xl text-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(104,166,125,0.2)' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#68a67d" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Accessible</h3>
              <p className="text-gray-400 text-sm mb-4">
                WCAG compliant, RTL support for Arabic, multilingual UI
              </p>
              <div className="flex justify-center gap-2">
                <span className="px-2 py-1 rounded bg-white/10 text-xs">🇬🇧 EN</span>
                <span className="px-2 py-1 rounded bg-white/10 text-xs">🇫🇷 FR</span>
                <span className="px-2 py-1 rounded bg-white/10 text-xs">🇩🇿 AR</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Referral Program */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(224,123,76,0.2)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e07b4c" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Referral Discount Program</h2>
          </div>

          <div
            className="p-8 rounded-3xl"
            style={{ background: 'linear-gradient(135deg, rgba(224,123,76,0.2) 0%, rgba(104,166,125,0.2) 100%)', border: '1px solid rgba(224,123,76,0.3)' }}
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Give 20%, Get 20%</h3>
                <p className="text-gray-400 mb-6">
                  Existing users share their unique referral link. New users get 20% off their first subscription,
                  and the referrer gets 20% off their next month.
                </p>

                <div className="space-y-3">
                  {[
                    'Viral growth through word-of-mouth',
                    'Reduced CAC through organic referrals',
                    'Higher LTV from referred customers',
                    'Built-in social proof mechanism',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#e07b4c]" />
                      <span className="text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-black/30">
                  <p className="text-sm text-gray-400 mb-1">Expected Referral Rate</p>
                  <p className="text-3xl font-bold text-[#e07b4c]">15-25%</p>
                  <p className="text-xs text-gray-500">of new signups from referrals</p>
                </div>
                <div className="p-4 rounded-xl bg-black/30">
                  <p className="text-sm text-gray-400 mb-1">Referral Conversion Rate</p>
                  <p className="text-3xl font-bold text-[#68a67d]">3x Higher</p>
                  <p className="text-xs text-gray-500">vs. paid acquisition</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Strategy */}
      <section className="py-16 px-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(104,166,125,0.2)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#68a67d" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Content Strategy: Pain Point Marketing</h2>
          </div>

          <p className="text-gray-400 mb-8 max-w-3xl">
            Our content focuses on the real struggles our audience faces. By providing genuine value for free,
            we build trust and dramatically increase conversion rates.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                emoji: '😰',
                topic: 'Anxiety & Stress',
                examples: ['Daily stress management tips', 'Breathing exercises', 'Work-life balance'],
                color: '#68a67d',
              },
              {
                emoji: '😔',
                topic: 'Depression',
                examples: ['Signs to watch for', 'Self-care routines', 'When to seek help'],
                color: '#5865F2',
              },
              {
                emoji: '💊',
                topic: 'Addiction Recovery',
                examples: ['Recovery journeys', 'Coping mechanisms', 'Support resources'],
                color: '#e07b4c',
              },
              {
                emoji: '🧠',
                topic: 'Mental Wellness',
                examples: ['Mindfulness practices', 'Cognitive techniques', 'Sleep hygiene'],
                color: '#F9AB00',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <span className="text-4xl mb-4 block">{item.emoji}</span>
                <h3 className="font-bold mb-3" style={{ color: item.color }}>{item.topic}</h3>
                <ul className="text-sm text-gray-400 space-y-2">
                  {item.examples.map((ex, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full" style={{ background: item.color }} />
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Content Funnel */}
          <div
            className="mt-12 p-8 rounded-3xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <h3 className="text-xl font-bold mb-6 text-center">Content-to-Conversion Funnel</h3>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              {[
                { stage: 'Awareness', desc: 'Free valuable content on social media', icon: '📱', width: 'w-full md:w-48' },
                { stage: 'Interest', desc: 'Blog posts & guides on website', icon: '📖', width: 'w-full md:w-44' },
                { stage: 'Desire', desc: 'Free AI chat trial', icon: '💬', width: 'w-full md:w-40' },
                { stage: 'Action', desc: 'Pro subscription', icon: '⭐', width: 'w-full md:w-36' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div
                    className={`${item.width} p-4 rounded-xl text-center`}
                    style={{ background: `rgba(104,166,125,${0.1 + i * 0.1})` }}
                  >
                    <span className="text-2xl mb-2 block">{item.icon}</span>
                    <p className="font-bold text-sm text-[#68a67d]">{item.stage}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                  </div>
                  {i < 3 && (
                    <svg className="hidden md:block text-gray-600" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-xl bg-[#68a67d]/10 text-center">
              <p className="text-[#68a67d] font-medium">
                "Provide so much value for free that people can't help but wonder what the paid version offers"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Marketing Budget Summary */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-12"
            style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }}
          >
            Monthly Marketing Budget (Year 1)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Channel</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Algeria</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Europe (Y2)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { channel: 'Meta Ads (FB/IG)', algeria: '$3,500', europe: '$15,000' },
                  { channel: 'Google Ads', algeria: '$2,500', europe: '$12,000' },
                  { channel: 'TikTok', algeria: '$2,000', europe: '$5,000' },
                  { channel: 'LinkedIn (B2B)', algeria: '$1,000', europe: '$4,000' },
                  { channel: 'Content Creation', algeria: '$1,500', europe: '$3,000' },
                  { channel: 'Influencer Marketing', algeria: '$1,500', europe: '$5,000' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="py-4 px-4 text-white">{row.channel}</td>
                    <td className="text-center py-4 px-4 text-[#68a67d]">{row.algeria}</td>
                    <td className="text-center py-4 px-4 text-[#e07b4c]">{row.europe}</td>
                  </tr>
                ))}
                <tr className="bg-[#68a67d]/10">
                  <td className="py-4 px-4 font-bold">Total Monthly</td>
                  <td className="text-center py-4 px-4 font-bold text-[#68a67d]">$12,000</td>
                  <td className="text-center py-4 px-4 font-bold text-[#e07b4c]">$44,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="p-8 rounded-3xl"
            style={{ background: 'linear-gradient(135deg, rgba(104,166,125,0.3) 0%, rgba(224,123,76,0.3) 100%)', border: '1px solid rgba(104,166,125,0.5)' }}
          >
            <h2 className="text-2xl font-bold mb-4">Ready to Scale Together?</h2>
            <p className="text-gray-400 mb-6">
              Our data-driven marketing approach ensures efficient customer acquisition and sustainable growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/investors"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
                style={{ background: '#68a67d', color: 'white' }}
              >
                ← Back to Investor Deck
              </Link>
              <a
                href="https://wa.me/213797339451"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2024 WA3i. Confidential - For Investor Eyes Only</p>
        </div>
      </footer>
    </div>
  );
}
