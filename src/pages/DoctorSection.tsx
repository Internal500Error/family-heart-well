
import React, { useState } from 'react';
import { 
  Stethoscope, 
  Plus, 
  Calendar, 
  FileText, 
  Phone,
  MapPin,
  Clock,
  Upload,
  Download,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  address: string;
  isPrimary: boolean;
}

interface Appointment {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

interface Document {
  id: string;
  name: string;
  type: 'prescription' | 'report' | 'other';
  date: string;
  doctorId?: string;
}

const DoctorSection = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: '1',
      name: 'Dr. Rajesh Sharma',
      specialty: 'General Physician',
      phone: '+91 98765 43210',
      address: 'City Hospital, Main Road',
      isPrimary: true
    },
    {
      id: '2',
      name: 'Dr. Priya Patel',
      specialty: 'Cardiologist',
      phone: '+91 98765 43211',
      address: 'Heart Care Center',
      isPrimary: false
    }
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      doctorId: '1',
      date: '2024-07-15',
      time: '10:00',
      reason: 'Regular checkup',
      status: 'upcoming'
    },
    {
      id: '2',
      doctorId: '2',
      date: '2024-07-20',
      time: '14:30',
      reason: 'Blood pressure follow-up',
      status: 'upcoming'
    }
  ]);

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Blood Test Report',
      type: 'report',
      date: '2024-07-10',
      doctorId: '1'
    },
    {
      id: '2',
      name: 'Prescription - Atorvastatin',
      type: 'prescription',
      date: '2024-07-08',
      doctorId: '2'
    }
  ]);

  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialty: '',
    phone: '',
    address: ''
  });

  const [newAppointment, setNewAppointment] = useState({
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });

  const addDoctor = () => {
    if (newDoctor.name && newDoctor.specialty && newDoctor.phone) {
      const doctor: Doctor = {
        id: Date.now().toString(),
        ...newDoctor,
        isPrimary: doctors.length === 0
      };
      setDoctors([...doctors, doctor]);
      setNewDoctor({ name: '', specialty: '', phone: '', address: '' });
    }
  };

  const addAppointment = () => {
    if (newAppointment.doctorId && newAppointment.date && newAppointment.time) {
      const appointment: Appointment = {
        id: Date.now().toString(),
        ...newAppointment,
        status: 'upcoming'
      };
      setAppointments([...appointments, appointment]);
      setNewAppointment({ doctorId: '', date: '', time: '', reason: '' });
    }
  };

  const getDoctorName = (doctorId: string) => {
    return doctors.find(d => d.id === doctorId)?.name || 'Unknown Doctor';
  };

  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming');
  const recentDocuments = documents.slice(0, 3);

  const generateHealthReport = () => {
    // In a real app, this would generate a comprehensive health report
    console.log('Generating health report...');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="text-center">
        <div className="bg-medicine/20 rounded-full p-4 w-fit mx-auto mb-4">
          <Stethoscope className="h-8 w-8 text-medicine" />
        </div>
        <h1 className="text-2xl font-poppins font-semibold mb-2">Doctor Section</h1>
        <p className="text-muted-foreground">Manage your healthcare team</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-medicine">{doctors.length}</div>
            <div className="text-xs text-muted-foreground">Doctors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-primary">{upcomingAppointments.length}</div>
            <div className="text-xs text-muted-foreground">Upcoming</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-health-good">{documents.length}</div>
            <div className="text-xs text-muted-foreground">Documents</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-poppins font-semibold flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Upcoming Appointments
          </h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Book
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Book Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="doctor">Select Doctor</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newAppointment.doctorId}
                    onChange={(e) => setNewAppointment({...newAppointment, doctorId: e.target.value})}
                  >
                    <option value="">Choose doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialty}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    value={newAppointment.reason}
                    onChange={(e) => setNewAppointment({...newAppointment, reason: e.target.value})}
                    placeholder="e.g., Regular checkup, Follow-up visit"
                  />
                </div>
                <Button onClick={addAppointment} className="w-full">
                  Book Appointment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {upcomingAppointments.map((appointment) => (
          <Card key={appointment.id} className="mb-3">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{getDoctorName(appointment.doctorId)}</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {appointment.reason || 'General consultation'}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-primary">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(appointment.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {appointment.time}
                    </div>
                  </div>
                </div>
                <Badge className="bg-primary/10 text-primary">
                  {appointment.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* My Doctors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-poppins font-semibold">My Doctors</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Doctor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Doctor Name</Label>
                  <Input
                    id="name"
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                    placeholder="Dr. Rajesh Sharma"
                  />
                </div>
                <div>
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    id="specialty"
                    value={newDoctor.specialty}
                    onChange={(e) => setNewDoctor({...newDoctor, specialty: e.target.value})}
                    placeholder="General Physician"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={newDoctor.phone}
                    onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={newDoctor.address}
                    onChange={(e) => setNewDoctor({...newDoctor, address: e.target.value})}
                    placeholder="City Hospital, Main Road"
                  />
                </div>
                <Button onClick={addDoctor} className="w-full">
                  Add Doctor
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {doctors.map((doctor) => (
          <Card key={doctor.id} className="mb-3">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold">{doctor.name}</h3>
                    {doctor.isPrimary && (
                      <Badge className="bg-primary text-white text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-medicine font-medium mb-1">
                    {doctor.specialty}
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-3 w-3 mr-2" />
                      {doctor.phone}
                    </div>
                    {doctor.address && (
                      <div className="flex items-start text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{doctor.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`tel:${doctor.phone}`)}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Documents & Reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-poppins font-semibold">Recent Documents</h2>
          <Button size="sm" variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>

        {recentDocuments.map((document) => (
          <Card key={document.id} className="mb-3">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-muted rounded-lg p-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{document.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(document.date).toLocaleDateString()}
                      {document.doctorId && ` • ${getDoctorName(document.doctorId)}`}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Health Report Generator */}
      <Card className="bg-gradient-to-r from-medicine/10 to-primary/10 border-medicine/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-medicine/20 rounded-full p-2">
              <FileText className="h-5 w-5 text-medicine" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-medicine mb-2">AI Health Summary</h3>
              <p className="text-sm text-foreground mb-3">
                Generate a comprehensive health report based on your recent readings and medicines.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={generateHealthReport}
                className="border-medicine/30 hover:bg-medicine/10"
              >
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorSection;
