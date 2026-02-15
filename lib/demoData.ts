// Comprehensive Demo Data for All Dashboard Modules
// This creates realistic scenarios to showcase platform functionality

export function initializeDemoData() {
  // Only initialize if not already present
  if (localStorage.getItem('demoDataInitialized') === 'true') {
    return;
  }

  // 1. LEADS - High-value prospects
  const leads = [
    {
      id: '1',
      name: 'Sarah Mitchell',
      email: 'sarah.mitchell@techstartup.com',
      phone: '+27-82-555-0101',
      source: 'TikTok',
      sourceIcon: '🎵',
      status: 'HOT',
      score: 98,
      intent: 'Enterprise Package',
      lastContact: '2 mins ago',
      created: new Date(Date.now() - 120000).toISOString(),
      notes: 'CEO of tech startup, interested in full automation suite. Budget: R50k/month',
      estimatedValue: 600000,
      tags: ['High Value', 'Decision Maker', 'Urgent'],
      interactions: 12,
      nextFollowUp: new Date(Date.now() + 3600000).toISOString(),
      comments: [
        { id: 1, text: 'Reached out via TikTok after viral video on AI automation', author: 'System', timestamp: new Date(Date.now() - 7200000).toISOString(), replies: [] },
        { id: 2, text: 'Had 45min discovery call - very impressed!', author: 'You', timestamp: new Date(Date.now() - 3600000).toISOString(), replies: [
          { id: 3, text: 'Sent custom proposal with ROI projections', author: 'You', timestamp: new Date(Date.now() - 1800000).toISOString() }
        ] }
      ],
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      email: 'marcus@growthhackers.co',
      phone: '+27-83-555-0202',
      source: 'WhatsApp',
      sourceIcon: '💬',
      status: 'HOT',
      score: 95,
      intent: 'TikTok Lead Gen',
      lastContact: '15 mins ago',
      created: new Date(Date.now() - 900000).toISOString(),
      notes: 'Marketing agency owner, wants white-label solution for clients',
      estimatedValue: 450000,
      tags: ['Agency', 'White Label', 'Recurring'],
      interactions: 8,
      nextFollowUp: new Date(Date.now() + 7200000).toISOString(),
      comments: [
        { id: 1, text: 'Friend referral - already warm lead', author: 'System', timestamp: new Date(Date.now() - 900000).toISOString(), replies: [] }
      ],
    },
    {
      id: '3',
      name: 'Priya Patel',
      email: 'priya.patel@fashionbrand.com',
      phone: '+27-84-555-0303',
      source: 'Instagram',
      sourceIcon: '📸',
      status: 'HOT',
      score: 92,
      intent: 'Social Commerce',
      lastContact: '1 hour ago',
      created: new Date(Date.now() - 3600000).toISOString(),
      notes: 'Fashion brand owner, 150k followers, wants automated DM-to-sale funnel',
      estimatedValue: 280000,
      tags: ['E-commerce', 'Influencer', 'Social Selling'],
      interactions: 6,
      nextFollowUp: new Date(Date.now() + 10800000).toISOString(),
    },
    {
      id: '4',
      name: 'David Chen',
      email: 'david.chen@realestate.co.za',
      phone: '+27-85-555-0404',
      source: 'LinkedIn',
      sourceIcon: '💼',
      status: 'WARM',
      score: 78,
      intent: 'CRM Integration',
      lastContact: '2 hours ago',
      created: new Date(Date.now() - 7200000).toISOString(),
      notes: 'Real estate agency, needs lead management automation',
      estimatedValue: 180000,
      tags: ['Real Estate', 'CRM', 'Integration'],
      interactions: 4,
      nextFollowUp: new Date(Date.now() + 86400000).toISOString(),
    },
    {
      id: '5',
      name: 'Zanele Khumalo',
      email: 'zanele@beautysalon.co.za',
      phone: '+27-86-555-0505',
      source: 'Facebook',
      sourceIcon: '👍',
      status: 'WARM',
      score: 72,
      intent: 'Booking Automation',
      lastContact: '5 hours ago',
      created: new Date(Date.now() - 18000000).toISOString(),
      notes: 'Beauty salon chain (3 locations), wants automated booking system',
      estimatedValue: 120000,
      tags: ['Local Business', 'Appointments', 'Multi-location'],
      interactions: 3,
      nextFollowUp: new Date(Date.now() + 172800000).toISOString(),
    }
  ];

  // 2. CONVERSATIONS - Active chats across platforms
  const conversations = [
    {
      id: 'conv1',
      lead: { id: '1', name: 'Sarah Mitchell', avatar: '' },
      platform: 'TIKTOK',
      lastMessage: 'Can we schedule a call tomorrow to finalize the contract?',
      lastMessageTime: new Date(Date.now() - 120000).toISOString(),
      unreadCount: 2,
      status: 'active',
      assignedTo: 'You',
      tags: ['High Priority', '🔥 Hot Lead'],
      messages: [
        { id: 'm1', content: 'Hi! I watched your latest video on AI automation', direction: 'INBOUND', timestamp: new Date(Date.now() - 7200000).toISOString(), isRead: true },
        { id: 'm2', content: 'Thanks for reaching out! Would love to discuss your needs', direction: 'OUTBOUND', timestamp: new Date(Date.now() - 7000000).toISOString(), isRead: true },
        { id: 'm3', content: 'We\'re a 50-person tech startup looking to automate our entire customer journey', direction: 'INBOUND', timestamp: new Date(Date.now() - 3600000).toISOString(), isRead: true },
        { id: 'm4', content: 'Perfect! I\'ll send over a custom proposal with ROI projections', direction: 'OUTBOUND', timestamp: new Date(Date.now() - 3500000).toISOString(), isRead: true },
        { id: 'm5', content: 'Just reviewed the proposal - looks amazing! Love the projected 10x ROI', direction: 'INBOUND', timestamp: new Date(Date.now() - 300000).toISOString(), isRead: false },
        { id: 'm6', content: 'Can we schedule a call tomorrow to finalize the contract?', direction: 'INBOUND', timestamp: new Date(Date.now() - 120000).toISOString(), isRead: false },
      ]
    },
    {
      id: 'conv2',
      lead: { id: '2', name: 'Marcus Johnson', avatar: '' },
      platform: 'WHATSAPP',
      lastMessage: 'My clients are going to love this!',
      lastMessageTime: new Date(Date.now() - 900000).toISOString(),
      unreadCount: 1,
      status: 'active',
      assignedTo: 'You',
      tags: ['Agency Partner'],
      messages: [
        { id: 'm1', content: 'Hey! Your friend John referred me. Interested in white-label solutions', direction: 'INBOUND', timestamp: new Date(Date.now() - 1800000).toISOString(), isRead: true },
        { id: 'm2', content: 'Great! We have a fantastic agency partner program', direction: 'OUTBOUND', timestamp: new Date(Date.now() - 1700000).toISOString(), isRead: true },
        { id: 'm3', content: 'My clients are going to love this!', direction: 'INBOUND', timestamp: new Date(Date.now() - 900000).toISOString(), isRead: false },
      ]
    },
    {
      id: 'conv3',
      lead: { id: '3', name: 'Priya Patel', avatar: '' },
      platform: 'INSTAGRAM',
      lastMessage: 'How fast can we get this set up?',
      lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
      unreadCount: 1,
      status: 'active',
      assignedTo: 'You',
      tags: ['Influencer'],
    }
  ];

  // 3. PRODUCTS/SERVICES
  const products = [
    {
      id: 'prod1',
      name: 'Enterprise Automation Suite',
      type: 'SERVICE',
      description: 'Complete business automation with AI-powered lead generation, CRM, and analytics',
      costProduction: 5000,
      costPackaging: 0,
      costDelivery: 0,
      suggestedPrice: 25000,
      sellingPrice: 49999,
      profitMargin: 90,
      status: 'ACTIVE',
      sku: 'EAS-001',
      category: 'Premium Services',
      stock: 999,
      posEnabled: true,
      features: ['AI Lead Scoring', 'Multi-platform Integration', '24/7 Support', 'Custom Workflows', 'Advanced Analytics'],
      testimonials: 3,
      rating: 4.9,
      salesCount: 12,
      createdAt: new Date(Date.now() - 8640000000).toISOString(),
    },
    {
      id: 'prod2',
      name: 'TikTok Lead Generation System',
      type: 'SERVICE',
      description: 'Automated TikTok DM to sales pipeline with AI chatbot',
      costProduction: 1200,
      costPackaging: 0,
      costDelivery: 0,
      suggestedPrice: 6000,
      sellingPrice: 8999,
      profitMargin: 86,
      status: 'ACTIVE',
      sku: 'TTLG-001',
      category: 'Social Media',
      stock: 999,
      posEnabled: true,
      features: ['Auto-reply to DMs', 'Lead Qualification', 'CRM Integration', 'Analytics Dashboard'],
      rating: 4.8,
      salesCount: 45,
      createdAt: new Date(Date.now() - 6040000000).toISOString(),
    },
    {
      id: 'prod3',
      name: 'White Label Dashboard License',
      type: 'PRODUCT',
      description: 'Rebrandable automation platform for agencies',
      costProduction: 3000,
      costPackaging: 100,
      costDelivery: 50,
      suggestedPrice: 12000,
      sellingPrice: 14999,
      profitMargin: 79,
      status: 'ACTIVE',
      sku: 'WLD-001',
      category: 'Agency Tools',
      stock: 8,
      posEnabled: true,
      features: ['Custom Branding', 'Client Management', 'White-glove Setup', '6 Months Support'],
      rating: 5.0,
      salesCount: 8,
      createdAt: new Date(Date.now() - 4320000000).toISOString(),
    },
    {
      id: 'prod4',
      name: 'Content Creation Package',
      type: 'SERVICE',
      description: '20 professional videos with captions and posting schedule',
      costProduction: 2500,
      costPackaging: 0,
      costDelivery: 0,
      suggestedPrice: 8000,
      sellingPrice: 9999,
      profitMargin: 75,
      status: 'ACTIVE',
      sku: 'CCP-001',
      category: 'Content',
      stock: 999,
      posEnabled: true,
      features: ['Professional Editing', 'SEO Optimization', 'Platform Optimization', 'Performance Analytics'],
      rating: 4.9,
      salesCount: 28,
      createdAt: new Date(Date.now() - 2592000000).toISOString(),
    },
    {
      id: 'prod5',
      name: 'E-Commerce Automation',
      type: 'SERVICE',
      description: 'Shopify/WooCommerce integration with automated order processing',
      costProduction: 1800,
      costPackaging: 0,      costDelivery: 0,
      suggestedPrice: 7500,
      sellingPrice: 12999,
      profitMargin: 86,
      status: 'ACTIVE',
      sku: 'ECA-001',
      category: 'E-Commerce',
      stock: 999,
      posEnabled: true,
      rating: 4.7,
      salesCount: 19,
      createdAt: new Date(Date.now() - 1728000000).toISOString(),
    }
  ];

  // 4. ORDERS & SALES
  const orders = [
    {
      id: 'ord1',
      orderId: 'ORD-2026-001',
      customer: { name: 'Sarah Mitchell', email: 'sarah.mitchell@techstartup.com', phone: '+27-82-555-0101' },
      items: [{ productId: 'prod1', productName: 'Enterprise Automation Suite', quantity: 1, price: 49999 }],
      subtotal: 49999,
      tax: 7500,
      total: 57499,
      status: 'paid',
      paymentMethod: 'Bank Transfer',
      date: new Date(Date.now() - 172800000).toISOString(),
      deliveryStatus: 'in-progress',
      notes: 'Priority implementation - start next week',
    },
    {
      id: 'ord2',
      orderId: 'ORD-2026-002',
      customer: { name: 'Marcus Johnson', email: 'marcus@growthhackers.co', phone: '+27-83-555-0202' },
      items: [
        { productId: 'prod3', productName: 'White Label Dashboard License', quantity: 1, price: 14999 },
        { productId: 'prod2', productName: 'TikTok Lead Generation System', quantity: 3, price: 8999 }
      ],
      subtotal: 41996,
      tax: 6299,
      total: 48295,
      status: 'pending',
      paymentMethod: 'Pending',
      date: new Date(Date.now() - 86400000).toISOString(),
      deliveryStatus: 'pending',
      notes: 'Agency bundle - waiting for payment confirmation',
    },
    {
      id: 'ord3',
      orderId: 'ORD-2026-003',
      customer: { name: 'Priya Patel', email: 'priya.patel@fashionbrand.com', phone: '+27-84-555-0303' },
      items: [
        { productId: 'prod4', productName: 'Content Creation Package', quantity: 2, price: 9999 },
        { productId: 'prod5', productName: 'E-Commerce Automation', quantity: 1, price: 12999 }
      ],
      subtotal: 32997,
      tax: 4950,
      total: 37947,
      status: 'paid',
      paymentMethod: 'Credit Card',
      date: new Date(Date.now() - 259200000).toISOString(),
      deliveryStatus: 'completed',
    }
  ];

  // 5. INVOICES
  const invoices = [
    {
      id: 'inv1',
      invoiceNumber: 'INV-2026-001',
      client: { name: 'Sarah Mitchell', company: 'Tech Startup Inc.', email: 'sarah.mitchell@techstartup.com' },
      items: [
        { description: 'Enterprise Automation Suite - Initial Setup', quantity: 1, rate: 49999, amount: 49999 },
        { description: 'Onboarding & Training (4 hrs)', quantity: 4, rate: 1500, amount: 6000 }
      ],
      subtotal: 55999,
      tax: 8400,
      total: 64399,
      status: 'paid',
      issueDate: new Date(Date.now() - 259200000).toISOString(),
      dueDate: new Date(Date.now() - 172800000).toISOString(),
      paidDate: new Date(Date.now() - 172800000).toISOString(),
      notes: 'Thank you for your business! Implementation begins Feb 16.',
    },
    {
      id: 'inv2',
      invoiceNumber: 'INV-2026-002',
      client: { name: 'Marcus Johnson', company: 'Growth Hackers Agency', email: 'marcus@growthhackers.co' },
      items: [
        { description: 'White Label Dashboard License', quantity: 1, rate: 14999, amount: 14999 },
        { description: 'TikTok Lead Gen System x3', quantity: 3, rate: 8999, amount: 26997 }
      ],
      subtotal: 41996,
      tax: 6299,
      total: 48295,
      status: 'sent',
      issueDate: new Date(Date.now() - 86400000).toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      notes: 'Agency partner discount applied (15%).',
    },
    {
      id: 'inv3',
      invoiceNumber: 'INV-2026-003',
      client: { name: 'Priya Patel', company: 'Fashion Brand Co.', email: 'priya.patel@fashionbrand.com' },
      items: [
        { description: 'Content Creation Package x2', quantity: 2, rate: 9999, amount: 19998 },
        { description: 'E-Commerce Automation', quantity: 1, rate: 12999, amount: 12999 }
      ],
      subtotal: 32997,
      tax: 4950,
      total: 37947,
      status: 'paid',
      issueDate: new Date(Date.now() - 345600000).toISOString(),
      dueDate: new Date(Date.now() - 259200000).toISOString(),
      paidDate: new Date(Date.now() - 259200000).toISOString(),
    }
  ];

  // 6. AUTOMATIONS
  const automations = [
    {
      id: 'auto1',
      name: 'TikTok DM Auto-Response',
      description: 'Instantly reply to TikTok messages with personalized responses',
      status: 'active',
      trigger: 'New TikTok DM',
      actions: ['Send AI Response', 'Create Lead', 'Notify Sales Team'],
      createdDate: new Date(Date.now() - 8640000000).toISOString(),
      lastTriggered: new Date(Date.now() - 120000).toISOString(),
      triggerCount: 247,
      successRate: 98.4,
      platforms: ['TikTok'],
      tags: ['Lead Gen', 'High Priority'],
    },
    {
      id: 'auto2',
      name: 'Hot Lead Notification',
      description: 'Alert team when lead score exceeds 90',
      status: 'active',
      trigger: 'Lead Score > 90',
      actions: ['Send WhatsApp Alert', 'Create Task', 'Update CRM'],
      createdDate: new Date(Date.now() - 6040000000).toISOString(),
      lastTriggered: new Date(Date.now() - 900000).toISOString(),
      triggerCount: 43,
      successRate: 100,
      platforms: ['WhatsApp', 'CRM'],
      tags: ['Sales', 'Notifications'],
    },
    {
      id: 'auto3',
      name: 'Follow-up Email Sequence',
      description: '3-day automated follow-up for warm leads',
      status: 'active',
      trigger: 'Lead Status = Warm',
      actions: ['Send Email Day 1', 'Send Email Day 3', 'Create Follow-up Task'],
      createdDate: new Date(Date.now() - 4320000000).toISOString(),
      lastTriggered: new Date(Date.now() - 7200000).toISOString(),
      triggerCount: 89,
      successRate: 76.5,
      platforms: ['Email'],
      tags: ['Nurture'],
    },
    {
      id: 'auto4',
      name: 'Invoice Payment Reminder',
      description: 'Send reminders 3 days before and on due date',
      status: 'active',
      trigger: 'Invoice Due Soon',
      actions: ['Send Email Reminder', 'Update Invoice Status'],
      createdDate: new Date(Date.now() - 2592000000).toISOString(),
      lastTriggered: new Date(Date.now() - 86400000).toISOString(),
      triggerCount: 67,
      successRate: 94.2,
      platforms: ['Email'],
      tags: ['Finance', 'Collections'],
    }
  ];

  // 7. ANALYTICS DATA
  const analytics = {
    revenue: {
      total: 198542,
      thisMonth: 150741,
      lastMonth: 89650,
      growth: 68.1,
      chartData: [
        { month: 'Aug', revenue: 45200 },
        { month: 'Sep', revenue: 62800 },
        { month: 'Oct', revenue: 78300 },
        { month: 'Nov', revenue: 89650 },
        { month: 'Dec', revenue: 103500 },
        { month: 'Jan', revenue: 122800 },
        { month: 'Feb', revenue: 150741 }
      ]
    },
    leads: {
      total: 342,
      hot: 47,
      warm: 134,
      cold: 161,
      conversionRate: 13.7,
      sources: [
        { name: 'TikTok', count: 156, conversion: 18.5 },
        { name: 'Instagram', count: 89, conversion: 12.3 },
        { name: 'WhatsApp', count: 54, conversion: 22.2 },
        { name: 'LinkedIn', count: 28, conversion: 25.0 },
        { name: 'Facebook', count: 15, conversion: 6.7 }
      ]
    },
    performance: {
      responseTime: '4.2 mins',
      customerSatisfaction: 94.5,
      activeAutomations: 12,
      tasksCompleted: 287,
      dealsClosed: 28
    }
  };

  // 8. WELLNESS DATA
  const wellness = {
    todayScore: 87,
    weeklyAverage: 84,
    metrics: {
      sleep: { value: 8.2, target: 8, unit: 'hours', trend: 'up' },
      exercise: { value: 45, target: 30, unit: 'mins', trend: 'up' },
      water: { value: 2.1, target: 2.5, unit: 'liters', trend: 'neutral' },
      stress: { value: 3, target: 5, unit: 'level(1-10)', trend: 'down' },
      meditation: { value: 15, target: 10, unit: 'mins', trend: 'up' },
      screenTime: { value: 6.5, target: 8, unit: 'hours', trend: 'down' }
    },
    weeklyData: [
      { day: 'Mon', score: 82, sleep: 7.5, exercise: 30, mood: 8 },
      { day: 'Tue', score: 85, sleep: 8.0, exercise: 45, mood: 8 },
      { day: 'Wed', score: 80, sleep: 7.0, exercise: 0, mood: 6 },
      { day: 'Thu', score: 86, sleep: 8.5, exercise: 60, mood: 9 },
      { day: 'Fri', score: 88, sleep: 8.2, exercise: 45, mood: 9 },
      { day: 'Sat', score: 90, sleep: 9.0, exercise: 30, mood: 10 },
      { day: 'Sun', score: 87, sleep: 8.2, exercise: 45, mood: 9 }
    ],
    recommendations: [
      { type: 'improvement', message: 'Increase water intake by 400ml to meet your goal' },
      { type: 'success', message: 'Great job maintaining 45 mins of exercise!' },
      { type: 'warning', message: 'Wednesday showed a dip - consider scheduling a rest day' }
    ]
  };

  // 9. IDEAS & CONTENT
  const ideas = [
    {
      id: 'idea1',
      title: 'AI-Powered Client Onboarding',
      description: 'Automate the entire client onboarding process with AI chatbot and smart forms',
      category: 'Product',
      status: 'in-progress',
      priority: 'high',
      potentialRevenue: 100000,
      effort: 'medium',
      createdDate: new Date(Date.now() - 604800000).toISOString(),
      tags: ['AI', 'Automation', 'UX'],
      upvotes: 12,
      comments: 5
    },
    {
      id: 'idea2',
      title: 'TikTok Trend Analysis Dashboard',
      description: 'Real-time dashboard showing trending topics, hashtags, and viral content patterns',
      category: 'Feature',
      status: 'planned',
      priority: 'high',
      potentialRevenue: 75000,
      effort: 'high',
      createdDate: new Date(Date.now() - 259200000).toISOString(),
      tags: ['TikTok', 'Analytics', 'Trends'],
      upvotes: 24,
      comments: 8
    },
    {
      id: 'idea3',
      title: 'Video Content Generator',
      description: 'AI tool that creates short-form video scripts based on trending topics',
      category: 'Content',
      status: 'backlog',
      priority: 'medium',
      potentialRevenue: 50000,
      effort: 'high',
      createdDate: new Date(Date.now() - 1209600000).toISOString(),
      tags: ['AI', 'Content', 'Video'],
      upvotes: 18,
      comments: 12
    }
  ];

  // 10. PERFORMANCE METRICS
  const performance = {
    overallScore: 92,
    metrics: [
      { name: 'Sales Performance', score: 94, target: 90, trend: 'up' },
      { name: 'Customer Satisfaction', score: 96, target: 95, trend: 'up' },
      { name: 'Response Time', score: 88, target: 85, trend: 'up' },
      { name: 'Project Completion', score: 91, target: 90, trend: 'stable' },
      { name: 'Team Collaboration', score: 95, target: 90, trend: 'up' }
    ],
    goals: [
      { id: 1, title: 'Close R500k in deals this month', progress: 78, target: 500000, current: 390000, deadline: '2026-02-28' },
      { id: 2, title: 'Onboard 5 enterprise clients', progress: 60, target: 5, current: 3, deadline: '2026-03-31' },
      { id: 3, title: 'Achieve 95% customer satisfaction', progress: 96, target: 95, current: 96, deadline: '2026-02-28' }
    ],
    achievements: [
      { id: 1, title: '🏆 Top Performer', description: 'Closed most deals in Q1', date: '2026-02-01', badge: 'gold' },
      { id: 2, title: '⚡ Speed Demon', description: 'Average response time under 5 minutes', date: '2026-01-15', badge: 'silver' },
      { id: 3, title: '🎯 Goal Crusher', description: 'Hit 3 consecutive monthly targets', date: '2026-01-31', badge: 'platinum' }
    ]
  };

  // Save all data to localStorage
  localStorage.setItem('veltrix_leads', JSON.stringify(leads));
  localStorage.setItem('veltrix_conversations', JSON.stringify(conversations));
  localStorage.setItem('productsList', JSON.stringify(products));
  localStorage.setItem('veltrix_orders', JSON.stringify(orders));
  localStorage.setItem('veltrix_invoices', JSON.stringify(invoices));
  localStorage.setItem('veltrix_automations', JSON.stringify(automations));
  localStorage.setItem('veltrix_analytics', JSON.stringify(analytics));
  localStorage.setItem('veltrix_wellness', JSON.stringify(wellness));
  localStorage.setItem('veltrix_ideas', JSON.stringify(ideas));
  localStorage.setItem('veltrix_performance', JSON.stringify(performance));

  // Mark demo data as initialized
  localStorage.setItem('demoDataInitialized', 'true');

  console.log('✅ Demo data initialized successfully!');
}

// Function to reset demo data
export function resetDemoData() {
  localStorage.removeItem('demoDataInitialized');
  initializeDemoData();
  console.log('🔄 Demo data reset successfully!');
}

// Export individual data loaders for specific modules
export function getLeadsData() {
  const data = localStorage.getItem('veltrix_leads');
  return data ? JSON.parse(data) : [];
}

export function getConversationsData() {
  const data = localStorage.getItem('veltrix_conversations');
  return data ? JSON.parse(data) : [];
}

export function getProductsData() {
  const data = localStorage.getItem('productsList');
  return data ? JSON.parse(data) : [];
}

export function getOrdersData() {
  const data = localStorage.getItem('veltrix_orders');
  return data ? JSON.parse(data) : [];
}

export function getInvoicesData() {
  const data = localStorage.getItem('veltrix_invoices');
  return data ? JSON.parse(data) : [];
}

export function getAutomationsData() {
  const data = localStorage.getItem('veltrix_automations');
  return data ? JSON.parse(data) : [];
}

export function getAnalyticsData() {
  const data = localStorage.getItem('veltrix_analytics');
  return data ? JSON.parse(data) : null;
}

export function getWellnessData() {
  const data = localStorage.getItem('veltrix_wellness');
  return data ? JSON.parse(data) : null;
}

export function getIdeasData() {
  const data = localStorage.getItem('veltrix_ideas');
  return data ? JSON.parse(data) : [];
}

export function getPerformanceData() {
  const data = localStorage.getItem('veltrix_performance');
  return data ? JSON.parse(data) : null;
}
