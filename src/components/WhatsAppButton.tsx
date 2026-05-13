import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/12345678900?text=Hi%20Sunny%20Logistics%2C%20I%27m%20interested%20in%20your%20dispatching%20services."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-green-500/25 group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="font-body font-600 text-sm max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
        Chat Now
      </span>
    </a>
  );
}
