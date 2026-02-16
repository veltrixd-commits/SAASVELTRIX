// Leads Management Page
'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlatformBadge } from '@/components/PlatformBadge';
import { recordCtaClick } from '@/lib/analytics';

type CtaMetadata = Record<string, string | number | boolean | null | undefined>;

export default function LeadsPage() {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', source: 'TikTok' });
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New state for advanced features
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [respondingToLead, setRespondingToLead] = useState<any>(null);
  const [responseText, setResponseText] = useState('');
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [viewingComments, setViewingComments] = useState<any>(null);
  const [replyingToComment, setReplyingToComment] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const logLeadCta = useCallback((event: { id: string; label: string; surface?: string; metadata?: CtaMetadata; destination?: string }) => {
    recordCtaClick({
      id: event.id,
      label: event.label,
      surface: event.surface || 'leads-hq',
      destination: event.destination,
      metadata: event.metadata,
    });
  }, []);

  const openAddLeadModal = () => {
    logLeadCta({
      id: 'leads-add-open',
      label: 'Open add lead modal',
      surface: 'leads-header',
    });
    setShowAddModal(true);
  };

  const cancelAddLeadModal = () => {
    logLeadCta({
      id: 'leads-add-cancel',
      label: 'Cancel add lead modal',
      surface: 'leads-add-modal',
    });
    setShowAddModal(false);
  };

  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
    logLeadCta({
      id: `leads-filter-status-${status.toLowerCase()}`,
      label: 'Filter leads by status',
      surface: 'leads-stats',
      metadata: { status },
    });
  };

  const handleSourceFilterChange = (value: string) => {
    setSourceFilter(value);
    logLeadCta({
      id: `leads-filter-source-${value.toLowerCase()}`,
      label: 'Filter leads by source',
      surface: 'leads-filters',
      metadata: { source: value },
    });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    logLeadCta({
      id: `leads-sort-${value}`,
      label: 'Change leads sort order',
      surface: 'leads-filters',
      metadata: { sort: value },
    });
  };

  const handleDateRangeChange = (range: string) => {
    setDateFilter(range);
    logLeadCta({
      id: `leads-date-range-${range}`,
      label: 'Apply lead date window',
      surface: 'leads-filters',
      metadata: { range },
    });
  };

  const handleRespondToLead = (lead: any) => {
    logLeadCta({
      id: `leads-response-open-${lead.id}`,
      label: 'Open lead response modal',
      surface: 'leads-table-actions',
      metadata: { leadId: lead.id, status: lead.status, source: lead.source },
    });
    setRespondingToLead(lead);
    setShowResponseModal(true);
  };

  const handleViewLeadComments = (lead: any) => {
    logLeadCta({
      id: `leads-comments-open-${lead.id}`,
      label: 'View lead comments',
      surface: 'leads-table-actions',
      metadata: { leadId: lead.id, status: lead.status },
    });
    setViewingComments(lead);
    setShowCommentsModal(true);
  };

  const handleCloseResponseModal = () => {
    if (respondingToLead) {
      logLeadCta({
        id: `leads-response-cancel-${respondingToLead.id}`,
        label: 'Cancel lead response',
        surface: 'leads-response-modal',
        metadata: { leadId: respondingToLead.id },
      });
    }
    setShowResponseModal(false);
    setRespondingToLead(null);
    setResponseText('');
  };

  const handleCloseCommentsModal = () => {
    if (viewingComments) {
      logLeadCta({
        id: `leads-comments-close-${viewingComments.id}`,
        label: 'Close comments modal',
        surface: 'leads-comments-modal',
        metadata: { leadId: viewingComments.id },
      });
    }
    setShowCommentsModal(false);
    setViewingComments(null);
    setReplyingToComment(null);
    setReplyText('');
  };

  const handleOpenReplyBox = (commentId: number) => {
    logLeadCta({
      id: `leads-comment-reply-init-${commentId}`,
      label: 'Open reply editor',
      surface: 'leads-comments-modal',
      metadata: { leadId: viewingComments?.id, commentId },
    });
    setReplyingToComment(commentId);
  };

  const handleCancelReply = () => {
    if (replyingToComment !== null) {
      logLeadCta({
        id: `leads-comment-reply-cancel-${replyingToComment}`,
        label: 'Cancel reply draft',
        surface: 'leads-comments-modal',
        metadata: { leadId: viewingComments?.id, commentId: replyingToComment },
      });
    }
    setReplyingToComment(null);
    setReplyText('');
  };

  // Load leads from localStorage on mount
  useEffect(() => {
    const savedLeads = localStorage.getItem('veltrix_leads');
    if (savedLeads) {
      setLeads(JSON.parse(savedLeads));
    } else {
      // Initialize with default leads
      const defaultLeads = getDefaultLeads();
      setLeads(defaultLeads);
      localStorage.setItem('veltrix_leads', JSON.stringify(defaultLeads));
    }
    setIsLoading(false);
  }, []);

  // Save leads to localStorage whenever they change
  useEffect(() => {
    if (leads.length > 0) {
      localStorage.setItem('veltrix_leads', JSON.stringify(leads));
    }
  }, [leads]);

  function getDefaultLeads() {
    return [
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+27-555-0101',
        source: 'TikTok',
        sourceIcon: '🎵',
        status: 'HOT',
        score: 95,
        intent: 'Pricing Inquiry',
        lastContact: '5 mins ago',
        created: '2024-01-15',
        notes: 'Very interested in premium package',
        comments: [
          { id: 1, text: 'Initial contact via TikTok DM', author: 'System', timestamp: '2024-01-15 10:00', replies: [] },
          { id: 2, text: 'Sent pricing sheet', author: 'You', timestamp: '2024-01-15 10:05', replies: [
            { id: 3, text: 'Waiting for response', author: 'You', timestamp: '2024-01-15 10:10' }
          ] }
        ],
      },
      {
        id: 2,
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '+27-555-0102',
        source: 'WhatsApp',
        sourceIcon: '💬',
        status: 'HOT',
        score: 92,
        intent: 'Demo Request',
        lastContact: '12 mins ago',
        created: '2024-01-15',
        notes: 'Wants to book a demo this week',
        comments: [
          { id: 1, text: 'Interested in enterprise plan', author: 'System', timestamp: '2024-01-15 09:48', replies: [] }
        ],
      },
      {
        id: 3,
        name: 'Emma Williams',
        email: 'emma.williams@email.com',
        phone: '+27-555-0103',
        source: 'Instagram',
        sourceIcon: '📸',
        status: 'HOT',
        score: 88,
        intent: 'Service Question',
        lastContact: '23 mins ago',
        created: '2024-01-15',
        notes: 'Asked about implementation timeline',
      },
      {
        id: 4,
        name: 'James Brown',
        email: 'james.brown@email.com',
        phone: '+27-555-0104',
        source: 'Facebook',
        sourceIcon: '👥',
        status: 'WARM',
        score: 72,
        intent: 'General Inquiry',
        lastContact: '1 hour ago',
        created: '2024-01-14',
        notes: 'Interested but needs budget approval',
      },
      {
        id: 5,
        name: 'Sophia Martinez',
        email: 'sophia.m@email.com',
        phone: '+27-555-0105',
        source: 'LinkedIn',
        sourceIcon: '💼',
        status: 'WARM',
        score: 68,
        intent: 'Partnership',
        lastContact: '2 hours ago',
        created: '2024-01-14',
        notes: 'Looking for business partnership',
      },
      {
        id: 6,
        name: 'David Lee',
        email: 'david.lee@email.com',
        phone: '+27-555-0106',
        source: 'TikTok',
        sourceIcon: '🎵',
        status: 'COLD',
        score: 45,
        intent: 'Info Request',
        lastContact: '3 days ago',
        created: '2024-01-12',
        notes: 'Downloaded brochure, no response yet',
      },
      {
        id: 7,
        name: 'Olivia Taylor',
        email: 'olivia.t@email.com',
        phone: '+27-555-0107',
        source: 'WhatsApp',
        sourceIcon: '💬',
        status: 'WARM',
        score: 75,
        intent: 'Pricing Inquiry',
        lastContact: '1 day ago',
        created: '2024-01-13',
        notes: 'Comparing with competitors',
      },
      {
        id: 8,
        name: 'Ethan Taylor',
        email: 'ethan.taylor@email.com',
        phone: '+27-555-0108',
        source: 'Instagram',
        sourceIcon: '📸',
        status: 'NEW',
        score: 60,
        intent: 'General Inquiry',
        lastContact: '10 mins ago',
        created: '2024-01-15',
        notes: 'Just submitted form',
      },
      {
        id: 9,
        name: 'Ava Anderson',
        email: 'ava.anderson@email.com',
        phone: '+27-555-0109',
        source: 'Facebook',
        sourceIcon: '👥',
        status: 'NEW',
        score: 55,
        intent: 'Product Info',
        lastContact: '30 mins ago',
        created: '2024-01-15',
        notes: 'Asking about features',
      },
      {
        id: 10,
        name: 'Noah Garcia',
        email: 'noah.garcia@email.com',
        phone: '+27-555-0110',
        source: 'TikTok',
        sourceIcon: '🎵',
        status: 'WARM',
        score: 70,
        intent: 'Demo Request',
        lastContact: '5 hours ago',
        created: '2024-01-14',
        notes: 'Wants video demo',
      },
    ];
  }

  // Add new lead
  const addLead = () => {
    const lead = {
      id: Date.now(),
      ...newLead,
      status: 'NEW',
      score: 50,
      intent: 'General Inquiry',
      lastContact: 'Just now',
      created: new Date().toISOString().split('T')[0],
      notes: 'New lead added'
    };
    
    logLeadCta({
      id: 'leads-save-new',
      label: 'Save new lead',
      surface: 'leads-add-modal',
      metadata: { source: lead.source },
    });
    
    setLeads([...leads, lead]);
    setNewLead({ name: '', email: '', phone: '', source: 'TikTok' });
    setShowAddModal(false);
  };

  // Edit lead
  const openEditModal = (lead: any) => {
    logLeadCta({
      id: `leads-edit-open-${lead.id}`,
      label: 'Open edit lead modal',
      surface: 'leads-table-actions',
      metadata: { leadId: lead.id, status: lead.status, source: lead.source },
    });
    setEditingLead({...lead});
    setShowEditModal(true);
  };

  const updateLead = () => {
    if (editingLead) {
      logLeadCta({
        id: `leads-edit-save-${editingLead.id}`,
        label: 'Save lead edits',
        surface: 'leads-edit-modal',
        metadata: { leadId: editingLead.id, status: editingLead.status },
      });
    }
    setLeads(leads.map(l => l.id === editingLead.id ? editingLead : l));
    setShowEditModal(false);
    setEditingLead(null);
  };

  // Delete lead
  const deleteLead = (id: number) => {
    const targetLead = leads.find((l) => l.id === id);
    logLeadCta({
      id: `leads-delete-request-${id}`,
      label: 'Attempt delete lead',
      surface: 'leads-table-actions',
      metadata: { leadId: id, status: targetLead?.status },
    });
    if (confirm('Are you sure you want to delete this lead?')) {
      setLeads(leads.filter(l => l.id !== id));
      logLeadCta({
        id: `leads-delete-confirmed-${id}`,
        label: 'Lead deleted',
        surface: 'leads-table-actions',
        metadata: { leadId: id },
      });
    }
  };

  // Add response to lead
  const addResponse = () => {
    if (!respondingToLead || !responseText.trim()) return;
    
    const updatedLeads = leads.map(lead => {
      if (lead.id === respondingToLead.id) {
        const newComment = {
          id: Date.now(),
          text: responseText,
          author: 'You',
          timestamp: new Date().toLocaleString(),
          replies: []
        };
        return {
          ...lead,
          comments: [...(lead.comments || []), newComment],
          lastContact: 'Just now'
        };
      }
      return lead;
    });
    
    setLeads(updatedLeads);
    setResponseText('');
    setShowResponseModal(false);
    setRespondingToLead(null);
    logLeadCta({
      id: `leads-response-send-${respondingToLead.id}`,
      label: 'Send lead response',
      surface: 'leads-response-modal',
      metadata: { leadId: respondingToLead.id, source: respondingToLead.source },
    });
    alert('Response sent successfully!');
  };
  
  // Add reply to comment
  const addReply = (commentId: number) => {
    if (!viewingComments || !replyText.trim()) return;
    
    const updatedLeads = leads.map(lead => {
      if (lead.id === viewingComments.id) {
        const updatedComments = lead.comments.map((comment: any) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), {
                id: Date.now(),
                text: replyText,
                author: 'You',
                timestamp: new Date().toLocaleString()
              }]
            };
          }
          return comment;
        });
        return { ...lead, comments: updatedComments };
      }
      return lead;
    });
    
    setLeads(updatedLeads);
    setReplyText('');
    setReplyingToComment(null);
    logLeadCta({
      id: `leads-comment-reply-${commentId}`,
      label: 'Reply to lead comment',
      surface: 'leads-comments-modal',
      metadata: { leadId: viewingComments.id, commentId },
    });
  };
  
  // Filter leads with date range
  const filteredLeads = leads.filter(lead => {
    const matchesStatus = filterStatus === 'ALL' || lead.status === filterStatus;
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.source.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Source filter
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    
    // Date filter
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const leadDate = new Date(lead.created);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - leadDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dateFilter === 'today') matchesDate = daysDiff === 0;
      else if (dateFilter === 'week') matchesDate = daysDiff <= 7;
      else if (dateFilter === 'month') matchesDate = daysDiff <= 30;
    }
    
    return matchesStatus && matchesSearch && matchesSource && matchesDate;
  });
  
  // Sort leads
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (sortBy === 'score-high') return b.score - a.score;
    if (sortBy === 'score-low') return a.score - b.score;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    // Default: recent (by created date)
    return new Date(b.created).getTime() - new Date(a.created).getTime();
  });

  // Stats
  const stats = {
    total: leads.length,
    hot: leads.filter(l => l.status === 'HOT').length,
    warm: leads.filter(l => l.status === 'WARM').length,
    cold: leads.filter(l => l.status === 'COLD').length,
    new: leads.filter(l => l.status === 'NEW').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Syncing pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">👥 Pipeline Triage HQ</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Qualify, reply, and move real buyers forward before momentum dies.</p>
        </div>
        <button 
          onClick={openAddLeadModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          + Add lead now
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Leads" value={stats.total} color="blue" active={filterStatus === 'ALL'} onClick={() => handleStatusFilter('ALL')} />
        <StatCard label="🔥 Hot" value={stats.hot} color="red" active={filterStatus === 'HOT'} onClick={() => handleStatusFilter('HOT')} />
        <StatCard label="Warm" value={stats.warm} color="orange" active={filterStatus === 'WARM'} onClick={() => handleStatusFilter('WARM')} />
        <StatCard label="Cold" value={stats.cold} color="gray" active={filterStatus === 'COLD'} onClick={() => handleStatusFilter('COLD')} />
        <StatCard label="✨ New" value={stats.new} color="green" active={filterStatus === 'NEW'} onClick={() => handleStatusFilter('NEW')} />
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Hunt leads by name, email, or platform—no lag."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select 
              value={sourceFilter}
              onChange={(e) => handleSourceFilterChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Sources</option>
              <option value="TikTok">TikTok</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="LinkedIn">LinkedIn</option>
            </select>
            <select 
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="recent">Sort by: Recent</option>
              <option value="score-high">Sort by: Score (High)</option>
              <option value="score-low">Sort by: Score (Low)</option>
              <option value="name">Sort by: Name</option>
            </select>
          </div>
          
          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">📅 Show activity from:</span>
            <div className="flex gap-2">
              {['all', 'today', 'week', 'month'].map(range => (
                <button
                  key={range}
                  onClick={() => handleDateRangeChange(range)}
                  className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                    dateFilter === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {range === 'all' ? 'All Time' : range === 'today' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Card View */}
      <div className="block lg:hidden space-y-4">
        {sortedLeads.map(lead => (
          <LeadCard 
            key={lead.id} 
            lead={lead} 
            onEdit={openEditModal} 
            onDelete={deleteLead}
            onRespond={handleRespondToLead}
            onViewComments={handleViewLeadComments}
          />
        ))}
      </div>

      {/* Desktop: Table View */}
      <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Lead</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Source</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Score</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Intent</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Last Contact</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedLeads.map(lead => (
                <LeadRow 
                  key={lead.id} 
                  lead={lead} 
                  onEdit={openEditModal} 
                  onDelete={deleteLead}
                  onRespond={handleRespondToLead}
                  onViewComments={handleViewLeadComments}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Info */}
      <div className="text-center text-gray-600 dark:text-gray-400">
        Showing {sortedLeads.length} of {leads.length} leads
        {dateFilter !== 'all' && ` (filtered by: ${dateFilter})`}
        {sourceFilter !== 'all' && ` (source: ${sourceFilter})`}
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Capture a fresh lead</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                  placeholder="+27-555-0123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Source</label>
                <select
                  value={newLead.source}
                  onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                >
                  <option value="TikTok">TikTok</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="LinkedIn">LinkedIn</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={addLead}
                disabled={!newLead.name || !newLead.email}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save lead
              </button>
              <button
                onClick={cancelAddLeadModal}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditModal && editingLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Lead</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={editingLead.name}
                  onChange={(e) => setEditingLead({...editingLead, name: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={editingLead.email}
                  onChange={(e) => setEditingLead({...editingLead, email: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={editingLead.phone}
                  onChange={(e) => setEditingLead({...editingLead, phone: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  value={editingLead.status}
                  onChange={(e) => setEditingLead({...editingLead, status: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                >
                  <option value="NEW">New</option>
                  <option value="HOT">Hot</option>
                  <option value="WARM">Warm</option>
                  <option value="COLD">Cold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Source</label>
                <select
                  value={editingLead.source}
                  onChange={(e) => setEditingLead({...editingLead, source: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                >
                  <option value="TikTok">TikTok</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="LinkedIn">LinkedIn</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Score (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingLead.score}
                  onChange={(e) => setEditingLead({...editingLead, score: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={updateLead}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Response Modal */}
      {showResponseModal && respondingToLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              💬 Respond to {respondingToLead.name}
            </h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4 text-sm">
              <div className="font-medium">{respondingToLead.email}</div>
              <div className="text-gray-600 dark:text-gray-400">{respondingToLead.source} • {respondingToLead.intent}</div>
            </div>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={6}
              placeholder="Type your response here..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCloseResponseModal}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={addResponse}
                disabled={!responseText.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Response
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Comments Modal */}
      {showCommentsModal && viewingComments && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                💬 Comments for {viewingComments.name}
              </h3>
              <button
                onClick={handleCloseCommentsModal}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4 text-sm">
              <div className="font-medium">{viewingComments.email}</div>
              <div className="text-gray-600 dark:text-gray-400">Status: {viewingComments.status} • Score: {viewingComments.score}</div>
            </div>
            
            {viewingComments.comments && viewingComments.comments.length > 0 ? (
              <div className="space-y-4">
                {viewingComments.comments.map((comment: any) => (
                  <div key={comment.id} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">{comment.author}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{comment.timestamp}</div>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{comment.text}</p>
                    
                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-6 space-y-2 mt-3 border-l-2 border-blue-200 dark:border-blue-700 pl-4">
                        {comment.replies.map((reply: any) => (
                          <div key={reply.id} className="bg-blue-50 dark:bg-blue-900/20 rounded p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-gray-900 dark:text-white">{reply.author}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{reply.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{reply.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Reply Form */}
                    {replyingToComment === comment.id ? (
                      <div className="mt-3 ml-6">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={2}
                          placeholder="Type your reply..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              addReply(comment.id);
                              // Refresh the viewing comments
                              const updated = leads.find(l => l.id === viewingComments.id);
                              if (updated) setViewingComments(updated);
                            }}
                            disabled={!replyText.trim()}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                          >
                            Reply
                          </button>
                          <button
                            onClick={handleCancelReply}
                            className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenReplyBox(comment.id)}
                        className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline mt-2"
                      >
                        💬 Reply
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No touchpoints logged. Drop a response and restart momentum.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, active, onClick }: any) {
  const colors = {
    blue: active ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    red: active ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200',
    orange: active ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    gray: active ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    green: active ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200',
  };

  return (
    <button
      onClick={onClick}
      className={`${colors[color]} rounded-lg p-4 text-center transition-all cursor-pointer border-2 ${
        active ? 'border-gray-900 shadow-lg' : 'border-transparent'
      }`}
    >
      <div className="text-2xl sm:text-3xl font-bold mb-1">{value}</div>
      <div className="text-xs sm:text-sm font-medium">{label}</div>
    </button>
  );
}

function LeadCard({ lead, onEdit, onDelete, onRespond, onViewComments }: any) {
  const statusColors = {
    HOT: 'bg-red-100 text-red-800 border-red-300',
    WARM: 'bg-orange-100 text-orange-800 border-orange-300',
    COLD: 'bg-gray-100 text-gray-800 border-gray-300',
    NEW: 'bg-green-100 text-green-800 border-green-300',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{lead.name}</h3>
          <p className="text-sm text-gray-500">{lead.email}</p>
          <p className="text-sm text-gray-500">{lead.phone}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[lead.status]}`}>
          {lead.status}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        <PlatformBadge platform={lead.source} size="xs" />
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
          {lead.intent}
        </span>
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
          Score: {lead.score}
        </span>
      </div>

      <div className="text-xs text-gray-500 mb-3">
        Last contact: {lead.lastContact}
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => onRespond(lead)}
          className="flex-1 px-3 py-2 bg-green-600 text-white rounded font-medium text-sm hover:bg-green-700"
        >
          ✉️ Respond
        </button>
        <button 
          onClick={() => onViewComments(lead)}
          className="px-3 py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700"
        >
          💬 {lead.comments?.length || 0}
        </button>
        <button 
          onClick={() => onEdit(lead)}
          className="px-3 py-2 bg-gray-600 text-white rounded font-medium text-sm hover:bg-gray-700"
        >
          ✏️
        </button>
        <button 
          onClick={() => onDelete(lead.id)}
          className="px-3 py-2 bg-red-600 text-white rounded font-medium text-sm hover:bg-red-700"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

function LeadRow({ lead, onEdit, onDelete, onRespond, onViewComments }: any) {
  const statusColors = {
    HOT: 'bg-red-100 text-red-800',
    WARM: 'bg-orange-100 text-orange-800',
    COLD: 'bg-gray-100 text-gray-800',
    NEW: 'bg-green-100 text-green-800',
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-6">
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{lead.name}</div>
          <div className="text-sm text-gray-500">{lead.email}</div>
          <div className="text-xs text-gray-400">{lead.phone}</div>
        </div>
      </td>
      <td className="py-4 px-6">
        <PlatformBadge platform={lead.source} size="xs" />
      </td>
      <td className="py-4 px-6">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusColors[lead.status]}`}>
          {lead.status}
        </span>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
            <div 
              className={`h-full rounded-full ${lead.score >= 85 ? 'bg-red-500' : lead.score >= 70 ? 'bg-orange-500' : 'bg-gray-400'}`}
              style={{ width: `${lead.score}%` }}
            />
          </div>
          <span className="text-sm font-semibold">{lead.score}</span>
        </div>
      </td>
      <td className="py-4 px-6 text-sm">{lead.intent}</td>
      <td className="py-4 px-6 text-sm text-gray-600">{lead.lastContact}</td>
      <td className="py-4 px-6">
        <div className="flex gap-2">
          <button 
            onClick={() => onRespond(lead)}
            className="px-3 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
            title="Send Response"
          >
            ✉️
          </button>
          <button 
            onClick={() => onViewComments(lead)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 relative"
            title="View Comments"
          >
            💬
            {lead.comments?.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {lead.comments.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => onEdit(lead)}
            className="px-3 py-1.5 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700"
            title="Edit Lead"
          >
            ✏️
          </button>
          <button 
            onClick={() => onDelete(lead.id)}
            className="px-3 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700"
            title="Delete Lead"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );
}

