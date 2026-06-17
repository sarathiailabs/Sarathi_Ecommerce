import React from 'react'
import { Link } from 'react-router-dom'
import { LifeBuoy, ArrowLeft, HelpCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export const HelpPage: React.FC = () => {
  return (
    <div id="helpcenter-section" className="min-h-[calc(100vh-130px)] flex items-center justify-center px-6 py-16 bg-[#F8FAFC]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center"
      >
        <div className="relative mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-[#0F6FFF] shadow-xs">
            <LifeBuoy size={32} />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-800 mb-3 uppercase tracking-tight">
          Help Center
        </h1>
        <p className="text-slate-500 text-xs leading-relaxed mb-8 font-semibold">
          Need assistance? Our support team is here to help you 24/7. Explore our FAQs or reach out directly to resolve any issues.
        </p>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 text-left mb-8 space-y-4">
          <div className="flex gap-3">
            <HelpCircle size={18} className="text-[#0F6FFF] shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-800">How do I track my order?</h4>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold">Go to 'My Orders' under your account section to view detailed delivery status updates.</p>
            </div>
          </div>
          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <HelpCircle size={18} className="text-[#0F6FFF] shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-800">What is the returns policy?</h4>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold">We offer a 30-day hassle-free return window for all premium electronics and accessories.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm bg-[#0F6FFF] text-white font-bold text-xs shadow-xs hover:bg-[#0D5ED9] transition-all"
          >
            <ArrowLeft size={14} />
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
