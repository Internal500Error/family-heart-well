
import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff,
  Heart,
  Pill,
  Activity,
  BookOpen,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      message: "Namaste! 🙏 I'm your DilCare AI assistant. I'm here to help you with health questions, medicine reminders, and wellness tips. How can I make your day better?",
      timestamp: new Date()
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const quickQuestions = [
    {
      icon: Pill,
      question: "What does my medicine do?",
      color: "text-medicine"
    },
    {
      icon: Activity,
      question: "My BP is high, what should I eat?",
      color: "text-health-danger"
    },
    {
      icon: BookOpen,
      question: "Give me a healthy recipe",
      color: "text-health-good"
    },
    {
      icon: Heart,
      question: "I'm feeling anxious, help me",
      color: "text-primary"
    }
  ];

  const sendMessage = (text?: string) => {
    const messageText = text || inputMessage.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(messageText);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('medicine') || lowerMessage.includes('tablet')) {
      return "I can help you understand your medicines! 💊 Please tell me the name of your medicine, and I'll explain what it does and when to take it. Remember, always follow your doctor's advice!";
    }
    
    if (lowerMessage.includes('bp') || lowerMessage.includes('blood pressure') || lowerMessage.includes('high')) {
      return "For high blood pressure, try these natural approaches: 🌿\n\n• Reduce salt intake\n• Eat more fruits and vegetables\n• Take gentle walks daily\n• Practice deep breathing\n• Avoid processed foods\n\nBut please consult your doctor for proper medication! Your health is precious. ❤️";
    }
    
    if (lowerMessage.includes('recipe') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
      return "Here's a heart-healthy recipe for you! 🍲\n\n**Daliya Khichdi**\n• 1 cup broken wheat (daliya)\n• 1/2 cup moong dal\n• Mixed vegetables\n• Turmeric, cumin, ginger\n• Cook with less oil\n\nThis is nutritious, easy to digest, and delicious! Your family will love it too. 😊";
    }
    
    if (lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('stress')) {
      return "I understand you're feeling anxious, and that's completely normal. 🤗\n\nTry this right now:\n• Take 3 deep breaths with me\n• Breathe in for 4 counts, hold for 4, out for 6\n• Remember: This feeling will pass\n• You are loved and cared for\n\nWould you like me to guide you through a calming exercise? I'm here for you. 💙";
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('namaste')) {
      return "Namaste! 🙏 It's wonderful to talk with you today. I hope you're feeling well and happy. What would you like to chat about? I'm here to help with anything health-related or just to keep you company!";
    }
    
    return "That's a great question! 🤔 I want to give you the best answer possible. Could you tell me a bit more about what you're looking for? I'm here to help with medicines, health tips, nutrition advice, or just to have a caring conversation. Your wellbeing matters to me! 💝";
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    // Voice recognition logic would go here
  };

  const speakMessage = (message: string) => {
    // Text-to-speech logic would go here
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.8; // Slower for elderly users
      utterance.pitch = 1;
      utterance.volume = 1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="bg-primary/20 rounded-full p-4 w-fit mx-auto mb-4">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-poppins font-semibold mb-2">AI Assistant</h1>
        <p className="text-muted-foreground">Your caring health companion</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto mb-4 max-h-96">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <Card className={message.type === 'user' ? 'bg-primary text-white' : 'bg-muted/50'}>
                <CardContent className="p-3">
                  <div className="flex items-start space-x-2">
                    {message.type === 'ai' && (
                      <div className="bg-primary/20 rounded-full p-1 mt-1">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-line leading-relaxed">
                        {message.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {message.type === 'ai' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => speakMessage(message.message)}
                            className="p-1 h-6"
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <Card className="bg-muted/50">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <div className="bg-primary/20 rounded-full p-1">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Quick Questions */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-3">Quick questions:</p>
        <div className="grid grid-cols-2 gap-2">
          {quickQuestions.map((item, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs p-2 h-auto"
              onClick={() => sendMessage(item.question)}
            >
              <item.icon className={`h-3 w-3 mr-1 ${item.color}`} />
              <span className="text-left leading-tight">{item.question}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything about your health..."
            className="pr-10"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
        </div>
        
        <Button
          variant={isListening ? "secondary" : "outline"}
          size="sm"
          onClick={toggleVoice}
          className={isListening ? "animate-pulse" : ""}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        
        <Button 
          size="sm" 
          onClick={() => sendMessage()}
          disabled={!inputMessage.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Helpful Notice */}
      <Card className="mt-4 bg-gradient-to-r from-primary/10 to-accent/20 border-primary/20">
        <CardContent className="p-3">
          <div className="flex items-start space-x-2">
            <Heart className="h-4 w-4 text-primary mt-0.5 animate-heart-beat" />
            <p className="text-xs text-foreground">
              I'm here to provide general health information and emotional support. 
              For medical emergencies, please contact your doctor or use the SOS feature. 🏥
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistant;
