'use client';

import React, { useState, Children, isValidElement } from 'react';

interface PricingPlanProps {
  name: string;
  price: string;
  yearlyPrice?: string;
  description?: string;
  features: string[];
  cta: { label: string; href: string };
  popular?: boolean;
}

export function PricingPlan(_props: PricingPlanProps) {
  return null;
}

interface ComparisonRowProps {
  feature: string;
  values: (string | boolean)[];
}

export function ComparisonRow(_props: ComparisonRowProps) {
  return null;
}

interface ComparisonCategoryProps {
  title: string;
}

export function ComparisonCategory(_props: ComparisonCategoryProps) {
  return null;
}

interface PricingSectionProps {
  title?: string;
  description?: string;
  monthlyLabel?: string;
  yearlyLabel?: string;
  mostPopularLabel?: string;
  children: React.ReactNode;
}

export function PricingSection({ title, description, monthlyLabel = 'Monthly', yearlyLabel = 'Yearly', mostPopularLabel = 'Most Popular', children }: PricingSectionProps) {
  const [isYearly, setIsYearly] = useState(false);

  const plans: PricingPlanProps[] = [];
  const rows: { type: 'category' | 'row'; props: ComparisonRowProps | ComparisonCategoryProps }[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === PricingPlan) plans.push(child.props as PricingPlanProps);
    else if (child.type === ComparisonRow) rows.push({ type: 'row', props: child.props as ComparisonRowProps });
    else if (child.type === ComparisonCategory) rows.push({ type: 'category', props: child.props as ComparisonCategoryProps });
  });

  return (
    <section className="py-16 md:py-24">
      <div className="container-main">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold text-[var(--ss-text)] mb-4">{title}</h2>}
            {description && <p className="text-lg text-[var(--ss-text)]/60 max-w-2xl mx-auto">{description}</p>}
          </div>
        )}

        {plans.some((p) => p.yearlyPrice) && (
          <div className="flex items-center justify-center gap-3 mb-12">
            <span className={`text-sm font-medium ${!isYearly ? 'text-[var(--ss-text)]' : 'text-[var(--ss-text)]/50'}`}>{monthlyLabel}</span>
            <button onClick={() => setIsYearly(!isYearly)} className={`relative w-12 h-6 rounded-full transition-colors ${isYearly ? 'bg-[var(--ss-primary)]' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isYearly ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-[var(--ss-text)]' : 'text-[var(--ss-text)]/50'}`}>{yearlyLabel}</span>
          </div>
        )}

        <div className={`grid grid-cols-1 gap-6 ${plans.length === 2 ? 'md:grid-cols-2' : plans.length >= 3 ? 'md:grid-cols-3' : ''} mb-16`}>
          {plans.map((plan) => (
            <div key={plan.name} className={`relative rounded-2xl p-8 ${plan.popular ? 'bg-[var(--ss-primary)] text-white ring-2 ring-[var(--ss-primary)] shadow-xl' : 'bg-white border border-gray-200'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--ss-accent)] text-white text-xs font-medium rounded-full">{mostPopularLabel}</div>
              )}
              <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-[var(--ss-text)]'}`}>{plan.name}</h3>
              {plan.description && <p className={`text-sm mb-4 ${plan.popular ? 'text-white/80' : 'text-[var(--ss-text)]/60'}`}>{plan.description}</p>}
              <div className="mb-6">
                <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-[var(--ss-text)]'}`}>{isYearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price}</span>
              </div>
              <a href={plan.cta.href} className={`block w-full text-center py-3 rounded-lg font-medium transition-colors ${plan.popular ? 'bg-white text-[var(--ss-primary)] hover:bg-white/90' : 'bg-[var(--ss-primary)] text-white hover:bg-[var(--ss-primary-600)]'}`}>{plan.cta.label}</a>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className={`flex items-start gap-2 text-sm ${plan.popular ? 'text-white/90' : 'text-[var(--ss-text)]/70'}`}>
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 pr-4 font-medium text-[var(--ss-text)]">Feature</th>
                  {plans.map((plan) => <th key={plan.name} className="text-center py-4 px-4 font-medium text-[var(--ss-text)]">{plan.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  if (row.type === 'category') {
                    return <tr key={i} className="bg-gray-50"><td colSpan={plans.length + 1} className="py-3 px-4 font-semibold text-[var(--ss-text)]">{(row.props as ComparisonCategoryProps).title}</td></tr>;
                  }
                  const r = row.props as ComparisonRowProps;
                  return (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-3 pr-4 text-[var(--ss-text)]/70">{r.feature}</td>
                      {r.values.map((val, j) => (
                        <td key={j} className="text-center py-3 px-4">
                          {typeof val === 'boolean' ? (val ? <svg className="w-5 h-5 mx-auto text-[var(--ss-accent)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <span className="text-gray-300">&mdash;</span>) : <span className="text-[var(--ss-text)]/70">{val}</span>}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
