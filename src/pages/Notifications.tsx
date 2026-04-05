import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { communityService } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await communityService.getNotifications();
      const payload = response.data as unknown;
      const data = Array.isArray(payload)
        ? payload
        : (payload as { results?: any[] })?.results ?? [];
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await communityService.markNotificationRead(id);
      loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const markAllRead = async () => {
    try {
      await communityService.markAllNotificationsRead();
      loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20 pb-20">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pt-1 px-1">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">DilCare</p>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Notifications</h1>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Bell className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between px-1 mb-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          
          {notifications.some(n => !n.is_read) && (
            <Button variant="link" size="sm" onClick={markAllRead} className="text-primary text-xs">
              <CheckCheck className="h-4 w-4 mr-1" /> Mark all as read
            </Button>
          )}
        </div>

        {/* List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <Card className="glass border-0 shadow-sm">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Bell className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p>You have no notifications yet.</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notif) => (
              <Card 
                key={notif.id} 
                className={`glass border-0 shadow-sm overflow-hidden transition-transform interactive-card ${!notif.is_read ? 'border-l-4 border-l-primary' : 'opacity-80'}`}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
              >
                <CardContent className="p-4 flex gap-4">
                  <div className={`p-2 rounded-lg h-fit ${!notif.is_read ? 'bg-primary/10' : 'bg-gray-100'}`}>
                    <Bell className={`h-5 w-5 ${!notif.is_read ? 'text-primary' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${!notif.is_read ? 'font-bold text-foreground' : 'text-gray-600'}`}>{notif.title}</p>
                    {notif.message && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notif.is_read && (
                    <div className="flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Notifications;
