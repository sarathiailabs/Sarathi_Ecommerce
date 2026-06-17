import React from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

export const ContactPage: React.FC = () => {
  return (
    <div id="contactus-section" className="min-h-[calc(100vh-130px)] flex items-center justify-center px-6 py-16 bg-[#F8FAFC]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center"
      >
        <div className="relative mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-[#0F6FFF] shadow-xs">
            <MessageSquare size={32} />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-800 mb-3 uppercase tracking-tight">
          Contact Us
        </h1>
        <p className="text-slate-500 text-xs leading-relaxed mb-8 font-semibold">
          Got questions? Get in touch with our team directly. We are happy to help!
        </p>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 text-left mb-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-[#0F6FFF]" />
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Support</h4>
              <p className="text-xs font-bold text-slate-800">support@sarathiailabs.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <Phone size={16} className="text-[#0F6FFF]" />
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone Helpline</h4>
              <p className="text-xs font-bold text-slate-800">+91 90224 73314</p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <MapPin size={16} className="text-[#0F6FFF]" />
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Headquarters</h4>
              <p className="text-xs font-bold text-slate-800">Kolhapur, Maharashtra, India</p>
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
