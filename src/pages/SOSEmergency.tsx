
import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Plus, 
  Edit,
  CheckCircle2,
  Ambulance,
  Shield,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

const SOSEmergency = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'Dr. Sharma',
      relationship: 'Family Doctor',
      phone: '+91 98765 43210',
      isPrimary: true
    },
    {
      id: '2',
      name: 'Rajesh (Son)',
      relationship: 'Son',
      phone: '+91 98765 43211',
      isPrimary: false
    },
    {
      id: '3',
      name: 'Priya (Daughter)',
      relationship: 'Daughter',
      phone: '+91 98765 43212',
      isPrimary: false
    }
  ]);

  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone: ''
  });

  const [sosActivated, setSosActivated] = useState(false);
  const [locationSharing, setLocationSharing] = useState(false);

  const activateSOS = () => {
    setSosActivated(true);
    setLocationSharing(true);
    // In a real app, this would:
    // 1. Get current location
    // 2. Send SMS/call to emergency contacts
    // 3. Start location sharing
    // 4. Alert emergency services if needed
    console.log('SOS Activated - Sending alerts to all emergency contacts');
    
    // Auto-deactivate after 10 seconds for demo
    setTimeout(() => {
      setSosActivated(false);
      setLocationSharing(false);
    }, 10000);
  };

  const addContact = () => {
    if (newContact.name && newContact.phone) {
      const contact: EmergencyContact = {
        id: Date.now().toString(),
        ...newContact,
        isPrimary: false
      };
      setContacts([...contacts, contact]);
      setNewContact({ name: '', relationship: '', phone: '' });
    }
  };

  const makeContactPrimary = (id: string) => {
    setContacts(contacts.map(contact => ({
      ...contact,
      isPrimary: contact.id === id
    })));
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="text-center">
        <div className="bg-health-danger/20 rounded-full p-4 w-fit mx-auto mb-4">
          <Shield className="h-8 w-8 text-health-danger" />
        </div>
        <h1 className="text-2xl font-poppins font-semibold mb-2">Emergency SOS</h1>
        <p className="text-muted-foreground">Your safety is our priority</p>
      </div>

      {/* SOS Status */}
      {sosActivated && (
        <Alert className="border-health-danger bg-red-50">
          <AlertTriangle className="h-4 w-4 text-health-danger" />
          <AlertDescription className="text-health-danger font-semibold">
            SOS ACTIVATED! Emergency contacts have been notified. Location sharing is active.
          </AlertDescription>
        </Alert>
      )}

      {/* Main SOS Button */}
      <Card className="border-health-danger/30">
        <CardContent className="p-6 text-center">
          <Button
            size="lg"
            className={`w-32 h-32 rounded-full text-2xl font-bold transition-all duration-300 ${
              sosActivated 
                ? 'bg-green-600 hover:bg-green-700 animate-pulse' 
                : 'bg-health-danger hover:bg-red-600 hover:scale-105 animate-gentle-bounce'
            }`}
            onClick={activateSOS}
            disabled={sosActivated}
          >
            {sosActivated ? (
              <div className="flex flex-col items-center">
                <CheckCircle2 className="h-8 w-8 mb-2" />
                <span className="text-sm">SENT</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <span className="text-sm">SOS</span>
              </div>
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            {sosActivated 
              ? 'Help is on the way! Stay calm and safe.'
              : 'Press and hold for 3 seconds in emergency'
            }
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="flex flex-col items-center p-6 h-auto border-medicine/30 hover:bg-medicine/10"
        >
          <Ambulance className="h-8 w-8 text-medicine mb-2" />
          <span className="text-sm font-semibold">Call Ambulance</span>
          <span className="text-xs text-muted-foreground">102</span>
        </Button>

        <Button 
          variant="outline" 
          className="flex flex-col items-center p-6 h-auto border-health-danger/30 hover:bg-health-danger/10"
        >
          <Phone className="h-8 w-8 text-health-danger mb-2" />
          <span className="text-sm font-semibold">Police Help</span>
          <span className="text-xs text-muted-foreground">100</span>
        </Button>
      </div>

      {/* Emergency Contacts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-poppins font-semibold">Emergency Contacts</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Emergency Contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    placeholder="e.g., Dr. Sharma"
                  />
                </div>
                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                    placeholder="e.g., Family Doctor, Son, Daughter"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <Button onClick={addContact} className="w-full">
                  Add Contact
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {contacts.map((contact) => (
          <Card key={contact.id} className="mb-3">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold">{contact.name}</h3>
                    {contact.isPrimary && (
                      <Badge className="bg-primary text-white text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {contact.relationship}
                  </p>
                  <p className="text-sm font-mono text-medicine">
                    {contact.phone}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`tel:${contact.phone}`)}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  {!contact.isPrimary && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => makeContactPrimary(contact.id)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Location Sharing Status */}
      <Card className="bg-gradient-to-r from-medicine/10 to-primary/10 border-medicine/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-medicine/20 rounded-full p-2">
              <MapPin className={`h-5 w-5 text-medicine ${locationSharing ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <h3 className="font-semibold text-medicine mb-2">Location Sharing</h3>
              <p className="text-sm text-foreground mb-3">
                {locationSharing 
                  ? 'Your location is being shared with emergency contacts'
                  : 'Enable location sharing for faster emergency response'
                }
              </p>
              <Button 
                variant={locationSharing ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setLocationSharing(!locationSharing)}
              >
                {locationSharing ? 'Sharing Active' : 'Enable Sharing'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Tips */}
      <Card className="bg-gradient-to-r from-health-good/10 to-primary/10 border-health-good/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-health-good/20 rounded-full p-2">
              <Heart className="h-5 w-5 text-health-good" />
            </div>
            <div>
              <h3 className="font-semibold text-health-good mb-2">Safety Reminder</h3>
              <p className="text-sm text-foreground leading-relaxed">
                Keep your phone charged and nearby. Practice using the SOS feature with family. 
                Remember: Help is always available when you need it! 🛡️
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SOSEmergency;
