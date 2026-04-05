import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Apple, Dumbbell, Wind, Heart,
  CheckCircle2, Play, Pause, Star, Clock, Sparkles,
  Trophy, Flame, Loader,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { gyaanService } from '@/lib/api-client';

interface GyaanTip {
  id: string;
  category: 'nutrition' | 'exercise' | 'meditation' | 'ayurveda';
  title: string;
  description: string;
  content: string;
  duration?: number;
  completed: boolean;
  favorite: boolean;
  streak?: number;
}

const CATEGORY_META = {
  all: { label: 'All Tips', Icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10', pill: 'bg-primary/10 text-primary', accent: '#6366f1', light: '#eef2ff' },
  nutrition: { label: 'Nutrition', Icon: Apple, color: 'text-green-600', bg: 'bg-green-50', pill: 'bg-green-100 text-green-700', accent: '#16a34a', light: '#f0fdf4' },
  exercise: { label: 'Exercise', Icon: Dumbbell, color: 'text-orange-500', bg: 'bg-orange-50', pill: 'bg-orange-100 text-orange-700', accent: '#f97316', light: '#fff7ed' },
  meditation: { label: 'Meditation', Icon: Wind, color: 'text-sky-500', bg: 'bg-sky-50', pill: 'bg-sky-100 text-sky-700', accent: '#0ea5e9', light: '#f0f9ff' },
  ayurveda: { label: 'Ayurveda', Icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', pill: 'bg-rose-100 text-rose-700', accent: '#f43f5e', light: '#fff1f2' },
} as const;

type CategoryKey = keyof typeof CATEGORY_META;

// ─── Timer hook ───────────────────────────────────────────────────────────────
const useTimer = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = (id: string, mins: number) => {
    if (ref.current) clearInterval(ref.current);
    setActiveId(id);
    setSeconds(mins * 60);
    ref.current = setInterval(() => {
      setSeconds(s => { if (s <= 1) { clearInterval(ref.current!); setActiveId(null); return 0; } return s - 1; });
    }, 1000);
  };
  const stop = () => { if (ref.current) clearInterval(ref.current); setActiveId(null); setSeconds(0); };
  useEffect(() => () => { if (ref.current) clearInterval(ref.current); }, []);

  return {
    activeId, seconds, stop, start,
    fmt: `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`,
  };
};

// ─── Main component ───────────────────────────────────────────────────────────
const GyaanCorner = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const timer = useTimer();

  // API state
  const [tips, setTips] = useState<GyaanTip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Load tips from API
  useEffect(() => {
    const loadTips = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await gyaanService.getTips();
        if (response.error) {
          setError('Failed to load tips');
          setTips([]);
        } else {
          const data = Array.isArray(response.data) ? response.data : [];
          setTips(data.map(t => ({
            id: String(t.id),
            category: (t.category || 'nutrition') as any,
            title: t.title,
            description: t.description,
            content: t.content,
            duration: t.duration,
            completed: t.completed || false,
            favorite: t.is_favorite || false,
            streak: t.streak || 0,
          })));
        }
      } catch (err) {
        console.error('Failed to load tips:', err);
        setError('Failed to load tips');
      } finally {
        setIsLoading(false);
      }
    };
    loadTips();
  }, []);

  // Toggle complete status
  const toggleComplete = async (id: string) => {
    try {
      await gyaanService.markComplete(id);
      setTips(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    } catch (err) {
      console.error('Failed to mark complete:', err);
    }
  };

  // Compute derived values
  const filteredTips = selectedCategory === 'all' ? tips : tips.filter(t => t.category === selectedCategory);
  const completedCount = tips.filter(t => t.completed).length;
  const completionPct = tips.length > 0 ? (completedCount / tips.length) * 100 : 0;
  const favCount = tips.filter(t => t.favorite).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* ── Hero Header ───────────────────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary to-indigo-600 px-6 pt-7 pb-6 text-white shadow-lg">
          {/* decorative blobs */}
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute bottom-0 left-8 w-20 h-20 rounded-full bg-white/8" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-5 w-5 text-white/80" />
                <span className="text-white/70 text-xs font-semibold tracking-widest uppercase">DilCare</span>
              </div>
              <h1 className="text-2xl font-bold leading-tight">Gyaan Corner</h1>
              <p className="text-white/65 text-sm mt-1">Daily wisdom for healthy living</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-3xl font-black leading-none">{completedCount}/{tips.length}</div>
              <div className="text-white/60 text-xs mt-0.5">done today</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative mt-5">
            <div className="flex items-center justify-between text-xs text-white/60 mb-1.5">
              <span>Today's progress</span>
              <span className="font-semibold text-white">{Math.round(completionPct)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Quick stats row ────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Flame, label: 'Streak', value: `${tips.find(t => t.streak)?.streak ?? 0}d`, color: 'text-orange-500', bg: 'bg-orange-50' },
            { icon: Trophy, label: 'Completed', value: `${completedCount}`, color: 'text-green-600', bg: 'bg-green-50' },
            { icon: Star, label: 'Favourites', value: `${favCount}`, color: 'text-yellow-500', bg: 'bg-yellow-50' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <Card key={label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-1">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`h-4.5 w-4.5 ${color}`} />
                </div>
                <span className="text-xl font-black text-gray-900 leading-none">{value}</span>
                <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Category filter ────────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Browse by Category</p>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
            {(Object.keys(CATEGORY_META) as CategoryKey[]).map(key => {
              const { label, Icon, accent, light, color } = CATEGORY_META[key];
              const active = selectedCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0 border"
                  style={active
                    ? { background: accent, color: '#fff', borderColor: accent, boxShadow: `0 4px 14px ${accent}40` }
                    : { background: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }
                  }
                >
                  <Icon
                    className="h-3.5 w-3.5"
                    style={{ color: active ? '#fff' : accent }}
                  />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Error display ──────────────────────────────────────────────── */}
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* ── Loading state ──────────────────────────────────────────────– */}
        {isLoading ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-8 flex flex-col items-center gap-3">
              <Loader className="h-6 w-6 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Loading tips...</p>
            </CardContent>
          </Card>
        ) : (
          <>
        {/* ── Section heading ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            {(() => { const { Icon, color } = CATEGORY_META[selectedCategory]; return <Icon className={`h-4 w-4 ${color}`} />; })()}
            <h2 className="font-bold text-gray-900 text-sm">
              {selectedCategory === 'all' ? 'All Health Tips' : `${CATEGORY_META[selectedCategory].label} Tips`}
            </h2>
          </div>
          <span className="text-xs font-medium text-muted-foreground bg-gray-100 px-2.5 py-1 rounded-full">
            {filteredTips.length} tips
          </span>
        </div>

        {/* ── Tips list ──────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {filteredTips.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-7 w-7 text-gray-300" />
              </div>
              <p className="text-sm text-muted-foreground">No tips in this category yet.</p>
            </div>
          ) : (
            filteredTips.map(tip => {
              const meta = CATEGORY_META[tip.category];
              const isRunning = timer.activeId === tip.id;
              return (
                <Card
                  key={tip.id}
                  className={`border-0 shadow-sm overflow-hidden transition-all duration-200 ${tip.completed ? 'ring-1 ring-green-200' : 'hover:shadow-md'
                    }`}
                >
                  {/* coloured left accent bar */}
                  <div className="flex">
                    <div className="w-1 shrink-0 rounded-l-xl" style={{ background: meta.accent }} />

                    <CardContent className="flex-1 p-5 min-w-0">

                      {/* Row 1: category pill + completed tag + favourite */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${meta.pill}`}>
                          <meta.Icon className="h-3 w-3" />
                          {meta.label}
                        </span>
                        {tip.completed && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Done
                          </span>
                        )}
                        {tip.streak && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-700 ml-auto mr-0">
                            🔥 {tip.streak}d
                          </span>
                        )}
                        <button
                          onClick={() => toggleFavorite(tip.id)}
                          className={`ml-auto p-1.5 rounded-full transition-colors ${tip.streak ? 'ml-1' : ''} hover:bg-gray-100`}
                        >
                          <Star className={`h-4 w-4 transition-colors ${tip.favorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        </button>
                      </div>

                      {/* Row 2: title */}
                      <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-1">{tip.title}</h3>

                      {/* Row 3: description */}
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{tip.description}</p>

                      {/* Duration */}
                      {tip.duration && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-3">
                          <Clock className="h-3.5 w-3.5" />
                          {tip.duration} min
                        </div>
                      )}

                      {/* Content box */}
                      <div
                        className="rounded-2xl p-4 mb-4 border text-sm text-gray-700 leading-relaxed whitespace-pre-line"
                        style={{ background: meta.accent + '08', borderColor: meta.accent + '20' }}
                      >
                        {tip.content}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {tip.duration ? (
                          <>
                            <Button
                              size="sm"
                              className="flex-1 h-10 rounded-xl text-sm font-semibold border-0"
                              style={isRunning
                                ? { background: '#f3f4f6', color: '#374151' }
                                : { background: meta.accent, color: '#fff' }
                              }
                              onClick={() => isRunning ? timer.stop() : timer.start(tip.id, tip.duration!)}
                            >
                              {isRunning
                                ? <><Pause className="h-3.5 w-3.5 mr-2" />{timer.fmt}</>
                                : <><Play className="h-3.5 w-3.5 mr-2" />Start Timer</>
                              }
                            </Button>
                            <button
                              onClick={() => toggleComplete(tip.id)}
                              className={`h-10 w-10 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${tip.completed
                                  ? 'bg-green-500 border-green-500'
                                  : 'bg-white border-gray-200 hover:border-green-400'
                                }`}
                            >
                              <CheckCircle2 className={`h-5 w-5 ${tip.completed ? 'text-white' : 'text-gray-300'}`} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => toggleComplete(tip.id)}
                            className={`flex-1 h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 border-2 ${tip.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600'
                              }`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {tip.completed ? 'Completed!' : 'Mark as Done'}
                          </button>
                        )}
                      </div>

                    </CardContent>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* ── Featured tip ───────────────────────────────────────────────── */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div
            className="px-5 pt-5 pb-6 relative"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            {/* decoration */}
            <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
            <div className="absolute right-10 bottom-0 w-16 h-16 rounded-full bg-white/8" />

            <div className="relative flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest mb-1.5">
                  Today's Special Tip
                </p>
                <p className="text-sm text-white/90 leading-relaxed">
                  Practice gratitude! Before sleeping, think of 3 good things that happened today.
                  This simple practice can improve your mood and sleep quality. 🙏✨
                </p>
              </div>
            </div>
          </div>
        </Card>
          </>
        )}

        {/* bottom spacing */}
        <div className="h-2" />
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default GyaanCorner;