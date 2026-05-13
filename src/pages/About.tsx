import { useNavigate } from 'react-router-dom';
import { Sun, Truck, Heart, Globe, Target, Zap } from 'lucide-react';


const values = [
  { icon: Heart, title: 'Carrier-First Mindset', desc: 'Carriers are the backbone of freight. We treat every driver and owner-operator as a true partner, not just a transaction.' },
  { icon: Target, title: 'Results Over Promises', desc: 'We don\'t make empty guarantees. We back every commitment with action — better loads, better rates, better support.' },
  { icon: Zap, title: 'Speed & Reliability', desc: 'In logistics, time is money. Our dispatchers move fast, communicate clearly, and never leave you guessing about your next load.' },
  { icon: Globe, title: 'Global Perspective', desc: 'Operating from Addis Ababa gives us a cost advantage we pass directly to our carriers — competitive fees, premium service.' },
];

const team = [
  {
    name: 'Amir Tesfaye',
    role: 'Founder & Head Dispatcher',
    bio: '8+ years in freight logistics. Built Sunny Logistics from a single desk in Addis Ababa with a vision to give American carriers a better dispatching experience.',
    img: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    name: 'Liya Hailu',
    role: 'Senior Load Planner',
    bio: 'Expert in lane optimization and rate negotiation. Liya consistently finds loads paying 15-20% above spot market for our carriers.',
    img: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    name: 'Daniel Bekele',
    role: 'Compliance & Onboarding',
    bio: 'Ensures every carrier in our network meets FMCSA requirements. Daniel makes the onboarding process seamless and fast.',
    img: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

const milestones = [
  { year: '2021', event: 'Sunny Logistics founded in Addis Ababa, Ethiopia' },
  { year: '2022', event: 'Reached 50 active carriers across 20 U.S. states' },
  { year: '2023', event: 'Expanded to all 48 contiguous states; launched digital portal' },
  { year: '2024', event: 'Dispatched over 1,500 loads; achieved 97% on-time rating' },
  { year: '2025', event: '150+ carriers; $4M+ in carrier revenue generated' },
  { year: '2026', event: 'Launched document portal and real-time load tracking' },
];

export default function About() {
  const navigate = useNavigate();

  const handleNav = (page: string) => {
    navigate(page === 'home' ? '/' : `/${page}`);
  };

  return (
    <div className="font-body pt-16 lg:pt-20">
      <section className="relative py-20 lg:py-28 bg-charcoal-700 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-sunny-400"
              style={{
                width: `${Math.random() * 200 + 50}px`,
                height: `${Math.random() * 200 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="relative w-16 h-16">
                <Sun className="w-16 h-16 text-sunny-400" strokeWidth={2} />
                <Truck className="w-7 h-7 text-charcoal-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="font-heading font-800 text-4xl lg:text-5xl text-white mb-5 leading-tight">
              The Story Behind <span className="text-sunny-400">Sunny Logistics</span>
            </h1>
            <p className="font-body text-white/70 text-lg leading-relaxed">
              Born in Addis Ababa. Built for American roads. Sunny Logistics exists because too many carriers were overpaying for underperforming dispatch services.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="font-body font-600 text-sunny-500 text-sm tracking-wider uppercase">Our Mission</span>
              <h2 className="font-heading font-800 text-3xl lg:text-4xl text-charcoal-700 mt-2 mb-6 leading-tight">
                Dispatch Services That Actually Work For You
              </h2>
              <div className="space-y-4 font-body text-charcoal-500 leading-relaxed">
                <p>
                  We started Sunny Logistics with a simple belief: carriers deserve a dispatch partner who fights as hard for their rates as they fight to keep their trucks moving. Too many drivers were stuck with dispatchers who took large cuts, offered poor communication, and left them hunting for loads on their own.
                </p>
                <p>
                  Our lean operation based in Addis Ababa means we keep overhead low and pass those savings directly to our carriers through competitive fees (8-10%) and maximum negotiated rates. We reinvest every dollar into better technology, better relationships with brokers, and better support for our carrier family.
                </p>
                <p>
                  Today, we serve 150+ carriers across all 48 states, dispatching thousands of loads per year with a 98% on-time delivery rating. But for us, the number that matters most is yours — your revenue per mile.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/906150/pexels-photo-906150.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Addis Ababa operations"
                className="rounded-2xl w-full h-96 object-cover shadow-xl"
              />
              <div className="absolute -bottom-5 -right-5 bg-sunny-400 rounded-2xl p-5 shadow-xl">
                <div className="font-heading font-800 text-3xl text-charcoal-800">5+</div>
                <div className="font-body text-charcoal-700 text-sm">Years Operating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-charcoal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-heading font-800 text-3xl text-charcoal-700">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-charcoal-100 text-center hover:border-sunny-300 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-sunny-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-sunny-500" />
                </div>
                <h3 className="font-heading font-700 text-charcoal-700 text-base mb-2">{title}</h3>
                <p className="font-body text-charcoal-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="font-body font-600 text-sunny-500 text-sm tracking-wider uppercase">Meet the Team</span>
            <h2 className="font-heading font-800 text-3xl text-charcoal-700 mt-2">
              The People Behind Your Loads
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member) => (
              <div key={member.name} className="text-center group">
                <div className="relative w-32 h-32 mx-auto mb-5 overflow-hidden rounded-2xl shadow-lg">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-800/20 to-transparent" />
                </div>
                <h3 className="font-heading font-700 text-charcoal-700 text-lg">{member.name}</h3>
                <div className="font-body text-sunny-500 font-600 text-sm mb-3">{member.role}</div>
                <p className="font-body text-charcoal-400 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-charcoal-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="font-body font-600 text-sunny-400 text-sm tracking-wider uppercase">Our Journey</span>
            <h2 className="font-heading font-800 text-3xl text-white mt-2">Milestones</h2>
          </div>
          <div className="relative">
            <div className="absolute left-4 sm:left-1/2 sm:-translate-x-0.5 top-0 bottom-0 w-0.5 bg-white/10" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div key={m.year} className={`relative flex items-start gap-6 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                  <div className="absolute left-4 sm:left-1/2 sm:-translate-x-1/2 w-8 h-8 rounded-full bg-sunny-400 flex items-center justify-center z-10 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-charcoal-800" />
                  </div>
                  <div className={`ml-14 sm:ml-0 sm:w-1/2 ${i % 2 === 0 ? 'sm:pr-10 sm:text-right' : 'sm:pl-10'}`}>
                    <div className="font-heading font-800 text-sunny-400 text-lg">{m.year}</div>
                    <div className="font-body text-white/70 text-sm mt-1 leading-relaxed">{m.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-sunny-400">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading font-800 text-3xl text-charcoal-800 mb-4">Join the Sunny Family</h2>
          <p className="font-body text-charcoal-700 mb-8">
            Whether you're a carrier looking for better loads or a shipper needing reliable freight solutions — we're here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleNav('carriers')}
              className="bg-charcoal-800 hover:bg-charcoal-700 text-white font-heading font-700 px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-xl"
            >
              Register as Carrier
            </button>
            <button
              onClick={() => handleNav('contact')}
              className="border-2 border-charcoal-800 text-charcoal-800 hover:bg-charcoal-800 hover:text-white font-heading font-600 px-8 py-4 rounded-xl transition-all duration-200"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
