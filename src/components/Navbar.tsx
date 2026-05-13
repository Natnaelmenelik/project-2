import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Sun, Truck, X } from 'lucide-react';

const navLinks = [
  { path: '/', label: 'Home', end: true },
  { path: '/carriers', label: 'Carriers' },
  { path: '/shippers', label: 'Shippers' },
  { path: '/about', label: 'About Us' },
  { path: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-charcoal-700 shadow-2xl' : 'bg-charcoal-700/95'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" onClick={closeMenu} className="flex items-center gap-2 group">
            <div className="relative">
              <Sun className="w-8 h-8 text-sunny-400 group-hover:text-sunny-300 transition-colors" strokeWidth={2.5} />
              <Truck className="w-3.5 h-3.5 text-charcoal-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" strokeWidth={2.5} />
            </div>

            <div className="flex flex-col leading-none">
              <span className="font-heading font-800 text-white text-lg leading-tight tracking-wide">
                SUNNY
              </span>
              <span className="font-heading font-500 text-sunny-400 text-xs tracking-widest uppercase leading-tight">
                LOGISTICS
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `font-body font-500 text-sm transition-colors duration-200 relative group ${
                    isActive ? 'text-sunny-400' : 'text-white/80 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    <span
                      className={`absolute -bottom-1 left-0 w-full h-0.5 bg-sunny-400 transition-transform duration-200 origin-left ${
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/carriers"
              className="bg-sunny-400 hover:bg-sunny-500 text-charcoal-800 font-heading font-700 text-sm px-5 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Register as Carrier
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
            type="button"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-charcoal-800 border-t border-white/10">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block w-full text-left px-4 py-3 rounded-lg font-body font-500 transition-colors ${
                    isActive
                      ? 'bg-sunny-400/10 text-sunny-400'
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="pt-2 border-t border-white/10 mt-2">
              <Link
                to="/carriers"
                onClick={closeMenu}
                className="block w-full bg-sunny-400 hover:bg-sunny-500 text-charcoal-800 font-heading font-700 py-3 rounded-lg transition-colors text-center"
              >
                Register as Carrier
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
