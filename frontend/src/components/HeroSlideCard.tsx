import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { HeroSlide } from '../data/heroSlides'

interface HeroSlideCardProps {
  slide: HeroSlide
  isActive: boolean
}

export const HeroSlideCard: React.FC<HeroSlideCardProps> = ({ slide, isActive }) => {
  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950 flex items-center">
      {/* Immersive background image with lazy loading */}
      <img
        src={slide.bgImage}
        alt={slide.imageAlt}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-45 scale-105 transition-transform duration-[8000ms] ease-out"
        style={{ transform: isActive ? 'scale(1)' : 'scale(1.05)' }}
      />

      {/* Dark gradient background overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${slide.gradientOverlay}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 pointer-events-none" />

      {/* Content wrapper */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-12 h-full">
        
        {/* ── LEFT: Text content ── */}
        <div className="flex-1 flex flex-col gap-4 sm:gap-6 text-center md:text-left items-center md:items-start max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
            <Sparkles size={12} className="text-[#14B8A6]" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#14B8A6]">
              {slide.badge}
            </span>
          </div>

          {/* Headline with slide-in animation */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.15] tracking-tight">
            {slide.title} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#0F6FFF] to-[#14B8A6] bg-clip-text text-transparent">
              {slide.titleHighlight}
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-slate-350 text-sm md:text-base leading-relaxed max-w-lg font-medium">
            {slide.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 w-full">
            <Link
              to={slide.ctaLink}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-[#0F6FFF] hover:bg-[#0D5ED9] text-white shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
            >
              <ShoppingBag size={14} className="text-white" />
              <span>{slide.ctaText}</span>
            </Link>
            <Link
              to={slide.secondaryCtaLink}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
            >
              <span>{slide.secondaryCtaText}</span>
              <ArrowRight size={14} className="text-white" />
            </Link>
          </div>
        </div>

        {/* ── RIGHT: Product image ── */}
        <div className="flex-1 flex justify-center items-center w-full md:w-auto relative max-w-md lg:max-w-lg">
          {/* Glassmorphic ring/disc glow behind image */}
          <div className="absolute w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(15,111,255,0.15),transparent_70%)] blur-2xl" />
          
          {/* Premium floating glass-card backplane */}
          <div className="absolute inset-0 bg-white/5 border border-white/10 backdrop-blur-xs rounded-[40px] shadow-2xl scale-95 pointer-events-none" />

          {/* Product image with animated floating */}
          <motion.div
            animate={isActive ? { y: [0, -15, 0] } : {}}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
            className="relative z-10 w-64 h-64 sm:w-72 sm:h-72 lg:w-88 lg:h-88 xl:w-96 xl:h-96 flex items-center justify-center p-6"
          >
            <img
              src={slide.productImage}
              alt={slide.imageAlt}
              className="w-full h-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.55)] max-h-[80vw] md:max-h-none scale-102 hover:scale-105 transition-transform duration-500"
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
