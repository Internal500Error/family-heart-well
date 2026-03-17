import React, { useRef, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, Pill, Activity, BookOpen, Shield,
  Footprints, Scale, Users,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home', color: '#ef4444', bg: '#fff1f2' },
  { path: '/medicine', icon: Pill, label: 'Medicine', color: '#6366f1', bg: '#f5f3ff' },
  { path: '/steps', icon: Footprints, label: 'Steps', color: '#f97316', bg: '#fff7ed' },
  { path: '/bmi', icon: Scale, label: 'BMI', color: '#721ba5', bg: '#f0fdf4' },
  { path: '/community', icon: Users, label: 'Community', color: '#607fed', bg: '#eff6ff' },
  { path: '/health', icon: Activity, label: 'Health', color: '#16a34a', bg: '#fff1f2' },
  { path: '/gyaan', icon: BookOpen, label: 'Wellness', color: '#607fed', bg: '#eef2ff' },
  { path: '/sos', icon: Shield, label: 'Emergency', color: '#ef4444', bg: '#fef2f2' },
];

const ITEM_W = 68; // px width per nav item

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track sliding pill position
  const [pillStyle, setPillStyle] = useState({ left: 0, width: ITEM_W, opacity: 0 });
  const [activeColor, setActiveColor] = useState(NAV_ITEMS[0].color);
  const [prevIdx, setPrevIdx] = useState(0);

  const isChildDashboard = location.pathname.includes('/child-dashboard');
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);
  if (isAuthPage || isChildDashboard) return null;

  const activeIdx = NAV_ITEMS.findIndex(n => n.path === location.pathname);
  const safeIdx = activeIdx < 0 ? 0 : activeIdx;

  // Move sliding pill + scroll active into view
  useEffect(() => {
    const el = itemRefs.current[safeIdx];
    if (!el || !scrollRef.current) return;

    const container = scrollRef.current;
    const elLeft = el.offsetLeft;
    const elW = el.offsetWidth;

    // Slide pill
    setPillStyle({ left: elLeft, width: elW, opacity: 1 });
    setActiveColor(NAV_ITEMS[safeIdx].color);

    // Scroll active item to center
    const scrollTo = elLeft - container.clientWidth / 2 + elW / 2;
    container.scrollTo({ left: Math.max(0, scrollTo), behavior: 'smooth' });

    setPrevIdx(safeIdx);
  }, [safeIdx]);

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderTop: '1px solid rgba(0,0,0,0.07)',
          boxShadow: '0 -2px 40px rgba(0,0,0,0.09)',
        }}
      >
        {/* Scrollable track */}
        <div
          ref={scrollRef}
          className="relative mx-auto max-w-md overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {/* ── Sliding background pill ────────────────────────────── */}
          <div
            className="absolute top-2 transition-all"
            style={{
              left: pillStyle.left,
              width: pillStyle.width,
              height: 52,
              borderRadius: 18,
              background: activeColor + '18',
              border: `1.5px solid ${activeColor}30`,
              opacity: pillStyle.opacity,
              transition: 'left 0.35s cubic-bezier(0.34,1.56,0.64,1), width 0.3s ease, background 0.3s ease, border-color 0.3s ease',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* ── Nav items ─────────────────────────────────────────── */}
          <div className="flex items-end px-2 pt-2 pb-3 gap-0">
            {NAV_ITEMS.map(({ path, icon: Icon, label, color, bg }, idx) => {
              const isActive = safeIdx === idx;
              return (
                <div
                  key={path}
                  ref={el => { itemRefs.current[idx] = el; }}
                  style={{ width: ITEM_W, flexShrink: 0, position: 'relative', zIndex: 1 }}
                >
                  <NavLink to={path} className="block">
                    <div
                      className="flex flex-col items-center justify-center gap-0.5 py-1 transition-transform duration-200 active:scale-90"
                      style={{ minHeight: 52 }}
                    >
                      {/* Icon wrapper */}
                      <div
                        className="flex items-center justify-center transition-all"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 12,
                          background: isActive ? color : 'transparent',
                          boxShadow: isActive ? `0 4px 16px ${color}55` : 'none',
                          transform: isActive ? 'translateY(-4px) scale(1.12)' : 'translateY(0) scale(1)',
                          transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                        }}
                      >
                        <Icon
                          style={{
                            width: 18, height: 18,
                            color: isActive ? '#fff' : '#b0b7c3',
                            transition: 'color 0.25s ease',
                          }}
                        />
                      </div>

                      {/* Label */}
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? color : '#b0b7c3',
                          letterSpacing: '-0.01em',
                          lineHeight: 1,
                          transition: 'color 0.25s ease, font-weight 0.2s ease',
                          transform: isActive ? 'scale(1.05)' : 'scale(1)',
                          display: 'block',

                        }}
                      >
                        {label}
                      </span>
                    </div>
                  </NavLink>
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom spacer */}
      <div className="h-[76px]" />

      <style>{`
        nav > div::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
};