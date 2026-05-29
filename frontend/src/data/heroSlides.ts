export interface HeroSlide {
  id: number
  badge: string
  title: string
  titleHighlight: string
  subtitle: string
  ctaText: string
  ctaLink: string
  secondaryCtaText: string
  secondaryCtaLink: string
  image: string
  imageAlt: string
  gradientFrom: string
  gradientVia: string
  gradientTo: string
  accentColor: string
  glowColor: string
  tag: string
}

export const heroSlides: HeroSlide[] = [
  {
    id: 1,
    badge: '🔥 New Arrival',
    title: 'Next-Gen Flagship',
    titleHighlight: 'Smartphones',
    subtitle: 'Experience unparalleled performance with AMOLED displays, pro-grade cameras, and all-day AI power. Your future in your hands.',
    ctaText: 'Shop Now',
    ctaLink: '/',
    secondaryCtaText: 'Explore All',
    secondaryCtaLink: '/',
    image: '/hero/smartphone.png',
    imageAlt: 'Premium Flagship Smartphone',
    gradientFrom: 'from-purple-950',
    gradientVia: 'via-indigo-950',
    gradientTo: 'to-slate-950',
    accentColor: 'text-purple-400',
    glowColor: 'rgba(139, 92, 246, 0.35)',
    tag: 'Smartphones',
  },
  {
    id: 2,
    badge: '🎧 Best Seller',
    title: 'Immersive Sound,',
    titleHighlight: 'Zero Limits',
    subtitle: 'Studio-quality audio meets intelligent noise cancellation. Lose yourself in crystal-clear highs and room-shaking bass.',
    ctaText: 'Shop Now',
    ctaLink: '/',
    secondaryCtaText: 'Explore All',
    secondaryCtaLink: '/',
    image: '/hero/headphones.png',
    imageAlt: 'Premium Wireless Headphones',
    gradientFrom: 'from-indigo-950',
    gradientVia: 'via-violet-950',
    gradientTo: 'to-slate-950',
    accentColor: 'text-indigo-400',
    glowColor: 'rgba(99, 102, 241, 0.35)',
    tag: 'Audio',
  },
  {
    id: 3,
    badge: '⌚ Limited Edition',
    title: 'Your Health,',
    titleHighlight: 'Redefined',
    subtitle: 'Advanced biometric tracking, GPS precision, and a week-long battery. The smartwatch that keeps up with your every move.',
    ctaText: 'Shop Now',
    ctaLink: '/',
    secondaryCtaText: 'Explore All',
    secondaryCtaLink: '/',
    image: '/hero/smartwatch.png',
    imageAlt: 'Premium Smartwatch',
    gradientFrom: 'from-violet-950',
    gradientVia: 'via-purple-950',
    gradientTo: 'to-slate-950',
    accentColor: 'text-violet-400',
    glowColor: 'rgba(167, 139, 250, 0.35)',
    tag: 'Wearables',
  },
  {
    id: 4,
    badge: '💻 Pro Series',
    title: 'Power Meets',
    titleHighlight: 'Elegance',
    subtitle: 'Ultra-thin chassis, blazing fast processors, and OLED brilliance. The laptop engineered for creators who demand more.',
    ctaText: 'Shop Now',
    ctaLink: '/',
    secondaryCtaText: 'Explore All',
    secondaryCtaLink: '/',
    image: '/hero/laptop.png',
    imageAlt: 'Premium Ultrabook Laptop',
    gradientFrom: 'from-slate-950',
    gradientVia: 'via-indigo-950',
    gradientTo: 'to-purple-950',
    accentColor: 'text-blue-400',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    tag: 'Laptops',
  },
]
