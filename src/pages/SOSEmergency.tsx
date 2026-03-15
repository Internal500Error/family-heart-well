import React, { useState, useRef } from 'react';
import {
  AlertTriangle, Phone, MapPin, Plus, Trash2,
  Shield, Heart, Clock, Star, CheckCircle2, Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

// ─── Hold-to-activate ring ─────────────────────────────────────────────────
const SOS_HOLD_MS = 3000;

const SOSEmergency = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { id: '1', name: 'Dr. Sarah Johnson', phone: '+1-555-0123', relationship: 'Primary Doctor', isPrimary: true },
    { id: '2', name: 'Rajesh (Son)', phone: '+1-555-0456', relationship: 'Son', isPrimary: false },
  ]);

  const [newContact, setNewContact] = useState<Omit<EmergencyContact, 'id'>>({
    name: '', phone: '', relationship: '', isPrimary: false,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0); // 0–100
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStart = useRef<number>(0);

  // ── SOS hold logic ──────────────────────────────────────────────────────
  const startHold = () => {
    if (isEmergencyActive) return;
    holdStart.current = Date.now();
    holdInterval.current = setInterval(() => {
      const elapsed = Date.now() - holdStart.current;
      const pct = Math.min((elapsed / SOS_HOLD_MS) * 100, 100);
      setHoldProgress(pct);
      if (pct >= 100) {
        clearInterval(holdInterval.current!);
        setIsEmergencyActive(true);
        setHoldProgress(0);
      }
    }, 30);
  };

  const cancelHold = () => {
    if (holdInterval.current) clearInterval(holdInterval.current);
    if (!isEmergencyActive) setHoldProgress(0);
  };

  const cancelEmergency = () => { setIsEmergencyActive(false); setHoldProgress(0); };

  // ── Contacts ────────────────────────────────────────────────────────────
  const addContact = () => {
    if (!newContact.name || !newContact.phone) return;
    setContacts(prev => [...prev, { ...newContact, id: String(Date.now()) }]);
    setNewContact({ name: '', phone: '', relationship: '', isPrimary: false });
    setIsDialogOpen(false);
  };

  const removeContact = (id: string) =>
    setContacts(prev => prev.filter(c => c.id !== id));

  // ── Location ────────────────────────────────────────────────────────────
  const shareLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => window.open(`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`, '_blank'),
      (err) => alert(`Error: ${err.message}`),
    );
  };

  // ring dimensions
  const R = 52;
  const C = 2 * Math.PI * R;
  const off = C - (holdProgress / 100) * C;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* ── Page header ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-1 px-1">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">DilCare</p>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Emergency SOS</h1>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
            <Shield className="h-6 w-6 text-red-500" />
          </div>
        </div>

        {/* ── SOS button card ───────────────────────────────────────── */}
        <Card className={`border-2 shadow-lg transition-all duration-300 overflow-hidden ${isEmergencyActive ? 'border-red-500' : 'border-red-200'
          }`}>
          {/* Top accent bar */}
          <div className={`h-1.5 w-full transition-all duration-300 ${isEmergencyActive ? 'bg-red-500' : 'bg-gradient-to-r from-red-400 to-orange-400'
            }`} />

          <CardContent className="p-6 text-center">
            {/* Hold ring + button */}
            <div className="relative flex items-center justify-center mb-6">
              {/* Outer glow when active */}
              {isEmergencyActive && (
                <div className="absolute w-40 h-40 rounded-full bg-red-500/20 animate-ping" />
              )}

              {/* SVG progress ring */}
              <svg
                width="140" height="140"
                className="-rotate-90 absolute"
                viewBox="0 0 140 140"
              >
                {/* track */}
                <circle cx="70" cy="70" r={R} fill="none" stroke="#fecaca" strokeWidth="6" />
                {/* progress */}
                <circle
                  cx="70" cy="70" r={R}
                  fill="none"
                  stroke={isEmergencyActive ? '#ef4444' : '#f97316'}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={off}
                  className="transition-all duration-75"
                />
              </svg>

              {/* Central button */}
              <button
                className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center select-none transition-all duration-200 shadow-xl active:scale-95 ${isEmergencyActive
                    ? 'bg-red-600 animate-pulse'
                    : holdProgress > 0
                      ? 'bg-red-500 scale-105'
                      : 'bg-red-500 hover:bg-red-600 hover:scale-105'
                  }`}
                onMouseDown={startHold}
                onMouseUp={cancelHold}
                onMouseLeave={cancelHold}
                onTouchStart={startHold}
                onTouchEnd={cancelHold}
              >
                <AlertTriangle className="h-9 w-9 text-white" />
                {holdProgress > 0 && !isEmergencyActive && (
                  <span className="text-white/80 text-[10px] font-bold mt-0.5 leading-none">
                    {Math.ceil(((100 - holdProgress) / 100) * (SOS_HOLD_MS / 1000))}s
                  </span>
                )}
              </button>
            </div>

            <h2 className={`text-xl font-black mb-1 ${isEmergencyActive ? 'text-red-600' : 'text-gray-900'}`}>
              {isEmergencyActive ? '🚨 Emergency Activated!' : 'Emergency SOS'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isEmergencyActive
                ? 'Contacts & emergency services have been notified.'
                : 'Hold the button for 3 seconds to activate'}
            </p>

            {/* Active state panel */}
            {isEmergencyActive && (
              <div className="mt-5 bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3 text-left">
                <div className="flex items-center gap-2 text-red-600">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-bold">Emergency protocol active</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    'Location shared with all contacts',
                    'Emergency services contacted',
                    'SMS alerts sent',
                  ].map(msg => (
                    <div key={msg} className="flex items-center gap-2 text-xs text-red-700">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      {msg}
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={cancelEmergency}
                  className="w-full h-9 rounded-xl border-red-300 text-red-600 hover:bg-red-100 hover:border-red-400 font-semibold mt-1"
                >
                  ✓ I'm Safe — Cancel Alert
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Quick actions ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => window.location.href = 'tel:112'}
            className="group flex flex-col items-center gap-2 bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:border-red-200 hover:shadow-md transition-all duration-200 active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
              <Phone className="h-6 w-6 text-red-500" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900 text-sm">Call 112</p>
              <p className="text-[11px] text-muted-foreground">Emergency Services</p>
            </div>
          </button>

          <button
            onClick={shareLocation}
            className="group flex flex-col items-center gap-2 bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200 active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
              <MapPin className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900 text-sm">Share Location</p>
              <p className="text-[11px] text-muted-foreground">Send GPS coordinates</p>
            </div>
          </button>
        </div>

        {/* ── Emergency contacts ────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-gray-900 text-sm">Emergency Contacts</h2>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 rounded-xl text-xs font-semibold px-3">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Add Emergency Contact
                  </DialogTitle>
                  <DialogDescription>
                    This person will be notified when you activate SOS.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Full Name</Label>
                    <Input value={newContact.name} onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                      placeholder="Enter full name" className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Phone Number</Label>
                    <Input type="tel" value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                      placeholder="+91 98765 43210" className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Relationship</Label>
                    <Input value={newContact.relationship} onChange={e => setNewContact({ ...newContact, relationship: e.target.value })}
                      placeholder="e.g., Son, Doctor, Neighbour" className="h-11 rounded-xl" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="flex-1 h-11 rounded-xl font-semibold" onClick={addContact}>
                      Add Contact
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {contacts.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Heart className="h-7 w-7 text-gray-300" />
                </div>
                <p className="text-sm text-muted-foreground">No emergency contacts yet.<br />Add someone who can help.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact, idx) => (
                <Card key={contact.id} className="border-0 shadow-sm overflow-hidden">
                  <div className="flex">
                    {/* Left accent */}
                    <div className={`w-1 shrink-0 rounded-l-xl ${contact.isPrimary ? 'bg-amber-400' : 'bg-primary/40'}`} />

                    <CardContent className="flex-1 p-4 min-w-0">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Heart className="h-5 w-5 text-primary" />
                          </div>
                          {contact.isPrimary && (
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400 absolute -top-1.5 -right-1.5" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-gray-900 text-[15px] leading-tight truncate">{contact.name}</p>
                            {contact.isPrimary && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                          <p className="text-xs font-medium text-primary mt-0.5">{contact.phone}</p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => window.location.href = `tel:${contact.phone}`}
                            className="w-9 h-9 rounded-xl bg-green-50 hover:bg-green-100 border border-green-200 flex items-center justify-center transition-colors"
                          >
                            <Phone className="h-4 w-4 text-green-600" />
                          </button>
                          <button
                            onClick={() => removeContact(contact.id)}
                            className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* ── Emergency protocol info ────────────────────────────────── */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-400" />
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
                  Emergency Protocol
                </p>
                <div className="space-y-1.5">
                  {[
                    'Hold SOS button for 3 seconds to activate',
                    'Automatic location sharing with contacts',
                    'Emergency services will be contacted',
                    'Stay calm and follow operator instructions',
                  ].map(tip => (
                    <div key={tip} className="flex items-start gap-2 text-xs text-amber-800">
                      <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="h-2" />
      </div>
    </div>
  );
};

export default SOSEmergency;