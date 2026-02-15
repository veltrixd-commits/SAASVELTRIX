'use client';

import { useState } from 'react';
import { Target, Plus, Users, TrendingUp, Clock, DollarSign, ArrowRight, MoreHorizontal, X } from 'lucide-react';

export default function PipelinesPage() {
  const [selectedPipeline, setSelectedPipeline] = useState('sales');
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [showDealDetailModal, setShowDealDetailModal] = useState(false);
  const [showStageDetailModal, setShowStageDetailModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [selectedStage, setSelectedStage] = useState<any>(null);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [newDeal, setNewDeal] = useState({
    name: '',
    value: '',
    probability: 80,
    contact: '',
    stage: 'New Lead',
    source: 'Direct'
  });

  const pipelines = [
    { id: 'sales', name: 'Sales Pipeline', icon: DollarSign, color: 'text-emerald-500', glow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]' },
    { id: 'recruitment', name: 'Recruitment', icon: Users, color: 'text-blue-500', glow: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' },
    { id: 'onboarding', name: 'Client Onboarding', icon: Target, color: 'text-purple-500', glow: 'drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]' }
  ];

  const stages = {
    sales: [
      { name: 'New Lead', count: 23, value: 'R68,500', color: 'bg-blue-100', textColor: 'text-blue-700', deals: [
        { id: 1, name: 'TechStart Solutions', value: 'R15,000', probability: 85, daysInStage: 2, contact: 'Sarah Johnson', source: 'TikTok', email: 'sarah@techstart.com', phone: '+27 11 555 0001', notes: 'Interested in Instagram content creation package for their brand' },
        { id: 2, name: 'Digital Agency Co', value: 'R12,500', probability: 70, daysInStage: 4, contact: 'Michael Chen', source: 'LinkedIn', email: 'michael@digitalagency.com', phone: '+27 11 555 0002', notes: 'Looking forcomprehensive digital marketing solution' },
        { id: 3, name: 'E-Commerce Plus', value: 'R8,000', probability: 60, daysInStage: 1, contact: 'Emma Wilson', source: 'Instagram', email: 'emma@ecommerce.com', phone: '+27 11 555 0003', notes: 'Wants to boost product visibility on social media' }
      ]},
      { name: 'Qualified', count: 18, value: 'R124,000', color: 'bg-cyan-100', textColor: 'text-cyan-700', deals: [
        { id: 4, name: 'Marketing Pro Ltd', value: 'R25,000', probability: 75, daysInStage: 5, contact: 'David Lee', source: 'Referral', email: 'david@marketingpro.com', phone: '+27 11 555 0004', notes: 'Referred by TechStart Solutions, budget approved' },
        { id: 5, name: 'Growth Hackers', value: 'R18,000', probability: 80, daysInStage: 3, contact: 'Lisa Brown', source: 'WhatsApp', email: 'lisa@growthhackers.com', phone: '+27 11 555 0005', notes: 'Ready to schedule demo, high engagement potential' }
      ]},
      { name: 'Demo Scheduled', count: 12, value: 'R89,000', color: 'bg-purple-100', textColor: 'text-purple-700', deals: [
        { id: 6, name: 'Scale Up Inc', value: 'R35,000', probability: 90, daysInStage: 2, contact: 'James Taylor', source: 'TikTok', email: 'james@scaleup.com', phone: '+27 11 555 0006', notes: 'Demo scheduled for next Tuesday at 2 PM' },
        { id: 7, name: 'Innovate Corp', value: 'R22,000', probability: 85, daysInStage: 1, contact: 'Sophie Martin', source: 'Direct', email: 'sophie@innovate.com', phone: '+27 11 555 0007', notes: 'Very impressed with our portfolio, demo tomorrow' }
      ]},
      { name: 'Proposal Sent', count: 8, value: 'R156,000', color: 'bg-orange-100', textColor: 'text-orange-700', deals: [
        { id: 8, name: 'Enterprise Global', value: 'R75,000', probability: 95, daysInStage: 3, contact: 'Robert King', source: 'LinkedIn', email: 'robert@enterprise.com', phone: '+27 11 555 0008', notes: 'Proposal sent with 3 package tiers, awaiting final decision' },
        { id: 9, name: 'Tech Consulting', value: 'R45,000', probability: 90, daysInStage: 2, contact: 'Anna White', source: 'Referral', email: 'anna@techconsult.com', phone: '+27 11 555 0009', notes: 'Custom proposal for their unique requirements' }
      ]},
      { name: 'Negotiation', count: 5, value: 'R98,000', color: 'bg-yellow-100', textColor: 'text-yellow-700', deals: [
        { id: 10, name: 'Future Systems', value: 'R55,000', probability: 85, daysInStage: 4, contact: 'Chris Green', source: 'Instagram', email: 'chris@futuresystems.com', phone: '+27 11 555 0010', notes: 'Negotiating pricing and timeline, very interested' }
      ]},
      { name: 'Closed Won', count: 15, value: 'R245,000', color: 'bg-green-100', textColor: 'text-green-700', deals: [
        { id: 11, name: 'Success Partners', value: 'R85,000', probability: 100, daysInStage: 0, contact: 'Maria Garcia', source: 'WhatsApp', email: 'maria@success.com', phone: '+27 11 555 0011', notes: 'Contract signed! Starting next week' },
        { id: 12, name: 'Velocity Group', value: 'R65,000', probability: 100, daysInStage: 0, contact: 'Tom Anderson', source: 'Direct', email: 'tom@velocity.com', phone: '+27 11 555 0012', notes: 'Deal closed, onboarding in progress' }
      ]}
    ]
  };

  const stats = [
    { label: 'Total Pipeline Value', value: 'R780,500', icon: DollarSign, color: 'text-emerald-500', glow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]' },
    { label: 'Active Deals', value: '81', icon: Target, color: 'text-blue-500', glow: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' },
    { label: 'Win Rate', value: '68%', icon: TrendingUp, color: 'text-purple-500', glow: 'drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]' },
    { label: 'Avg. Deal Time', value: '18 days', icon: Clock, color: 'text-orange-500', glow: 'drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]' }
  ];

  const currentStages = stages[selectedPipeline] || stages.sales;

  // Get unique sources and calculate stats
  const allDeals = currentStages.flatMap((stage: any) => stage.deals);
  const allSources = Array.from(new Set(allDeals.map((deal: any) => deal.source))) as string[];
  
  const sourceStats = allSources.map((source: string) => {
    const sourceDeals = allDeals.filter((d: any) => d.source === source);
    const totalValue = sourceDeals.reduce((sum: number, d: any) => {
      const value = parseInt(d.value.replace(/[^0-9]/g, ''));
      return sum + value;
    }, 0);
    return { source, count: sourceDeals.length, value: totalValue };
  });

  // Filter stages by source
  const filteredStages = sourceFilter === 'all' 
    ? currentStages 
    : currentStages.map((stage: any) => ({
        ...stage,
        deals: stage.deals.filter((deal: any) => deal.source === sourceFilter)
      }));

  // Calculate conversion rate between stages
  const getConversionRate = (fromIndex: number, toIndex: number) => {
    if (fromIndex >= filteredStages.length - 1) return null;
    const fromStage = filteredStages[fromIndex];
    const toStage = filteredStages[toIndex];
    if (!fromStage.deals.length) return 0;
    return Math.round((toStage.deals.length / fromStage.deals.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Target className="w-8 h-8 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.7)] animate-pulse" />
            Sales Pipeline
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage your deals through every stage</p>
        </div>
        <button 
          onClick={() => setShowAddDealModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:scale-105 transition-all shadow-lg hover:shadow-2xl flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Deal
        </button>
      </div>

      {/* Pipeline Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {pipelines.map((pipeline) => {
          const IconComponent = pipeline.icon;
          return (
            <button
              key={pipeline.id}
              onClick={() => setSelectedPipeline(pipeline.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                selectedPipeline === pipeline.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'glass-card hover:scale-105'
              }`}
            >
              <IconComponent className={`w-5 h-5 ${selectedPipeline === pipeline.id ? 'text-white' : pipeline.color} ${pipeline.glow}`} />
              {pipeline.name}
            </button>
          );
        })}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="glass-card rounded-2xl p-6 hover:scale-105 transition-all">
              <IconComponent className={`w-8 h-8 ${stat.color} ${stat.glow} mb-3`} />
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Source Filter */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Filter by Source:
          </span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSourceFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${ 
                sourceFilter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'glass-button hover:scale-105'
              }`}
            >
              All Sources ({allDeals.length})
            </button>
            {sourceStats.map(({ source, count, value }) => (
              <button
                key={source}
                onClick={() => setSourceFilter(source)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  sourceFilter === source
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'glass-button hover:scale-105'
                }`}
              >
                {source} ({count}) · R{(value / 1000).toFixed(1)}k
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {filteredStages.map((stage: any, stageIndex: number) => (
            <div key={stageIndex} className="flex items-start gap-3">
              <div className="w-80 flex-shrink-0">
                <div 
                  onClick={() => {
                    setSelectedStage(stage);
                    setShowStageDetailModal(true);
                  }}
                  className={`${stage.color} rounded-t-2xl p-4 cursor-pointer hover:scale-105 transition-all group`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-bold ${stage.textColor} text-lg group-hover:underline`}>{stage.name}</h3>
                    <span className={`${stage.textColor} font-semibold text-sm px-2 py-1 bg-white/50 rounded-lg`}>
                      {stage.deals.length}
                    </span>
                  </div>
                  <p className={`${stage.textColor} font-bold text-xl`}>{stage.value}</p>
                  <p className="text-xs text-gray-600 mt-1">Click to view all deals</p>
                </div>
              
                <div className="glass-card rounded-b-2xl p-4 space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto custom-scrollbar">
                  {stage.deals.map((deal: any, dealIndex: number) => (
                    <div 
                      key={dealIndex} 
                      onClick={() => {
                        setSelectedDeal(deal);
                        setShowDealDetailModal(true);
                      }}
                      className="glass-button p-4 rounded-xl hover:scale-[1.02] transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                              {deal.name}
                            </h4>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-medium">
                              {deal.source}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="p-1 hover:bg-white/50 rounded-lg transition-all"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Value</span>
                          <span className="font-bold text-emerald-600">{deal.value}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Probability</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{deal.probability}%</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${deal.probability}%` }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-white/20">
                          <span>{deal.contact}</span>
                          <span>{deal.daysInStage} days</span>
                        </div>
                      </div>
                    </div>
                  ))}
                
                <button 
                  onClick={() => {
                    setNewDeal({...newDeal, stage: stage.name});
                    setShowAddDealModal(true);
                  }}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-500 hover:text-primary-600 transition-all flex items-center justify-center gap-2 group"
                >
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Add Deal
                </button>
              </div>
            </div>
            
            {/* Conversion Rate Arrow */}
            {stageIndex < filteredStages.length - 1 && (
              <div className="flex flex-col items-center justify-center pt-20 flex-shrink-0">
                {(() => {
                  const rate = getConversionRate(stageIndex, stageIndex + 1);
                  return (
                    <>
                      <div className="text-center mb-2">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Conversion</div>
                        <div className={`text-lg font-bold ${
                          rate >= 70 ? 'text-green-500' :
                          rate >= 40 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>
                          {rate}%
                        </div>
                      </div>
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </>
                  );
                })()}
              </div>
            )}
          </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="glass-button p-4 rounded-xl hover:scale-105 transition-all text-left group">
            <TrendingUp className="w-6 h-6 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-gray-900 dark:text-white">View Analytics</p>
            <p className="text-sm text-gray-600 mt-1">Detailed pipeline metrics</p>
          </button>
          <button className="glass-button p-4 rounded-xl hover:scale-105 transition-all text-left group">
            <Users className="w-6 h-6 text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-gray-900 dark:text-white">Assign Deals</p>
            <p className="text-sm text-gray-600 mt-1">Distribute to team members</p>
          </button>
          <button className="glass-button p-4 rounded-xl hover:scale-105 transition-all text-left group">
            <Clock className="w-6 h-6 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)] mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-gray-900 dark:text-white">Set Reminders</p>
            <p className="text-sm text-gray-600 mt-1">Never miss a follow-up</p>
          </button>
        </div>
      </div>

      {/* Add Deal Modal */}
      {showAddDealModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Deal</h3>
              <button onClick={() => setShowAddDealModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deal Name *</label>
                <input
                  type="text"
                  value={newDeal.name}
                  onChange={(e) => setNewDeal({...newDeal, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., TechStart Solutions"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deal Value (R) *</label>
                <input
                  type="text"
                  value={newDeal.value}
                  onChange={(e) => setNewDeal({...newDeal, value: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 15,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Name *</label>
                <input
                  type="text"
                  value={newDeal.contact}
                  onChange={(e) => setNewDeal({...newDeal, contact: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Sarah Johnson"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Probability (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newDeal.probability}
                  onChange={(e) => setNewDeal({...newDeal, probability: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>0%</span>
                  <span className="font-semibold text-blue-600">{newDeal.probability}%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stage</label>
                <select
                  value={newDeal.stage}
                  onChange={(e) => setNewDeal({...newDeal, stage: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="New Lead">New Lead</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Demo Scheduled">Demo Scheduled</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closed Won">Closed Won</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Source *</label>
                <select
                  value={newDeal.source}
                  onChange={(e) => setNewDeal({...newDeal, source: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram">Instagram</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Referral">Referral</option>
                  <option value="Direct">Direct</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  if (newDeal.name && newDeal.value && newDeal.contact) {
                    alert(`Deal "${newDeal.name}" added to ${newDeal.stage}!`);
                    setShowAddDealModal(false);
                    setNewDeal({
                      name: '',
                      value: '',
                      probability: 80,
                      contact: '',
                      stage: 'New Lead',
                      source: 'Direct'
                    });
                  }
                }}
                disabled={!newDeal.name || !newDeal.value || !newDeal.contact}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Deal
              </button>
              <button
                onClick={() => setShowAddDealModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deal Detail Modal */}
      {showDealDetailModal && selectedDeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl my-8 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Deal Details</h3>
              <button 
                onClick={() => setShowDealDetailModal(false)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Deal Header */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedDeal.name}</h4>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{selectedDeal.value}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium">
                    {selectedDeal.source}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>🎯 Probability: <span className="font-bold text-gray-900 dark:text-white">{selectedDeal.probability}%</span></span>
                  <span>⏱️ {selectedDeal.daysInStage} days in stage</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Contact Person</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{selectedDeal.contact}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{selectedDeal.email}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{selectedDeal.phone}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Source</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{selectedDeal.source}</div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📝 Notes:</div>
                <p className="text-gray-900 dark:text-white">{selectedDeal.notes}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:scale-105 transition-all">
                  ✏️ Edit Deal
                </button>
                <button className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                  ➡️ Move Stage
                </button>
                <button className="px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stage Detail Modal */}
      {showStageDetailModal && selectedStage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl my-8 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStage.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedStage.deals.length} deals · Total value: {selectedStage.value}
                </p>
              </div>
              <button 
                onClick={() => setShowStageDetailModal(false)} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Deals List */}
            <div className="space-y-3">
              {selectedStage.deals.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No deals in this stage</p>
                </div>
              ) : (
                selectedStage.deals.map((deal: any) => (
                  <div 
                    key={deal.id}
                    onClick={() => {
                      setSelectedDeal(deal);
                      setShowStageDetailModal(false);
                      setShowDealDetailModal(true);
                    }}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer border border-white/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-gray-900 dark:text-white">{deal.name}</h4>
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-medium rounded-full">
                            {deal.source}
                          </span>
                          <span className="text-sm text-gray-500">• {deal.contact}</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="font-bold text-blue-600 dark:text-blue-400">{deal.value}</span>
                          <span className="text-gray-600 dark:text-gray-400">🎯 {deal.probability}% probability</span>
                          <span className="text-gray-600 dark:text-gray-400">⏱️ {deal.daysInStage} days</span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
