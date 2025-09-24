import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiUser, FiCpu, FiTerminal, FiZap } from 'react-icons/fi';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AISectionProps {
  profile: any;
  projects: any[];
  jobs: any[];
}

// Night Owl Theme Colors
const nightOwl = {
  bg: '#011627',
  surface: '#0b2942',
  darker: '#001122',
  accent: '#82aaff',
  secondary: '#c792ea',
  success: '#addb67',
  warning: '#ffcb8b',
  error: '#ff5874',
  text: '#d6deeb',
  textDim: '#5f7e97',
  border: '#1d3b53',
  selection: '#1d3b53'
};

const AISection: React.FC<AISectionProps> = ({ profile, projects, jobs }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hey there! 👋 I'm an AI assistant that knows all about ${profile.fname}'s work. Ask me anything about his skills, projects, or experience!`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Try OpenRouter API first
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GATSBY_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Portfolio AI Assistant'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.2-3b-instruct:free',
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant for ${profile.fname}'s portfolio. Keep responses conversational and helpful. You know about his skills: ${profile.skills.join(', ')}, his current role as ${jobs[0]?.jobTitle || 'a developer'} at ${jobs[0]?.company?.name || 'his company'}, and his projects. Be friendly but professional.`
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0]?.message?.content || getFallbackResponse(lowerMessage);
      }
    } catch (error) {
      console.log('Using fallback responses');
    }

    return getFallbackResponse(lowerMessage);
  };

  const getFallbackResponse = (lowerMessage: string): string => {
    if (lowerMessage.includes('skill') || lowerMessage.includes('tech')) {
      return `${profile.fname} is skilled in ${profile.skills.slice(0, 6).join(', ')} and many other technologies. He's particularly strong in full-stack development and modern web technologies.`;
    }
    
    if (lowerMessage.includes('project')) {
      const projectNames = projects.slice(0, 3).map(p => p.project?.name || p.name).filter(Boolean);
      return `Some of his notable projects include ${projectNames.join(', ')}. Each project demonstrates different technical skills and problem-solving approaches.`;
    }
    
    if (lowerMessage.includes('experience') || lowerMessage.includes('work')) {
      return `He's currently working as ${jobs[0]?.jobTitle || 'a developer'} and has extensive experience in software development. He's worked on various projects ranging from web applications to complex systems.`;
    }
    
    if (lowerMessage.includes('contact') || lowerMessage.includes('hire')) {
      return `${profile.for_hire ? "He's currently available for new opportunities!" : "He's always open to discussing interesting projects."} You can reach out through the contact section or connect via his social profiles.`;
    }

    const responses = [
      `That's an interesting question! ${profile.fname} has experience across many areas of development. What specific aspect would you like to know more about?`,
      `Great question! He's passionate about technology and always learning new things. Feel free to ask about his projects, skills, or experience.`,
      `Good point! ${profile.fname} enjoys tackling complex problems and building efficient solutions. What would you like to explore further?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim()) return;

    // Track AI interaction for gamification
    if ((window as any).portfolioGamification) {
      (window as any).portfolioGamification.trackInteraction('ai');
    }
    if ((window as any).portfolioGamification) {
      (window as any).portfolioGamification.trackInteraction();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const aiResponse = await generateResponse(text);
      
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1500 + Math.random() * 1000);
    } catch (error) {
      setIsTyping(false);
    }
  };

  const quickQuestions = [
    "What are his main skills?",
    "Tell me about his projects",
    "What's his experience?",
    "Is he available for hire?"
  ];

  return (
    <section className="py-16" style={{ backgroundColor: nightOwl.bg }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4" style={{ color: nightOwl.text }}>
            AI Assistant
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: nightOwl.textDim }}>
            Chat with an AI that knows all about {profile.fname}'s work, skills, and experience.
            Ask anything you'd like to know!
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Quick Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <p className="text-sm mb-4" style={{ color: nightOwl.textDim }}>
              Quick questions to get started:
            </p>
            <div className="flex flex-wrap gap-3">
              {quickQuestions.map((question, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSendMessage(question)}
                  className="px-4 py-2 rounded-lg text-sm border transition-all hover:scale-105"
                  style={{
                    backgroundColor: nightOwl.surface,
                    borderColor: nightOwl.border,
                    color: nightOwl.accent
                  }}
                  whileHover={{ 
                    backgroundColor: nightOwl.selection,
                    borderColor: nightOwl.accent
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-lg border overflow-hidden"
            style={{
              backgroundColor: nightOwl.surface,
              borderColor: nightOwl.border
            }}
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center space-x-3" style={{ borderColor: nightOwl.border }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: nightOwl.accent + '20' }}>
                <FiCpu className="w-5 h-5" style={{ color: nightOwl.accent }} />
              </div>
              <div>
                <h3 className="font-medium" style={{ color: nightOwl.text }}>AI Assistant</h3>
                <p className="text-sm" style={{ color: nightOwl.textDim }}>
                  Powered by Meta-Llama • Always online
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  {/* Message Header */}
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center" style={{
                      backgroundColor: message.sender === 'user' ? nightOwl.secondary + '20' : nightOwl.accent + '20'
                    }}>
                      {message.sender === 'user' ? (
                        <FiUser className="w-3 h-3" style={{ color: message.sender === 'user' ? nightOwl.secondary : nightOwl.accent }} />
                      ) : (
                        <FiCpu className="w-3 h-3" style={{ color: nightOwl.accent }} />
                      )}
                    </div>
                    <span className="text-sm font-medium" style={{
                      color: message.sender === 'user' ? nightOwl.secondary : nightOwl.accent
                    }}>
                      {message.sender === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                    <span className="text-xs" style={{ color: nightOwl.textDim }}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Message Content */}
                  <div className="ml-8">
                    <div 
                      className="p-3 rounded-lg border"
                      style={{
                        backgroundColor: message.sender === 'user' ? nightOwl.selection : nightOwl.darker,
                        borderColor: message.sender === 'user' ? nightOwl.secondary + '30' : nightOwl.accent + '30',
                        color: nightOwl.text
                      }}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: nightOwl.accent + '20' }}>
                        <FiCpu className="w-3 h-3" style={{ color: nightOwl.accent }} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: nightOwl.accent }}>
                        AI Assistant
                      </span>
                      <span className="text-xs" style={{ color: nightOwl.textDim }}>
                        typing...
                      </span>
                    </div>
                    <div className="ml-8">
                      <div 
                        className="p-3 rounded-lg border inline-block"
                        style={{
                          backgroundColor: nightOwl.darker,
                          borderColor: nightOwl.accent + '30'
                        }}
                      >
                        <div className="flex space-x-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: nightOwl.accent }}
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: i * 0.2
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t" style={{ borderColor: nightOwl.border }}>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about the portfolio..."
                  className="flex-1 px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: nightOwl.darker,
                    borderColor: nightOwl.border,
                    color: nightOwl.text
                  }}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isTyping}
                  className="px-6 py-3 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                  style={{
                    backgroundColor: nightOwl.accent,
                    color: nightOwl.bg
                  }}
                >
                  <FiSend className="w-4 h-4" />
                  <span className="text-sm font-medium">Send</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-4 mt-8"
          >
            {[
              { label: 'Messages', value: messages.length, icon: FiTerminal },
         
   
            ].map((stat, index) => (
              <div 
                key={index} 
                className="p-4 rounded-lg border text-center"
                style={{
                  backgroundColor: nightOwl.surface,
                  borderColor: nightOwl.border
                }}
              >
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="w-5 h-5" style={{ color: nightOwl.accent }} />
                </div>
                <div className="text-lg font-bold mb-1" style={{ color: nightOwl.text }}>
                  {stat.value}
                </div>
                <div className="text-sm" style={{ color: nightOwl.textDim }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AISection;
