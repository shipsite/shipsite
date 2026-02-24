import React, { Children, isValidElement } from 'react';
import { PricingSectionClient } from './PricingSectionClient';

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

export function PricingSection({ children, ...rest }: PricingSectionProps) {
  const plans: PricingPlanProps[] = [];
  const rows: { type: 'category' | 'row'; props: ComparisonRowProps | ComparisonCategoryProps }[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === PricingPlan) plans.push(child.props as PricingPlanProps);
    else if (child.type === ComparisonRow) rows.push({ type: 'row', props: child.props as ComparisonRowProps });
    else if (child.type === ComparisonCategory) rows.push({ type: 'category', props: child.props as ComparisonCategoryProps });
  });

  return <PricingSectionClient {...rest} plans={plans} rows={rows} />;
}
