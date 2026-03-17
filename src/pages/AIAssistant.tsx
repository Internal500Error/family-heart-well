
import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Heart,
  Pill,
  Activity,
  BookOpen,
  Volume2,
  Settings,
  Key,
  X,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

// AI API Integration
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are DilCare AI, a knowledgeable and caring health assistant for Indian families. 

YOUR EXPERTISE:
- Medicine information (dosage, side effects, interactions, timing)
- Nutrition and diet plans (diabetes, BP, heart health, weight management)
- Exercise recommendations for all ages
- Mental wellness and stress management
- Indian home remedies (Ayurveda, yoga, pranayama)
- First aid guidance
- Chronic disease management (diabetes, hypertension, thyroid)
- Women's health, children's health, elderly care
- Sleep hygiene and lifestyle modifications

YOUR PERSONALITY:
- Warm and caring like a knowledgeable family member
- Use occasional Hindi words naturally (Namaste, beta, ji, aapka)
- Give practical, actionable advice with specific steps
- Include relevant emojis to be friendly 😊
- Keep responses helpful but concise

IMPORTANT RULES:
- ALWAYS provide helpful health information - never refuse health questions
- For serious symptoms, recommend consulting a doctor while still providing guidance
- Give specific actionable advice, not vague responses
- Include Indian context (foods, remedies, cultural practices)
- Be encouraging and supportive

You can answer ANY health-related question including medicines, symptoms, diseases, nutrition, fitness, mental health, etc.`;

const AIAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      message: "Namaste! 🙏 I'm your DilCare AI assistant powered by real AI. I'm here to help you with health questions, medicine info, and wellness tips. How can I help you today?",
      timestamp: new Date()
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const quickQuestions = [
    {
      icon: Pill,
      question: "What does metformin do?",
      color: "text-medicine"
    },
    {
      icon: Activity,
      question: "My BP is 150/95, what should I do?",
      color: "text-health-danger"
    },
    {
      icon: BookOpen,
      question: "Give me a diabetic-friendly recipe",
      color: "text-health-good"
    },
    {
      icon: Heart,
      question: "I'm feeling stressed, help me relax",
      color: "text-primary"
    }
  ];

  // Real AI API Call using Groq
  const callGroqAPI = async (userMessage: string): Promise<string> => {
    const conversationHistory = messages.slice(-6).map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.message
    }));

    try {
      console.log('Calling Groq API...');

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory,
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      });

      const data = await response.json();
      console.log('Groq Response:', data);

      if (!response.ok) {
        console.error('Groq Error:', data);
        throw new Error(data.error?.message || 'API Error');
      }

      const aiText = data.choices?.[0]?.message?.content;
      if (aiText) {
        return aiText;
      }

      throw new Error('No response from AI');
    } catch (error) {
      console.error('AI Error:', error);
      return fallbackResponse(userMessage);
    }
  };

  // Fallback responses when API unavailable
  const fallbackResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('medicine') || lowerMessage.includes('tablet') || lowerMessage.includes('metformin')) {
      return "💊 Metformin is commonly prescribed for Type 2 diabetes. It helps control blood sugar levels by reducing glucose production in the liver.\n\n**Key points:**\n• Take with meals to reduce stomach upset\n• Stay hydrated\n• Monitor blood sugar regularly\n\nAlways follow your doctor's prescribed dosage! 🏥";
    }

    if (lowerMessage.includes('bp') || lowerMessage.includes('blood pressure') || lowerMessage.includes('150')) {
      return "⚠️ A reading of 150/95 is considered Stage 1 Hypertension.\n\n**Immediate steps:**\n• Sit quietly, rest for 10 mins, then recheck\n• Reduce salt intake today\n• Avoid caffeine and stress\n• Take prescribed BP medicine if you have any\n\nIf symptoms like headache or chest pain occur, please consult your doctor immediately! 🏥";
    }

    if (lowerMessage.includes('recipe') || lowerMessage.includes('diabetic') || lowerMessage.includes('food')) {
      return "🥗 **Diabetic-Friendly Methi Paratha**\n\n**Ingredients:**\n• 1 cup whole wheat flour\n• 1 cup fresh fenugreek leaves (methi)\n• 1 tsp cumin, salt to taste\n\n**Method:**\n1. Mix methi with flour, add water to make dough\n2. Rest 15 mins, roll into parathas\n3. Cook with minimal oil\n\n✨ Methi helps control blood sugar naturally!";
    }

    if (lowerMessage.includes('stress') || lowerMessage.includes('anxious') || lowerMessage.includes('relax')) {
      return "🧘 Let's relax together!\n\n**Try this 4-7-8 breathing:**\n1. Breathe IN for 4 seconds\n2. HOLD for 7 seconds\n3. Breathe OUT for 8 seconds\n4. Repeat 3-4 times\n\n**Quick tips:**\n• Step away from screens\n• Listen to soft music\n• Drink warm water with tulsi\n\nRemember: It's okay to rest. You're doing great! 💙";
    }

    return "I'm here to help! 🤗 You can ask me about:\n• Medicine information\n• Diet and nutrition tips\n• Blood pressure/diabetes management\n• Stress relief techniques\n• Home remedies\n\nFor the best experience, add your free Groq API key in settings!";
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || inputMessage.trim();
    if (!messageText) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    const aiResponse = await callGroqAPI(messageText);

    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      message: aiResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakMessage = (message: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const cleanMessage = message.replace(/[*#]/g, '').replace(/\n+/g, '. ');
      const utterance = new SpeechSynthesisUtterance(cleanMessage);
      utterance.rate = 0.85;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = 'en-IN';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-accent/20 max-w-lg mx-auto px-4 py-6">
      <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent rounded-full p-3">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-poppins font-semibold flex items-center gap-2">
                AI Assistant
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </h1>
              <p className="text-xs text-muted-foreground">
                Powered by Llama 3.3 70B
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto mb-4 max-h-[50vh] pr-2">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
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
                    <span className="text-xs text-muted-foreground ml-2">Thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Quick Questions
          </p>
          <div className="grid grid-cols-2 gap-2">
            {quickQuestions.map((item, index) => (
              <button
                key={index}
                onClick={() => sendMessage(item.question)}
                className="flex items-start gap-2 p-3 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 transition-all duration-150 active:scale-95 text-left w-full"
              >
                <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                  <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                </div>
                <span className="text-xs font-medium text-gray-700 leading-snug">
                  {item.question}
                </span>
              </button>
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
    </div>
  );
};

export default AIAssistant;
