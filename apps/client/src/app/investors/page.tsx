'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function InvestorsPage() {
  const [currency, setCurrency] = useState<'DZD' | 'EUR' | 'USD'>('USD');

  const exchangeRates = {
    DZD: 135,
    EUR: 0.92,
    USD: 1,
  };

  const formatCurrency = (usd: number) => {
    const value = usd * exchangeRates[currency];
    if (currency === 'DZD') {
      return `${value.toLocaleString()} DZD`;
    } else if (currency === 'EUR') {
      return `€${value.toLocaleString()}`;
    }
    return `$${usd.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a', color: 'white' }}>
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute top-0 left-1/4 w-[600px] h-[600px]"
            style={{
              background: 'radial-gradient(circle, #68a67d 0%, transparent 70%)',
              filter: 'blur(100px)',
            }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-[400px] h-[400px]"
            style={{
              background: 'radial-gradient(circle, #e07b4c 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ background: 'rgba(104, 166, 125, 0.2)', color: '#68a67d' }}
            >
              Investment Opportunity
            </span>
            <h1
              className="text-5xl md:text-7xl font-bold mb-6"
              style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }}
            >
              WA3i
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-4">
              AI-Powered Mental Wellness Platform
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Revolutionizing mental health support in Algeria & expanding to Europe
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              { label: 'Target Market', value: '45M+', sub: 'Algeria Population' },
              { label: 'EU Expansion', value: '450M+', sub: 'European Market' },
              { label: 'Mental Health Gap', value: '75%', sub: 'Untreated in Algeria' },
              { label: 'Growth Rate', value: '23%', sub: 'MENA Digital Health' },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl text-center"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <p className="text-4xl font-bold mb-2" style={{ color: '#68a67d' }}>
                  {stat.value}
                </p>
                <p className="text-white font-medium">{stat.label}</p>
                <p className="text-gray-500 text-sm">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Currency Toggle */}
      <div className="sticky top-0 z-50 py-4 px-4" style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-6xl mx-auto flex justify-end">
          <div className="inline-flex rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            {(['USD', 'EUR', 'DZD'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  currency === c ? 'bg-[#68a67d] text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Streams */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }}
          >
            Revenue Streams
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Three diversified revenue channels for sustainable growth
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* B2C Subscriptions */}
            <div
              className="p-8 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: 'rgba(104, 166, 125, 0.2)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#68a67d" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">B2C Subscriptions</h3>
              <p className="text-gray-400 mb-6">Pro plan for individuals seeking mental wellness support</p>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-800">
                  <span className="text-gray-400">Monthly Price</span>
                  <span className="font-bold text-[#68a67d]">{formatCurrency(19)}/mo</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-800">
                  <span className="text-gray-400">Yearly Price</span>
                  <span className="font-bold text-[#68a67d]">{formatCurrency(180)}/yr</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-800">
                  <span className="text-gray-400">Founding Member</span>
                  <span className="font-bold text-[#68a67d]">{formatCurrency(39)} once</span>
                </div>
              </div>
            </div>

            {/* Community Discord */}
            <div
              className="p-8 rounded-3xl relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(88,101,242,0.2) 0%, rgba(104,166,125,0.2) 100%)', border: '1px solid rgba(88,101,242,0.3)' }}
            >
              <div
                className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: '#e07b4c', color: 'white' }}
              >
                NEW
              </div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: 'rgba(88, 101, 242, 0.3)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#5865F2">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Community Discord</h3>
              <p className="text-gray-400 mb-6">Pro members get access to therapeutic voice groups</p>

              <div className="space-y-4">
                <div
                  className="p-4 rounded-xl"
                  style={{ background: 'rgba(0,0,0,0.3)' }}
                >
                  <p className="text-sm text-gray-300 mb-2">Voice Support Groups</p>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#68a67d]" />
                      Max 10 members per group
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#68a67d]" />
                      100% Anonymous
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#68a67d]" />
                      Moderated by AI + Humans
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#68a67d]" />
                      Psychologist-approved protocols
                    </li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'rgba(104,166,125,0.1)' }}>
                  <p className="text-xs text-gray-400 mb-1">Proven Benefits</p>
                  <p className="text-sm text-gray-300">
                    "Group therapy shows 85% effectiveness for anxiety & depression" - APA Studies
                  </p>
                </div>
              </div>
            </div>

            {/* B2B White Label */}
            <div
              className="p-8 rounded-3xl"
              style={{ background: 'linear-gradient(135deg, rgba(224,123,76,0.2) 0%, rgba(104,166,125,0.2) 100%)', border: '1px solid rgba(224,123,76,0.3)' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: 'rgba(224, 123, 76, 0.3)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e07b4c" strokeWidth="2">
                  <path d="M3 21h18" />
                  <path d="M9 8h1" />
                  <path d="M9 12h1" />
                  <path d="M9 16h1" />
                  <path d="M14 8h1" />
                  <path d="M14 12h1" />
                  <path d="M14 16h1" />
                  <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">B2B White Label</h3>
              <p className="text-gray-400 mb-6">AI therapy bot for clinics & healthcare providers</p>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Monthly Rental</span>
                  <span className="font-bold text-2xl text-[#e07b4c]">{formatCurrency(2000)}/mo</span>
                </div>
                <div
                  className="p-4 rounded-xl"
                  style={{ background: 'rgba(0,0,0,0.3)' }}
                >
                  <p className="text-sm font-medium text-white mb-2">Includes:</p>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e07b4c]" />
                      Custom branding
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e07b4c]" />
                      Patient management dashboard
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e07b4c]" />
                      Progress reports for doctors
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e07b4c]" />
                      24/7 AI support agent
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e07b4c]" />
                      HIPAA-ready infrastructure
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Projections */}
      <section className="py-20 px-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }}
          >
            Revenue Projections
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Conservative estimates based on market penetration rates
          </p>

          {/* Algeria Projections */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-3xl">🇩🇿</span>
              <h3 className="text-2xl font-bold">Algeria Market</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-4 px-4 text-gray-400 font-medium">Metric</th>
                    <th className="text-center py-4 px-4 text-gray-400 font-medium">Year 1</th>
                    <th className="text-center py-4 px-4 text-gray-400 font-medium">Year 2</th>
                    <th className="text-center py-4 px-4 text-gray-400 font-medium">Year 3</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-4">B2C Subscribers</td>
                    <td className="text-center py-4 px-4 text-[#68a67d]">5,000</td>
                    <td className="text-center py-4 px-4 text-[#68a67d]">25,000</td>
                    <td className="text-center py-4 px-4 text-[#68a67d]">100,000</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-4">B2C Revenue</td>
                    <td className="text-center py-4 px-4">{formatCurrency(90000)}</td>
                    <td className="text-center py-4 px-4">{formatCurrency(450000)}</td>
                    <td className="text-center py-4 px-4">{formatCurrency(1800000)}</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-4">B2B Clinic Partners</td>
                    <td className="text-center py-4 px-4 text-[#e07b4c]">10</td>
                    <td className="text-center py-4 px-4 text-[#e07b4c]">50</td>
                    <td className="text-center py-4 px-4 text-[#e07b4c]">150</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-4">B2B Revenue</td>
                    <td className="text-center py-4 px-4">{formatCurrency(240000)}</td>
                    <td className="text-center py-4 px-4">{formatCurrency(1200000)}</td>
                    <td className="text-center py-4 px-4">{formatCurrency(3600000)}</td>
                  </tr>
                  <tr className="bg-[#68a67d]/10">
                    <td className="py-4 px-4 font-bold">Total Algeria Revenue</td>
                    <td className="text-center py-4 px-4 font-bold text-[#68a67d]">{formatCurrency(330000)}</td>
                    <td className="text-center py-4 px-4 font-bold text-[#68a67d]">{formatCurrency(1650000)}</td>
                    <td className="text-center py-4 px-4 font-bold text-[#68a67d]">{formatCurrency(5400000)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Europe Projections */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-3xl">🇪🇺</span>
              <h3 className="text-2xl font-bold">European Market (Year 2+)</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-4 px-4 text-gray-400 font-medium">Metric</th>
                    <th className="text-center py-4 px-4 text-gray-400 font-medium">Year 2</th>
                    <th className="text-center py-4 px-4 text-gray-400 font-medium">Year 3</th>
                    <th className="text-center py-4 px-4 text-gray-400 font-medium">Year 4</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-4">Target Countries</td>
                    <td className="text-center py-4 px-4 text-gray-300">France, Belgium</td>
                    <td className="text-center py-4 px-4 text-gray-300">+ Germany, Spain</td>
                    <td className="text-center py-4 px-4 text-gray-300">+ UK, Italy, NL</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-4">B2C Subscribers</td>
                    <td className="text-center py-4 px-4 text-[#68a67d]">10,000</td>
                    <td className="text-center py-4 px-4 text-[#68a67d]">75,000</td>
                    <td className="text-center py-4 px-4 text-[#68a67d]">300,000</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-4">B2C Revenue (€29/mo)</td>
                    <td className="text-center py-4 px-4">{formatCurrency(348000)}</td>
                    <td className="text-center py-4 px-4">{formatCurrency(2610000)}</td>
                    <td className="text-center py-4 px-4">{formatCurrency(10440000)}</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-4">B2B Clinic Partners</td>
                    <td className="text-center py-4 px-4 text-[#e07b4c]">20</td>
                    <td className="text-center py-4 px-4 text-[#e07b4c]">100</td>
                    <td className="text-center py-4 px-4 text-[#e07b4c]">300</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-4">B2B Revenue (€3K/mo)</td>
                    <td className="text-center py-4 px-4">{formatCurrency(720000)}</td>
                    <td className="text-center py-4 px-4">{formatCurrency(3600000)}</td>
                    <td className="text-center py-4 px-4">{formatCurrency(10800000)}</td>
                  </tr>
                  <tr className="bg-[#68a67d]/10">
                    <td className="py-4 px-4 font-bold">Total Europe Revenue</td>
                    <td className="text-center py-4 px-4 font-bold text-[#68a67d]">{formatCurrency(1068000)}</td>
                    <td className="text-center py-4 px-4 font-bold text-[#68a67d]">{formatCurrency(6210000)}</td>
                    <td className="text-center py-4 px-4 font-bold text-[#68a67d]">{formatCurrency(21240000)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Combined Total */}
          <div
            className="mt-16 p-8 rounded-3xl text-center"
            style={{ background: 'linear-gradient(135deg, rgba(104,166,125,0.3) 0%, rgba(224,123,76,0.3) 100%)', border: '1px solid rgba(104,166,125,0.5)' }}
          >
            <p className="text-gray-400 mb-2">Projected Combined Revenue by Year 4</p>
            <p className="text-5xl md:text-6xl font-bold" style={{ color: '#68a67d' }}>
              {formatCurrency(26640000)}
            </p>
            <p className="text-gray-400 mt-2">Annual Recurring Revenue</p>
          </div>
        </div>
      </section>

      {/* Discord Community Details */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
                style={{ background: 'rgba(88,101,242,0.2)', color: '#5865F2' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#5865F2">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
                Therapeutic Community
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold mb-6"
                style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }}
              >
                Anonymous Voice Support Groups
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Pro members get exclusive access to moderated voice channels where they can share experiences
                and support each other in a safe, anonymous environment.
              </p>

              <div className="space-y-4">
                {[
                  {
                    title: 'Small Groups (Max 10)',
                    desc: 'Intimate settings for meaningful connections and deeper sharing',
                  },
                  {
                    title: '100% Anonymous',
                    desc: 'Voice-only, no cameras, pseudonyms encouraged - complete privacy',
                  },
                  {
                    title: 'Psychologist-Approved',
                    desc: 'Group therapy protocols backed by clinical research and APA guidelines',
                  },
                  {
                    title: 'Specialized Channels',
                    desc: 'Anxiety, Depression, Addiction Recovery, Stress Management, and more',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(104,166,125,0.2)' }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#68a67d" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="p-8 rounded-3xl"
              style={{ background: 'rgba(88,101,242,0.1)', border: '1px solid rgba(88,101,242,0.3)' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-400">Live Voice Channel</span>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Anonymous_Hope', speaking: true },
                  { name: 'Silent_Strength', speaking: false },
                  { name: 'Rising_Phoenix', speaking: false },
                  { name: 'Calm_Waters', speaking: false },
                  { name: 'New_Dawn', speaking: false },
                ].map((user, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      user.speaking ? 'bg-[#68a67d]/20 ring-2 ring-[#68a67d]' : 'bg-white/5'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: 'rgba(255,255,255,0.1)' }}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-gray-300">{user.name}</span>
                    {user.speaking && (
                      <div className="ml-auto flex gap-0.5">
                        {[1, 2, 3].map((bar) => (
                          <div
                            key={bar}
                            className="w-1 bg-[#68a67d] rounded-full animate-pulse"
                            style={{ height: `${8 + bar * 4}px`, animationDelay: `${bar * 0.1}s` }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-black/30">
                <p className="text-xs text-gray-500 text-center">
                  "Sharing in these groups helped me realize I'm not alone.
                  The anonymity makes it easier to open up." - Member
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* B2B Details */}
      <section className="py-20 px-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ background: 'rgba(224,123,76,0.2)', color: '#e07b4c' }}
            >
              B2B Solution
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }}
            >
              White Label for Healthcare Providers
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Clinics and doctors can deploy our AI therapy assistant under their own brand
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div
              className="p-8 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <h3 className="text-xl font-bold mb-6">For Clinics & Hospitals</h3>
              <ul className="space-y-4">
                {[
                  '24/7 patient support between appointments',
                  'Reduce no-shows with engagement reminders',
                  'Collect mood data and progress metrics',
                  'Generate reports for treatment planning',
                  'Handle overflow during peak times',
                  'Multi-language support (Arabic, French, English)',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-[#e07b4c]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="p-8 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <h3 className="text-xl font-bold mb-6">For Private Practitioners</h3>
              <ul className="space-y-4">
                {[
                  'Extend your reach beyond office hours',
                  'Pre-session questionnaires & mood tracking',
                  'Crisis detection with instant alerts',
                  'Integration with your existing tools',
                  'HIPAA & GDPR compliant infrastructure',
                  'Custom conversation flows & protocols',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-[#68a67d]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className="mt-12 p-8 rounded-3xl text-center"
            style={{ background: 'linear-gradient(135deg, rgba(224,123,76,0.2) 0%, rgba(104,166,125,0.2) 100%)', border: '1px solid rgba(224,123,76,0.3)' }}
          >
            <p className="text-2xl font-bold mb-2">
              {formatCurrency(2000)}<span className="text-lg font-normal text-gray-400">/month per clinic</span>
            </p>
            <p className="text-gray-400">
              Includes setup, training, and dedicated support
            </p>
          </div>
        </div>
      </section>

      {/* Why Algeria First */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }}
          >
            Why Algeria First?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📊',
                title: 'Massive Unmet Need',
                desc: '75% of mental health needs go untreated. Only 1 psychiatrist per 100,000 people.',
              },
              {
                icon: '📱',
                title: 'Mobile-First Population',
                desc: '85% smartphone penetration. Young, tech-savvy demographic ready for digital health.',
              },
              {
                icon: '🚀',
                title: 'First Mover Advantage',
                desc: 'No significant competitors in AI mental health. Opportunity to define the market.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl text-center"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <span className="text-4xl mb-4 block">{item.icon}</span>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketing Strategy Link */}
      <section className="py-16 px-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-4xl mx-auto">
          <Link
            href="/investors/marketing"
            className="block p-8 rounded-3xl transition-all hover:scale-[1.01]"
            style={{ background: 'linear-gradient(135deg, rgba(104,166,125,0.2) 0%, rgba(88,101,242,0.2) 100%)', border: '1px solid rgba(104,166,125,0.3)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[#68a67d] text-sm font-medium mb-2 block">Deep Dive</span>
                <h3 className="text-2xl font-bold mb-2">Marketing Strategy</h3>
                <p className="text-gray-400">
                  Paid ads, SEO, referral programs, content strategy & growth tactics
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-[#68a67d]">
                <span className="font-medium">View Details</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-6"
            style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }}
          >
            Join Us in Transforming Mental Healthcare
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            We're looking for investors who share our vision of making mental wellness accessible to everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/213797339451?text=I'm%20interested%20in%20investing%20in%20WA3i"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium transition-all hover:scale-[1.02]"
              style={{ background: '#68a67d', color: 'white' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contact via WhatsApp
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium transition-all hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
            >
              View Product Demo
            </Link>
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
