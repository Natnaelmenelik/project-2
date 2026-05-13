import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, Activity } from 'lucide-react';

function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) return;

    const step = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return count;
}

export default function LoadCounter() {
  const [loadsThisMonth, setLoadsThisMonth] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedCount = useCountUp(isVisible ? loadsThisMonth : 0);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from('load_stats')
        .select('loads_moved, month')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) setLoadsThisMonth(data.loads_moved);
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div ref={containerRef} className="bg-sunny-400 rounded-2xl p-8 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-sunny-300" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-sunny-500" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Activity className="w-5 h-5 text-charcoal-700 animate-pulse" />
          <span className="font-body font-600 text-charcoal-700 text-sm uppercase tracking-wider">
            Live Load Counter
          </span>
        </div>

        <div className="font-heading font-800 text-6xl lg:text-7xl text-charcoal-800 mb-2 tabular-nums">
          {animatedCount.toLocaleString()}
        </div>

        <div className="font-body text-charcoal-700 text-sm mb-4">
          Loads Dispatched in {currentMonth}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-charcoal-700">
          <TrendingUp className="w-4 h-4" />
          <span className="font-body text-sm font-600">+12% from last month</span>
        </div>
      </div>
    </div>
  );
}
