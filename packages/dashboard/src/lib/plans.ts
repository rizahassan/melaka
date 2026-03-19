/**
 * Plan definitions - shared between client and server.
 */

export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    description: 'Self-hosted',
    features: [
      'Full SDK & CLI access',
      'Unlimited self-hosted translations',
      '3 AI providers (Gemini, OpenAI, Claude)',
      'Deploy your own Cloud Functions',
      'Community support',
    ],
    limits: {
      translations: -1, // unlimited (self-hosted)
      projects: 1,
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 19,
    priceId: null, // Set at runtime from env
    description: 'For small projects',
    features: [
      '2,000 translations/month',
      'Fully managed — no code needed',
      'No AI API keys needed',
      'Hosted dashboard',
      '3 projects',
      'Email support',
    ],
    limits: {
      translations: 2000,
      projects: 3,
    },
    overage: 0.008, // $0.008 per translation over limit
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 49,
    priceId: null, // Set at runtime from env
    description: 'For growing apps',
    popular: true,
    features: [
      '10,000 translations/month',
      'Everything in Starter',
      '10 projects',
      'Priority support',
      'Translation analytics',
    ],
    limits: {
      translations: 10000,
      projects: 10,
    },
    overage: 0.005, // $0.005 per translation over limit
  },
  scale: {
    id: 'scale',
    name: 'Scale',
    price: 149,
    priceId: null, // Set at runtime from env
    description: 'For high-volume apps',
    features: [
      '50,000 translations/month',
      'Everything in Pro',
      'Unlimited projects',
      'Dedicated support',
    ],
    limits: {
      translations: 50000,
      projects: -1, // unlimited
    },
    overage: 0.003, // $0.003 per translation over limit
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: -1, // Custom pricing
    priceId: null,
    description: 'Custom solutions',
    features: [
      'Custom translation limits',
      'Everything in Scale',
      'SSO & audit logs',
      'Dedicated account manager',
    ],
    limits: {
      translations: -1, // unlimited/custom
      projects: -1, // unlimited
    },
    overage: 0, // Custom
  },
} as const;

export type PlanId = keyof typeof PLANS;

// Trial configuration
export const TRIAL_CONFIG = {
  durationDays: 14,
  translationLimit: 500,
} as const;
