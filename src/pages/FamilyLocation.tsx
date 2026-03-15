import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin, Navigation, RefreshCw, Phone, Heart,
  Activity, Footprints, ChevronDown, Wifi, WifiOff,
  Shield, Clock, ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';


// ─── Types ─────────────────────────────────────────────────────────────────────
type Relationship = 'mother' | 'father' | 'guardian' | 'brother' | 'sister' | 'grandpa';

interface FamilyMemberLocation {
  id: string;
  name: string;
  relationship: Relationship;
  lat: number;
  lng: number;
  lastSeen: string;           // ISO string
  isLive: boolean;
  batteryLevel?: number;
  speed?: number;             // km/h
  address?: string;
  healthStats?: {
    bloodPressure?: { systolic: number; diastolic: number };
    stepsToday?: number;
  };
}



// ─── Relationship helpers ──────────────────────────────────────────────────────
const RELATIONSHIP_META: Record<Relationship, { emoji: string; color: string; accent: string }> = {
  mother:   { emoji: '👩', color: '#ec4899', accent: '#fce7f3' },
  father:   { emoji: '👨', color: '#3b82f6', accent: '#eff6ff' },
  guardian: { emoji: '🧑', color: '#8b5cf6', accent: '#f5f3ff' },
  brother:  { emoji: '👦', color: '#f97316', accent: '#fff7ed' },
  sister:   { emoji: '👧', color: '#14b8a6', accent: '#f0fdfa' },
  grandpa:  { emoji: '👴', color: '#84cc16', accent: '#f7fee7' },
};

const getMeta = (rel: Relationship) => RELATIONSHIP_META[rel] ?? RELATIONSHIP_META.guardian;


// ─── Seeded random — gives stable positions per id ────────────────────────────
const seededRandom = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  const rand = () => { h ^= h >>> 13; h = Math.imul(h, 1540483477); h ^= h >>> 15; return ((h >>> 0) / 0xFFFFFFFF); };
  return rand;
};

// ─── Generate mock location for a parent ──────────────────────────────────────
// Base: Mumbai (19.076, 72.877). Scatter ±0.05 degrees (~5km radius)
const mockLocation = (id: string, name: string, relationship: Relationship): FamilyMemberLocation => {
  const rand = seededRandom(id);
  const lat = 19.076 + (rand() - 0.5) * 0.10;
  const lng = 72.877 + (rand() - 0.5) * 0.10;
  const addresses = [
    'Near Bandra Station', 'Juhu Beach Road', 'Andheri West Market',
    'Powai Lake View', 'Kurla Complex', 'Dadar TT Circle',
  ];
  return {
    id, name, relationship, lat, lng,
    lastSeen: new Date().toISOString(),
    isLive: rand() > 0.2,
    batteryLevel: Math.floor(rand() * 80 + 20),
    speed: Math.floor(rand() * 20),
    address: addresses[Math.floor(rand() * addresses.length)],
    healthStats: {
      bloodPressure: { systolic: Math.floor(rand() * 40 + 110), diastolic: Math.floor(rand() * 20 + 70) },
      stepsToday: Math.floor(rand() * 8000 + 1000),
    },
  };
};

// ─── Simulate small drift for "live" feel ─────────────────────────────────────
const drift = (member: FamilyMemberLocation): FamilyMemberLocation => ({
  ...member,
  lat: member.lat + (Math.random() - 0.5) * 0.0005,
  lng: member.lng + (Math.random() - 0.5) * 0.0005,
  lastSeen: new Date().toISOString(),
  speed: Math.max(0, (member.speed ?? 0) + Math.floor((Math.random() - 0.5) * 4)),
});

// ─── Relative time formatter ──────────────────────────────────────────────────
const relativeTime = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 10) return 'Just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

// ─── Member Bottom Sheet ───────────────────────────────────────────────────────
const MemberSheet = ({
  member,
  onClose,
}: {
  member: FamilyMemberLocation;
  onClose: () => void;
}) => {
  const meta = getMeta(member.relationship);
  const bp = member.healthStats?.bloodPressure;
  const bpText = bp ? `${bp.systolic}/${bp.diastolic}` : '—';
  const bpColor = bp && bp.systolic >= 140 ? 'text-red-500' : bp && bp.systolic >= 120 ? 'text-amber-500' : 'text-green-600';

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 animate-slide-up">
      {/* Backdrop tap to close */}
      <div className="absolute inset-x-0 -top-96 bottom-full" onClick={onClose} />

      <div
        className="relative rounded-t-3xl shadow-2xl border-t border-white/20"
        style={{ background: 'linear-gradient(to bottom, #ffffff, #f8fafc)' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="px-5 pb-8 pt-2 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                style={{ background: meta.accent }}
              >
                {meta.emoji}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">{member.name}</h3>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-sm text-gray-500 capitalize">{member.relationship}</span>
                  <span className="text-gray-300">·</span>
                  {member.isLive ? (
                    <span className="flex items-center space-x-1 text-xs text-green-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                      <span>Live</span>
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">{relativeTime(member.lastSeen)}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
            >
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Location pill */}
          <div className="flex items-center space-x-2 bg-gray-50 rounded-xl px-4 py-3">
            <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
            <span className="text-sm text-gray-700">{member.address}</span>
            <span className="text-gray-300 mx-1">·</span>
            <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-400">{relativeTime(member.lastSeen)}</span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-rose-50 rounded-xl p-3 text-center">
              <Heart className="h-4 w-4 text-rose-500 mx-auto mb-1" />
              <p className={`text-sm font-bold ${bpColor}`}>{bpText}</p>
              <p className="text-xs text-gray-400">BP</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <Footprints className="h-4 w-4 text-orange-500 mx-auto mb-1" />
              <p className="text-sm font-bold text-orange-700">
                {member.healthStats?.stepsToday?.toLocaleString() ?? '—'}
              </p>
              <p className="text-xs text-gray-400">Steps</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <Navigation className="h-4 w-4 text-blue-500 mx-auto mb-1" />
              <p className="text-sm font-bold text-blue-700">{member.speed} km/h</p>
              <p className="text-xs text-gray-400">Speed</p>
            </div>
          </div>

          {/* Battery + Call */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-gray-50 rounded-xl px-3 py-2 flex-1">
              <div className="relative w-6 h-3 border border-gray-400 rounded-sm">
                <div
                  className="absolute inset-0.5 rounded-sm transition-all"
                  style={{
                    width: `${(member.batteryLevel ?? 50)}%`,
                    background: (member.batteryLevel ?? 50) > 30 ? '#22c55e' : '#ef4444',
                  }}
                />
              </div>
              <span className="text-xs text-gray-600">{member.batteryLevel}%</span>
            </div>

            <Button
              className="flex-1 h-10 rounded-xl border-0 text-white font-semibold"
              style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)` }}
            >
              <Phone className="h-4 w-4 mr-2" />
              Call {member.name.split(' ')[0]}
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.35s cubic-bezier(0.32, 0.72, 0, 1) forwards; }
      `}</style>
    </div>
  );
};

// ─── SVG Map Pin ──────────────────────────────────────────────────────────────
// Custom Leaflet icon rendered as SVG data URI
const buildPinSvg = (emoji: string, color: string, isLive: boolean) => {
  const pulse = isLive
    ? `<circle cx="20" cy="20" r="18" fill="${color}" opacity="0.25"><animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite"/></circle>`
    : '';
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="54" viewBox="0 0 44 54">
      ${pulse}
      <circle cx="22" cy="22" r="20" fill="white" stroke="${color}" stroke-width="3"/>
      <text x="22" y="29" text-anchor="middle" font-size="18">${emoji}</text>
      <path d="M22 42 L16 34 Q10 28 22 28 Q34 28 28 34 Z" fill="${color}"/>
    </svg>
  `;
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
// Props: pass in parents from your shared store / context
interface FamilyLocationProps {
  // Feed in the same parents array used in AddFamilyMembers
  // Shape matches ParentHealthSummary — we only need id, name, relationship
  linkedParents?: Array<{ id: string; name: string; relationship: Relationship }>;
}

// Default demo members shown when no parents are linked yet
const DEMO_PARENTS: Array<{ id: string; name: string; relationship: Relationship }> = [
  { id: 'demo-1', name: 'Sunita Kumar', relationship: 'mother' },
  { id: 'demo-2', name: 'Rajesh Kumar', relationship: 'father' },
  { id: 'demo-3', name: 'Priya Kumar',  relationship: 'sister' },
];

const FamilyLocation: React.FC<FamilyLocationProps> = ({ linkedParents }) => {
  const parents = linkedParents && linkedParents.length > 0 ? linkedParents : DEMO_PARENTS;

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const leafletRef = useRef<any>(null);

  const [members, setMembers] = useState<FamilyMemberLocation[]>(() =>
    parents.map((p) => mockLocation(p.id, p.name, p.relationship))
  );
  const [selected, setSelected] = useState<FamilyMemberLocation | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // ── Load Leaflet dynamically ────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Inject Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Inject Leaflet JS
    if (!(window as any).L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  const initMap = useCallback(() => {
    if (!mapRef.current || leafletMap.current) return;
    const L = (window as any).L;
    leafletRef.current = L;

    const map = L.map(mapRef.current, {
      center: [19.076, 72.877],
      zoom: 13,
      zoomControl: false,
    });

    // Tile layer — OpenStreetMap with a warm style
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom zoom control — bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    leafletMap.current = map;
    setMapReady(true);
  }, []);

  // ── Place / update markers when map is ready or members change ─────────────
  useEffect(() => {
    if (!mapReady || !leafletMap.current) return;
    const L = leafletRef.current;

    members.forEach((m) => {
      const meta = getMeta(m.relationship);
      const svg = buildPinSvg(meta.emoji, meta.color, m.isLive);
      const icon = L.divIcon({
        html: svg,
        className: '',
        iconSize: [44, 54],
        iconAnchor: [22, 54],
        popupAnchor: [0, -54],
      });

      if (markersRef.current[m.id]) {
        // Update position smoothly
        markersRef.current[m.id].setLatLng([m.lat, m.lng]);
        markersRef.current[m.id].setIcon(icon);
      } else {
        // Create new marker
        const marker = L.marker([m.lat, m.lng], { icon })
          .addTo(leafletMap.current)
          .on('click', () => setSelected(m));
        markersRef.current[m.id] = marker;
      }
    });

    // Fit bounds to show all members
    if (Object.keys(markersRef.current).length > 0) {
      const group = L.featureGroup(Object.values(markersRef.current));
      leafletMap.current.fitBounds(group.getBounds().pad(0.3));
    }
  }, [mapReady, members]);

  // ── Keep selected member in sync after drift ───────────────────────────────
  useEffect(() => {
    if (selected) {
      const updated = members.find((m) => m.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [members]);

  // ── Live drift every 5 seconds ─────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setMembers((prev) => prev.map((m) => (m.isLive ? drift(m) : m)));
      setLastRefresh(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── Manual refresh ─────────────────────────────────────────────────────────
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setMembers((prev) => prev.map(drift));
      setLastRefresh(new Date());
      setIsRefreshing(false);
    }, 800);
  };

  // ── Center map on a member ─────────────────────────────────────────────────
  const flyTo = (m: FamilyMemberLocation) => {
    leafletMap.current?.flyTo([m.lat, m.lng], 15, { animate: true, duration: 0.8 });
    setSelected(m);
  };

  const liveCount = members.filter((m) => m.isLive).length;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-100">

      {/* ── Top header ── */}
      <div
        className="absolute top-0 left-0 right-0 z-20 px-4 pt-safe"
        style={{ paddingTop: 'env(safe-area-inset-top, 16px)' }}
      >
        <div className="mt-3 flex items-center justify-between">
          <div>
            <div
            //    onClick={()=> navigate('/child-dashboard')} 
              className="text-lg text-gray-900"
              style={{ fontFamily: "'Poppins', sans-serif", textShadow: '0 1px 3px rgba(255,255,255,0.8)' }}
            >
                <ChevronLeft className="h-5 w-5 text-gray-600 inline-block -translate-y-px mr-1" />
              Back
            </div>

            <div className="flex items-center space-x-2 mt-0.5">
              {liveCount > 0 ? (
                <Wifi className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-gray-400" />
              )}
              <span className="text-xs text-gray-600 font-medium">
                {liveCount}/{members.length} live
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400">Updated {relativeTime(lastRefresh.toISOString())}</span>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center"
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Map container ── */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* ── Member avatar strip (bottom of map, above sheet) ── */}
      {!selected && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          {/* Gradient fade */}
          <div className="h-16 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />

          <div className="bg-white/95 backdrop-blur-sm px-4 pt-3 pb-safe"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 16px)' }}>

            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {members.length} Family Members
              </p>
              <div className="flex items-center space-x-1">
                <Shield className="h-3.5 w-3.5 text-green-500" />
                <span className="text-xs text-green-600 font-medium">Secured</span>
              </div>
            </div>

            <div className="flex space-x-3 overflow-x-auto pb-1 scrollbar-hide">
              {members.map((m) => {
                const meta = getMeta(m.relationship);
                return (
                  <button
                    key={m.id}
                    onClick={() => flyTo(m)}
                    className="flex flex-col items-center space-y-1.5 shrink-0 group"
                  >
                    <div className="relative">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border-2 group-active:scale-95 transition-transform"
                        style={{
                          background: meta.accent,
                          borderColor: meta.color,
                        }}
                      >
                        {meta.emoji}
                      </div>
                      {/* Live dot */}
                      {m.isLive && (
                        <span
                          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white animate-pulse"
                          style={{ background: meta.color }}
                        />
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-gray-700 max-w-[56px] truncate">
                      {m.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Member detail sheet ── */}
      {selected && (
        <MemberSheet
          member={selected}
          onClose={() => setSelected(null)}
        />
      )}

      <style>{`
        .leaflet-container { font-family: inherit; background: #f0f4f8; }
        .leaflet-tile { filter: saturate(0.9) brightness(1.05); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default FamilyLocation;