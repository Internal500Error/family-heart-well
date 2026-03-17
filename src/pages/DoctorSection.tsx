import React, { useState } from 'react';
import {
  Stethoscope, Plus, Calendar, FileText, Phone,
  MapPin, Clock, Upload, Download, Share2,
  Star, Sparkles, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Doctor {
  id: string; name: string; specialty: string;
  phone: string; address: string; isPrimary: boolean;
}
interface Appointment {
  id: string; doctorId: string; date: string;
  time: string; reason: string; status: 'upcoming' | 'completed' | 'cancelled';
}
interface Doc {
  id: string; name: string;
  type: 'prescription' | 'report' | 'other';
  date: string; doctorId?: string;
}

// ─── Specialty → color map ────────────────────────────────────────────────────
const SPECIALTY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  'General Physician': { bg: 'bg-blue-50', text: 'text-blue-600', dot: '#3b82f6' },
  'Cardiologist': { bg: 'bg-red-50', text: 'text-red-600', dot: '#ef4444' },
  'Neurologist': { bg: 'bg-purple-50', text: 'text-purple-600', dot: '#8b5cf6' },
  'Orthopedic': { bg: 'bg-orange-50', text: 'text-orange-600', dot: '#f97316' },
  'Diabetologist': { bg: 'bg-amber-50', text: 'text-amber-600', dot: '#f59e0b' },
};
const getSpecialtyStyle = (s: string) =>
  SPECIALTY_COLORS[s] ?? { bg: 'bg-teal-50', text: 'text-teal-600', dot: '#0d9488' };

const DOC_TYPE_META = {
  prescription: { bg: 'bg-purple-50', text: 'text-purple-600', label: 'Prescription' },
  report: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Report' },
  other: { bg: 'bg-gray-50', text: 'text-gray-500', label: 'Document' },
};

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHead = ({
  icon: Icon, title, color = 'from-blue-500 to-teal-400', action,
}: { icon: React.ElementType; title: string; color?: string; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-4 px-1">
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-4 rounded-full bg-gradient-to-b ${color}`} />
      <Icon className="h-4 w-4 text-gray-500" />
      <h2 className="font-black text-gray-900 text-sm">{title}</h2>
    </div>
    {action}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const DoctorSection = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([
    { id: '1', name: 'Dr. Rajesh Sharma', specialty: 'General Physician', phone: '+91 98765 43210', address: 'City Hospital, Main Road', isPrimary: true },
    { id: '2', name: 'Dr. Priya Patel', specialty: 'Cardiologist', phone: '+91 98765 43211', address: 'Heart Care Center', isPrimary: false },
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: '1', doctorId: '1', date: '2024-07-15', time: '10:00', reason: 'Regular checkup', status: 'upcoming' },
    { id: '2', doctorId: '2', date: '2024-07-20', time: '14:30', reason: 'Blood pressure follow-up', status: 'upcoming' },
  ]);

  const [documents, setDocuments] = useState<Doc[]>([
    { id: '1', name: 'Blood Test Report', type: 'report', date: '2024-07-10', doctorId: '1' },
    { id: '2', name: 'Prescription - Atorvastatin', type: 'prescription', date: '2024-07-08', doctorId: '2' },
  ]);

  const [newDoctor, setNewDoctor] = useState({ name: '', specialty: '', phone: '', address: '' });
  const [newAppt, setNewAppt] = useState({ doctorId: '', date: '', time: '', reason: '' });
  const [showDoctorDialog, setShowDoctorDialog] = useState(false);
  const [showApptDialog, setShowApptDialog] = useState(false);

  const getDoctorName = (id: string) => doctors.find(d => d.id === id)?.name ?? 'Unknown Doctor';

  const addDoctor = () => {
    if (!newDoctor.name || !newDoctor.specialty || !newDoctor.phone) return;
    setDoctors(prev => [...prev, { id: Date.now().toString(), ...newDoctor, isPrimary: prev.length === 0 }]);
    setNewDoctor({ name: '', specialty: '', phone: '', address: '' });
    setShowDoctorDialog(false);
  };

  const addAppointment = () => {
    if (!newAppt.doctorId || !newAppt.date || !newAppt.time) return;
    setAppointments(prev => [...prev, { id: Date.now().toString(), ...newAppt, status: 'upcoming' }]);
    setNewAppt({ doctorId: '', date: '', time: '', reason: '' });
    setShowApptDialog(false);
  };

  const upcoming = appointments.filter(a => a.status === 'upcoming');
  const recentDocs = documents.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* ── Hero header ─────────────────────────────────────────── */}
        <div
          className="relative rounded-3xl overflow-hidden shadow-lg"
          style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0d9488 100%)' }}
        >
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute bottom-0 -left-6 w-28 h-28 rounded-full bg-white/10" />

          <div className="relative px-6 pt-7 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Stethoscope className="h-4 w-4 text-white/70" />
                  <span className="text-white/60 text-xs font-semibold tracking-widest uppercase">DilCare</span>
                </div>
                <h1 className="text-2xl font-black text-white leading-tight">Doctor Section</h1>
                <p className="text-white/60 text-sm mt-1">Manage your healthcare team</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center">
                <Stethoscope className="h-7 w-7 text-white" />
              </div>
            </div>

            {/* Stat strip */}
            <div className="grid grid-cols-3 gap-2 mt-5">
              {[
                { label: 'Doctors', value: doctors.length },
                { label: 'Upcoming', value: upcoming.length },
                { label: 'Documents', value: documents.length },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-2xl px-3 py-2.5 text-center border border-white/20"
                  style={{ background: 'rgba(255,255,255,0.14)' }}>
                  <p className="text-white font-black text-lg leading-none">{value}</p>
                  <p className="text-white/55 text-[10px] font-semibold uppercase tracking-wide mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Upcoming Appointments ────────────────────────────────── */}
        <div>
          <SectionHead
            icon={Calendar}
            title="Upcoming Appointments"
            color="from-blue-500 to-sky-400"
            action={
              <button
                onClick={() => setShowApptDialog(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Book
              </button>
            }
          />

          {upcoming.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-25" />
              <p className="text-sm">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(appt => {
                const doc = doctors.find(d => d.id === appt.doctorId);
                const sc = doc ? getSpecialtyStyle(doc.specialty) : { bg: 'bg-gray-50', text: 'text-gray-500', dot: '#6b7280' };
                return (
                  <Card key={appt.id} className="border-0 shadow-sm overflow-hidden">
                    <div className="flex">
                      <div className="w-1 shrink-0 rounded-l-xl" style={{ background: sc.dot }} />
                      <CardContent className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-[15px] leading-tight truncate">
                              {getDoctorName(appt.doctorId)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                              {appt.reason || 'General consultation'}
                            </p>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: sc.dot }}>
                                <Calendar className="h-3 w-3" />
                                {new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: sc.dot }}>
                                <Clock className="h-3 w-3" />
                                {appt.time}
                              </div>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text} shrink-0`}>
                            Upcoming
                          </span>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ── My Doctors ───────────────────────────────────────────── */}
        <div>
          <SectionHead
            icon={Stethoscope}
            title="My Doctors"
            color="from-teal-500 to-emerald-400"
            action={
              <button
                onClick={() => setShowDoctorDialog(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Doctor
              </button>
            }
          />

          <div className="space-y-3">
            {doctors.map(doctor => {
              const sc = getSpecialtyStyle(doctor.specialty);
              return (
                <Card key={doctor.id} className="border-0 shadow-sm overflow-hidden">
                  <div className="flex">
                    <div className="w-1 shrink-0 rounded-l-xl" style={{ background: sc.dot }} />
                    <CardContent className="flex-1 p-4">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div
                          className={`w-12 h-12 rounded-2xl ${sc.bg} flex items-center justify-center shrink-0`}
                        >
                          <Stethoscope className={`h-5 w-5 ${sc.text}`} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className="font-bold text-gray-900 text-[15px] leading-tight">{doctor.name}</p>
                            {doctor.isPrimary && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                                Primary
                              </span>
                            )}
                          </div>
                          <p className={`text-xs font-semibold ${sc.text} mb-2`}>{doctor.specialty}</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3 shrink-0" />
                              {doctor.phone}
                            </div>
                            {doctor.address && (
                              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                                <span className="leading-snug">{doctor.address}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Call button */}
                        <button
                          onClick={() => window.open(`tel:${doctor.phone}`)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-2 transition-colors"
                          style={{ background: sc.bg, borderColor: sc.dot + '40' }}
                        >
                          <Phone className={`h-4 w-4 ${sc.text}`} />
                        </button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ── Documents ────────────────────────────────────────────── */}
        <div>
          <SectionHead
            icon={FileText}
            title="Recent Documents"
            color="from-violet-500 to-purple-400"
            action={
              <button className="flex items-center gap-1.5 text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-xl transition-colors">
                <Upload className="h-3.5 w-3.5" />
                Upload
              </button>
            }
          />

          <div className="space-y-3">
            {recentDocs.map(doc => {
              const m = DOC_TYPE_META[doc.type];
              return (
                <Card key={doc.id} className="border-0 shadow-sm overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl ${m.bg} flex items-center justify-center shrink-0`}>
                        <FileText className={`h-5 w-5 ${m.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm leading-tight truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${m.bg} ${m.text}`}>
                            {m.label}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(doc.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                          {doc.doctorId && (
                            <span className="text-[11px] text-muted-foreground truncate">
                              · {getDoctorName(doc.doctorId)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {[Download, Share2].map((Icon, i) => (
                          <button key={i}
                            className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center transition-colors">
                            <Icon className="h-3.5 w-3.5 text-gray-500" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ── AI Health Summary ────────────────────────────────────── */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #0ea5e9, #0d9488, #8b5cf6)' }} />
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-1.5">AI Health Summary</p>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  Generate a comprehensive health report based on your recent readings and medicines.
                </p>
                <button
                  className="flex items-center gap-2 text-xs font-bold text-white px-4 py-2.5 rounded-xl transition-opacity hover:opacity-90 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #0d9488)' }}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Generate Report
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="h-2" />
      </div>

      {/* ── Book Appointment Dialog ──────────────────────────────── */}
      <Dialog open={showApptDialog} onOpenChange={setShowApptDialog}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              Book Appointment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Select Doctor</Label>
              <select
                className="w-full h-11 px-3 border border-input rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={newAppt.doctorId}
                onChange={e => setNewAppt({ ...newAppt, doctorId: e.target.value })}
              >
                <option value="">Choose doctor…</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Date</Label>
                <Input type="date" value={newAppt.date}
                  onChange={e => setNewAppt({ ...newAppt, date: e.target.value })}
                  className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Time</Label>
                <Input type="time" value={newAppt.time}
                  onChange={e => setNewAppt({ ...newAppt, time: e.target.value })}
                  className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Reason</Label>
              <Textarea value={newAppt.reason}
                onChange={e => setNewAppt({ ...newAppt, reason: e.target.value })}
                placeholder="e.g., Regular checkup, Follow-up"
                className="rounded-xl resize-none" rows={3} />
            </div>
            <Button onClick={addAppointment} className="w-full h-11 rounded-xl font-semibold">
              Book Appointment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Add Doctor Dialog ────────────────────────────────────── */}
      <Dialog open={showDoctorDialog} onOpenChange={setShowDoctorDialog}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center">
                <Stethoscope className="h-4 w-4 text-teal-600" />
              </div>
              Add Doctor
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            {[
              { id: 'name', label: 'Doctor Name', placeholder: 'Dr. Rajesh Sharma', key: 'name' },
              { id: 'specialty', label: 'Specialty', placeholder: 'General Physician', key: 'specialty' },
              { id: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210', key: 'phone' },
            ].map(({ id, label, placeholder, key }) => (
              <div key={id} className="space-y-1.5">
                <Label htmlFor={id} className="text-sm font-semibold">{label}</Label>
                <Input id={id} value={(newDoctor as any)[key]}
                  onChange={e => setNewDoctor({ ...newDoctor, [key]: e.target.value })}
                  placeholder={placeholder} className="h-11 rounded-xl" />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Address</Label>
              <Textarea value={newDoctor.address}
                onChange={e => setNewDoctor({ ...newDoctor, address: e.target.value })}
                placeholder="City Hospital, Main Road"
                className="rounded-xl resize-none" rows={2} />
            </div>
            <Button onClick={addDoctor} className="w-full h-11 rounded-xl font-semibold">
              Add Doctor
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorSection;