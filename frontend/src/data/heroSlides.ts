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
    badge: 'Smartphones & Electronics',
    title: 'Next-Gen Flagships.',
    titleHighlight: 'Elite Performance.',
    subtitle: 'Discover premium smartphones and accessories designed for the modern lifestyle.',
    ctaText: 'Shop Now',
    ctaLink: '/?category=Electronics',
    secondaryCtaText: 'Explore Collection',
    secondaryCtaLink: '/?category=Electronics',
    bgImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1920&q=80',
    productImage: '',
    imageAlt: 'Premium Flagship Smartphones',
    gradientOverlay: '',
    accentColor: 'text-[#0F6FFF]',
    tag: 'Electronics',
  },
  {
    id: 2,
    badge: 'Fashion Collection',
    title: 'Elegance Redefined.',
    titleHighlight: 'Style Reimagined.',
    subtitle: 'Explore premium luxury apparel and trendsetting outfits for every occasion.',
    ctaText: 'Shop Now',
    ctaLink: '/?category=Fashion',
    secondaryCtaText: 'Explore Collection',
    secondaryCtaLink: '/?category=Fashion',
    bgImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1920&q=80',
    productImage: '',
    imageAlt: 'Premium Fashion Collection',
    gradientOverlay: '',
    accentColor: 'text-[#14B8A6]',
    tag: 'Fashion',
  },
  {
    id: 3,
    badge: 'Home Appliances',
    title: 'Modern Cookware.',
    titleHighlight: 'Smart Living.',
    subtitle: 'Elevate your home environment with energy-efficient smart appliances.',
    ctaText: 'Shop Now',
    ctaLink: '/?category=Home%20%26%20Kitchen',
    secondaryCtaText: 'Explore Collection',
    secondaryCtaLink: '/?category=Home%20%26%20Kitchen',
    bgImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1920&q=80',
    productImage: '',
    imageAlt: 'Modern Home Appliances',
    gradientOverlay: '',
    accentColor: 'text-amber-500',
    tag: 'Home & Kitchen',
  },
  {
    id: 4,
    badge: 'Smart Home Devices',
    title: 'Intelligent Control.',
    titleHighlight: 'Connected Spaces.',
    subtitle: 'Seamless ambient lighting, security locks, and hub controllers at your command.',
    ctaText: 'Shop Now',
    ctaLink: '/?category=Electronics',
    secondaryCtaText: 'Explore Collection',
    secondaryCtaLink: '/?category=Electronics',
    bgImage: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1920&q=80',
    productImage: '',
    imageAlt: 'Smart Home Devices',
    gradientOverlay: '',
    accentColor: 'text-emerald-500',
    tag: 'Smart Home',
  },
  {
    id: 5,
    badge: 'Gaming Accessories',
    title: 'Immersive Action.',
    titleHighlight: 'Pro Setup.',
    subtitle: 'Mechanical keyboards, latency-free headsets, and responsive controllers.',
    ctaText: 'Shop Now',
    ctaLink: '/?category=Electronics',
    secondaryCtaText: 'Explore Collection',
    secondaryCtaLink: '/?category=Electronics',
    bgImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80',
    productImage: '',
    imageAlt: 'High Performance Gaming Accessories',
    gradientOverlay: '',
    accentColor: 'text-indigo-500',
    tag: 'Gaming',
  }
]
