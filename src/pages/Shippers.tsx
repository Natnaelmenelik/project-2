import { useState } from 'react';
import { Shield, Clock, TrendingUp, MapPin, Package, CheckCircle, ArrowRight, Star, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const stats = [
  { value: '98%', label: 'On-Time Delivery Rate' },
  { value: '48hr', label: 'Average Carrier Assignment' },
  { value: '48', label: 'States Served' },
  { value: '$0', label: 'Hidden Fees' },
];

const capabilities = [
  { icon: Package, title: 'Dry Van', desc: 'General freight, palletized goods, consumer products — enclosed and protected.' },
  { icon: '❄️', title: 'Temperature-Controlled', desc: 'Reefer capacity for food, beverages, pharmaceuticals, and chemicals.' },
  { icon: '🏗️', title: 'Flatbed & Specialized', desc: 'Steel coils, machinery, oversized equipment, and project cargo.' },
  { icon: MapPin, title: 'Nationwide Coverage', desc: 'Dense carrier networks across all major freight corridors and markets.' },
  { icon: Clock, title: 'Expedited Shipping', desc: 'Hot-shot and team drivers for time-critical, high-priority shipments.' },
  { icon: TrendingUp, title: 'Spot & Contract', desc: 'Flexible rate structures — spot loads or consistent contract lanes.' },
];

const trustPoints = [
  'FMCSA-compliant carrier vetting process',
  'Real-time load tracking updates',
  'Dedicated account manager',
  'Signed rate confirmation on every load',
  'Insurance verification before dispatch',
  'Transparent invoicing, no surprises',
];

interface QuoteForm {
  company: string;
  name: string;
  email: string;
  phone: string;
  origin: string;
  destination: string;
  commodity: string;
  equipment: string;
  message: string;
}

export default function Shippers() {
  const [form, setForm] = useState<QuoteForm>({
    company: '', name: '', email: '', phone: '',
    origin: '', destination: '', commodity: '', equipment: '', message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const update = (field: keyof QuoteForm, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company || !form.email || !form.origin || !form.destination) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');

    const message = `QUOTE REQUEST\nOrigin: ${form.origin.trim()}\nDestination: ${form.destination.trim()}\nCommodity: ${form.commodity.trim()}\nEquipment: ${form.equipment.trim()}\n\n${form.message.trim()}`;

    const { error } = await supabase.from('contact_submissions').insert({
      name: form.name.trim() || form.company.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company.trim(),
      message,
      type: 'shipper',
    });

    if (error) {
      console.error('Shipper quote submission failed:', error);
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
      return;
    }

    setStatus('success');
  };

  return (
    <div className="font-body pt-16 lg:pt-20">
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Warehouse logistics"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/95 to-charcoal-800/60" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="font-body font-600 text-sunny-400 text-sm tracking-wider uppercase">For Shippers & Businesses</span>
            <h1 className="font-heading font-800 text-4xl lg:text-5xl text-white mt-3 mb-5 leading-tight">
              Your Freight,<br />
              <span className="text-sunny-400">Delivered Reliably.</span>
            </h1>
            <p className="font-body text-white/75 text-lg leading-relaxed">
              Partner with Sunny Logistics and gain access to a vetted carrier network, dedicated account management, and on-time delivery you can count on.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-charcoal-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y-2 lg:divide-y-0 lg:divide-x divide-white/10">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center py-4 lg:py-0">
                <div className="font-heading font-800 text-4xl text-sunny-400">{stat.value}</div>
                <div className="font-body text-white/60 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="font-body font-600 text-sunny-500 text-sm tracking-wider uppercase">Capabilities</span>
            <h2 className="font-heading font-800 text-3xl lg:text-4xl text-charcoal-700 mt-2">
              What We Can Move
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap) => (
              <div key={cap.title} className="p-6 rounded-2xl border border-charcoal-100 hover:border-sunny-300 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-sunny-50 rounded-xl flex items-center justify-center mb-4 text-2xl">
                  {typeof cap.icon === 'string' ? cap.icon : <cap.icon className="w-6 h-6 text-sunny-500" />}
                </div>
                <h3 className="font-heading font-700 text-charcoal-700 text-lg mb-2">{cap.title}</h3>
                <p className="font-body text-charcoal-400 text-sm leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-charcoal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="font-body font-600 text-sunny-500 text-sm tracking-wider uppercase">Safety & Compliance</span>
              <h2 className="font-heading font-800 text-3xl text-charcoal-700 mt-2 mb-6">
                Your Freight Is Safe With Us
              </h2>
              <p className="font-body text-charcoal-500 leading-relaxed mb-8">
                Every carrier in our network is FMCSA-verified, properly insured, and held to strict safety and performance standards. We don't just move freight — we protect your supply chain.
              </p>
              <ul className="space-y-3">
                {trustPoints.map((point) => (
                  <li key={point} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <span className="font-body text-charcoal-600 text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1427541/pexels-photo-1427541.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Freight safety"
                className="rounded-2xl w-full h-80 object-cover shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 border border-charcoal-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sunny-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-sunny-500" />
                  </div>
                  <div>
                    <div className="font-heading font-700 text-charcoal-700 text-sm">Fully Insured</div>
                    <div className="flex gap-1 mt-0.5">
                      {[1,2,3,4,5].map((s) => <Star key={s} className="w-3 h-3 fill-sunny-400 text-sunny-400" />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white" id="quote">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="font-body font-600 text-sunny-500 text-sm tracking-wider uppercase">Get a Quote</span>
            <h2 className="font-heading font-800 text-3xl text-charcoal-700 mt-2 mb-3">Request Freight Quote</h2>
            <p className="font-body text-charcoal-400">
              Fill out the form and a dedicated account manager will respond within 2 business hours.
            </p>
          </div>

          {status === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-heading font-700 text-charcoal-700 text-xl mb-2">Quote Request Received!</h3>
              <p className="font-body text-charcoal-400">Our team will contact you within 2 business hours with competitive rates.</p>
            </div>
          ) : (
            <div className="bg-white border border-charcoal-100 rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { field: 'company' as const, label: 'Company Name', required: true, placeholder: 'Your Company LLC' },
                    { field: 'name' as const, label: 'Contact Name', required: false, placeholder: 'Full name' },
                    { field: 'email' as const, label: 'Email', required: true, placeholder: 'your@email.com', type: 'email' },
                    { field: 'phone' as const, label: 'Phone', required: false, placeholder: '+1 (555) 000-0000', type: 'tel' },
                    { field: 'origin' as const, label: 'Origin City/State', required: true, placeholder: 'Chicago, IL' },
                    { field: 'destination' as const, label: 'Destination City/State', required: true, placeholder: 'Dallas, TX' },
                    { field: 'commodity' as const, label: 'Commodity / Freight Type', required: false, placeholder: 'e.g. Packaged food, Steel coils' },
                    { field: 'equipment' as const, label: 'Equipment Needed', required: false, placeholder: 'e.g. 53ft Dry Van, Flatbed' },
                  ].map(({ field, label, required, placeholder, type }) => (
                    <div key={field}>
                      <label className="block font-body font-600 text-charcoal-600 text-sm mb-1.5">
                        {label} {required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type={type || 'text'}
                        value={form[field]}
                        onChange={(e) => update(field, e.target.value)}
                        placeholder={placeholder}
                        className="w-full border border-charcoal-200 rounded-xl px-4 py-3 font-body text-charcoal-700 text-sm focus:outline-none focus:border-sunny-400 focus:ring-2 focus:ring-sunny-400/20 transition-all"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block font-body font-600 text-charcoal-600 text-sm mb-1.5">Additional Notes</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    rows={4}
                    placeholder="Pickup dates, special requirements, weight, etc."
                    className="w-full border border-charcoal-200 rounded-xl px-4 py-3 font-body text-charcoal-700 text-sm focus:outline-none focus:border-sunny-400 focus:ring-2 focus:ring-sunny-400/20 transition-all resize-none"
                  />
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="font-body text-red-600 text-sm">{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full flex items-center justify-center gap-2 bg-sunny-400 hover:bg-sunny-500 disabled:opacity-60 text-charcoal-800 font-heading font-700 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-lg text-base"
                >
                  {status === 'loading' ? (
                    <div className="w-5 h-5 border-2 border-charcoal-700/30 border-t-charcoal-700 rounded-full animate-spin" />
                  ) : (
                    <>Request My Quote <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
