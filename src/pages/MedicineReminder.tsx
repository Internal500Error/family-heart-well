import React, { useState, useEffect } from 'react';
import {
  Pill, Plus, Clock, CheckCircle2, AlertCircle,
  Camera, Mic, XCircle, Sparkles, ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { medicineService } from '@/lib/api-client';

interface Medicine {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  is_taken: boolean;
  missed?: boolean;
  color: string;
}

// Cycle through pill accent colors so each medicine feels distinct
const PILL_COLORS = [
  { dot: '#6366f1', light: '#eef2ff' }, // indigo
  { dot: '#0ea5e9', light: '#f0f9ff' }, // sky
  { dot: '#f97316', light: '#fff7ed' }, // orange
  { dot: '#16a34a', light: '#f0fdf4' }, // green
  { dot: '#f43f5e', light: '#fff1f2' }, // rose
  { dot: '#8b5cf6', light: '#f5f3ff' }, // violet
];
const pickColor = (idx: number) => PILL_COLORS[idx % PILL_COLORS.length];

const MedicineReminder = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [newMedicine, setNewMedicine] = useState({ name: '', dosage: '', frequency: '', time: '' });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setIsLoading(true);
      // Get today's medicine intakes (which include is_taken status)
      const response = await medicineService.getTodayMedicines();
      if (response.data && Array.isArray(response.data)) {
        const medicinesWithColors = response.data.map((med: any, idx: number) => ({
          ...med,
          color: JSON.stringify(pickColor(idx)),
        }));
        setMedicines(medicinesWithColors);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch medicines');
      console.error('Error fetching medicines:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaken = async (intakeId: number, currentStatus: boolean) => {
    try {
      setIsSaving(true);
      // Toggle the intake status (convert ID to string for API call)
      const response = await medicineService.toggleMedicineIntake(
        String(intakeId),
        { is_taken: !currentStatus } // Send the toggle data properly
      );
      if (response.error) {
        setError(response.error);
      } else {
        // Refresh the medicines list after toggling
        await fetchMedicines();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update medicine');
      console.error('Error updating medicine:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const addMedicine = async () => {
    if (!newMedicine.name || !newMedicine.dosage || !newMedicine.frequency || !newMedicine.time) {
      setError('Please fill in all fields');
      return;
    }
    try {
      setIsSaving(true);
      const response = await medicineService.addMedicine(newMedicine);
      if (response.error) {
        setError(response.error);
      } else {
        setNewMedicine({ name: '', dosage: '', frequency: '', time: '' });
        setDialogOpen(false);
        await fetchMedicines();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add medicine');
      console.error('Error adding medicine:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const pending = medicines.filter(m => !m.is_taken);
  const completed = medicines.filter(m => m.is_taken);
  const missed = medicines.filter(m => m.missed);

  const stats = [
    { label: 'Pending', value: pending.length, textColor: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Taken', value: completed.length, textColor: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Missed', value: missed.length, textColor: 'text-red-500', bg: 'bg-red-50' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading medicines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* ── Hero header ───────────────────────────────────────────── */}
        <div
          className="relative rounded-3xl overflow-hidden px-6 pt-7 pb-6 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
        >
          {/* decorative blobs */}
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute bottom-0 left-10 w-20 h-20 rounded-full bg-white/8" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Pill className="h-4 w-4 text-white/70" />
                <span className="text-white/60 text-xs font-semibold tracking-widest uppercase">DilCare</span>
              </div>
              <h1 className="text-2xl font-bold text-white leading-tight">Medicine Reminder</h1>
              <p className="text-white/60 text-sm mt-1">Stay healthy with timely medicines</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Pill className="h-7 w-7 text-white" />
            </div>
          </div>

          {/* Inline progress dots */}
          <div className="relative mt-5 flex items-center gap-2">
            {medicines.map((m, i) => (
              <div
                key={m.id}
                className={`h-2 rounded-full transition-all duration-300 ${m.taken ? 'bg-white' : 'bg-white/30'}`}
                style={{ width: m.taken ? 24 : 10 }}
              />
            ))}
            <span className="text-white/60 text-xs ml-auto">
              {completed.length}/{medicines.length} taken today
            </span>
          </div>
        </div>

        {/* ── Quick stats ────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value, textColor, bg }) => (
            <Card key={label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <span className={`text-xl font-black leading-none ${textColor}`}>{value}</span>
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Action row ─────────────────────────────────────────────── */}
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 h-11 rounded-2xl text-sm font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  Add New Medicine
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-semibold">Medicine Name</Label>
                  <Input
                    id="name"
                    value={newMedicine.name}
                    onChange={e => setNewMedicine({ ...newMedicine, name: e.target.value })}
                    placeholder="e.g., Atorvastatin"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dosage" className="text-sm font-semibold">Dosage</Label>
                  <Input
                    id="dosage"
                    value={newMedicine.dosage}
                    onChange={e => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                    placeholder="e.g., 20mg"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Frequency</Label>
                  <Select onValueChange={v => setNewMedicine({ ...newMedicine, frequency: v })}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Once daily">Once daily</SelectItem>
                      <SelectItem value="Twice daily">Twice daily</SelectItem>
                      <SelectItem value="Three times daily">Three times daily</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="time" className="text-sm font-semibold">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newMedicine.time}
                    onChange={e => setNewMedicine({ ...newMedicine, time: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>
                <Button onClick={addMedicine} className="w-full h-11 rounded-xl font-semibold mt-2">
                  Add Medicine
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl shrink-0">
            <Mic className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl shrink-0">
            <Camera className="h-4 w-4" />
          </Button>
        </div>

        {/* ── Medicine list ──────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-gray-900 text-sm">Today's Schedule</h2>
            </div>
            <span className="text-xs font-medium text-muted-foreground bg-gray-100 px-2.5 py-1 rounded-full">
              {medicines.length} medicines
            </span>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="space-y-3">
            {medicines.map((medicine) => {
              const col = JSON.parse(medicine.color) as { dot: string; light: string };
              return (
                <Card
                  key={medicine.id}
                  className={`border-0 shadow-sm overflow-hidden transition-all duration-200 ${medicine.is_taken ? 'opacity-60' : 'hover:shadow-md'
                    }`}
                >
                  <div className="flex">
                    {/* Left color bar */}
                    <div className="w-1 shrink-0 rounded-l-xl" style={{ background: col.dot }} />

                    <CardContent className="flex-1 p-4 min-w-0">
                      <div className="flex items-center gap-3">

                        {/* Pill icon circle */}
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                          style={{ background: col.light }}
                        >
                          <Pill className="h-5 w-5" style={{ color: col.dot }} />
                        </div>

                        {/* Medicine info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <h3 className="font-bold text-gray-900 text-[15px] leading-tight">{medicine.name}</h3>
                            {medicine.missed && (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 leading-none">
                                Missed
                              </Badge>
                            )}
                            {medicine.is_taken && (
                              <Badge className="text-[10px] px-1.5 py-0 h-4 leading-none bg-green-500 text-white border-0">
                                Taken
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {medicine.dosage} · {medicine.frequency}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" style={{ color: col.dot }} />
                            <span className="text-xs font-semibold" style={{ color: col.dot }}>
                              {medicine.time}
                            </span>
                          </div>
                        </div>

                        {/* Take button */}
                        <button
                          onClick={() => toggleTaken(medicine.id, medicine.is_taken)}
                          disabled={isSaving}
                          className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border-2 transition-all duration-200 ${medicine.is_taken
                              ? 'bg-green-500 border-green-500'
                              : 'bg-white hover:border-green-400'
                            } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                          style={!medicine.is_taken ? { borderColor: col.dot + '60' } : {}}
                        >
                          {medicine.is_taken
                            ? <CheckCircle2 className="h-5 w-5 text-white" />
                            : <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: col.dot }} />
                          }
                        </button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ── AI tip ────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="flex">
            <div className="w-1 shrink-0 rounded-l-xl bg-gradient-to-b from-primary to-violet-500" />
            <CardContent className="flex-1 p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                    AI Reminder Tip
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Taking Atorvastatin in the evening is best as your body produces more cholesterol at night. Great timing! 🌙
                  </p>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* ── Safety note ───────────────────────────────────────────── */}
        <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
          <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-xs text-green-700 font-medium leading-snug">
            Always consult your doctor before changing dosage or stopping any medication.
          </p>
        </div>

        <div className="h-2" />
      </div>
    </div>
  );
};

export default MedicineReminder;