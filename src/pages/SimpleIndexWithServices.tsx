import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Pill, 
  Activity, 
  Droplets, 
  Calculator, 
  Book, 
  Phone, 
  MessageCircle,
  User,
  Stethoscope,
  Footprints
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SimpleIndexWithServices = () => {
  const navigate = useNavigate();
  const [healthStats, setHealthStats] = useState({
    steps: 7500,
    water: 2.1,
    medicines: { taken: 2, total: 3 },
    heartRate: 72
  });

  const quickActions = [
    { 
      title: 'Medicines', 
      icon: Pill, 
      path: '/medicine', 
      color: 'bg-blue-500',
      description: 'Track medications'
    },
    { 
      title: 'Health Tracker', 
      icon: Activity, 
      path: '/health', 
      color: 'bg-green-500',
      description: 'Monitor vitals'
    },
    { 
      title: 'Step Tracker', 
      icon: Footprints, 
      path: '/steps', 
      color: 'bg-purple-500',
      description: 'Track your steps'
    },
    { 
      title: 'Water Intake', 
      icon: Droplets, 
      path: '/water', 
      color: 'bg-cyan-500',
      description: 'Stay hydrated'
    },
    { 
      title: 'BMI Calculator', 
      icon: Calculator, 
      path: '/bmi', 
      color: 'bg-orange-500',
      description: 'Calculate BMI'
    },
    { 
      title: 'AI Assistant', 
      icon: MessageCircle, 
      path: '/ai', 
      color: 'bg-pink-500',
      description: 'Chat with AI'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome to DilCare
        </h1>
        <p className="text-gray-600">Your family health companion</p>
      </div>

      {/* Health Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Steps</p>
                <p className="text-xl font-bold">{healthStats.steps.toLocaleString()}</p>
              </div>
              <Footprints className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Water</p>
                <p className="text-xl font-bold">{healthStats.water}L</p>
              </div>
              <Droplets className="h-6 w-6 text-cyan-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Medicines</p>
                <p className="text-xl font-bold">
                  {healthStats.medicines.taken}/{healthStats.medicines.total}
                </p>
              </div>
              <Pill className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Heart Rate</p>
                <p className="text-xl font-bold">{healthStats.heartRate}</p>
              </div>
              <Heart className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(action.path)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-10 h-10 ${action.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">{action.title}</h3>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SimpleIndexWithServices;
