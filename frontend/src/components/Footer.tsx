import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Phone, MapPin, ArrowRight, ChevronDown } from 'lucide-react'

const LINKS = {
  Shop: [
    { label: 'All Products', href: '/products#products-section' },
    { label: 'Electronics', href: '/products?category=electronics#electronics-section' },
    { label: 'Home & Kitchen', href: '/products?category=home-kitchen#home-kitchen-section' },
    { label: 'Fashion', href: '/products?category=fashion#fashion-section' },
    { label: 'Sports', href: '/products?category=sports#sports-section' },
  ],
  Account: [
    { label: 'Sign In', href: '/login#signin-section' },
    { label: 'Create Account', href: '/register#createaccount-section' },
    { label: 'My Orders', href: '/orders#myorders-section' },
    { label: 'Cart', href: '/cart#cart-section' },
  ],
  Support: [
    { label: 'Help Center', href: '/help#helpcenter-section' },
    { label: 'Returns Policy', href: '/returns#returnspolicy-section' },
    { label: 'Shipping Info', href: '/shipping#shippinginfo-section' },
    { label: 'Contact Us', href: '/contact#contactus-section' },
  ],
}

export const Footer: React.FC = () => {
  const navigate = useNavigate()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Shop: false,
    Account: false,
    Support: false
  })

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <footer data-testid="main-footer" role="contentinfo" className="w-full bg-[#172337] text-[#878787] border-t border-slate-700/50 mt-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-5 sm:pt-14 sm:pb-8">
        
        {/* Newsletter bar */}
        <div data-testid="newsletter-section" className="bg-[#213147] rounded-2xl p-4 sm:p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 border border-slate-700/30">
          <div className="text-center sm:text-left space-y-0.5 sm:space-y-1">
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-white leading-tight">Stay in the loop</h3>
            <p className="text-[11px] sm:text-xs md:text-sm text-slate-300">Get exclusive deals, product launches, and shopping news.</p>
          </div>
          <form data-testid="newsletter-form" onSubmit={(e) => e.preventDefault()} className="flex gap-2 w-full sm:w-auto shrink-0">
            <input
              type="email"
              name="newsletter-email"
              data-testid="newsletter-email-input"
              placeholder="Enter your email..."
              title="Subscribe to newsletter"
              aria-label="Newsletter email"
              className="h-10 px-4 text-xs text-slate-800 bg-white rounded-full focus:outline-none placeholder-slate-400 sm:w-64 flex-1 border border-slate-300"
            />
            <button data-testid="newsletter-subscribe-btn" type="submit" title="Subscribe to our newsletter" className="h-10 px-5 bg-[#14B8A6] hover:bg-[#11998a] text-white text-xs font-bold rounded-full flex items-center justify-center gap-1.5 transition-colors shrink-0">
              Subscribe
              <ArrowRight size={13} />
            </button>
          </form>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 flex flex-col gap-3.5">
            <Link
              to="/"
              onTouchEnd={(e) => {
                e.preventDefault()
                navigate('/')
              }}
              data-testid="footer-logo"
              aria-label="Sarathi home"
              className="flex items-center gap-2.5 self-start"
            >
              <img
                src="/sarathi-logo.jpg"
                alt="Sarathi Logo"
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain rounded-full border border-white/20 bg-white"
              />
              <div>
                <div className="text-sm sm:text-base font-extrabold text-white tracking-tight">Sarathi Store</div>
                <div className="text-[8px] sm:text-[9px] text-[#14B8A6] font-semibold tracking-wider uppercase -mt-0.5">Powered by Sarathi AI Labs</div>
              </div>
            </Link>
            <p className="hidden sm:block text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Smart shopping experiences curated by Sarathi AI Labs. Quality products, fast logistics.
            </p>
            
            {/* Contact info list */}
            <div className="flex flex-col gap-y-2 text-[11px] sm:text-xs text-slate-400 mt-1 sm:mt-0">
              <a href="mailto:support@sarathiailabs.com" className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                <Mail size={12} className="text-[#14B8A6]/70 shrink-0" />
                <span>support@sarathiailabs.com</span>
              </a>
              <a href="tel:+919022473314" className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                <Phone size={12} className="text-[#14B8A6]/70 shrink-0" />
                <span>+91 90224 73314</span>
              </a>
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-[#14B8A6]/70 shrink-0" />
                <span>Kolhapur, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(LINKS).map(([title, items]) => {
            const isOpen = openSections[title]
            return (
              <div 
                key={title} 
                data-testid={`footer-links-${title.toLowerCase()}`} 
                className="border-b border-slate-800/60 sm:border-0 pb-2 sm:pb-0"
              >
                {/* Mobile Accordion Header Button */}
                <button
                  onClick={() => toggleSection(title)}
                  className="flex sm:hidden w-full items-center justify-between py-2 text-xs font-semibold text-white uppercase tracking-wider focus:outline-none"
                >
                  <span>{title}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                </button>

                {/* Desktop Header */}
                <h4 className="hidden sm:block text-xs font-semibold text-white uppercase tracking-wider mb-4">{title}</h4>

                {/* Links list */}
                <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-2 pointer-events-auto' : 'grid-rows-[0fr] opacity-0 pointer-events-none'} sm:block sm:opacity-100 sm:grid-rows-none sm:pointer-events-auto`}>
                  <ul className="overflow-hidden space-y-2 text-sm sm:text-xs">
                    {items.map((item) => (
                      <li key={item.label}>
                        <Link
                          to={item.href}
                          data-testid={`footer-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                          title={item.label}
                          className="text-[#878787] hover:text-white cursor-pointer transition-colors duration-200 focus:outline-none focus:text-white"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom bar */}
        <div data-testid="footer-bottom-bar" className="border-t border-slate-700/50 pt-5 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p data-testid="footer-copyright" className="text-xs text-slate-500 text-center sm:text-left w-full sm:w-auto">
            © {new Date().getFullYear()} Sarathi Store. All rights reserved.
          </p>
          <div data-testid="footer-legal-links" className="flex gap-4 text-xs text-slate-400 justify-center sm:justify-start w-full sm:w-auto">
            <a href="#" data-testid="footer-privacy-link" title="Privacy Policy" className="hover:text-white transition-colors duration-200">Privacy</a>
            <a href="#" data-testid="footer-terms-link" title="Terms of Service" className="hover:text-white transition-colors duration-200">Terms</a>
            <a href="#" data-testid="footer-cookies-link" title="Cookie Policy" className="hover:text-white transition-colors duration-200">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
