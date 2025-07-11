import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Plus, 
  Trash2, 
  Shield,
  Heart,
  Clock,
  Star // Added missing Star import
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

const SOSEmergency = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      phone: '+1-555-0123',
      relationship: 'Primary Doctor',
      isPrimary: true
    },
    {
      id: '2',
      name: 'Rajesh (Son)',
      phone: '+1-555-0456',
      relationship: 'Son',
      isPrimary: false
    }
  ]);

  const [newContact, setNewContact] = useState<Omit<EmergencyContact, 'id'>>({
    name: '',
    phone: '',
    relationship: '',
    isPrimary: false
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  const addContact = () => {
    setContacts([...contacts, { ...newContact, id: String(Date.now()) }]);
    setNewContact({ name: '', phone: '', relationship: '', isPrimary: false });
    setIsDialogOpen(false);
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter(contact => contact.id !== id));
  };

  const handleEmergencyPress = () => {
    setIsEmergencyActive(true);
    // Simulate emergency activation after 3 seconds
    setTimeout(() => {
      // In a real app, this is where you'd trigger the actual emergency protocol
      // e.g., sending SMS, calling emergency services, etc.
      console.log('Emergency protocol activated!');
    }, 3000);
  };

  const handleEmergencyRelease = () => {
    setIsEmergencyActive(false);
  };

  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          window.open(googleMapsUrl, '_blank');
          alert(`Location shared! Check Google Maps in new tab.`);
        },
        (error) => {
          alert(`Error getting location: ${error.message}`);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Emergency Button - Always Visible */}
      <Card className={`border-2 transition-all duration-300 ${
        isEmergencyActive 
          ? 'border-red-500 bg-red-50 shadow-lg animate-pulse' 
          : 'border-red-200 hover:border-red-300'
      }`}>
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              isEmergencyActive 
                ? 'bg-red-500 animate-pulse' 
                : 'bg-red-500 hover:bg-red-600 hover:scale-105'
            }`}>
              <AlertTriangle className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-poppins font-bold text-red-600 mb-2">
            Emergency SOS
          </h2>
          <p className="text-muted-foreground mb-6">
            Press and hold for 3 seconds to activate emergency protocol
          </p>
          
          <Button
            size="lg"
            className={`w-full h-16 text-lg font-semibold transition-all duration-300 ${
              isEmergencyActive
                ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                : 'bg-red-500 hover:bg-red-600 hover:scale-105'
            }`}
            onMouseDown={handleEmergencyPress}
            onMouseUp={handleEmergencyRelease}
            onTouchStart={handleEmergencyPress}
            onTouchEnd={handleEmergencyRelease}
          >
            <Shield className="h-6 w-6 mr-2" />
            {isEmergencyActive ? 'EMERGENCY ACTIVATED!' : 'EMERGENCY SOS'}
          </Button>
          
          {isEmergencyActive && (
            <div className="mt-4 p-4 bg-red-100 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-red-600 mb-2">
                <Clock className="h-4 w-4" />
                <span className="font-semibold">Emergency services contacted</span>
              </div>
              <p className="text-sm text-red-700">
                Your location and emergency contacts have been notified.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => setIsEmergencyActive(false)}
              >
                I'm Safe - Cancel Alert
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Emergency Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = 'tel:911'}>
          <CardContent className="p-4 text-center">
            <Phone className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <h3 className="font-semibold text-foreground">Call 911</h3>
            <p className="text-xs text-muted-foreground">Emergency Services</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={shareLocation}>
          <CardContent className="p-4 text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-semibold text-foreground">Share Location</h3>
            <p className="text-xs text-muted-foreground">Send GPS coordinates</p>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Emergency Contacts</CardTitle>
            <p className="text-sm text-muted-foreground">
              People to contact in case of emergency
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Emergency Contact</DialogTitle>
                <DialogDescription>
                  Add someone who should be contacted during emergencies.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    placeholder="+1-555-0123"
                  />
                </div>
                
                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                    placeholder="e.g., Son, Doctor, Neighbor"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addContact}>
                    Add Contact
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {contacts.map((contact) => (
            <div key={contact.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  {contact.isPrimary && (
                    <Star className="h-4 w-4 text-amber-500 absolute -top-1 -right-1 fill-current" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{contact.name}</h4>
                  <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                  <p className="text-xs text-muted-foreground">{contact.phone}</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.location.href = `tel:${contact.phone}`}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => removeContact(contact.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {contacts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No emergency contacts added yet.</p>
              <p className="text-sm">Add your first contact to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Information */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-1">Emergency Protocol</h4>
              <div className="text-sm text-amber-700 space-y-1">
                <p>• Hold SOS button for 3 seconds to activate</p>
                <p>• Automatic location sharing with contacts</p>
                <p>• Emergency services will be contacted</p>
                <p>• Stay calm and follow operator instructions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SOSEmergency;
