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

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setActiveIndex(swiper.realIndex)
  }, [])

  const goPrev = () => swiperRef.current?.slidePrev()
  const goNext = () => swiperRef.current?.slideNext()
  const goTo = (index: number) => swiperRef.current?.slideToLoop(index)

  return (
    <section className="relative w-full px-4 sm:px-6 lg:px-8 py-3" aria-label="Featured promotions">
      <div className="max-w-7xl mx-auto">

        {/* Slider Container */}
        <div className="relative group/slider">

          {/* Outer shadow/border card */}
          <div className="relative rounded-sm overflow-hidden border border-slate-200 shadow-sm bg-white">
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
              style={{ height: 'clamp(280px, 40vw, 360px)' }}
            >
              {heroSlides.map((slide, idx) => (
                <SwiperSlide key={slide.id}>
                  <HeroSlideCard slide={slide} isActive={activeIndex === idx} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Arrows */}
            <button
              onClick={goPrev}
              aria-label="Previous slide"
              className="
                absolute left-2 top-1/2 -translate-y-1/2 z-20
                w-9 h-14 bg-white/90 hover:bg-white text-slate-800
                border border-slate-200 flex items-center justify-center
                shadow-md opacity-0 group-hover/slider:opacity-100
                transition-all duration-200 rounded-r-md
              "
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={goNext}
              aria-label="Next slide"
              className="
                absolute right-2 top-1/2 -translate-y-1/2 z-20
                w-9 h-14 bg-white/90 hover:bg-white text-slate-800
                border border-slate-200 flex items-center justify-center
                shadow-md opacity-0 group-hover/slider:opacity-100
                transition-all duration-200 rounded-l-md
              "
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Dot Pagination */}
          <div className="flex items-center justify-center gap-1.5 mt-3" role="tablist" aria-label="Slide navigation">
            {heroSlides.map((slide, idx) => (
              <button
                key={slide.id}
                role="tab"
                aria-selected={activeIndex === idx}
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => goTo(idx)}
                className={`
                  rounded-full transition-all duration-300
                  ${activeIndex === idx
                    ? 'w-6 h-2 bg-[#2874F0]'
                    : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                  }
                `}
              />
            ))}
          </div>
        </div>

        {/* Thumbnail/Labels row */}
        <div className="hidden lg:grid grid-cols-4 gap-3 mt-3">
          {heroSlides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => goTo(idx)}
              className={`
                p-2 rounded-sm border text-left transition-colors duration-150
                ${activeIndex === idx
                  ? 'bg-blue-50/50 border-[#2874F0] shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
                }
              `}
            >
              <span className={`block text-[10px] font-bold ${activeIndex === idx ? 'text-[#2874F0]' : 'text-slate-400'}`}>
                {slide.badge}
              </span>
              <span className={`block text-xs font-semibold truncate ${activeIndex === idx ? 'text-[#2874F0]' : 'text-slate-700'}`}>
                {slide.title} {slide.titleHighlight}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
