import { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Clock, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const contactInfo = [
  {
    icon: Phone,
    title: '24/7 Dispatch Line',
    value: '+1 (234) 567-8900',
    sub: 'For load inquiries and carrier support',
    href: 'tel:+12345678900',
    color: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    value: 'Chat Now',
    sub: 'Fastest response — typically under 5 minutes',
    href: 'https://wa.me/12345678900',
    color: 'bg-green-50',
    iconColor: 'text-green-500',
  },
  {
    icon: Mail,
    title: 'Email',
    value: 'dispatch@sunnylogistics.com',
    sub: 'For documents and formal inquiries',
    href: 'mailto:dispatch@sunnylogistics.com',
    color: 'bg-sunny-50',
    iconColor: 'text-sunny-500',
  },
  {
    icon: MapPin,
    title: 'Headquarters',
    value: 'Addis Ababa, Ethiopia',
    sub: 'Remote dispatch operations serving all 48 states',
    href: undefined,
    color: 'bg-charcoal-50',
    iconColor: 'text-charcoal-500',
  },
];

const hours = [
  { day: 'Monday – Friday', time: '24 hours' },
  { day: 'Saturday', time: '24 hours' },
  { day: 'Sunday', time: '24 hours' },
];

type ContactType = 'carrier' | 'shipper' | 'general';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '', type: 'general' as ContactType });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setErrorMsg('Name, email, and message are required.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');

    const { error } = await supabase.from('contact_submissions').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company.trim(),
      message: form.message.trim(),
      type: form.type,
    });

    if (error) {
      console.error('Contact submission failed:', error);
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again or reach us via WhatsApp.');
      return;
    }

    setStatus('success');
  };

  return (
    <div className="font-body pt-16 lg:pt-20">
      <section className="bg-charcoal-700 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="font-body font-600 text-sunny-400 text-sm tracking-wider uppercase">Get In Touch</span>
          <h1 className="font-heading font-800 text-4xl lg:text-5xl text-white mt-3 mb-4">
            We're Always <span className="text-sunny-400">Available</span>
          </h1>
          <p className="font-body text-white/70 text-lg max-w-xl mx-auto">
            Logistics never sleeps, and neither do we. Reach out any time through your preferred channel.
          </p>
        </div>
      </section>

      <section className="py-16 bg-charcoal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {contactInfo.map((info) => (
              <div key={info.title} className="bg-white rounded-2xl p-6 border border-charcoal-100 hover:border-sunny-300 hover:shadow-lg transition-all duration-300">
                <div className={`w-12 h-12 ${info.color} rounded-xl flex items-center justify-center mb-4`}>
                  <info.icon className={`w-6 h-6 ${info.iconColor}`} />
                </div>
                <div className="font-heading font-700 text-charcoal-600 text-xs uppercase tracking-wider mb-1">{info.title}</div>
                {info.href ? (
                  <a
                    href={info.href}
                    target={info.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="font-body font-600 text-charcoal-700 hover:text-sunny-500 text-sm transition-colors block mb-1"
                  >
                    {info.value}
                  </a>
                ) : (
                  <div className="font-body font-600 text-charcoal-700 text-sm mb-1">{info.value}</div>
                )}
                <div className="font-body text-charcoal-400 text-xs">{info.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="font-heading font-800 text-2xl text-charcoal-700 mb-2">Send Us a Message</h2>
              <p className="font-body text-charcoal-400 text-sm mb-8">
                Fill in your details and we'll get back to you within 1-2 hours during business hours. For urgent matters, use WhatsApp.
              </p>

              {status === 'success' ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-heading font-700 text-charcoal-700 text-xl mb-2">Message Received!</h3>
                  <p className="font-body text-charcoal-400">Thank you, {form.name}. Our team will respond shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex gap-3 p-1 bg-charcoal-50 rounded-xl">
                    {(['general', 'carrier', 'shipper'] as ContactType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => update('type', type)}
                        className={`flex-1 py-2.5 rounded-lg font-body font-600 text-sm capitalize transition-all duration-200 ${
                          form.type === type
                            ? 'bg-white shadow text-charcoal-700'
                            : 'text-charcoal-400 hover:text-charcoal-600'
                        }`}
                      >
                        {type === 'general' ? 'General' : type === 'carrier' ? 'Carrier' : 'Shipper'}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { field: 'name', label: 'Full Name', required: true, placeholder: 'Your full name' },
                      { field: 'email', label: 'Email Address', required: true, placeholder: 'your@email.com', type: 'email' },
                      { field: 'phone', label: 'Phone Number', required: false, placeholder: '+1 (555) 000-0000', type: 'tel' },
                      { field: 'company', label: 'Company Name', required: false, placeholder: 'Your company (optional)' },
                    ].map(({ field, label, required, placeholder, type }) => (
                      <div key={field}>
                        <label className="block font-body font-600 text-charcoal-600 text-sm mb-1.5">
                          {label} {required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type={type || 'text'}
                          value={form[field as keyof typeof form] as string}
                          onChange={(e) => update(field, e.target.value)}
                          placeholder={placeholder}
                          className="w-full border border-charcoal-200 rounded-xl px-4 py-3 font-body text-charcoal-700 text-sm focus:outline-none focus:border-sunny-400 focus:ring-2 focus:ring-sunny-400/20 transition-all"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block font-body font-600 text-charcoal-600 text-sm mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => update('message', e.target.value)}
                      rows={5}
                      placeholder="Tell us how we can help. Describe your needs, lanes, equipment, or any questions..."
                      className="w-full border border-charcoal-200 rounded-xl px-4 py-3 font-body text-charcoal-700 text-sm focus:outline-none focus:border-sunny-400 focus:ring-2 focus:ring-sunny-400/20 transition-all resize-none"
                    />
                  </div>

                  {errorMsg && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="font-body text-red-600 text-sm">{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="flex items-center justify-center gap-2 bg-sunny-400 hover:bg-sunny-500 disabled:opacity-60 text-charcoal-800 font-heading font-700 px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-lg"
                  >
                    {status === 'loading' ? (
                      <div className="w-5 h-5 border-2 border-charcoal-700/30 border-t-charcoal-700 rounded-full animate-spin" />
                    ) : (
                      <>Send Message <ArrowRight className="w-5 h-5" /></>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-charcoal-700 rounded-2xl p-7 text-white">
                <div className="flex items-center gap-3 mb-5">
                  <Clock className="w-5 h-5 text-sunny-400" />
                  <h3 className="font-heading font-700 text-white text-lg">Dispatch Hours</h3>
                </div>
                <div className="space-y-3">
                  {hours.map((h) => (
                    <div key={h.day} className="flex items-center justify-between">
                      <span className="font-body text-white/60 text-sm">{h.day}</span>
                      <span className="font-body font-600 text-sunny-400 text-sm">{h.time}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-5 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="font-body text-white/70 text-sm">Dispatchers online now</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-600 rounded-2xl p-7 text-white">
                <MessageCircle className="w-8 h-8 mb-4" />
                <h3 className="font-heading font-700 text-xl mb-2">WhatsApp for Fastest Response</h3>
                <p className="font-body text-green-100 text-sm leading-relaxed mb-5">
                  For urgent inquiries, load discussions, or quick questions — WhatsApp gets you a response in minutes, not hours.
                </p>
                <a
                  href="https://wa.me/12345678900?text=Hi%20Sunny%20Logistics%2C%20I%27d%20like%20to%20inquire%20about%20your%20services."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-green-700 font-heading font-700 px-5 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-lg text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Open WhatsApp
                </a>
              </div>

              <div className="bg-sunny-50 border border-sunny-200 rounded-2xl p-7">
                <h3 className="font-heading font-700 text-charcoal-700 text-base mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Register as a Carrier', page: 'carriers' },
                    { label: 'Request a Freight Quote', page: 'shippers' },
                    { label: 'Learn About Our Services', page: 'about' },
                  ].map((action) => (
                    <a
                      key={action.label}
                      href="#"
                      onClick={(e) => { e.preventDefault(); }}
                      className="flex items-center gap-2 font-body text-charcoal-600 hover:text-sunny-600 text-sm py-1.5 transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-sunny-500" />
                      {action.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
