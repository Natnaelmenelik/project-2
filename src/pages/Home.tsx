import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Shield, Clock, DollarSign, Star, CheckCircle, ArrowRight, Zap, Globe, Award } from 'lucide-react';
import LoadCounter from '../components/LoadCounter';


function StatCard({ value, label, prefix = '', suffix = '' }: { value: number; label: string; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 1800;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isVisible, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="font-heading font-800 text-4xl lg:text-5xl text-sunny-400 tabular-nums">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="font-body text-white/70 text-sm mt-1">{label}</div>
    </div>
  );
}

const services = [
  {
    icon: '🚛',
    title: 'Dry Van',
    desc: 'Standard enclosed trailers for general freight. We find the best-paying dry van loads on the market.',
    features: ['48 & 53 ft trailers', 'General merchandise', 'Team & solo drivers'],
    color: 'from-blue-600/20 to-blue-800/10',
  },
  {
    icon: '❄️',
    title: 'Reefer',
    desc: 'Temperature-controlled loads for perishables, pharmaceuticals, and specialty freight.',
    features: ['Frozen & fresh loads', 'Pharma-grade monitoring', 'Premium pay rates'],
    color: 'from-cyan-600/20 to-cyan-800/10',
  },
  {
    icon: '🏗️',
    title: 'Flatbed',
    desc: 'Heavy equipment, steel, lumber, and oversized freight that demands expertise and precision.',
    features: ['Oversized permitting', 'Step deck & RGN', 'High-value loads'],
    color: 'from-orange-600/20 to-orange-800/10',
  },
  {
    icon: '⚡',
    title: 'Power Only',
    desc: 'Hook up to shipper-provided trailers and maximize your truck\'s earning potential.',
    features: ['Drop & hook loads', 'No trailer needed', 'Flexible scheduling'],
    color: 'from-yellow-600/20 to-yellow-800/10',
  },
];

const whyPoints = [
  {
    icon: Shield,
    title: 'Fully Verified Loads',
    desc: 'Every load is vetted through DAT and load boards. No double-broking, ever.',
  },
  {
    icon: Clock,
    title: '24/7 Dispatching',
    desc: 'Our team is available around the clock — nights, weekends, and holidays included.',
  },
  {
    icon: DollarSign,
    title: 'Best-Rate Negotiation',
    desc: 'We fight for the highest rates on every load. Our carriers average 18% above market.',
  },
  {
    icon: Zap,
    title: 'Fast Document Processing',
    desc: 'Submit your paperwork digitally and get onboarded in under 48 hours.',
  },
  {
    icon: Globe,
    title: 'Nationwide Coverage',
    desc: 'We cover all 48 contiguous states with strong lane knowledge coast to coast.',
  },
  {
    icon: Award,
    title: 'Transparent Fees',
    desc: 'Flat 8-10% dispatch fee with no hidden charges. You keep the majority of every load.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Register & Upload Docs',
    desc: 'Sign up, upload your MC Authority, W-9, and insurance certificate securely through our portal.',
  },
  {
    num: '02',
    title: 'Get Matched to Loads',
    desc: 'Our dispatchers immediately start finding high-paying loads on your preferred lanes.',
  },
  {
    num: '03',
    title: 'Deliver & Get Paid',
    desc: 'Haul your freight, submit your POD, and receive quick pay on every load we book.',
  },
];

const testimonials = [
  {
    name: 'Marcus T.',
    role: 'Owner-Operator, Dry Van',
    text: 'Sunny Logistics found me a $4,200 load within hours of signing up. I was blown away. They actually answer the phone at 2am.',
    stars: 5,
  },
  {
    name: 'Diana R.',
    role: 'Fleet Owner, 3 Trucks',
    text: 'I\'ve worked with 4 dispatch companies before. Sunny is the only one that consistently beats my rate expectations. Revenue is up 22%.',
    stars: 5,
  },
  {
    name: 'Kevin L.',
    role: 'Flatbed Operator',
    text: 'The document portal saved me so much time. Got set up in one day. Sunny keeps me loaded week after week.',
    stars: 5,
  },
];

export default function Home() {
  const navigate = useNavigate();

  const handleNav = (page: string) => {
    navigate(page === 'home' ? '/' : `/${page}`);
  };

  return (
    <div className="font-body">
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Highway trucks"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/95 via-charcoal-800/80 to-charcoal-700/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-sunny-400/10 border border-sunny-400/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-body font-600 text-sunny-400 text-xs tracking-wider uppercase">
                Dispatching Now Across All 48 States
              </span>
            </div>

            <h1 className="font-heading font-800 text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6">
              Reliable Dispatching.{' '}
              <span className="text-sunny-400">Brighter</span> Bottom Lines.
            </h1>

            <p className="font-body text-white/75 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl">
              Sunny Logistics keeps your trucks moving with high-paying loads and 24/7 dispatch support — so you can focus on driving, not dealing.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleNav('carriers')}
                className="flex items-center justify-center gap-2 bg-sunny-400 hover:bg-sunny-500 text-charcoal-800 font-heading font-700 px-8 py-4 rounded-xl transition-all duration-200 shadow-xl hover:shadow-sunny-400/25 hover:-translate-y-0.5 text-base"
              >
                Register as a Carrier
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleNav('contact')}
                className="flex items-center justify-center gap-2 border-2 border-white/60 text-white hover:bg-white hover:text-charcoal-800 font-heading font-600 px-8 py-4 rounded-xl transition-all duration-200 text-base"
              >
                Request a Quote
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-5 mt-10">
              {['No Hidden Fees', 'Quick Pay Available', '24/7 Support', 'Nationwide Loads'].map((badge) => (
                <div key={badge} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-sunny-400" />
                  <span className="font-body text-white/80 text-sm">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      <section className="bg-charcoal-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 divide-y-2 lg:divide-y-0 lg:divide-x divide-white/10">
            <StatCard value={2400} label="Loads Dispatched" suffix="+" />
            <StatCard value={98} label="On-Time Delivery Rate" suffix="%" />
            <StatCard value={48} label="States Covered" />
            <StatCard value={150} label="Active Carriers" suffix="+" />
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="font-body font-600 text-sunny-500 text-sm tracking-wider uppercase">What We Dispatch</span>
            <h2 className="font-heading font-800 text-3xl lg:text-4xl text-charcoal-700 mt-2 mb-4">
              Equipment We Specialize In
            </h2>
            <p className="font-body text-charcoal-400 text-lg max-w-2xl mx-auto">
              Whether you run a dry van, refrigerated trailer, flatbed, or just the power unit — we have the loads and the expertise to keep you profitable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className={`relative bg-gradient-to-br ${service.color} border border-charcoal-100 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-default`}
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="font-heading font-700 text-charcoal-700 text-xl mb-2">{service.title}</h3>
                <p className="font-body text-charcoal-400 text-sm leading-relaxed mb-4">{service.desc}</p>
                <ul className="space-y-1.5">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-sunny-500 shrink-0" />
                      <span className="font-body text-charcoal-500 text-xs">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-charcoal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="font-body font-600 text-sunny-500 text-sm tracking-wider uppercase">Why Carriers Choose Us</span>
            <h2 className="font-heading font-800 text-3xl lg:text-4xl text-charcoal-700 mt-2">
              The Sunny Advantage
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyPoints.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 border border-charcoal-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-sunny-300"
              >
                <div className="w-12 h-12 bg-sunny-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-sunny-500" />
                </div>
                <h3 className="font-heading font-700 text-charcoal-700 text-lg mb-2">{title}</h3>
                <p className="font-body text-charcoal-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-charcoal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="font-body font-600 text-sunny-400 text-sm tracking-wider uppercase">How It Works</span>
              <h2 className="font-heading font-800 text-3xl lg:text-4xl text-white mt-2 mb-8">
                Start Hauling Better Loads in 3 Steps
              </h2>
              <div className="space-y-6">
                {steps.map((step) => (
                  <div key={step.num} className="flex gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-sunny-400/10 border border-sunny-400/30 flex items-center justify-center">
                      <span className="font-heading font-800 text-sunny-400 text-sm">{step.num}</span>
                    </div>
                    <div>
                      <h3 className="font-heading font-700 text-white text-lg mb-1">{step.title}</h3>
                      <p className="font-body text-white/60 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleNav('carriers')}
                className="mt-10 flex items-center gap-2 bg-sunny-400 hover:bg-sunny-500 text-charcoal-800 font-heading font-700 px-7 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-lg"
              >
                Get Started Today
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-6">
              <LoadCounter />
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                  <div className="font-heading font-800 text-3xl text-white mb-1">8-10%</div>
                  <div className="font-body text-white/50 text-xs">Flat Dispatch Fee</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                  <div className="font-heading font-800 text-3xl text-white mb-1">48hr</div>
                  <div className="font-body text-white/50 text-xs">Onboarding Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="font-body font-600 text-sunny-500 text-sm tracking-wider uppercase">Testimonials</span>
            <h2 className="font-heading font-800 text-3xl lg:text-4xl text-charcoal-700 mt-2">
              Carriers Trust Sunny Logistics
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-charcoal-50 rounded-2xl p-7 border border-charcoal-100 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-sunny-400 text-sunny-400" />
                  ))}
                </div>
                <p className="font-body text-charcoal-600 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div>
                  <div className="font-heading font-700 text-charcoal-700 text-sm">{t.name}</div>
                  <div className="font-body text-charcoal-400 text-xs mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-sunny-400 to-sunny-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-charcoal-800 translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading font-800 text-3xl lg:text-5xl text-charcoal-800 mb-4">
            Ready to Earn More Per Mile?
          </h2>
          <p className="font-body text-charcoal-700 text-lg mb-10">
            Join 150+ carriers already earning more with Sunny Logistics. Registration takes minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleNav('carriers')}
              className="bg-charcoal-800 hover:bg-charcoal-700 text-white font-heading font-700 px-9 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-xl text-base"
            >
              Register as a Carrier
            </button>
            <button
              onClick={() => handleNav('contact')}
              className="border-2 border-charcoal-700 text-charcoal-800 hover:bg-charcoal-800 hover:text-white font-heading font-600 px-9 py-4 rounded-xl transition-all duration-200 text-base"
            >
              Talk to a Dispatcher
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
