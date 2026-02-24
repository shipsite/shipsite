'use client';

import React, { useState, Children, isValidElement } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { Section } from '../ui/section';
import { Button } from '../ui/button';

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
  id?: string;
  title?: string;
  description?: string;
  monthlyLabel?: string;
  yearlyLabel?: string;
  mostPopularLabel?: string;
  children: React.ReactNode;
}

export function PricingSection({ id, title, description, monthlyLabel = 'Monthly', yearlyLabel = 'Yearly', mostPopularLabel = 'Most Popular', children }: PricingSectionProps) {
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
    <Section id={id}>
      <div className="container-main">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>}
            {description && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>}
          </div>
        )}

        {plans.some((p) => p.yearlyPrice) && (
          <div className="flex items-center justify-center gap-3 mb-12">
            <span className={cn('text-sm font-medium', !isYearly ? 'text-foreground' : 'text-muted-foreground')}>{monthlyLabel}</span>
            <button onClick={() => setIsYearly(!isYearly)} className={cn('relative w-12 h-6 rounded-full transition-colors', isYearly ? 'bg-primary' : 'bg-muted')}>
              <span className={cn('absolute top-0.5 w-5 h-5 bg-background rounded-full shadow transition-transform', isYearly ? 'translate-x-6' : 'translate-x-0.5')} />
            </button>
            <span className={cn('text-sm font-medium', isYearly ? 'text-foreground' : 'text-muted-foreground')}>{yearlyLabel}</span>
          </div>
        )}

        <div className={cn('grid grid-cols-1 gap-6 mb-16', plans.length === 2 && 'md:grid-cols-2', plans.length >= 3 && 'md:grid-cols-3')}>
          {plans.map((plan) => (
            <div key={plan.name} className={cn(
              'relative rounded-2xl p-8',
              plan.popular
                ? 'glass-4 ring-2 ring-primary shadow-xl'
                : 'glass-1'
            )}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">{mostPopularLabel}</div>
              )}
              <h3 className="text-xl font-bold mb-2 text-foreground">{plan.name}</h3>
              {plan.description && <p className="text-sm mb-4 text-muted-foreground">{plan.description}</p>}
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{isYearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price}</span>
              </div>
              <Button asChild className="w-full" variant={plan.popular ? 'default' : 'glow'}>
                <a href={plan.cta.href}>{plan.cta.label}</a>
              </Button>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
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
                <tr className="border-b border-border">
                  <th className="text-left py-4 pr-4 font-medium text-foreground">Feature</th>
                  {plans.map((plan) => <th key={plan.name} className="text-center py-4 px-4 font-medium text-foreground">{plan.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  if (row.type === 'category') {
                    return <tr key={i} className="bg-muted"><td colSpan={plans.length + 1} className="py-3 px-4 font-semibold text-foreground">{(row.props as ComparisonCategoryProps).title}</td></tr>;
                  }
                  const r = row.props as ComparisonRowProps;
                  return (
                    <tr key={i} className="border-b border-border">
                      <td className="py-3 pr-4 text-muted-foreground">{r.feature}</td>
                      {r.values.map((val, j) => (
                        <td key={j} className="text-center py-3 px-4">
                          {typeof val === 'boolean' ? (val ? <Check className="w-5 h-5 mx-auto text-primary" /> : <span className="text-muted-foreground/30">&mdash;</span>) : <span className="text-muted-foreground">{val}</span>}
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
    </Section>
  );
}
