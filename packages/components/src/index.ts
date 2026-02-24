// @shipsite.dev/components — MDX Component Registry

// Context
export {
  ShipSiteProvider,
  useShipSite,
  useNavLinks,
  useResolveHref,
  useAlternateLinks,
} from './context/ShipSiteProvider';
export type { ShipSiteContextValue } from './context/ShipSiteProvider';

// Theme
export { ThemeProvider } from './context/ThemeProvider';
export { ThemeToggle } from './ui/theme-toggle';

// Layout
export { Header } from './layout/Header';
export { Footer } from './layout/Footer';
export { LocaleSwitcher } from './ui/locale-switcher';

// Marketing
export { Hero } from './marketing/Hero';
export { PageHero } from './marketing/PageHero';
export { Features, Feature } from './marketing/Features';
export {
  AlternatingFeatures,
  AlternatingFeatureRow,
  AlternatingFeatureItem,
} from './marketing/AlternatingFeatures';
export {
  PricingSection,
  PricingPlan,
  ComparisonRow,
  ComparisonCategory,
} from './marketing/PricingSection';
export { Companies } from './marketing/Companies';
export { Testimonial } from './marketing/Testimonial';
export { BannerCTA, BannerFeature } from './marketing/BannerCTA';
export { FAQ, FAQItem } from './marketing/FAQ';
export { Steps, Step } from './marketing/Steps';
export { CardGrid, CardGridItem } from './marketing/CardGrid';
export { CalloutCard } from './marketing/CalloutCard';
export { Stats, Stat } from './marketing/Stats';
export { Testimonials, TestimonialCard } from './marketing/Testimonials';
export { BentoGrid, BentoItem } from './marketing/BentoGrid';
export { Gallery, GalleryItem } from './marketing/Gallery';
export { SocialProof } from './marketing/SocialProof';
export { Carousel, CarouselItem } from './marketing/Carousel';
export { TabsSection, TabItem } from './marketing/TabsSection';

// Blog
export { BlogArticle } from './blog/BlogArticle';
export { BlogIndex } from './blog/BlogIndex';

// Image utilities
export { ThemeImage } from './ui/theme-image';
export type { ImageSource } from './ui/theme-image';

// UI primitives
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './ui/table';

// Prose (Markdown element overrides)
export { ProseH2, ProseH3, ProseH4, ProseP, ProseA, ProseUl, ProseOl, ProseLi, ProseBlockquote, ProsePre, ProseCode, ProseHr, ProseImg } from './ui/prose';

// Content
export { ContentPage, ContentSection } from './content/ContentPage';
