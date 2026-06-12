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
    badge: '🔥 Top Seller',
    title: 'Next-Gen Flagship',
    titleHighlight: 'Smartphones',
    subtitle: 'Experience parallel speed with high-refresh AMOLED screens, professional camera sets, and intelligent features.',
    ctaText: 'Shop Now',
    ctaLink: '/?category=Smartphones',
    secondaryCtaText: 'Explore More',
    secondaryCtaLink: '/?category=Smartphones',
    image: '/hero/smartphone.png',
    imageAlt: 'Premium Flagship Smartphone',
    gradientFrom: 'from-blue-50',
    gradientVia: 'via-slate-50',
    gradientTo: 'to-blue-100',
    accentColor: 'text-[#2874F0]',
    glowColor: 'rgba(40, 116, 240, 0.12)',
    tag: 'Smartphones',
  },
  {
    id: 2,
    badge: '🎧 Premium Sound',
    title: 'Immersive Studio',
    titleHighlight: 'Audio Noise Cancellation',
    subtitle: 'High fidelity audio meets cutting-edge adaptive noise cancelling. Get lost in true high-res acoustics.',
    ctaText: 'Explore Collection',
    ctaLink: '/?category=Audio',
    secondaryCtaText: 'View Deals',
    secondaryCtaLink: '/?category=deals',
    image: '/hero/headphones.png',
    imageAlt: 'Premium Wireless Headphones',
    gradientFrom: 'from-orange-50',
    gradientVia: 'via-slate-50',
    gradientTo: 'to-amber-100',
    accentColor: 'text-[#FF9F00]',
    glowColor: 'rgba(255, 159, 0, 0.12)',
    tag: 'Audio',
  },
  {
    id: 3,
    badge: '⌚ Smart Wearable',
    title: 'Health Tracking',
    titleHighlight: 'Redefined',
    subtitle: 'Advanced heart monitoring, onboard GPS navigation, and active multi-day battery backups.',
    ctaText: 'Shop Now',
    ctaLink: '/?category=Wearables',
    secondaryCtaText: 'Explore All',
    secondaryCtaLink: '/?category=Wearables',
    image: '/hero/smartwatch.png',
    imageAlt: 'Premium Smartwatch',
    gradientFrom: 'from-emerald-50',
    gradientVia: 'via-slate-50',
    gradientTo: 'to-teal-100',
    accentColor: 'text-[#388E3C]',
    glowColor: 'rgba(56, 142, 60, 0.12)',
    tag: 'Wearables',
  },
  {
    id: 4,
    badge: '💻 Ultimate Power',
    title: 'Lightweight Professional',
    titleHighlight: 'Ultrabooks',
    subtitle: 'Sleek designs housing ultra-high performance processors and vivid visual panels built for designers.',
    ctaText: 'Explore Pro',
    ctaLink: '/?category=Laptops',
    secondaryCtaText: 'View All',
    secondaryCtaLink: '/?category=Laptops',
    image: '/hero/laptop.png',
    imageAlt: 'Premium Ultrabook Laptop',
    gradientFrom: 'from-slate-50',
    gradientVia: 'via-blue-50',
    gradientTo: 'to-slate-100',
    accentColor: 'text-[#2874F0]',
    glowColor: 'rgba(40, 116, 240, 0.12)',
    tag: 'Laptops',
  },
]
