import React, { useRef, useState, useCallback } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination, EffectFade, A11y } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Swiper CSS
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

import { heroSlides } from '../data/heroSlides'
import { HeroSlideCard } from './HeroSlideCard'

export const HeroSlider: React.FC = () => {
  const swiperRef = useRef<SwiperType | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isBeginning, setIsBeginning] = useState(true)
  const [isEnd, setIsEnd] = useState(false)

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setActiveIndex(swiper.realIndex)
    setIsBeginning(swiper.isBeginning)
    setIsEnd(swiper.isEnd)
  }, [])

  const goPrev = () => swiperRef.current?.slidePrev()
  const goNext = () => swiperRef.current?.slideNext()
  const goTo = (index: number) => swiperRef.current?.slideToLoop(index)

  return (
    <section className="relative w-full px-4 sm:px-6 lg:px-8 py-4" aria-label="Featured promotions">
      <div className="max-w-7xl mx-auto">

        {/* ── Slider Container ── */}
        <div className="relative group/slider">

          {/* Outer glow halo */}
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-purple-600/20 via-indigo-600/10 to-purple-600/20 blur-md opacity-60 group-hover/slider:opacity-90 transition-opacity duration-500 pointer-events-none" />

          {/* Swiper wrapper */}
          <div className="relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl shadow-purple-950/50">
            <Swiper
              modules={[Autoplay, Navigation, Pagination, EffectFade, A11y]}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              loop={true}
              speed={800}
              autoplay={{
                delay: 4500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              pagination={{ clickable: false }}
              a11y={{ prevSlideMessage: 'Previous slide', nextSlideMessage: 'Next slide' }}
              onSwiper={(swiper) => { swiperRef.current = swiper }}
              onSlideChange={handleSlideChange}
              className="hero-swiper w-full"
              style={{ height: 'clamp(340px, 55vw, 520px)' }}
            >
              {heroSlides.map((slide, idx) => (
                <SwiperSlide key={slide.id}>
                  <HeroSlideCard slide={slide} isActive={activeIndex === idx} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* ── Custom Prev Arrow ── */}
            <button
              onClick={goPrev}
              aria-label="Previous slide"
              className="
                absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20
                w-9 h-9 sm:w-11 sm:h-11 rounded-2xl
                bg-slate-900/70 hover:bg-slate-800/90
                border border-white/10 hover:border-purple-500/40
                text-slate-300 hover:text-white
                backdrop-blur-md
                flex items-center justify-center
                shadow-lg shadow-black/30
                opacity-0 group-hover/slider:opacity-100
                hover:scale-110 active:scale-95
                transition-all duration-200
              "
            >
              <ChevronLeft size={18} />
            </button>

            {/* ── Custom Next Arrow ── */}
            <button
              onClick={goNext}
              aria-label="Next slide"
              className="
                absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20
                w-9 h-9 sm:w-11 sm:h-11 rounded-2xl
                bg-slate-900/70 hover:bg-slate-800/90
                border border-white/10 hover:border-purple-500/40
                text-slate-300 hover:text-white
                backdrop-blur-md
                flex items-center justify-center
                shadow-lg shadow-black/30
                opacity-0 group-hover/slider:opacity-100
                hover:scale-110 active:scale-95
                transition-all duration-200
              "
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* ── Custom Dot Pagination ── */}
          <div className="flex items-center justify-center gap-2.5 mt-4" role="tablist" aria-label="Slide navigation">
            {heroSlides.map((slide, idx) => (
              <button
                key={slide.id}
                role="tab"
                aria-selected={activeIndex === idx}
                aria-label={`Go to slide ${idx + 1}: ${slide.titleHighlight}`}
                onClick={() => goTo(idx)}
                className={`
                  rounded-full border transition-all duration-400 ease-out
                  ${activeIndex === idx
                    ? 'w-8 h-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 border-purple-500/50 shadow-md shadow-purple-600/30'
                    : 'w-2.5 h-2.5 bg-slate-700 border-white/10 hover:bg-slate-600 hover:border-white/20'
                  }
                `}
              />
            ))}
          </div>

          {/* ── Slide Counter ── */}
          <div className="absolute bottom-10 right-4 sm:right-6 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-sm border border-white/5">
            <span className="text-white font-bold text-xs tabular-nums">{String(activeIndex + 1).padStart(2, '0')}</span>
            <span className="text-slate-600 text-xs">/</span>
            <span className="text-slate-500 text-xs tabular-nums">{String(heroSlides.length).padStart(2, '0')}</span>
          </div>


        </div>

        {/* ── Slide thumbnails / labels row ── */}
        <div className="hidden lg:grid grid-cols-4 gap-3 mt-4">
          {heroSlides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => goTo(idx)}
              className={`
                relative p-3 rounded-2xl border text-left transition-all duration-300
                ${activeIndex === idx
                  ? 'bg-purple-600/10 border-purple-500/40 shadow-md shadow-purple-700/10'
                  : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/40 hover:border-white/10'
                }
              `}
            >
              <span className={`block text-xs font-bold mb-0.5 ${activeIndex === idx ? 'text-purple-300' : 'text-slate-400'}`}>
                {slide.badge}
              </span>
              <span className={`block text-sm font-semibold leading-tight ${activeIndex === idx ? 'text-white' : 'text-slate-300'}`}>
                {slide.title} {slide.titleHighlight}
              </span>
              {activeIndex === idx && (
                <span className="absolute bottom-2 right-3 w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
