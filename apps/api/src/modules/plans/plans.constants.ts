export interface PlanFeature {
  name: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  analysisLimit: number | null; // null = unlimited
  features: PlanFeature[];
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'plan_free',
    name: 'Free',
    slug: 'free',
    description: 'Get started with basic psychological profiling',
    priceMonthly: 0,
    priceYearly: 0,
    analysisLimit: 3,
    features: [
      { name: '3 analyses per month', included: true },
      { name: 'Basic psychological profile', included: true },
      { name: 'Main cognitive biases identification', included: true },
      { name: 'Thinking patterns breakdown', included: true },
      { name: 'Complete psychological profile', included: false },
      { name: 'All biases detected', included: false },
      { name: 'Monthly progress tracking', included: false },
      { name: 'Weekly email reports', included: false },
      { name: 'Priority support', included: false },
    ],
  },
  {
    id: 'plan_pro',
    name: 'Pro',
    slug: 'pro',
    description: 'Unlock your full psychological potential',
    priceMonthly: 15,
    priceYearly: 144, // $12/month billed yearly
    analysisLimit: null, // unlimited
    popular: true,
    features: [
      { name: 'Unlimited analyses', included: true },
      { name: 'Complete psychological profile', included: true },
      { name: 'All cognitive biases detected', included: true },
      { name: 'Advanced thinking patterns', included: true },
      { name: '30-day progress tracking', included: true },
      { name: 'Weekly email reports', included: true },
      { name: 'Export reports (PDF)', included: true },
      { name: 'Priority support', included: true },
    ],
  },
];
