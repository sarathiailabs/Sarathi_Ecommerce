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
          </div>
        </div>
      </div>
    </footer>
  );
}
