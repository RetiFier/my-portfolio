import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIResponses = {
  greeting: [
    "Hello! I'm Reti's AI assistant. I can answer questions about his skills, projects, and experience. How can I help you today?",
    "Hi there! I'm here to help you learn more about Reti Fier's work and capabilities. What would you like to know?",
    "Welcome! I can provide insights into Reti's projects, technical skills, and professional experience. What interests you most?"
  ],
  skills: [
    "Reti is a full-stack developer with expertise in React, TypeScript, Node.js, Python, and cloud technologies. He's particularly strong in building scalable web applications and has 5+ years of experience.",
    "His technical stack includes modern frontend frameworks like React and Vue.js, backend technologies like Node.js and Python, and cloud platforms like AWS. He's also experienced with databases, DevOps, and testing frameworks.",
    "Reti's core competencies span the entire development lifecycle - from UI/UX design with tools like Figma to deployment with Docker and Kubernetes. He's passionate about performance optimization and clean code architecture."
  ],
  projects: [
    "Reti has worked on diverse projects including e-commerce platforms, AI analytics dashboards, crypto trading bots, and IoT applications. Each project showcases his ability to solve complex problems with innovative solutions.",
    "Some notable projects include a marketplace that increased small business sales by 300%, an AI dashboard serving 100+ companies, and a trading bot with 45% annual returns. You can explore these in detail in the Projects Galaxy section.",
    "His projects demonstrate expertise in scalable architecture, real-time systems, machine learning integration, and user-centric design. Each solution addresses real-world problems with measurable impact."
  ],
  experience: [
    "Reti has 5+ years of professional experience, currently working as a Senior Full-Stack Developer at TechCorp Solutions. He's led teams, architected systems handling 1M+ requests/day, and mentored junior developers.",
    "His career journey includes roles at innovative companies like InnovateLab, StartupXYZ, and WebDev Agency. He's experienced in both startup environments and larger organizations, adapting to different scales and requirements.",
    "Throughout his career, Reti has consistently delivered high-impact solutions, improved system performance, and contributed to team growth. His experience spans multiple industries including fintech, e-commerce, and IoT."
  ],
  contact: [
    "You can reach Reti at reti@retifier.dev or connect with him on LinkedIn. He's always open to discussing new opportunities, collaborations, or technical challenges.",
    "For professional inquiries, feel free to email reti@retifier.dev. You can also download his resume from this portfolio or schedule a call to discuss potential projects.",
    "Reti is based remotely and works with clients globally. The best way to get in touch is via email at reti@retifier.dev or through the contact form on this site."
  ],
  collaboration: [
    "Reti thrives in collaborative environments and has experience working with cross-functional teams, including designers, product managers, and stakeholders. He believes in clear communication and agile methodologies.",
    "He's comfortable with both remote and on-site work, having successfully managed distributed teams and contributed to open-source projects. His collaborative approach ensures alignment and successful project delivery.",
    "Reti enjoys mentoring others and sharing knowledge through code reviews, technical discussions, and documentation. He's contributed to team growth and knowledge sharing in every role."
  ],
  learning: [
    "Reti is committed to continuous learning and staying current with technology trends. He regularly explores new frameworks, attends conferences, and contributes to open-source projects.",
    "His learning approach includes hands-on experimentation, building side projects, and engaging with the developer community. This portfolio itself showcases his exploration of cutting-edge 3D web technologies.",
    "Recent areas of focus include advanced Three.js techniques, serverless architectures, AI/ML integration, and progressive web app development. He believes in learning by building."
  ]
};

const getAIResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return AIResponses.greeting[Math.floor(Math.random() * AIResponses.greeting.length)];
  }
  
  if (message.includes('skill') || message.includes('technology') || message.includes('tech stack')) {
    return AIResponses.skills[Math.floor(Math.random() * AIResponses.skills.length)];
  }
  
  if (message.includes('project') || message.includes('work') || message.includes('portfolio')) {
    return AIResponses.projects[Math.floor(Math.random() * AIResponses.projects.length)];
  }
  
  if (message.includes('experience') || message.includes('background') || message.includes('career')) {
    return AIResponses.experience[Math.floor(Math.random() * AIResponses.experience.length)];
  }
  
  if (message.includes('contact') || message.includes('email') || message.includes('reach') || message.includes('hire')) {
    return AIResponses.contact[Math.floor(Math.random() * AIResponses.contact.length)];
  }
  
  if (message.includes('team') || message.includes('collaboration') || message.includes('work together')) {
    return AIResponses.collaboration[Math.floor(Math.random() * AIResponses.collaboration.length)];
  }
  
  if (message.includes('learn') || message.includes('study') || message.includes('education')) {
    return AIResponses.learning[Math.floor(Math.random() * AIResponses.learning.length)];
  }
  
  // Default responses for unmatched queries
  const defaultResponses = [
    "That's an interesting question! Could you be more specific? I can help with information about Reti's skills, projects, experience, or how to contact him.",
    "I'd be happy to help! I have detailed information about Reti's technical abilities, work experience, and project portfolio. What would you like to know more about?",
    "I can provide insights about Reti's professional background, technical expertise, and project work. Could you rephrase your question or ask about a specific area?",
    "I'm here to help you learn about Reti Fier's capabilities as a full-stack developer. Feel free to ask about his skills, projects, experience, or how to get in touch!"
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message when first opened
      const welcomeMessage: Message = {
        id: '1',
        text: "Hello! I'm Reti's AI assistant. I can answer questions about his skills, projects, and experience. How can I help you today?",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputValue),
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // 1-3 seconds delay
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "What are Reti's main technical skills?",
    "Tell me about his latest projects",
    "What's his professional experience?",
    "How can I contact him for opportunities?",
    "What technologies does he specialize in?"
  ];

  return (
    <>
      {/* AI Assistant Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-2xl transition-all duration-300 ${
          isOpen ? 'rotate-45' : 'hover:scale-110'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? { rotate: 45 } : { rotate: 0 }}
      >
        {isOpen ? (
          <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 right-6 z-40 w-96 h-[600px] bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 text-white">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <div>
                  <h3 className="font-bold">Reti's AI Assistant</h3>
                  <p className="text-sm opacity-90">Ask me anything about Reti's work!</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 h-[400px] overflow-y-auto bg-black/20">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-white/10 text-white border border-white/20'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex justify-start"
                >
                  <div className="bg-white/10 text-white border border-white/20 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 1 && (
              <div className="p-4 border-t border-white/10">
                <p className="text-white text-sm mb-2">Try asking:</p>
                <div className="space-y-1">
                  {suggestedQuestions.slice(0, 3).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(question)}
                      className="block w-full text-left text-xs text-cyan-300 hover:text-cyan-100 transition-colors"
                    >
                      • {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about Reti's work..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                  disabled={isTyping}
                />
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
