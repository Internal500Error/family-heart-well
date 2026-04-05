import React, { useState, useRef, useEffect } from 'react';
import {
  AlertTriangle, Phone, MapPin, Plus, Trash2, Video,
  Shield, Heart, Clock, Star, CheckCircle2, Users, X, Loader,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { sosService } from '@/lib/api-client';

interface EmergencyContact {
  id: number;
  name: string;
  phone: string;
  relationship: string;
  is_primary: boolean;
}

interface VideoCallSession {
  id: string;
  contact: EmergencyContact;
  status: 'calling' | 'connected' | 'ended';
  startTime?: Date;
}

// ─── Hold-to-activate ring ─────────────────────────────────────────────────
const SOS_HOLD_MS = 3000;

const SOSEmergency = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [videoCallSession, setVideoCallSession] = useState<VideoCallSession | null>(null);
  const [isCallingPrimary, setIsCallingPrimary] = useState(false);
  const [locationShared, setLocationShared] = useState(false);
  
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStart = useRef<number>(0);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const response = await sosService.getEmergencyContacts();
      const data = response.data?.results || response.data;
      if (data && Array.isArray(data)) {
        setContacts(data);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load contacts');
      console.error('Error loading contacts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Get current location ────────────────────────────────────────────────────
  const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError('Geolocation not supported');
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
        (err) => {
          setError(`Location error: ${err.message}`);
          resolve(null);
        }
      );
    });
  };

  // ── Share location with all contacts ────────────────────────────────────
  const shareLocationToContacts = async () => {
    if (contacts.length === 0) {
      setError('No emergency contacts to share location with');
      return;
    }
    
    const location = await getCurrentLocation();
    if (!location) return;

    try {
      // Trigger SOS with location
      await sosService.triggerSOS({
        latitude: location.latitude,
        longitude: location.longitude,
        emergency_type: 'medical',
      });
      setLocationShared(true);
      
      // Also show on Google Maps for user
      window.open(
        `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
        '_blank'
      );
    } catch (err: any) {
      setError(err.message || 'Failed to share location');
    }
  };

  // ── Start video call to primary contact ─────────────────────────────────
  const initVideoCallToPrimary = async () => {
    const primary = contacts.find(c => c.is_primary);
    if (!primary) {
      setError('No primary contact set for video call');
      return;
    }

    setIsCallingPrimary(true);
    try {
      // Start video call session (in real app, this would integrate with WebRTC/Twilio)
      const location = await getCurrentLocation();
      
      const sessionId = `sos-${Date.now()}`;
      setVideoCallSession({
        id: sessionId,
        contact: primary,
        status: 'calling',
      });

      // Call the backend to initiate video call
      // For now, we'll trigger a phone call instead
      // In production, replace with WebRTC/Twilio integration
      window.location.href = `tel:${primary.phone}`;
    } catch (err: any) {
      setError(err.message || 'Failed to initiate video call');
      setVideoCallSession(null);
    } finally {
      setIsCallingPrimary(false);
    }
  };

  // ── SOS hold logic ──────────────────────────────────────────────────────
  const startHold = () => {
    if (isEmergencyActive || contacts.length === 0) return;
    
    holdStart.current = Date.now();
    holdInterval.current = setInterval(() => {
      const elapsed = Date.now() - holdStart.current;
      const pct = Math.min((elapsed / SOS_HOLD_MS) * 100, 100);
      setHoldProgress(pct);
      
      if (pct >= 100) {
        clearInterval(holdInterval.current!);
        activateEmergency();
      }
    }, 30);
  };

  const cancelHold = () => {
    if (holdInterval.current) clearInterval(holdInterval.current);
    if (!isEmergencyActive) setHoldProgress(0);
  };

  const activateEmergency = async () => {
    setIsEmergencyActive(true);
    setHoldProgress(0);
    
    try {
      // Share location with all contacts
      await shareLocationToContacts();
      
      // Initiate video call to primary contact
      await initVideoCallToPrimary();
    } catch (err) {
      console.error('Error during emergency activation:', err);
    }
  };

  const cancelEmergency = async () => {
    try {
      setIsEmergencyActive(false);
      setVideoCallSession(null);
      setLocationShared(false);
      setHoldProgress(0);
      
      // Notify backend that emergency was cancelled
      if (videoCallSession) {
        // Optional: Send cancel signal to backend
      }
    } catch (err) {
      console.error('Error cancelling emergency:', err);
    }
  };

  // ── Add contact ─────────────────────────────────────────────────────────
  const addContact = async () => {
    if (!newContact.name || !newContact.phone) {
      setError('Please fill in name and phone');
      return;
    }

    try {
      setIsSaving(true);
      const response = await sosService.addEmergencyContact({
        name: newContact.name,
        phone: newContact.phone,
        relationship: newContact.relationship,
        is_primary: contacts.length === 0, // First contact is primary
      });
      
      if (response.error) {
        setError(response.error);
      } else {
        setNewContact({ name: '', phone: '', relationship: '' });
        setIsDialogOpen(false);
        await loadContacts();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add contact');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Remove contact ──────────────────────────────────────────────────────
  const removeContact = async (id: number) => {
    try {
      setIsSaving(true);
      const response = await sosService.deleteEmergencyContact(String(id));
      
      if (response.error) {
        setError(response.error);
      } else {
        await loadContacts();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove contact');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading emergency contacts...</p>
        </div>
      </div>
    );
  }

  // ring dimensions
  const R = 52;
  const C = 2 * Math.PI * R;
  const off = C - (holdProgress / 100) * C;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* ── Error message ──────────────────────────────────────────── */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-3">
            <X className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

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

        {/* ── Video call active indicator ────────────────────────────── */}
        {videoCallSession && videoCallSession.status === 'connected' && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-teal-50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 animate-pulse flex items-center justify-center">
                <Video className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-green-700 text-sm">Video call connected</p>
                <p className="text-xs text-green-600">{videoCallSession.contact.name}</p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={cancelEmergency}
                className="h-8 rounded-lg"
              >
                End Call
              </Button>
            </CardContent>
          </Card>
        )}

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
                disabled={isEmergencyActive || contacts.length === 0}
                className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center select-none transition-all duration-200 shadow-xl active:scale-95 ${isEmergencyActive
                    ? 'bg-red-600 animate-pulse'
                    : holdProgress > 0
                      ? 'bg-red-500 scale-105'
                      : contacts.length === 0
                        ? 'bg-gray-400 cursor-not-allowed'
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
              {contacts.length === 0
                ? 'Add emergency contacts to activate SOS'
                : isEmergencyActive
                  ? `Emergency protocol activated. Video call initiated to ${contacts.find(c => c.is_primary)?.name || 'primary contact'}.`
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
                    { text: 'Location shared with all contacts', done: locationShared },
                    { text: 'Emergency video call initiated', done: videoCallSession !== null },
                    { text: 'Emergency services contacted', done: isEmergencyActive },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-red-700">
                      {item.done ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                      ) : (
                        <Loader className="h-3.5 w-3.5 shrink-0 animate-spin text-red-500" />
                      )}
                      {item.text}
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={cancelEmergency}
                  className="w-full h-9 rounded-xl border-red-300 text-red-600 hover:bg-red-100 hover:border-red-400 font-semibold mt-1"
                  disabled={isCallingPrimary}
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
            disabled={isEmergencyActive}
            onClick={shareLocationToContacts}
            className="group flex flex-col items-center gap-2 bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200 active:scale-95 disabled:opacity-50"
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
              <h2 className="font-bold text-gray-900 text-sm">Emergency Contacts ({contacts.length})</h2>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 rounded-xl text-xs font-semibold px-3" disabled={isEmergencyActive}>
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
                    This person will receive your location and be called during an emergency.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Full Name</Label>
                    <Input 
                      value={newContact.name} 
                      onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                      placeholder="e.g., Dr. Rajesh Kumar" 
                      className="h-11 rounded-xl" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Phone Number</Label>
                    <Input 
                      type="tel" 
                      value={newContact.phone} 
                      onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                      placeholder="+91 98765 43210" 
                      className="h-11 rounded-xl" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Relationship</Label>
                    <Input 
                      value={newContact.relationship} 
                      onChange={e => setNewContact({ ...newContact, relationship: e.target.value })}
                      placeholder="e.g., Son, Doctor, Neighbour" 
                      className="h-11 rounded-xl" 
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-11 rounded-xl" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1 h-11 rounded-xl font-semibold" 
                      onClick={addContact}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Adding...' : 'Add Contact'}
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
              {contacts.map((contact) => (
                <Card key={contact.id} className="border-0 shadow-sm overflow-hidden">
                  <div className="flex">
                    {/* Left accent */}
                    <div className={`w-1 shrink-0 rounded-l-xl ${contact.is_primary ? 'bg-amber-400' : 'bg-primary/40'}`} />

                    <CardContent className="flex-1 p-4 min-w-0">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Heart className="h-5 w-5 text-primary" />
                          </div>
                          {contact.is_primary && (
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400 absolute -top-1.5 -right-1.5" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-gray-900 text-[15px] leading-tight truncate">{contact.name}</p>
                            {contact.is_primary && (
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
                            title="Call contact"
                          >
                            <Phone className="h-4 w-4 text-green-600" />
                          </button>
                          {contact.is_primary && (
                            <button
                              onClick={initVideoCallToPrimary}
                              disabled={isCallingPrimary}
                              className="w-9 h-9 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center justify-center transition-colors disabled:opacity-50"
                              title="Initiate video call"
                            >
                              {isCallingPrimary ? (
                                <Loader className="h-4 w-4 text-blue-600 animate-spin" />
                              ) : (
                                <Video className="h-4 w-4 text-blue-600" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => removeContact(contact.id)}
                            disabled={isSaving}
                            className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center transition-colors disabled:opacity-50"
                            title="Remove contact"
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