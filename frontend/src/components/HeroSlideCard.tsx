import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, Zap } from 'lucide-react'
import { HeroSlide } from '../data/heroSlides'

interface HeroSlideCardProps {
  slide: HeroSlide
  isActive: boolean
}

export const HeroSlideCard: React.FC<HeroSlideCardProps> = ({ slide, isActive }) => {
  const imageRef = useRef<HTMLImageElement>(null)

  // Removed active image transform animation for a static display

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
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

      {/* Top-left ambient glow */}
      <div
        className="absolute -top-20 -left-20 w-96 h-96 rounded-full pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(circle, ${slide.glowColor}, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />

      {/* Animated grid / mesh overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 h-full flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 lg:px-16 py-8 gap-6">

        {/* ── LEFT: Text content ── */}
        <div className="flex-1 flex flex-col gap-4 md:gap-5 max-w-xl text-center md:text-left">

          {/* Badge */}
          <div className="flex justify-center md:justify-start">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/5 text-white border border-white/10 backdrop-blur-sm shadow-inner">
              <Zap size={11} className={slide.accentColor} />
              {slide.badge}
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-extrabold text-white leading-tight tracking-tight">
            {slide.title}{' '}
            <span
              className={`${slide.accentColor} bg-clip-text`}
              style={{
                backgroundImage: `linear-gradient(135deg, currentColor, rgba(255,255,255,0.8))`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {slide.titleHighlight}
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-slate-300/80 text-sm sm:text-base leading-relaxed max-w-md mx-auto md:mx-0">
            {slide.subtitle}
          </p>

          {/* Category tag */}
          <div className="flex justify-center md:justify-start">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-500 border-l-2 border-purple-500/50 pl-2">
              {slide.tag} Collection
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
            <Link
              to={slide.ctaLink}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-700/30 hover:shadow-purple-500/40 hover:scale-[1.04] active:scale-[0.97] transition-all duration-200"
            >
              <ShoppingBag size={15} />
              {slide.ctaText}
            </Link>
            <Link
              to={slide.secondaryCtaLink}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-white/20 backdrop-blur-sm hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
            >
              {slide.secondaryCtaText}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* ── RIGHT: Product image ── */}
        <div className="flex-shrink-0 relative flex items-center justify-center w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96">
          {/* Glow disc behind image */}
          <div
            className="absolute inset-4 rounded-full opacity-50 blur-3xl"
            style={{ background: slide.glowColor }}
          />

          {/* Floating ring decoration */}
          <div
            className="absolute inset-0 rounded-full border opacity-10"
            style={{ borderColor: slide.glowColor }}
          />
          <div
            className="absolute inset-8 rounded-full border opacity-5"
            style={{ borderColor: slide.glowColor }}
          />

          {/* Product image */}
          <img
            ref={imageRef}
            src={slide.image}
            alt={slide.imageAlt}
            loading="eager"
            className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
            style={{
              filter: `drop-shadow(0 20px 40px ${slide.glowColor})`,
            }}
          />
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
    </div>
  )
}
