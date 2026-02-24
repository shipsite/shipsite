import React, { Children, isValidElement } from 'react';
import { TabsSectionClient } from './TabsSectionClient';
import type { ImageSource } from '../ui/theme-image';

interface TabItemProps {
  label: string;
  title?: string;
  description?: string;
  image?: ImageSource;
  children?: React.ReactNode;
}

export function TabItem(_props: TabItemProps) {
  return null;
}

interface TabsSectionProps {
  id?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function TabsSection({ children, ...rest }: TabsSectionProps) {
  const tabs: TabItemProps[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === TabItem) {
      tabs.push(child.props as TabItemProps);
    }
  });

  return <TabsSectionClient {...rest} tabs={tabs} />;
}
