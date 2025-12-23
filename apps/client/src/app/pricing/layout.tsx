import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Free & Pro Plans',
  description:
    'Choose the perfect Matcha plan for your journey. Start free with 50 messages/month or upgrade to Pro for unlimited AI-powered psychological insights, voice therapy, and more.',
  keywords: [
    'Matcha pricing',
    'AI therapy pricing',
    'mental wellness app cost',
    'psychological analysis free',
    'cognitive bias app',
  ],
  openGraph: {
    title: 'Matcha Pricing - Start Free, Upgrade Anytime',
    description:
      'Free tier: 50 messages/month. Pro: Unlimited analysis, voice therapy, EMDR sessions. Start your mental wellness journey today.',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
