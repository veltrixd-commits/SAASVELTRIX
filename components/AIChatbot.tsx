// Global AI Chatbot Widget - Helps users navigate and get assistance
'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles, HelpCircle, Lightbulb, TrendingUp, DollarSign, Heart, Video, Users, Building2 } from 'lucide-react';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  suggestions?: string[];
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userContext, setUserContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load user context from localStorage
    const userData = localStorage.getItem('userData');
    const onboardingData = localStorage.getItem('onboardingData');
    
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUserContext(parsed);
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }

    // Initial welcome message
    if (messages.length === 0) {
      const welcomeMsg: Message = {
        id: 1,
        sender: 'bot',
        text: `Hi! I'm your AI assistant. I can help you navigate the platform, set up features, or answer any questions. What would you like to do today?`,
        timestamp: new Date(),
        suggestions: [
          'How do I connect my smartwatch?',
          'Show me the wellness features',
          'Help me create an automation',
          'Explain the pricing plans'
        ]
      };
      setMessages([welcomeMsg]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getContextualResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Wellness & Health
    if (input.includes('wellness') || input.includes('health') || input.includes('smartwatch')) {
      return `Great question about wellness! The Wellness Dashboard lets you:\n\n- Connect smartwatches (Apple Watch, Fitbit, Garmin, etc.)\n- Track health metrics automatically\n- Build morning routines\n- Chat with an AI wellness coach\n\nNavigate to the Wellness section in your Personal OS menu to get started. Would you like me to guide you through connecting a device?`;
    }
    
    // Content creator features
    if (input.includes('content') || input.includes('creator') || input.includes('video') || input.includes('script')) {
      return `The Content Studio is perfect for creators! You get:\n\n- AI Script Generator for TikTok/YouTube\n- Content calendar & scheduling\n- Analytics dashboard\n- Brand deals tracker\n\nCheck out the Content Studio in the Personal OS section. Need help generating your first script?`;
    }
    
    // Automations
    if (input.includes('automation') || input.includes('automate') || input.includes('workflow')) {
      return `Automations save you tons of time! You can automate:\n\n- Welcome messages to new leads\n- Follow-up sequences\n- Meeting reminders\n- Health tracking notifications\n- And much more!\n\nGo to the Automations page to create your first automation. Want me to walk you through it?`;
    }
    
    // Leads & Business
    if (input.includes('lead') || input.includes('customer') || input.includes('business')) {
      return `For lead management, you can:\n\n- Add leads manually or via automation\n- Track lead status (Hot, Warm, Cold)\n- Connect TikTok, WhatsApp, Instagram\n- Manage conversations in one inbox\n\nVisit the Leads page in Business Tools. Need help adding your first lead?`;
    }
    
    // Performance & Money
    if (input.includes('performance') || input.includes('money') || input.includes('goal') || input.includes('financial')) {
      return `The Performance & Money dashboard helps you:\n\n- Track motivation levels\n- Set financial goals\n- Monitor income streams\n- Celebrate achievements\n\nFind it in the Personal OS section. Want tips on setting effective goals?`;
    }
    
    // Pricing
    if (input.includes('pricing') || input.includes('price') || input.includes('cost') || input.includes('plan')) {
      return `We have 3 pricing tiers:\n\n✓ Free Trial (7 days) - Try all features\n✓ Starter (R4.5k/month) - For individuals & small teams\n✓ Professional (R17k/month) - Full platform access\n\nAll plans include unlimited contacts, automation, and AI features. Check out the Pricing page for details!`;
    }
    
    // Getting started
    if (input.includes('start') || input.includes('begin') || input.includes('setup') || input.includes('onboard')) {
      const userType = userContext?.userType || 'user';
      if (userType === 'business') {
        return `For business owners, I recommend:\n\n1. Connect your communication platforms (TikTok, WhatsApp)\n2. Import or add your first leads\n3. Set up an automation for new leads\n4. Configure your products/services\n\nLet me know which step you'd like help with!`;
      } else if (userType === 'creator') {
        return `For content creators, start with:\n\n1. Connect your smartwatch for wellness tracking\n2. Generate your first video script in Content Studio\n3. Set up your content calendar\n4. Explore the AI wellness coach\n\nWhich feature interests you most?`;
      }
      return `Welcome! Let's get you set up:\n\n1. Complete your profile\n2. Connect relevant tools (smartwatch, social media)\n3. Explore feature that match your goals\n4. Set up your first automation\n\nWhat's your main goal with the platform?`;
    }
    
    // Navigation help
    if (input.includes('where') || input.includes('find') || input.includes('navigate') || input.includes('go to')) {
      return `Here's how to navigate:\n\n📱 Personal OS:\n- Wellness (health tracking)\n- Performance (goals & money)\n- Content Studio (for creators)\n\n💼 Business Tools:\n- Inbox, Leads, Conversations\n- Products, Delivery, Finance\n- Automations, Analytics\n\nWhat feature are you looking for?`;
    }
    
    // Default helpful response
    return `I'm here to help! I can assist with:\n\n• Setting up automations\n• Connecting devices & platforms\n• Understanding features\n• Navigating the dashboard\n• Best practices & tips\n\nCould you tell me more about what you need help with?`;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        sender: 'bot',
        text: getContextualResponse(input),
        timestamp: new Date(),
        suggestions: getSuggestions(input)
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const getSuggestions = (input: string): string[] => {
    const lower = input.toLowerCase();
    
    if (lower.includes('wellness') || lower.includes('health')) {
      return ['Connect Apple Watch', 'Show morning routine', 'Talk to AI coach'];
    }
    if (lower.includes('content') || lower.includes('creator')) {
      return ['Generate a script', 'View content calendar', 'Check analytics'];
    }
    if (lower.includes('automation')) {
      return ['Create new automation', 'View active automations', 'Automation best practices'];
    }
    if (lower.includes('lead')) {
      return ['Add a lead', 'View all leads', 'Connect TikTok'];
    }
    
    return ['Show all features', 'Help me get started', 'Contact support'];
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSend();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button - Hidden on mobile */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="hidden sm:flex fixed bottom-4 right-4 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:scale-110 transition-all items-center justify-center group"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          <div className="absolute right-16 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Need help?
          </div>
        </button>
      )}

      {/* Chat Window - Smaller and more compact */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 h-[500px] sm:h-[550px] max-h-[80vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">AI Assistant</h3>
                <p className="text-xs text-blue-100">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none shadow-md'
                    }`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="flex items-center gap-2 mb-1 text-blue-600">
                        <Sparkles className="w-3 h-3" />
                        <span className="text-xs font-semibold">AI Assistant</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
                
                {/* Suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-2">
                    {msg.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full text-xs text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-2 overflow-x-auto">
              <QuickActionButton icon={HelpCircle} label="Help" onClick={() => setInput('I need help getting started')} />
              <QuickActionButton icon={Heart} label="Wellness" onClick={() => setInput('Show me wellness features')} />
              <QuickActionButton icon={Video} label="Content" onClick={() => setInput('Help with content creation')} />
              <QuickActionButton icon={TrendingUp} label="Goals" onClick={() => setInput('Set financial goals')} />
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-900 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function QuickActionButton({ icon: Icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
    >
      <Icon className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </button>
  );
}
