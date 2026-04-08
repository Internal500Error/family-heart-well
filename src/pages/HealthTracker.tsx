import React, { useState, useEffect } from 'react';
import {
  Activity, Heart, Droplets, Weight, Plus,
  TrendingUp, FileDown, Share2, Sparkles, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { healthService } from '@/lib/api-client';

interface HealthReading {
  id: string;
  type: 'bp' | 'sugar' | 'weight' | 'heartRate';
  value: string;
  date: string;
  time: string;
  status: 'normal' | 'warning' | 'danger';
}

const STATUS_META = {
  normal: { label: 'Normal', dot: 'bg-green-500', text: 'text-green-600', badge: 'bg-green-100 text-green-700' },
  warning: { label: 'Warning', dot: 'bg-yellow-400', text: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700' },
  danger: { label: 'High', dot: 'bg-red-500', text: 'text-red-600', badge: 'bg-red-100 text-red-700' },
};

const METRIC_META = {
  bp: { title: 'Blood Pressure', Icon: Heart, color: 'text-red-500', bg: 'bg-red-50', accent: '#ef4444', unit: 'mmHg' },
  sugar: { title: 'Blood Sugar', Icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50', accent: '#3b82f6', unit: 'mg/dL' },
  weight: { title: 'Weight', Icon: Weight, color: 'text-green-600', bg: 'bg-green-50', accent: '#16a34a', unit: 'kg' },
  heartRate: { title: 'Heart Rate', Icon: Activity, color: 'text-primary', bg: 'bg-orange-50', accent: '#f97316', unit: 'bpm' },
};

// Custom tooltip for chart
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="text-gray-500 font-medium mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-bold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const HealthTracker = () => {
  const [readings, setReadings] = useState<HealthReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState<'bp' | 'sugar' | 'weight' | 'heartRate'>('bp');
  const [newReading, setNewReading] = useState({
    type: 'bp',
    value: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Helper: Get latest reading of a specific type
  const latest = (type: string) => {
    return readings.find(r => r.type === type);
  };

  // Helper: Prepare chart data from readings
  const chartData = readings.slice(0, 5).reverse().map((reading, idx) => ({
    date: reading.date,
    bp: reading.type === 'bp' ? parseInt(reading.value.split('/')[0]) : null,
    sugar: reading.type === 'sugar' ? parseFloat(reading.value) : null,
  })).filter(d => d.bp !== null || d.sugar !== null);

  useEffect(() => {
    fetchReadings();
  }, [selectedType]);

  const fetchReadings = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await healthService.getHealthReadings({
        type: selectedType,
        limit: '50'
      });
      if (response.error) {
        setError(response.error);
        setReadings([]);
      } else {
        // Handle both array and paginated response formats
        let data = response.data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          // If it's a paginated response with results property
          data = (data as any).results || [];
        }
        setReadings(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError('Failed to load health readings');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addReading = async () => {
    if (!newReading.value.trim()) {
      setError('Please enter a value');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      const response = await healthService.addHealthReading({
        type: newReading.type,
        value: newReading.value,
        recorded_at: `${newReading.date}T${newReading.time}:00Z`,
      });
      if (response.error) {
        setError(response.error);
      } else {
        setNewReading({
          type: 'bp',
          value: '',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
        });
        setDialogOpen(false);
        fetchReadings();
      }
    } catch (err) {
      setError('Failed to add reading');
      console.error('Add error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* ── Error Banner ───────────────────────────────────────────── */}
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-red-700 text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-red-700 flex-1">{error}</p>
              <button 
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-600 font-bold text-lg leading-none shrink-0"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* ── Loading Indicator ──────────────────────────────────────── */}
        {isLoading && (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-8 flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Loading health data...</p>
            </CardContent>
          </Card>
        )}

        {/* ── Hero header ───────────────────────────────────────────── */}
        <div
          className="relative rounded-3xl overflow-hidden px-6 pt-7 pb-6 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)' }}
        >
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute bottom-0 left-10 w-20 h-20 rounded-full bg-white/8" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-white/70" />
                <span className="text-white/60 text-xs font-semibold tracking-widest uppercase">DilCare</span>
              </div>
              <h1 className="text-2xl font-bold text-white leading-tight">Health Tracker</h1>
              <p className="text-white/60 text-sm mt-1">Monitor your vital signs</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Activity className="h-7 w-7 text-white" />
            </div>
          </div>


        </div>

        {/* ── Metric cards 2×2 ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(METRIC_META) as Array<keyof typeof METRIC_META>).map(type => {
            const { title, Icon, color, bg, accent, unit } = METRIC_META[type];
            const r = latest(type);
            const status = (r?.status ?? 'normal') as keyof typeof STATUS_META;
            const sm = STATUS_META[status];

            return (
              <Card key={type} className="border-0 shadow-sm overflow-hidden">
                <div className="h-0.5 w-full" style={{ background: accent }} />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    {r && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sm.badge}`}>
                        {sm.label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium mb-0.5">{title}</p>
                  <p className="text-2xl font-black text-gray-900 leading-none">
                    {r?.value ?? '—'}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">{unit}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── Add reading ────────────────────────────────────────────── */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-11 rounded-2xl text-sm font-semibold">
              <Plus className="h-4 w-4 mr-2" />
              Add New Reading
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Add Health Reading
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Metric Type</Label>
                <select
                  className="w-full h-11 px-3 border border-input rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={newReading.type}
                  onChange={e => setNewReading({ ...newReading, type: e.target.value })}
                >
                  <option value="">Select metric</option>
                  <option value="bp">Blood Pressure</option>
                  <option value="sugar">Blood Sugar</option>
                  <option value="weight">Weight</option>
                  <option value="heartRate">Heart Rate</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="value" className="text-sm font-semibold">Value</Label>
                <Input
                  id="value"
                  value={newReading.value}
                  onChange={e => setNewReading({ ...newReading, value: e.target.value })}
                  placeholder="e.g., 120/80, 95, 72.5"
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="date" className="text-sm font-semibold">Date</Label>
                  <Input id="date" type="date" value={newReading.date}
                    onChange={e => setNewReading({ ...newReading, date: e.target.value })}
                    className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="time" className="text-sm font-semibold">Time</Label>
                  <Input id="time" type="time" value={newReading.time}
                    onChange={e => setNewReading({ ...newReading, time: e.target.value })}
                    className="h-11 rounded-xl" />
                </div>
              </div>
              <Button onClick={addReading} className="w-full h-11 rounded-xl font-semibold">
                Save Reading
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Trends chart ──────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Health Trends
              </CardTitle>
              <span className="text-xs text-muted-foreground bg-gray-100 px-2.5 py-1 rounded-full">Last 5 days</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="bp" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3, fill: '#ef4444' }} name="BP" />
                  <Line type="monotone" dataKey="sugar" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} name="Sugar" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex items-center justify-center gap-5 mt-1">
              {[{ color: '#ef4444', label: 'Blood Pressure' }, { color: '#3b82f6', label: 'Blood Sugar' }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded-full" style={{ background: l.color }} />
                  <span className="text-[11px] text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Recent readings ───────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              Recent Readings
            </h2>
            <span className="text-xs text-muted-foreground bg-gray-100 px-2.5 py-1 rounded-full">
              {readings.length} entries
            </span>
          </div>

          <div className="space-y-3">
            {readings.slice(0, 5).map(reading => {
              const m = METRIC_META[reading.type];
              const status = reading.status as keyof typeof STATUS_META;
              const sm = STATUS_META[status];
              return (
                <Card key={reading.id} className="border-0 shadow-sm overflow-hidden">
                  <div className="flex">
                    <div className="w-1 shrink-0 rounded-l-xl" style={{ background: m.accent }} />
                    <CardContent className="flex-1 p-4 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl ${m.bg} flex items-center justify-center shrink-0`}>
                          <m.Icon className={`h-5 w-5 ${m.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-[15px] leading-tight">{m.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{reading.date} · {reading.time}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xl font-black text-gray-900 leading-none">{reading.value}</p>
                          <p className="text-[11px] text-muted-foreground">{m.unit}</p>
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${sm.badge}`}>
                            {sm.label}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ── Export & Share ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-11 rounded-2xl text-sm font-semibold">
            <FileDown className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" className="h-11 rounded-2xl text-sm font-semibold">
            <Share2 className="h-4 w-4 mr-2" />
            Share Report
          </Button>
        </div>

        {/* ── AI Insight ────────────────────────────────────────────── */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="flex">
            <div className="w-1 shrink-0 rounded-l-xl bg-gradient-to-b from-green-500 to-emerald-600" />
            <CardContent className="flex-1 p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1.5">
                    AI Health Insight
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Your blood pressure has been stable this week! Keep up the good work with your morning walks. 🚶‍♂️
                  </p>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        <div className="h-2" />
      </div>
    </div>
  );
};

export default HealthTracker;