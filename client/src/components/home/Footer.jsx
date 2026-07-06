import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { INSTITUTE_NAME, CONTACT, SOCIAL_LINKS } from '../../constants/siteContent.js';

function Footer() {
  return (
    <footer id="contact" className="bg-navy-800 text-navy-100">
      <div className="max-w-6xl mx-auto px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
        <div>
          <p className="font-display text-lg text-white">{INSTITUTE_NAME}</p>
          <p className="mt-2 text-sm text-navy-300 max-w-xs">
            A modern portal connecting students, teachers, and the Examination Board.
          </p>
          <div className="mt-4 flex gap-3">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-card bg-navy-700 flex items-center justify-center hover:bg-navy-600 transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-white">Quick Links</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
            </li>
            <li>
              <a href="#about" className="hover:text-white transition-colors">About</a>
            </li>
            <li>
              <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium text-white">Contact</p>
          <ul className="mt-3 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{CONTACT.address}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>{CONTACT.phone}</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span>{CONTACT.email}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-700 py-4 text-center text-xs text-navy-300">
        © {new Date().getFullYear()} {INSTITUTE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
