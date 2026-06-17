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
    <section className="w-full px-4 sm:px-6 lg:px-8 mt-6 md:mt-8 mb-8 md:mb-12" aria-label="Featured promotions">
      <div className="relative bg-white rounded-[24px] overflow-hidden shadow-md border border-slate-200/50 group/slider w-full">
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
          pagination={false}
          a11y={{ prevSlideMessage: 'Previous slide', nextSlideMessage: 'Next slide' }}
          onSwiper={(swiper) => { swiperRef.current = swiper }}
          onSlideChange={handleSlideChange}
          className="hero-swiper w-full h-[320px] md:h-[450px] lg:h-[600px]"
        >
          {heroSlides.map((slide, idx) => (
            <SwiperSlide key={slide.id}>
              <HeroSlideCard slide={slide} isActive={activeIndex === idx} />
            </SwiperSlide>
          ))}
        </Swiper>
 
        {/* Custom Navigation Arrows with Premium Glassmorphism */}
        <button
          onClick={goPrev}
          aria-label="Previous slide"
          className="
            absolute left-4 top-1/2 -translate-y-1/2 z-20
            w-11 h-11 rounded-full bg-white/45 hover:bg-white/70 text-slate-800
            border border-white/40 flex items-center justify-center
            shadow-lg backdrop-blur-md opacity-0 group-hover/slider:opacity-100
            transition-all duration-300 hover:scale-105 active:scale-95
          "
        >
          <ChevronLeft size={20} className="text-slate-800" />
        </button>
 
        <button
          onClick={goNext}
          aria-label="Next slide"
          className="
            absolute right-4 top-1/2 -translate-y-1/2 z-20
            w-11 h-11 rounded-full bg-white/45 hover:bg-white/70 text-slate-800
            border border-white/40 flex items-center justify-center
            shadow-lg backdrop-blur-md opacity-0 group-hover/slider:opacity-100
            transition-all duration-300 hover:scale-105 active:scale-95
          "
        >
          <ChevronRight size={20} className="text-slate-800" />
        </button>
 
        {/* Custom Dot Pagination Indicators in a Floating Glassmorphic Pill */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-2 bg-slate-900/10 backdrop-blur-md px-4 py-2 rounded-full shadow-md" role="tablist" aria-label="Slide navigation">
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
                  ? 'w-6 h-2 bg-[#0F6FFF]'
                  : 'w-2 h-2 bg-slate-900/30 hover:bg-slate-900/50'
                }
              `}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
