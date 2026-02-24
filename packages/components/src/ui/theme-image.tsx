import React from 'react';
import { cn } from '../lib/utils';

export type ImageSource = string | { light: string; dark: string };

interface ThemeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: ImageSource;
}

export function ThemeImage({ src, className, ...props }: ThemeImageProps) {
  if (typeof src === 'string') {
    return <img src={src} className={className} {...props} />;
  }
  return (
    <>
      <img src={src.light} className={cn(className, 'dark:hidden')} {...props} />
      <img src={src.dark} className={cn(className, 'hidden dark:block')} {...props} />
    </>
  );
}
