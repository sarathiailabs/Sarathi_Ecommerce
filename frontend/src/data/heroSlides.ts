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
  bgImage: string
  productImage: string
  imageAlt: string
  gradientOverlay: string
  accentColor: string
  tag: string
}

export const heroSlides: HeroSlide[] = [
  {
    id: 1,
    badge: '🔥 Smart Technology',
    title: 'Smart Technology.',
    titleHighlight: 'Elite Curation.',
    subtitle: 'Discover premium electronics and accessories designed for modern lifestyles.',
    ctaText: 'Shop Trending',
    ctaLink: '/?category=Electronics',
    secondaryCtaText: 'Explore Deals',
    secondaryCtaLink: '/?category=Deals',
    bgImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80',
    productImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Premium Flagship Smartphone',
    gradientOverlay: 'from-slate-950/90 via-slate-950/60 to-blue-950/20',
    accentColor: 'text-[#0F6FFF]',
    tag: 'Electronics',
  },
  {
    id: 2,
    badge: '📸 Photography Collection',
    title: 'Capture Every',
    titleHighlight: 'Moment.',
    subtitle: 'Professional cameras and accessories for creators and enthusiasts.',
    ctaText: 'Shop Cameras',
    ctaLink: '/?category=Mobiles',
    secondaryCtaText: 'Explore Collection',
    secondaryCtaLink: '/?category=Mobiles',
    bgImage: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=1920&q=80',
    productImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Professional DSLR Mirrorless Camera',
    gradientOverlay: 'from-slate-950/90 via-slate-950/60 to-cyan-950/20',
    accentColor: 'text-cyan-400',
    tag: 'Photography',
  },
  {
    id: 3,
    badge: '🎮 Gaming Collection',
    title: 'Level Up Your',
    titleHighlight: 'Gaming Setup.',
    subtitle: 'Consoles, monitors, accessories, and gaming essentials.',
    ctaText: 'Shop Gaming',
    ctaLink: '/?category=Electronics',
    secondaryCtaText: 'View Deals',
    secondaryCtaLink: '/?category=Deals',
    bgImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1920&q=80',
    productImage: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Gaming Controller Console',
    gradientOverlay: 'from-slate-950/90 via-slate-950/60 to-indigo-950/20',
    accentColor: 'text-[#0F6FFF]',
    tag: 'Gaming',
  },
  {
    id: 4,
    badge: '🏠 Smart Home Collection',
    title: 'Upgrade',
    titleHighlight: 'Your Home.',
    subtitle: 'Smart devices and appliances for a connected lifestyle.',
    ctaText: 'Explore Devices',
    ctaLink: '/?category=Appliances',
    secondaryCtaText: 'Shop Now',
    secondaryCtaLink: '/?category=Appliances',
    bgImage: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1920&q=80',
    productImage: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Smart Speaker Assistant',
    gradientOverlay: 'from-slate-950/90 via-slate-950/60 to-emerald-950/20',
    accentColor: 'text-emerald-400',
    tag: 'Appliances',
  },
]
