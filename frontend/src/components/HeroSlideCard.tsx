import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react'
import { HeroSlide } from '../data/heroSlides'

interface HeroSlideCardProps {
  slide: HeroSlide
  isActive: boolean
}

export const HeroSlideCard: React.FC<HeroSlideCardProps> = ({ slide, isActive }) => {
  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-50 flex items-center">
      {/* Immersive background image with smooth Ken Burns zoom effect */}
      <img
        src={slide.bgImage}
        alt={slide.imageAlt}
        loading="lazy"
        className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[7500ms] ease-out ${
          isActive ? 'scale-105' : 'scale-100'
        }`}
      />

      {/* Clean soft left-side gradient overlay for premium look & text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 via-white/50 to-transparent z-[1]" />

      {/* Content wrapper */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-8 md:py-16 flex items-center h-full">
        
        {/* Text content layout */}
        <div className="flex flex-col gap-4 sm:gap-6 text-left items-start max-w-2xl">
          
          {/* Category Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/5 border border-slate-900/10 backdrop-blur-md shadow-xs">
            <Sparkles size={11} className="text-[#0F6FFF] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">
              {slide.badge}
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15] tracking-tight">
            {slide.title} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#0F6FFF] to-[#14B8A6] bg-clip-text text-transparent">
              {slide.titleHighlight}
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-xl font-medium">
            {slide.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to={slide.ctaLink}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#0F6FFF] hover:bg-[#0D5ED9] text-white shadow-md shadow-blue-500/15 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
            >
              <ShoppingBag size={14} className="text-white" />
              <span>{slide.ctaText}</span>
            </Link>
            <Link
              to={slide.secondaryCtaLink}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider bg-white/70 hover:bg-white text-slate-800 border border-slate-200 shadow-sm backdrop-blur-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
            >
              <span>{slide.secondaryCtaText}</span>
              <ArrowRight size={14} className="text-slate-700" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
