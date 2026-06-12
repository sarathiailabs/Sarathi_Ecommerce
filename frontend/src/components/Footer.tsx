import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Twitter, Instagram, Github, Youtube, ArrowRight } from 'lucide-react'

const LINKS = {
  Shop: [
    { label: 'All Products', href: '/' },
    { label: 'Electronics', href: '/?category=Electronics' },
    { label: 'Home & Kitchen', href: '/?category=Home%20%26%20Living' },
    { label: 'Fashion', href: '/?category=Fashion%20%26%20Accessories' },
    { label: 'Sports', href: '/?category=Sports%20%26%20Fitness' },
  ],
  Account: [
    { label: 'Sign In', href: '/login' },
    { label: 'Create Account', href: '/register' },
    { label: 'My Orders', href: '/orders' },
    { label: 'Cart', href: '/cart' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Returns Policy', href: '/returns' },
    { label: 'Shipping Info', href: '#' },
    { label: 'Contact Us', href: '#' },
  ],
}

const SOCIAL = [
  { icon: <Twitter size={16} />, href: '#', label: 'Twitter' },
  { icon: <Instagram size={16} />, href: '#', label: 'Instagram' },
  { icon: <Youtube size={16} />, href: '#', label: 'YouTube' },
  { icon: <Github size={16} />, href: '#', label: 'GitHub' },
]

export const Footer: React.FC = () => {
  return (
    <footer data-testid="main-footer" role="contentinfo" className="w-full bg-[#172337] text-[#878787] border-t border-slate-700/50 mt-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8">
        
        {/* Newsletter bar */}
        <div data-testid="newsletter-section" className="bg-[#213147] rounded-sm p-6 sm:p-8 mb-12 flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-700/30">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Stay in the loop</h3>
            <p className="text-sm text-slate-300">Get exclusive deals, product launches, and shopping news.</p>
          </div>
          <form data-testid="newsletter-form" onSubmit={(e) => e.preventDefault()} className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              name="newsletter-email"
              data-testid="newsletter-email-input"
              placeholder="Enter your email..."
              title="Subscribe to newsletter"
              aria-label="Newsletter email"
              className="px-3 py-2 text-xs text-slate-800 bg-white rounded-sm focus:outline-none placeholder-slate-400 sm:w-64 flex-1 border border-slate-300"
            />
            <button data-testid="newsletter-subscribe-btn" type="submit" title="Subscribe to our newsletter" className="px-5 py-2.5 bg-[#FF9F00] hover:bg-[#e68f00] text-white text-xs font-bold rounded-sm flex items-center gap-1.5 transition-colors">
              Subscribe
              <ArrowRight size={13} />
            </button>
          </form>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 space-y-5">
            <Link to="/" data-testid="footer-logo" aria-label="Sarathi home" className="flex items-center gap-2.5">
              <img
                src="/sarathi-logo.jpg"
                alt="Sarathi Logo"
                className="h-10 w-10 object-contain rounded-full border border-white/20 bg-white"
              />
              <div>
                <div className="text-base font-extrabold text-white tracking-tight">Sarathi Store</div>
                <div className="text-[9px] text-[#FF9F00] font-semibold tracking-wider uppercase -mt-0.5">Powered by Sarathi AI Labs</div>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Smart shopping experiences curated by Sarathi AI Labs. Quality products, fast logistics.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Mail size={12} className="text-[#FF9F00]/70" />
                support@sarathi.ai
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Phone size={12} className="text-[#FF9F00]/70" />
                +91 80 4321 9876
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <MapPin size={12} className="text-[#FF9F00]/70" />
                Bengaluru, Karnataka, India
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title} data-testid={`footer-links-${title.toLowerCase()}`} className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      data-testid={`footer-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      title={item.label}
                      className="text-xs text-[#878787] hover:text-white transition-colors duration-150"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div data-testid="footer-bottom-bar" className="border-t border-slate-700/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p data-testid="footer-copyright" className="text-xs text-slate-500">
            © {new Date().getFullYear()} Sarathi Store. All rights reserved.
          </p>
          <div data-testid="footer-social-links" className="flex items-center gap-3">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                data-testid={`social-link-${s.label.toLowerCase()}`}
                aria-label={s.label}
                title={`Follow us on ${s.label}`}
                className="w-8 h-8 rounded-full bg-[#213147] hover:bg-[#FF9F00] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>
          <div data-testid="footer-legal-links" className="flex gap-4 text-xs text-slate-500">
            <a href="#" data-testid="footer-privacy-link" title="Privacy Policy" className="hover:text-white cursor-pointer transition-colors">Privacy</a>
            <a href="#" data-testid="footer-terms-link" title="Terms of Service" className="hover:text-white cursor-pointer transition-colors">Terms</a>
            <a href="#" data-testid="footer-cookies-link" title="Cookie Policy" className="hover:text-white cursor-pointer transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
