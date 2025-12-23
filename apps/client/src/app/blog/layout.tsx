import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Mental Wellness & Psychology Insights',
  description:
    'Explore articles on cognitive biases, emotional intelligence, EMDR therapy, and mental wellness. Learn how AI can help you understand your mind better.',
  keywords: [
    'psychology blog',
    'mental wellness articles',
    'cognitive bias explained',
    'emotional intelligence tips',
    'EMDR therapy guide',
    'AI psychology',
  ],
  openGraph: {
    title: 'Matcha Blog - Psychology & Mental Wellness',
    description:
      'Expert insights on cognitive biases, emotional patterns, and personal growth. Discover how AI is transforming mental wellness.',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
