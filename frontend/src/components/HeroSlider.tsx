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
    <section className="relative w-full overflow-hidden rounded-b-[36px] md:rounded-b-[48px] shadow-2xl border-b border-slate-800/80" aria-label="Featured promotions">
      <div className="relative group/slider w-full">
        <Swiper
          modules={[Autoplay, Navigation, Pagination, EffectFade, A11y]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          loop={true}
          speed={1000}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{ clickable: true }}
          a11y={{ prevSlideMessage: 'Previous slide', nextSlideMessage: 'Next slide' }}
          onSwiper={(swiper) => { swiperRef.current = swiper }}
          onSlideChange={handleSlideChange}
          className="hero-swiper w-full"
          style={{ height: 'clamp(500px, 60vh, 650px)' }}
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
            absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20
            w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white
            border border-white/10 flex items-center justify-center
            shadow-2xl backdrop-blur-md opacity-0 group-hover/slider:opacity-100
            transition-all duration-300 hover:scale-105 active:scale-95
          "
        >
          <ChevronLeft size={20} className="text-white" />
        </button>

        <button
          onClick={goNext}
          aria-label="Next slide"
          className="
            absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20
            w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white
            border border-white/10 flex items-center justify-center
            shadow-2xl backdrop-blur-md opacity-0 group-hover/slider:opacity-100
            transition-all duration-300 hover:scale-105 active:scale-95
          "
        >
          <ChevronRight size={20} className="text-white" />
        </button>

        {/* Custom Dot Pagination Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-2.5" role="tablist" aria-label="Slide navigation">
          {heroSlides.map((slide, idx) => (
            <button
              key={slide.id}
              role="tab"
              aria-selected={activeIndex === idx}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => goTo(idx)}
              className={`
                rounded-full transition-all duration-300 h-2.5
                ${activeIndex === idx
                  ? 'w-8 bg-[#0F6FFF]'
                  : 'w-2.5 bg-white/30 hover:bg-white/50'
                }
              `}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
