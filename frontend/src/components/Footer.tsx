<<<<<<< HEAD
import React from 'react'
import { Link } from 'react-router-dom'
import { Zap, Mail, Phone, MapPin, Twitter, Instagram, Github, Youtube, ArrowRight } from 'lucide-react'

const LINKS = {
  Shop: [
    { label: 'All Products', href: '/' },
    { label: 'Electronics', href: '/?cat=Electronics' },
    { label: 'Wearables', href: '/?cat=Wearables' },
    { label: 'Audio', href: '/?cat=Audio' },
    { label: 'Smart Home', href: '/?cat=Smart+Home' },
  ],
  Account: [
    { label: 'Sign In', href: '/login' },
    { label: 'Create Account', href: '/register' },
    { label: 'My Orders', href: '/orders' },
    { label: 'Cart', href: '/cart' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Returns Policy', href: '#' },
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
    <footer data-testid="main-footer" role="contentinfo" className="relative border-t border-white/5 bg-slate-950 mt-12">
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8">
        {/* Newsletter bar */}
        <div data-testid="newsletter-section" className="glass-premium rounded-2xl p-6 sm:p-8 mb-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-extrabold text-white mb-1">Stay in the loop</h3>
            <p className="text-sm text-slate-400">Get exclusive deals, product launches, and tech news.</p>
          </div>
          <form data-testid="newsletter-form" onSubmit={(e) => e.preventDefault()} className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              name="newsletter-email"
              data-testid="newsletter-email-input"
              placeholder="Enter your email..."
              title="Subscribe to newsletter"
              aria-label="Newsletter email"
              className="input-field flex-1 sm:w-64"
            />
            <button data-testid="newsletter-subscribe-btn" type="submit" title="Subscribe to our newsletter" className="btn-primary flex-shrink-0 px-5 py-2.5 text-xs">
              Subscribe
              <ArrowRight size={14} />
            </button>
          </form>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-5">
            <Link to="/" data-testid="footer-logo" aria-label="Prathazon home" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg">
                <Zap size={18} className="text-white" fill="white" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white tracking-tight">Prathazon</div>
                <div className="text-[9px] text-amber-500/60 font-bold tracking-widest uppercase -mt-0.5">Elite Store</div>
              </div>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Premium tech & lifestyle products for the modern consumer. Curated quality, delivered fast.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Mail size={12} className="text-amber-500/50" />
                support@prathazon.com
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Phone size={12} className="text-amber-500/50" />
                +91 98765 43210
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin size={12} className="text-amber-500/50" />
                Mumbai, Maharashtra, India
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title} data-testid={`footer-links-${title.toLowerCase()}`} className="space-y-4">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-widest">{title}</h4>
              <ul role="list" className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label} role="listitem">
                    <Link
                      to={item.href}
                      data-testid={`footer-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      title={item.label}
                      className="text-sm text-slate-500 hover:text-amber-400 transition-colors duration-150"
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
        <div data-testid="footer-bottom-bar" className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p data-testid="footer-copyright" className="text-xs text-slate-600">
            © {new Date().getFullYear()} Prathazon Elite Store. All rights reserved.
          </p>
          <div data-testid="footer-social-links" className="flex items-center gap-3">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                data-testid={`social-link-${s.label.toLowerCase()}`}
                aria-label={s.label}
                title={`Follow us on ${s.label}`}
                className="w-8 h-8 rounded-lg bg-slate-900 border border-white/8 flex items-center justify-center text-slate-500 hover:text-amber-400 hover:border-amber-500/25 transition-all duration-150"
              >
                {s.icon}
              </a>
            ))}
          </div>
          <div data-testid="footer-legal-links" className="flex gap-4 text-xs text-slate-600">
            <a href="#" data-testid="footer-privacy-link" title="Privacy Policy" className="hover:text-slate-400 cursor-pointer transition-colors">Privacy</a>
            <a href="#" data-testid="footer-terms-link" title="Terms of Service" className="hover:text-slate-400 cursor-pointer transition-colors">Terms</a>
            <a href="#" data-testid="footer-cookies-link" title="Cookie Policy" className="hover:text-slate-400 cursor-pointer transition-colors">Cookies</a>
=======
import { Link } from 'react-router-dom';
import { Briefcase, HelpCircle, Store, TrendingUp } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 text-slate-300 pt-10 pb-4 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 border-b border-white/5 pb-10">
          
          {/* ABOUT */}
          <div>
            <h3 className="text-gray-400 font-medium mb-4 text-xs tracking-wider">ABOUT</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="hover:underline">Contact Us</Link></li>
              <li><Link to="/about" className="hover:underline">About Us</Link></li>
              <li><Link to="/careers" className="hover:underline">Careers</Link></li>
            </ul>
          </div>

          {/* HELP */}
          <div>
            <h3 className="text-gray-400 font-medium mb-4 text-xs tracking-wider">HELP</h3>
            <ul className="space-y-2">
              <li><Link to="/payments" className="hover:underline">Payments</Link></li>
              <li><Link to="/shipping" className="hover:underline">Shipping</Link></li>
              <li><Link to="/cancellation" className="hover:underline">Cancellation & Returns</Link></li>
              <li><Link to="/faq" className="hover:underline">FAQ</Link></li>
            </ul>
          </div>

          {/* CONSUMER POLICY */}
          <div>
            <h3 className="text-gray-400 font-medium mb-4 text-xs tracking-wider">CONSUMER POLICY</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="hover:underline">Terms Of Use</Link></li>
              <li><Link to="/security" className="hover:underline">Security</Link></li>
              <li><Link to="/privacy" className="hover:underline">Privacy</Link></li>
            </ul>
          </div>

          {/* ADDRESS */}
          <div>
            <h3 className="text-gray-400 font-medium mb-4 text-xs tracking-wider">Mail Us:</h3>
            <p className="text-gray-300 leading-relaxed">
              NovaCart Internet Private Limited,<br />
              Tech Village, Outer Ring Road,<br />
              Bengaluru, 560103,<br />
              Karnataka, India
            </p>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="flex flex-col md:flex-row items-center justify-between text-gray-300">
          <div className="flex flex-wrap items-center gap-6 mb-4 md:mb-0">
            <Link to="/seller" className="flex items-center gap-2 hover:text-white">
              <Store className="w-4 h-4 text-yellow-400" />
              <span>Become a Seller</span>
            </Link>
            <Link to="/advertise" className="flex items-center gap-2 hover:text-white">
              <TrendingUp className="w-4 h-4 text-yellow-400" />
              <span>Advertise</span>
            </Link>
            <Link to="/help" className="flex items-center gap-2 hover:text-white">
              <HelpCircle className="w-4 h-4 text-yellow-400" />
              <span>Help Center</span>
            </Link>
          </div>
          
          <div>
            <p>© 2007-{new Date().getFullYear()} NovaCart.com</p>
>>>>>>> 3fb1eaec9d7fbe035b485f07fc838529eccd6729
          </div>
        </div>
      </div>
    </footer>
<<<<<<< HEAD
  )
=======
  );
>>>>>>> 3fb1eaec9d7fbe035b485f07fc838529eccd6729
}
