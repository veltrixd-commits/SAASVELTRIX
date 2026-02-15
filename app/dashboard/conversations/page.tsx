// Conversations Management Page
'use client';

import { useState } from 'react';

export default function ConversationsPage() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'waiting'>('all');

  // Demo conversations data
  const conversations = [
    {
      id: 1,
      leadName: 'Sarah Johnson',
      leadEmail: 'sarah.johnson@email.com',
      platform: 'TikTok',
      platformIcon: '🎵',
      lastMessage: "Hi! I'm interested in your pricing packages. Can you tell me more?",
      unread: 3,
      lastMessageTime: '5 mins ago',
      status: 'active',
      messages: [
        { id: 1, sender: 'lead', text: 'Hi! I saw your TikTok video about automation.', time: '10:30 AM', date: 'Today' },
        { id: 2, sender: 'bot', text: 'Hi Sarah! 👋 Thanks for reaching out. I can help you with that. What would you like to know?', time: '10:31 AM', date: 'Today' },
        { id: 3, sender: 'lead', text: "I'm interested in your pricing packages. Can you tell me more?", time: '10:32 AM', date: 'Today' },
        { id: 4, sender: 'bot', text: 'Great question! We have 3 main packages: Starter (R2,999), Professional (R4,999), and Enterprise (R9,999). Which features are most important to you?', time: '10:33 AM', date: 'Today' },
      ]
    },
    {
      id: 2,
      leadName: 'Michael Chen',
      leadEmail: 'michael.chen@email.com',
      platform: 'WhatsApp',
      platformIcon: '💬',
      lastMessage: "Perfect! When can we schedule the demo?",
      unread: 2,
      lastMessageTime: '12 mins ago',
      status: 'active',
      messages: [
        { id: 1, sender: 'lead', text: 'Hello, I want to book a demo.', time: '9:45 AM', date: 'Today' },
        { id: 2, sender: 'bot', text: "Hi Michael! I'd be happy to help you book a demo. Our demos typically last 30 minutes. Are you available this week?", time: '9:46 AM', date: 'Today' },
        { id: 3, sender: 'lead', text: 'Perfect! When can we schedule the demo?', time: '9:50 AM', date: 'Today' },
      ]
    },
    {
      id: 3,
      leadName: 'Emma Williams',
      leadEmail: 'emma.williams@email.com',
      platform: 'Instagram',
      platformIcon: '📸',
      lastMessage: "Can you integrate with our existing CRM?",
      unread: 1,
      lastMessageTime: '23 mins ago',
      status: 'active',
      messages: [
        { id: 1, sender: 'lead', text: 'Hi! I have a question about implementation.', time: '9:15 AM', date: 'Today' },
        { id: 2, sender: 'bot', text: "Hi Emma! I'm here to help. What would you like to know about implementation?", time: '9:16 AM', date: 'Today' },
        { id: 3, sender: 'lead', text: 'Can you integrate with our existing CRM?', time: '9:20 AM', date: 'Today' },
        { id: 4, sender: 'bot', text: 'Yes! We integrate with most major CRMs including Salesforce, HubSpot, and Zoho. Which CRM are you using?', time: '9:21 AM', date: 'Today' },
      ]
    },
    {
      id: 4,
      leadName: 'James Brown',
      leadEmail: 'james.brown@email.com',
      platform: 'Facebook',
      platformIcon: '👥',
      lastMessage: "I need to check with my team first.",
      unread: 0,
      lastMessageTime: '1 hour ago',
      status: 'waiting',
      messages: [
        { id: 1, sender: 'lead', text: 'Hi, what are your payment terms?', time: '8:30 AM', date: 'Today' },
        { id: 2, sender: 'bot', text: 'Hi James! We offer flexible payment terms. You can pay monthly or annually (with 20% discount). We also have a 14-day money-back guarantee.', time: '8:31 AM', date: 'Today' },
        { id: 3, sender: 'lead', text: 'I need to check with my team first.', time: '8:45 AM', date: 'Today' },
        { id: 4, sender: 'bot', text: "Absolutely! Take your time. Feel free to reach out when you're ready. I'm here to help! 😊", time: '8:46 AM', date: 'Today' },
      ]
    },
    {
      id: 5,
      leadName: 'Sophia Martinez',
      leadEmail: 'sophia.m@email.com',
      platform: 'LinkedIn',
      platformIcon: '💼',
      lastMessage: "What kind of partnership are you offering?",
      unread: 0,
      lastMessageTime: '2 hours ago',
      status: 'waiting',
      messages: [
        { id: 1, sender: 'lead', text: `Hi! I'm interested in partnership opportunities.`, time: '7:00 AM', date: 'Today' },
        { id: 2, sender: 'bot', text: 'Hi Sophia! Great to hear from you. We offer several partnership models including affiliate, reseller, and strategic partnerships. What type interests you?', time: '7:02 AM', date: 'Today' },
        { id: 3, sender: 'lead', text: 'What kind of partnership are you offering?', time: '7:15 AM', date: 'Today' },
      ]
    },
  ];

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = 
      conv.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.leadEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = filterPlatform === 'ALL' || conv.platform === filterPlatform;
    return matchesSearch && matchesPlatform;
  });

  const selected = conversations.find(c => c.id === selectedConversation);

  const stats = {
    total: conversations.length,
    unread: conversations.filter(c => c.unread > 0).length,
    active: conversations.filter(c => c.status === 'active').length,
  };

  return (
    <div className="h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">💬 Conversations</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Unified inbox for all platform messages</p>
      </div>

      {/* Floating Tabs */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-2 mb-4">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            All ({conversations.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === 'active'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Active ({conversations.filter(c => c.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveTab('waiting')}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === 'waiting'
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Waiting ({conversations.filter(c => c.status === 'waiting').length})
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.unread}</div>
          <div className="text-sm text-gray-600">Unread</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-4 h-[calc(100%-180px)]">
        {/* Left Sidebar - Conversation List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          {/* Search and Filter */}
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="🔍 Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-3"
            />
            <select 
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">All Platforms</option>
              <option value="TikTok">TikTok</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="LinkedIn">LinkedIn</option>
            </select>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedConversation === conv.id ? 'bg-primary-50 border-l-4 border-l-primary-600' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{conv.leadName}</h3>
                      {conv.unread > 0 && (
                        <span className="flex-shrink-0 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{conv.leadEmail}</p>
                  </div>
                  <span className="text-lg flex-shrink-0">{conv.platformIcon}</span>
                </div>
                <p className="text-sm text-gray-600 truncate mb-1">{conv.lastMessage}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{conv.lastMessageTime}</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{conv.platform}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content - Chat Window */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          {selected ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                      {selected.leadName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-white">{selected.leadName}</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{selected.platformIcon} {selected.platform}</span>
                        <span>•</span>
                        <span>{selected.leadEmail}</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href="/dashboard/leads"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                  >
                    View Lead
                  </a>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {selected.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'lead' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[70%] ${msg.sender === 'lead' ? 'order-2' : 'order-1'}`}>
                      <div className={`rounded-lg p-3 ${
                        msg.sender === 'lead' 
                          ? 'bg-white border border-gray-200' 
                          : 'bg-primary-600 text-white'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
                        msg.sender === 'lead' ? 'justify-start' : 'justify-end'
                      }`}>
                        <span>{msg.time}</span>
                        {msg.sender === 'bot' && <span>✓✓</span>}
                      </div>
                    </div>
                  </div>
                ))}

                {/* AI Auto-Responder Badge */}
                <div className="flex justify-center">
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-xs font-medium">
                    🤖 AI Auto-Responder Active
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">
                    Send
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                    📎 Attach
                  </button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                    🤖 AI Suggest Reply
                  </button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                    📋 Templates
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg">Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
