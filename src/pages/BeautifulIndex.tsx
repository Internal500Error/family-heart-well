import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  Footprints,
  Sun,
  Moon,
  Sunrise
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BeautifulIndex = () => {
  const navigate = useNavigate();
  const currentHour = new Date().getHours();
  const userName = "Dr. Sharma";
  
  const [healthStats] = useState({
    steps: 7890,
    water: 2.3,
    medicines: { taken: 2, total: 3 },
    heartRate: 72
  });

  const getGreeting = () => {
    if (currentHour < 12) return { text: "Good Morning", icon: Sunrise, color: "text-orange-500" };
    if (currentHour < 17) return { text: "Good Afternoon", icon: Sun, color: "text-yellow-500" };
    return { text: "Good Evening", icon: Moon, color: "text-blue-500" };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const quickActions = [
    { 
      title: 'Medicines', 
      icon: Pill, 
      path: '/medicine', 
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      description: 'Track medications'
    },
    { 
      title: 'Health Tracker', 
      icon: Activity, 
      path: '/health', 
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      description: 'Monitor vitals'
    },
    { 
      title: 'Step Tracker', 
      icon: Footprints, 
      path: '/steps', 
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      description: 'Track your steps'
    },
    { 
      title: 'Water Intake', 
      icon: Droplets, 
      path: '/water', 
      color: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      description: 'Stay hydrated'
    },
    { 
      title: 'BMI Calculator', 
      icon: Calculator, 
      path: '/bmi', 
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      description: 'Calculate BMI'
    },
    { 
      title: 'Gyaan Corner', 
      icon: Book, 
      path: '/gyaan', 
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      description: 'Health knowledge'
    },
    { 
      title: 'SOS Emergency', 
      icon: Phone, 
      path: '/sos', 
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      description: 'Emergency help'
    },
    { 
      title: 'AI Assistant', 
      icon: MessageCircle, 
      path: '/ai', 
      color: 'bg-gradient-to-br from-pink-500 to-pink-600',
      description: 'Chat with AI'
    },
    { 
      title: 'Doctor Section', 
      icon: Stethoscope, 
      path: '/doctor', 
      color: 'bg-gradient-to-br from-teal-500 to-teal-600',
      description: 'Find doctors'
    },
    { 
      title: 'Profile', 
      icon: User, 
      path: '/profile', 
      color: 'bg-gradient-to-br from-gray-500 to-gray-600',
      description: 'Your profile'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Personalized Greeting */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <GreetingIcon className={`h-6 w-6 ${greeting.color}`} />
          <h1 className="text-2xl font-bold text-gray-800">
            {greeting.text}, {userName}!
          </h1>
        </div>
        <p className="text-gray-600">How are you feeling today?</p>
      </div>

      {/* Health Stats Overview */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Today's Steps</p>
                <p className="text-xl font-bold text-purple-800">{healthStats.steps.toLocaleString()}</p>
              </div>
              <Footprints className="h-8 w-8 text-purple-600" />
            </div>
            <Progress value={(healthStats.steps / 10000) * 100} className="mt-2 h-2" />
            <p className="text-xs text-purple-600 mt-1">Goal: 10,000 steps</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-700 font-medium">Water Intake</p>
                <p className="text-xl font-bold text-cyan-800">{healthStats.water}L</p>
              </div>
              <Droplets className="h-8 w-8 text-cyan-600" />
            </div>
            <Progress value={(healthStats.water / 3) * 100} className="mt-2 h-2" />
            <p className="text-xs text-cyan-600 mt-1">Goal: 3L</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Medicines</p>
                <p className="text-xl font-bold text-blue-800">
                  {healthStats.medicines.taken}/{healthStats.medicines.total}
                </p>
              </div>
              <Pill className="h-8 w-8 text-blue-600" />
            </div>
            <Progress 
              value={(healthStats.medicines.taken / healthStats.medicines.total) * 100} 
              className="mt-2 h-2" 
            />
            <p className="text-xs text-blue-600 mt-1">Today's doses</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Heart Rate</p>
                <p className="text-xl font-bold text-red-800">{healthStats.heartRate}</p>
                <p className="text-xs text-red-600">BPM</p>
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-0 bg-white"
                onClick={() => navigate(action.path)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1 text-gray-800">{action.title}</h3>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Today's Focus */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-green-800 mb-2">💡 Today's Health Tip</h3>
          <p className="text-sm text-green-700">
            Remember to take short walking breaks every hour. Your body will thank you!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BeautifulIndex;
