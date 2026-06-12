import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, Zap } from 'lucide-react'
import { HeroSlide } from '../data/heroSlides'

interface HeroSlideCardProps {
  slide: HeroSlide
  isActive: boolean
}

export const HeroSlideCard: React.FC<HeroSlideCardProps> = ({ slide, isActive }) => {
  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-50">
      {/* Layered gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${slide.gradientFrom} ${slide.gradientVia} ${slide.gradientTo}`}
      />

      {/* Radial glow accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 80% at 75% 50%, ${slide.glowColor}, transparent 70%)`,
        }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 h-full flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 lg:px-16 py-8 gap-6">

        {/* ── LEFT: Text content ── */}
        <div className="flex-1 flex flex-col gap-3 md:gap-4 max-w-xl text-center md:text-left">

          {/* Badge */}
          <div className="flex justify-center md:justify-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-[10px] font-bold bg-white/80 text-slate-800 border border-slate-200 shadow-xs uppercase tracking-wider">
              <Zap size={10} className={slide.accentColor} />
              {slide.badge}
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-slate-800 leading-tight tracking-tight">
            {slide.title}{' '}
            <span className={slide.accentColor}>
              {slide.titleHighlight}
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
            {slide.subtitle}
          </p>

          {/* Category tag */}
          <div className="flex justify-center md:justify-start">
            <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400 border-l-2 border-[#2874F0] pl-2">
              {slide.tag} Collection
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            <Link
              to={slide.ctaLink}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-sm text-xs font-bold bg-[#2874F0] hover:bg-[#1e5ecb] text-white shadow-xs transition-colors"
            >
              <ShoppingBag size={13} />
              {slide.ctaText}
            </Link>
            <Link
              to={slide.secondaryCtaLink}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-sm text-xs font-bold bg-[#FF9F00] hover:bg-[#e68f00] text-white shadow-xs transition-colors"
            >
              {slide.secondaryCtaText}
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* ── RIGHT: Product image ── */}
        <div className="flex-shrink-0 relative flex items-center justify-center w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 xl:w-80 xl:h-80">
          {/* Glow disc behind image */}
          <div
            className="absolute inset-4 rounded-full opacity-40 blur-3xl"
            style={{ background: slide.glowColor }}
          />

          {/* Product image */}
          <img
            src={slide.image}
            alt={slide.imageAlt}
            loading="eager"
            className="relative z-10 w-full h-full object-contain hero-slide-image drop-shadow-lg"
          />
        </div>
      </div>
    </div>
  )
}
