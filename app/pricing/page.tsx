'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    period: 'month',
    description: 'For solo consultants and small practices',
    features: [
      '5 GB document storage',
      'Unlimited AI queries',
      '8 specialized agents',
      'PDF, DOCX, PPTX support',
      'Basic analytics',
      'Email support',
    ],
    cta: 'Start free trial',
    highlighted: false,
  },
  {
    id: 'team',
    name: 'Team',
    price: 149,
    period: 'month',
    description: 'For consulting teams and boutique firms',
    features: [
      '50 GB document storage',
      'Unlimited AI queries',
      'All 8 agents + custom agents',
      'Slack & Google Drive integration',
      'Advanced analytics & audit logs',
      'Workflow automation',
      'Priority support',
      'Up to 20 team members',
    ],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    period: 'month',
    description: 'For large firms and enterprise clients',
    features: [
      'Unlimited storage',
      'Unlimited everything',
      'Custom agent training',
      'All integrations (Slack, Drive, Notion, GitHub)',
      'SSO / SAML',
      'White-label option',
      'Dedicated CSM',
      'SLA guarantee',
      'Custom contracts & DPAs',
    ],
    cta: 'Contact sales',
    highlighted: false,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async (planId: string) => {
    if (planId === 'enterprise') {
      window.location.href = 'mailto:sales@neurallm.ai?subject=Enterprise inquiry';
      return;
    }
    setLoading(planId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.8px', marginBottom: 12 }}>
          Simple, transparent pricing
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
          14-day free trial on all plans. No credit card required to start.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              border: plan.highlighted ? '2px solid var(--accent)' : '1px solid var(--border)',
              borderRadius: 12,
              padding: '28px 24px',
              background: plan.highlighted ? 'var(--accent-light)' : 'var(--bg)',
              position: 'relative',
            }}
          >
            {plan.highlighted && (
              <div style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                background: 'var(--accent)', color: '#fff',
                fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 20,
              }}>
                MOST POPULAR
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>{plan.description}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 36, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-1px' }}>${plan.price}</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/{plan.period}</span>
              </div>
            </div>

            <button
              onClick={() => handleCheckout(plan.id)}
              disabled={loading === plan.id}
              style={{
                width: '100%',
                padding: '10px 0',
                borderRadius: 8,
                border: plan.highlighted ? 'none' : '1px solid var(--border)',
                background: plan.highlighted ? 'var(--accent)' : 'var(--bg)',
                color: plan.highlighted ? '#fff' : 'var(--text-primary)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                marginBottom: 24,
                opacity: loading === plan.id ? 0.7 : 1,
              }}
            >
              {loading === plan.id ? 'Loading...' : plan.cta}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {plan.features.map((feature, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <polyline points="2,7 5.5,10.5 12,4"/>
                  </svg>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 48, padding: '24px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          All plans include a 14-day free trial. Cancel anytime. Prices exclude VAT where applicable.
        </p>
      </div>
    </div>
  );
}
