
import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, Send, User, Bot } from 'lucide-react';

const SupportScreen = () => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: 'Hello! Welcome to GoodDeeds Data support. How can I help you today?',
      timestamp: '10:00 AM'
    },
    {
      id: 2,
      type: 'user',
      message: 'Hi, I need help with my subscription',
      timestamp: '10:01 AM'
    },
    {
      id: 3,
      type: 'bot',
      message: 'I\'d be happy to help with your subscription. What specific issue are you experiencing?',
      timestamp: '10:01 AM'
    }
  ]);

  const quickHelp = [
    { title: 'Connection Issues', description: 'VPN not connecting properly' },
    { title: 'Subscription Problems', description: 'Billing and plan issues' },
    { title: 'Data Not Saving', description: 'Compression not working' },
    { title: 'Account Settings', description: 'Profile and preferences' }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        type: 'user',
        message: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, newMessage]);
      setMessage('');
      
      // Simulate bot response
      setTimeout(() => {
        const botResponse = {
          id: chatMessages.length + 2,
          type: 'bot',
          message: 'Thank you for your message. Our support team will get back to you shortly. Is there anything else I can help you with?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 pt-12 pb-8 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-3xl font-bold">Support</h1>
            <p className="text-blue-200">We're here to help you</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle size={24} className="text-white" />
          </div>
        </div>

        {/* Quick Contact */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <Phone size={24} className="text-white mb-2" />
            <p className="text-white font-semibold">Call Us</p>
            <p className="text-blue-200 text-sm">+234 800 123 4567</p>
          </button>
          <button className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <Mail size={24} className="text-white mb-2" />
            <p className="text-white font-semibold">Email</p>
            <p className="text-blue-200 text-sm">support@gooddeeds.ng</p>
          </button>
        </div>
      </div>

      {/* Quick Help */}
      <div className="px-6 mt-6">
        <h3 className="text-xl font-bold text-blue-900 mb-4">Quick Help</h3>
        <div className="grid grid-cols-1 gap-3 mb-6">
          {quickHelp.map((item, index) => (
            <button
              key={index}
              className="bg-white p-4 rounded-2xl shadow-lg border border-blue-100 text-left hover:shadow-xl transition-all duration-300"
            >
              <h4 className="font-semibold text-blue-900 mb-1">{item.title}</h4>
              <p className="text-blue-600 text-sm">{item.description}</p>
            </button>
          ))}
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4">
            <h3 className="text-white font-bold">Live Chat Support</h3>
            <p className="text-blue-100 text-sm">Usually responds in a few minutes</p>
          </div>

          {/* Chat Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${
                  msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {msg.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  msg.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-1 ${
                    msg.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-blue-100">
            <div className="flex space-x-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 transition-all duration-300"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl p-6 text-white shadow-xl">
          <h3 className="text-xl font-bold mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Phone size={20} />
              <div>
                <p className="font-semibold">Phone Support</p>
                <p className="text-cyan-100">+234 800 123 4567</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail size={20} />
              <div>
                <p className="font-semibold">Email Support</p>
                <p className="text-cyan-100">support@gooddeeds.ng</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MessageCircle size={20} />
              <div>
                <p className="font-semibold">Response Time</p>
                <p className="text-cyan-100">Usually within 24 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <div className="mt-6 bg-white rounded-3xl p-6 shadow-xl border border-blue-100">
          <h3 className="text-xl font-bold text-blue-900 mb-4">Send Feedback</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Subject"
              className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              placeholder="Describe your issue or feedback..."
              rows={4}
              className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            ></textarea>
            <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportScreen;
