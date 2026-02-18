// User Settings & Profile - Comprehensive settings management
'use client';

import { useState, useEffect } from 'react';
import { AvatarImage } from '@/components/AvatarImage';
import { User, Building2, Target, Briefcase, Save, CheckCircle, TrendingUp, DollarSign, Users as UsersIcon, Heart, Video, Shield, Lock, Eye, EyeOff, Sparkles, Bell, Key, CreditCard, Globe, Download, Upload, Trash2, LogOut, Smartphone, Mail, Link as LinkIcon, Moon, Sun, Code, Zap, AlertCircle, Settings as SettingsIcon, Clock, ArrowRight } from 'lucide-react';
import {
  canCurrentUserManageAiAutomationPermissions,
  getTeamMemberAiAutomationPermission,
  setTeamMemberAiAutomationPermission,
} from '@/lib/accessControl';
import {
  getCompanyByAdminEmail,
  getCompanyByCode,
  getPendingCompanyRequests,
  approveEmployeeWithAuthCode,
} from '@/lib/companyRegistry';

export default function SettingsPage() {
  const isServer = typeof window === 'undefined';
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'notifications' | 'integrations' | 'privacy' | 'billing' | 'security' | 'advanced'>('profile');
  const [userData, setUserData] = useState<any>(null);
  const [settings, setSettings] = useState({
    // Profile
    name: '',
    email: '',
    phone: '',
    timezone: 'Africa/Johannesburg',
    language: 'en',
    // Business
    industry: '',
    companySize: '',
    primaryGoal: '',
    monthlyRevenue: '',
    annualRevenue: '',
    teamSize: '',
    contentNiche: '',
    fitnessGoals: [],
    workStyle: '',
    focusAreas: [] as string[],
    logo: '' as string,
    // Notifications
    emailNotifications: {
      newLeads: true,
      hotLeads: true,
      messages: true,
      payments: true,
      automations: true,
      weeklyReport: true,
      dailyDigest: false,
      productUpdates: true,
    },
    pushNotifications: {
      enabled: true,
      newLeads: true,
      hotLeads: true,
      messages: true,
      urgent: true,
    },
    notificationFrequency: 'realtime' as 'realtime' | 'hourly' | 'daily',
    // Theme
    theme: 'auto' as 'light' | 'dark' | 'auto',
    compactMode: false,
    // Autopilot & Privacy Settings
    userMode: 'individual' as 'individual' | 'employee' | 'creator' | 'businessOwner',
    permissions: {
      canViewEarnings: true,
      canViewPerformance: true,
      canShareWellnessData: false,
      earningsVisibility: 'private' as 'private' | 'owner' | 'public',
      performanceVisibility: 'private' as 'private' | 'owner' | 'public',
      wellnessVisibility: 'private' as 'private' | 'therapist-only' | 'owner-aggregate' | 'public',
      allowAutopilot: true,
      allowWellnessGuardrails: true,
      allowPerformanceTracking: true,
    },
    // Integrations
    connectedAccounts: {
      tiktok: { connected: false, username: '', profileUrl: '', accessToken: '', connectedAt: '' },
      instagram: { connected: false, username: '', profileUrl: '', accessToken: '', connectedAt: '' },
      facebook: { connected: false, username: '', profileUrl: '', accessToken: '', connectedAt: '' },
      whatsapp: { connected: false, phoneNumber: '', businessName: '', accessToken: '', connectedAt: '' },
      linkedin: { connected: false, username: '', profileUrl: '', accessToken: '', connectedAt: '' },
      twitter: { connected: false, username: '', profileUrl: '', accessToken: '', connectedAt: '' },
    },
  });
  const [saved, setSaved] = useState(false);
  const [revenueError, setRevenueError] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('vx_live_' + Math.random().toString(36).substr(2, 32));

  useEffect(() => {
    // Load existing data
    const stored = localStorage.getItem('userData');
    const settingsStored = localStorage.getItem('userSettings');
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserData(parsed);
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }

    if (settingsStored) {
      try {
        const parsed = JSON.parse(settingsStored);
        const parsedConnectedAccounts = parsed.connectedAccounts || {};
        const normalizeAccount = (key: string, fallback: any) => {
          const value = parsedConnectedAccounts[key];
          if (typeof value === 'boolean') {
            return { ...fallback, connected: value };
          }
          return { ...fallback, ...(value || {}) };
        };

        // Merge with default settings to ensure all properties exist
        setSettings(prevSettings => ({
          ...prevSettings,
          ...parsed,
          emailNotifications: {
            ...prevSettings.emailNotifications,
            ...(parsed.emailNotifications || {}),
          },
          pushNotifications: {
            ...prevSettings.pushNotifications,
            ...(parsed.pushNotifications || {}),
          },
          permissions: {
            ...prevSettings.permissions,
            ...(parsed.permissions || {}),
          },
          connectedAccounts: {
            ...prevSettings.connectedAccounts,
            tiktok: normalizeAccount('tiktok', prevSettings.connectedAccounts.tiktok),
            instagram: normalizeAccount('instagram', prevSettings.connectedAccounts.instagram),
            facebook: normalizeAccount('facebook', prevSettings.connectedAccounts.facebook),
            whatsapp: normalizeAccount('whatsapp', prevSettings.connectedAccounts.whatsapp),
            linkedin: normalizeAccount('linkedin', prevSettings.connectedAccounts.linkedin),
            twitter: normalizeAccount('twitter', prevSettings.connectedAccounts.twitter),
          },
        }));
      } catch (e) {
        console.error('Failed to parse settings');
      }
    }
  }, []);

  const handleSave = () => {
    // Validate revenue before saving
    if (settings.monthlyRevenue && revenueError) {
      alert('Please correct the revenue value before saving.');
      return;
    }

    localStorage.setItem('userSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);

    // Update user context for chatbot
    const updatedUserData = { ...userData, settings };
    localStorage.setItem('userData', JSON.stringify(updatedUserData));
  };

  const handleMonthlyRevenueChange = (value: string) => {
    const numValue = parseFloat(value.replace(/[^0-9.]/g, ''));
    
    if (isNaN(numValue) || numValue < 0) {
      setRevenueError('Please enter a valid positive number');
      setSettings({...settings, monthlyRevenue: value, annualRevenue: ''});
      return;
    }

    if (numValue > 1500000) {
      setRevenueError('Monthly revenue must be below R1,500,000');
      setSettings({...settings, monthlyRevenue: value, annualRevenue: ''});
      return;
    }

    setRevenueError('');
    const annual = (numValue * 12).toFixed(2);
    setSettings({
      ...settings, 
      monthlyRevenue: numValue.toString(),
      annualRevenue: annual
    });
  };

  const toggleFocusArea = (area: string) => {
    setSettings(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const getUserTypeName = () => {
    if (!userData?.userType) return 'User';
    const types: any = {
      business: 'Business Owner',
      employee: 'Employee',
      creator: 'Content Creator',
      individual: 'Individual'
    };
    return types[userData.userType] || 'User';
  };

  if (isServer) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-blue-600" />
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Tell Veltrix how to treat your data, channels, and automation levers.</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg animate-slideIn">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700 dark:text-green-400 font-medium">Settings locked in.</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="glass-card rounded-xl p-2 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <TabButton
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
            icon={User}
            label="Profile"
          />
          <TabButton
            active={activeTab === 'business'}
            onClick={() => setActiveTab('business')}
            icon={Building2}
            label="Business"
          />
          <TabButton
            active={activeTab === 'notifications'}
            onClick={() => setActiveTab('notifications')}
            icon={Bell}
            label="Notifications"
          />
          <TabButton
            active={activeTab === 'integrations'}
            onClick={() => setActiveTab('integrations')}
            icon={Zap}
            label="Integrations"
          />
          <TabButton
            active={activeTab === 'privacy'}
            onClick={() => setActiveTab('privacy')}
            icon={Shield}
            label="Privacy"
          />
          <TabButton
            active={activeTab === 'billing'}
            onClick={() => setActiveTab('billing')}
            icon={CreditCard}
            label="Billing"
          />
          <TabButton
            active={activeTab === 'security'}
            onClick={() => setActiveTab('security')}
            icon={Lock}
            label="Security"
          />
          <TabButton
            active={activeTab === 'advanced'}
            onClick={() => setActiveTab('advanced')}
            icon={Code}
            label="Advanced"
          />
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && <ProfileSettings settings={settings} setSettings={setSettings} userData={userData} />}
      {activeTab === 'business' && <BusinessSettings settings={settings} setSettings={setSettings} revenueError={revenueError} handleMonthlyRevenueChange={handleMonthlyRevenueChange} toggleFocusArea={toggleFocusArea} />}
      {activeTab === 'notifications' && <NotificationSettings settings={settings} setSettings={setSettings} />}
      {activeTab === 'integrations' && <IntegrationSettings settings={settings} setSettings={setSettings} />}
      {activeTab === 'privacy' && <PrivacySettings settings={settings} setSettings={setSettings} userData={userData} />}
      {activeTab === 'billing' && <BillingSettings />}
      {activeTab === 'security' && <SecuritySettings apiKey={apiKey} showApiKey={showApiKey} setShowApiKey={setShowApiKey} />}
      {activeTab === 'advanced' && <AdvancedSettings />}

      {/* Save Button - Fixed at bottom */}
      <div className="sticky bottom-6 flex justify-end">
        <button
          onClick={handleSave}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3"
        >
          <Save className="w-5 h-5" />
          Save configuration
        </button>
      </div>
    </div>
  );
}

// ========== TAB COMPONENTS ==========

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
        active
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

// Profile Settings Tab
function ProfileSettings({ settings, setSettings, userData }: any) {
  return (
    <div className="space-y-6">
      {/* User Badge */}
      {userData?.userType && (
        <div className="glass-card rounded-xl p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center gap4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-2xl">
              {userData.userType === 'business' ? '💼' : 
               userData.userType === 'creator' ? '🎬' : 
               userData.userType === 'employee' ? '👔' : '🌟'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{userData.name || 'User'}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{userData.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Basic Info */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Personal Information
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({...settings, name: e.target.value})}
              placeholder="John Doe"
              className="w-full px-4 py-3 glass-input rounded-xl border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({...settings, email: e.target.value})}
              placeholder="john@example.com"
              className="w-full px-4 py-3 glass-input rounded-xl border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({...settings, phone: e.target.value})}
              placeholder="+27 82 555 0123"
              className="w-full px-4 py-3 glass-input rounded-xl border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-green-600" />
          Regional Settings
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({...settings, timezone: e.target.value})}
              className="w-full px-4 py-3 glass-input rounded-xl border-0 focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
            >
              <option value="Africa/Johannesburg">Africa/Johannesburg (South Africa)</option>
              <option value="Africa/Cairo">Africa/Cairo (Egypt)</option>
              <option value="Africa/Lagos">Africa/Lagos (Nigeria)</option>
              <option value="Europe/London">Europe/London (UK)</option>
              <option value="America/New_York">America/New York (US Eastern)</option>
              <option value="America/Los_Angeles">America/Los Angeles (US Pacific)</option>
              <option value="Asia/Dubai">Asia/Dubai (UAE)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({...settings, language: e.target.value})}
              className="w-full px-4 py-3 glass-input rounded-xl border-0 focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
            >
              <option value="en">English</option>
              <option value="af">Afrikaans</option>
              <option value="zu">Zulu</option>
              <option value="xh">Xhosa</option>
              <option value="fr">French</option>
              <option value="pt">Portuguese</option>
              <option value="es">Spanish</option>
            </select>
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-purple-600" />
          Appearance
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme Mode</label>
            <div className="grid grid-cols-3 gap-3">
              <ThemeOption
                label="Light"
                icon={<Sun className="w-5 h-5" />}
                selected={settings.theme === 'light'}
                onClick={() => setSettings({...settings, theme: 'light'})}
              />
              <ThemeOption
                label="Dark"
                icon={<Moon className="w-5 h-5" />}
                selected={settings.theme === 'dark'}
                onClick={() => setSettings({...settings, theme: 'dark'})}
              />
              <ThemeOption
                label="Auto"
                icon={<Sparkles className="w-5 h-5" />}
                selected={settings.theme === 'auto'}
                onClick={() => setSettings({...settings, theme: 'auto'})}
              />
            </div>
          </div>
          
          <label className="flex items-center gap-3 p-3 glass-card rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <input
              type="checkbox"
              checked={settings.compactMode}
              onChange={(e) => setSettings({...settings, compactMode: e.target.checked})}
              className="w-5 h-5 rounded text-purple-600 focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">Compact Mode</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Show more content by reducing spacing</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

// Business Settings Tab
function BusinessSettings({ settings, setSettings, revenueError, handleMonthlyRevenueChange, toggleFocusArea }: any) {
  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-purple-600" />
          Brand Identity
        </h3>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <label className="block">
              <span className="sr-only">Choose logo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setSettings({...settings, logo: reader.result as string});
                    reader.readAsDataURL(file);
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">PNG, JPG or GIF (max. 2MB). Square images work best.</p>
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          Business Information
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Industry</label>
            <select
              value={settings.industry}
              onChange={(e) => setSettings({...settings, industry: e.target.value})}
              className="w-full px-4 py-3 glass-input rounded-xl border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="">Select industry...</option>
              <option value="retail">Retail & E-commerce</option>
              <option value="saas">SaaS & Technology</option>
              <option value="services">Professional Services</option>
              <option value="health">Health & Wellness</option>
              <option value="education">Education & Training</option>
              <option value="real-estate">Real Estate</option>
              <option value="finance">Finance & Insurance</option>
              <option value="hospitality">Hospitality & Tourism</option>
              <option value="marketing">Marketing & Advertising</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Size</label>
            <select
              value={settings.companySize}
              onChange={(e) => setSettings({...settings, companySize: e.target.value})}
              className="w-full px-4 py-3 glass-input rounded-xl border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="">Select size...</option>
              <option value="solo">Just me</option>
              <option value="2-10">2-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="200+">200+ employees</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Revenue Goal (Max: R1,500,000)</label>
            <input
              type="number"
              value={settings.monthlyRevenue}
              onChange={(e) => handleMonthlyRevenueChange(e.target.value)}
              placeholder="e.g., 50000"
              max="1500000"
              min="0"
              className={`w-full px-4 py-3 glass-input rounded-xl border-0 focus:ring-2 text-gray-900 dark:text-white ${
                revenueError ? 'focus:ring-red-500' : 'focus:ring-blue-500'
              }`}
            />
            {revenueError && <p className="text-red-600 text-sm mt-1">{revenueError}</p>}
            {settings.annualRevenue && !revenueError && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                  💰 Annual Revenue Goal: R{parseFloat(settings.annualRevenue).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Goals & Focus Areas */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-600" />
          Goals & Focus Areas
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Goal</label>
            <select
              value={settings.primaryGoal}
              onChange={(e) => setSettings({...settings, primaryGoal: e.target.value})}
              className="w-full px-4 py-3 glass-input rounded-xl border-0 focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
            >
              <option value="">Select goal...</option>
              <option value="revenue">Increase Revenue</option>
              <option value="leads">Generate More Leads</option>
              <option value="automation">Save Time with Automation</option>
              <option value="wellness">Improve Personal Wellness</option>
              <option value="content">Grow Content Business</option>
              <option value="productivity">Boost Productivity</option>
              <option value="team">Build & Manage Team</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Feature Focus (Select all that apply)</label>
            <div className="space-y-2">
              <FocusCheckbox label="Lead Management & CRM" icon="👥" checked={settings.focusAreas.includes('leads')} onChange={() => toggleFocusArea('leads')} />
              <FocusCheckbox label="Marketing Automation" icon="⚡" checked={settings.focusAreas.includes('automation')} onChange={() => toggleFocusArea('automation')} />
              <FocusCheckbox label="Content Creation" icon="🎬" checked={settings.focusAreas.includes('content')} onChange={() => toggleFocusArea('content')} />
              <FocusCheckbox label="Wellness & Health" icon="💚" checked={settings.focusAreas.includes('wellness')} onChange={() => toggleFocusArea('wellness')} />
              <FocusCheckbox label="Finance & Money Goals" icon="💰" checked={settings.focusAreas.includes('finance')} onChange={() => toggleFocusArea('finance')} />
              <FocusCheckbox label="Team & Collaboration" icon="🤝" checked={settings.focusAreas.includes('team')} onChange={() => toggleFocusArea('team')} />
              <FocusCheckbox label="Analytics & Reporting" icon="📊" checked={settings.focusAreas.includes('analytics')} onChange={() => toggleFocusArea('analytics')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Notifications Settings Tab
function NotificationSettings({ settings, setSettings }: any) {
  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          Email Notifications
        </h3>
        
        <div className="space-y-3">
          <NotificationToggle
            label="New Leads"
            description="Get notified when a new lead enters your system"
            checked={settings.emailNotifications.newLeads}
            onChange={(checked) => setSettings({...settings, emailNotifications: {...settings.emailNotifications, newLeads: checked}})}
          />
          <NotificationToggle
            label="Hot Leads"
            description="Alert me when a lead becomes hot (score > 90)"
            checked={settings.emailNotifications.hotLeads}
            onChange={(checked) => setSettings({...settings, emailNotifications: {...settings.emailNotifications, hotLeads: checked}})}
          />
          <NotificationToggle
            label="New Messages"
            description="Notify me of new messages from leads/customers"
            checked={settings.emailNotifications.messages}
            onChange={(checked) => setSettings({...settings, emailNotifications: {...settings.emailNotifications, messages: checked}})}
          />
          <NotificationToggle
            label="Payment Received"
            description="Alert me when payments are received"
            checked={settings.emailNotifications.payments}
            onChange={(checked) => setSettings({...settings, emailNotifications: {...settings.emailNotifications, payments: checked}})}
          />
          <NotificationToggle
            label="Automation Completed"
            description="Notify me when automations finish running"
            checked={settings.emailNotifications.automations}
            onChange={(checked) => setSettings({...settings, emailNotifications: {...settings.emailNotifications, automations: checked}})}
          />
          <NotificationToggle
            label="Weekly Report"
            description="Receive weekly performance summary"
            checked={settings.emailNotifications.weeklyReport}
            onChange={(checked) => setSettings({...settings, emailNotifications: {...settings.emailNotifications, weeklyReport: checked}})}
          />
          <NotificationToggle
            label="Daily Digest"
            description="Get a daily summary of all activities"
            checked={settings.emailNotifications.dailyDigest}
            onChange={(checked) => setSettings({...settings, emailNotifications: {...settings.emailNotifications, dailyDigest: checked}})}
          />
          <NotificationToggle
            label="Product Updates"
            description="Keep me informed about new features and updates"
            checked={settings.emailNotifications.productUpdates}
            onChange={(checked) => setSettings({...settings, emailNotifications: {...settings.emailNotifications, productUpdates: checked}})}
          />
        </div>
      </div>

      {/* Push Notifications */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-600" />
          Push Notifications
        </h3>
        
        <div className="space-y-3">
          <NotificationToggle
            label="Enable Push Notifications"
            description="Receive real-time notifications in your browser"
            checked={settings.pushNotifications.enabled}
            onChange={(checked) => setSettings({...settings, pushNotifications: {...settings.pushNotifications, enabled: checked}})}
          />
          {settings.pushNotifications.enabled && (
            <>
              <NotificationToggle
                label="New Leads"
                description="Desktop notification for new leads"
                checked={settings.pushNotifications.newLeads}
                onChange={(checked) => setSettings({...settings, pushNotifications: {...settings.pushNotifications, newLeads: checked}})}
              />
              <NotificationToggle
                label="Hot Leads"
                description="Urgent notification for hot leads"
                checked={settings.pushNotifications.hotLeads}
                onChange={(checked) => setSettings({...settings, pushNotifications: {...settings.pushNotifications, hotLeads: checked}})}
              />
              <NotificationToggle
                label="Messages"
                description="Real-time message notifications"
                checked={settings.pushNotifications.messages}
                onChange={(checked) => setSettings({...settings, pushNotifications: {...settings.pushNotifications, messages: checked}})}
              />
              <NotificationToggle
                label="Urgent Alerts"
                description="Critical system alerts and warnings"
                checked={settings.pushNotifications.urgent}
                onChange={(checked) => setSettings({...settings, pushNotifications: {...settings.pushNotifications, urgent: checked}})}
              />
            </>
          )}
        </div>
      </div>

      {/* Notification Frequency */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-green-600" />
          Notification Frequency
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FrequencyOption
            label="Real-time"
            description="Instant notifications"
            selected={settings.notificationFrequency === 'realtime'}
            onClick={() => setSettings({...settings, notificationFrequency: 'realtime'})}
          />
          <FrequencyOption
            label="Hourly"
            description="Batched every hour"
            selected={settings.notificationFrequency === 'hourly'}
            onClick={() => setSettings({...settings, notificationFrequency: 'hourly'})}
          />
          <FrequencyOption
            label="Daily"
            description="Once per day summary"
            selected={settings.notificationFrequency === 'daily'}
            onClick={() => setSettings({...settings, notificationFrequency: 'daily'})}
          />
        </div>
      </div>
    </div>
  );
}

// Integrations Settings Tab
const UPCOMING_INTEGRATIONS = [
  { id: 'email-providers', title: '📧 Email Providers', description: 'Gmail, Outlook, SendGrid' },
  { id: 'ecommerce-providers', title: '🛒 E-commerce', description: 'Shopify, WooCommerce' },
  { id: 'calendar-providers', title: '📆 Calendars', description: 'Google Calendar, Outlook' },
  { id: 'payment-providers', title: '💳 Payment', description: 'Stripe, PayPal, Paystack' },
];

function IntegrationSettings({ settings, setSettings }: any) {
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string>('');
  const [oauthHealth, setOauthHealth] = useState<any>(null);
  const [integrationWaitlist, setIntegrationWaitlist] = useState<string[]>([]);
  const [integrationNotice, setIntegrationNotice] = useState('');

  useEffect(() => {
    const loadOauthHealth = async () => {
      try {
        const response = await fetch('/api/oauth/status');
        if (!response.ok) return;
        const payload = await response.json();
        setOauthHealth(payload);
      } catch {
      }
    };

    loadOauthHealth();
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('settingsIntegrationWaitlist');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setIntegrationWaitlist(parsed);
        }
      }
    } catch (error) {
      console.warn('Failed to load integration waitlist', error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('settingsIntegrationWaitlist', JSON.stringify(integrationWaitlist));
  }, [integrationWaitlist]);

  useEffect(() => {
    if (!integrationNotice) return;
    const timeout = window.setTimeout(() => setIntegrationNotice(''), 2500);
    return () => window.clearTimeout(timeout);
  }, [integrationNotice]);

  const waitForOAuthResult = (platform: string) => {
    return new Promise<any>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        window.removeEventListener('message', handler);
        reject(new Error('Authentication timed out. Please try again.'));
      }, 120000);

      const handler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        const payload = event.data;
        if (!payload || payload.type !== 'oauth_result' || payload.platform !== platform) return;

        clearTimeout(timeoutId);
        window.removeEventListener('message', handler);

        if (payload.success) {
          resolve(payload.accountData);
        } else {
          reject(new Error(payload.error || 'Authentication failed'));
        }
      };

      window.addEventListener('message', handler);
    });
  };

  const handleToggleIntegrationInterest = (integrationId: string) => {
    setIntegrationWaitlist((prev) => {
      const exists = prev.includes(integrationId);
      const next = exists ? prev.filter((id) => id !== integrationId) : [...prev, integrationId];
      const integration = UPCOMING_INTEGRATIONS.find((item) => item.id === integrationId);
      setIntegrationNotice(
        exists
          ? `${integration?.title.replace(/^[^A-Za-z0-9]+/, '') || 'Integration'} removed from waitlist.`
          : `${integration?.title.replace(/^[^A-Za-z0-9]+/, '') || 'Integration'} request submitted.`
      );
      return next;
    });
  };

  const handleConnect = async (platform: string) => {
    setConnectingPlatform(platform);
    setAuthError('');

    try {
      const startResponse = await fetch(`/api/oauth/${platform}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const startData = await startResponse.json();
      if (!startResponse.ok || !startData?.authUrl) {
        throw new Error(startData?.error || 'Failed to start authentication');
      }

      const width = 620;
      const height = 760;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        startData.authUrl,
        `${platform}_oauth`,
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      const accountData = await waitForOAuthResult(platform);

      setSettings((prev: any) => {
        const updated = {
          ...prev,
          connectedAccounts: {
            ...prev.connectedAccounts,
            [platform]: {
              ...prev.connectedAccounts?.[platform],
              ...accountData,
              connected: true,
              connectedAt: new Date().toISOString(),
            },
          },
        };
        localStorage.setItem('userSettings', JSON.stringify(updated));
        return updated;
      });
    } catch (error: any) {
      setAuthError(error.message || 'Connection failed');
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = (platform: string) => {
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
    const accountInfo = settings?.connectedAccounts?.[platform] || {};
    const accountDisplay = accountInfo.username || accountInfo.businessName || accountInfo.phoneNumber || platformName;

    if (!confirm(`Disconnect from ${platformName}?\n\nAccount: ${accountDisplay}\n\nThis will revoke access and stop all automations for this platform.`)) {
      return;
    }

    setSettings((prev: any) => {
      const updated = {
        ...prev,
        connectedAccounts: {
          ...prev.connectedAccounts,
          [platform]: {
            connected: false,
            username: '',
            profileUrl: '',
            phoneNumber: '',
            businessName: '',
            followers: '',
            likes: '',
            connections: '',
            verified: false,
            accessToken: '',
            connectedAt: '',
          },
        },
      };

      localStorage.setItem('userSettings', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* OAuth Info Banner */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Secure OAuth Authentication</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Clicking "Connect" opens the platform OAuth login screen. After authorization, your account details are
              securely sent back to this settings page and saved to your connected accounts.
            </p>
          </div>
        </div>
      </div>

      {oauthHealth && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">OAuth Configuration Status</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {oauthHealth.configuredCount}/{oauthHealth.total} configured
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {Object.entries(oauthHealth.status).map(([platform, details]: any) => (
              <div key={platform} className="px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-gray-900 dark:text-white capitalize">{platform}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${details.configured ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {details.configured ? 'Ready' : 'Missing env'}
                  </span>
                </div>
                {!details.configured && details.missing?.length > 0 && (
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 truncate" title={details.missing.join(', ')}>
                    {details.missing.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {authError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{authError}</p>
        </div>
      )}

      {/* Connected Accounts */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-blue-600" />
          Connected Accounts
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Connect your social media accounts to automate lead generation and messaging
        </p>

        <div className="space-y-3">
          <IntegrationCard
            name="TikTok"
            icon="🎵"
            description="Auto-respond to DMs, track viral content"
            accountData={settings.connectedAccounts.tiktok}
            loading={connectingPlatform === 'tiktok'}
            onConnect={() => handleConnect('tiktok')}
            onDisconnect={() => handleDisconnect('tiktok')}
          />
          <IntegrationCard
            name="Instagram"
            icon="📸"
            description="Manage DMs, comments, and story replies"
            accountData={settings.connectedAccounts.instagram}
            loading={connectingPlatform === 'instagram'}
            onConnect={() => handleConnect('instagram')}
            onDisconnect={() => handleDisconnect('instagram')}
          />
          <IntegrationCard
            name="Facebook"
            icon="👍"
            description="Automate page messages and lead forms"
            accountData={settings.connectedAccounts.facebook}
            loading={connectingPlatform === 'facebook'}
            onConnect={() => handleConnect('facebook')}
            onDisconnect={() => handleDisconnect('facebook')}
          />
          <IntegrationCard
            name="WhatsApp Business"
            icon="💬"
            description="Automated messaging and customer support"
            accountData={settings.connectedAccounts.whatsapp}
            loading={connectingPlatform === 'whatsapp'}
            onConnect={() => handleConnect('whatsapp')}
            onDisconnect={() => handleDisconnect('whatsapp')}
          />
          <IntegrationCard
            name="LinkedIn"
            icon="💼"
            description="Connect with professionals and generate B2B leads"
            accountData={settings.connectedAccounts.linkedin}
            loading={connectingPlatform === 'linkedin'}
            onConnect={() => handleConnect('linkedin')}
            onDisconnect={() => handleDisconnect('linkedin')}
          />
          <IntegrationCard
            name="Twitter / X"
            icon="🐦"
            description="Monitor mentions and automate engagement"
            accountData={settings.connectedAccounts.twitter}
            loading={connectingPlatform === 'twitter'}
            onConnect={() => handleConnect('twitter')}
            onDisconnect={() => handleDisconnect('twitter')}
          />
        </div>
      </div>

      {/* Coming Soon */}
      <div className="glass-card rounded-xl p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">🚀 Coming Soon</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Tap to reserve a spot as integrations roll out.</p>
          </div>
          <span className="text-xs font-semibold uppercase text-purple-700">Waitlist live</span>
        </div>
        {integrationNotice && (
          <div className="mb-4 p-3 rounded-lg bg-white/80 dark:bg-gray-900/40 text-sm font-medium text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
            {integrationNotice}
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          {UPCOMING_INTEGRATIONS.map((integration) => {
            const isRequested = integrationWaitlist.includes(integration.id);
            return (
              <button
                key={integration.id}
                type="button"
                onClick={() => handleToggleIntegrationInterest(integration.id)}
                className={`p-4 rounded-lg text-left transition-all border ${
                  isRequested
                    ? 'bg-white text-gray-900 border-purple-400 dark:bg-gray-800 dark:text-white'
                    : 'bg-white/80 text-gray-800 border-transparent dark:bg-gray-800/70 dark:text-gray-100'
                } hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500`}
              >
                <p className="font-semibold mb-1">{integration.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{integration.description}</p>
                <span
                  className={`mt-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    isRequested
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {isRequested ? 'Requested' : 'Request access'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Privacy Settings Tab
function PrivacySettings({ settings, setSettings, userData }: any) {
  const [canManageAiPermissions, setCanManageAiPermissions] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [companyCode, setCompanyCode] = useState('');
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [verificationInputs, setVerificationInputs] = useState<Record<string, string>>({});
  const [approvalMessage, setApprovalMessage] = useState('');

  useEffect(() => {
    setCanManageAiPermissions(canCurrentUserManageAiAutomationPermissions());

    const savedEmployeesRaw = localStorage.getItem('productivityEmployees');
    const savedEmployees = savedEmployeesRaw ? JSON.parse(savedEmployeesRaw) : [];
    const normalized = Array.isArray(savedEmployees)
      ? savedEmployees.map((employee: any) => ({
          key: String(employee.id || employee.email || employee.name || '').toLowerCase(),
          name: employee.name || employee.fullName || 'Team Member',
          email: employee.email || '',
          role: employee.role || 'Staff',
          avatar: employee.avatar || employee.profilePicture || '',
        }))
      : [];

    if (normalized.length > 0) {
      setTeamMembers(normalized);
      return;
    }

    const fallbackMembers = Array.isArray(userData?.teamMembers)
      ? userData.teamMembers.map((member: any) => ({
          key: String(member.id || member.email || member.name || '').toLowerCase(),
          name: member.name || 'Team Member',
          email: member.email || '',
          role: member.role || 'Staff',
          avatar: member.avatar || '',
        }))
      : [];

    setTeamMembers(fallbackMembers);

    const companyFromAdminEmail = userData?.email ? getCompanyByAdminEmail(userData.email) : null;
    const initialCompanyCode = companyFromAdminEmail?.employerCode || '';
    if (initialCompanyCode) {
      setCompanyCode(initialCompanyCode);
      setPendingRequests(getPendingCompanyRequests(initialCompanyCode));
      return;
    }

    if (userData?.employerCode) {
      setCompanyCode(userData.employerCode);
      setPendingRequests(getPendingCompanyRequests(userData.employerCode));
      return;
    }
  }, [userData]);

  const handleToggleMemberAiAccess = (member: any, enabled: boolean) => {
    if (!canManageAiPermissions) return;

    const identity = member.email || member.key;
    setTeamMemberAiAutomationPermission(identity, enabled, userData?.email || userData?.name || 'owner');

    setTeamMembers((prev) =>
      prev.map((item) =>
        item.key === member.key
          ? {
              ...item,
            }
          : item
      )
    );
  };

  const handleLoadCompanyRequests = () => {
    const normalized = companyCode.trim().toUpperCase();
    if (!normalized) {
      setApprovalMessage('Enter a company code to load pending requests.');
      return;
    }

    const company = getCompanyByCode(normalized);
    if (!company) {
      setApprovalMessage('Company not found or subscription inactive for this code.');
      setPendingRequests([]);
      return;
    }

    setPendingRequests(getPendingCompanyRequests(normalized));
    setApprovalMessage('Loaded latest pending employee requests.');
  };

  const handleApproveRequest = (employeeEmail: string) => {
    const normalizedCode = companyCode.trim().toUpperCase();
    const verificationCode = (verificationInputs[employeeEmail] || '').trim();

    const result = approveEmployeeWithAuthCode(
      normalizedCode,
      employeeEmail,
      verificationCode,
      ['wellness', 'performance', 'productivity', 'contentStudio']
    );

    if (!result.success) {
      setApprovalMessage(result.error || 'Failed to approve employee request.');
      return;
    }

    setPendingRequests(getPendingCompanyRequests(normalizedCode));
    setVerificationInputs((prev) => ({ ...prev, [employeeEmail]: '' }));
    setApprovalMessage(`Approved ${employeeEmail}.`);
  };

  return (
    <div className="space-y-6">
      {userData?.pendingEmployeeRequest?.status === 'pending' && userData?.userType !== 'employee' && (
        <div className="glass-card rounded-xl p-6 border border-purple-300 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-900/20">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Employee Approval Still Pending
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            Your company-link request is still active for {userData?.pendingEmployeeRequest?.companyName || userData?.companyName || 'your company'}.
            You can check approval status anytime without losing your current account mode.
          </p>
          <button
            onClick={() => {
              window.location.href = '/waiting-approval';
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
          >
            Check Employee Approval Status
          </button>
        </div>
      )}

      {/* Autopilot & User Mode */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Autopilot & User Mode
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Choose your primary mode - controls features and personalization
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <UserModeOption mode="individual" label="Individual" icon="❤️" description="Personal wellness & productivity" selected={settings.userMode === 'individual'} onClick={() => setSettings({...settings, userMode: 'individual'})} />
          <UserModeOption mode="employee" label="Employee" icon="👔" description="Tasks & team collaboration" selected={settings.userMode === 'employee'} onClick={() => setSettings({...settings, userMode: 'employee'})} />
          <UserModeOption mode="creator" label="Creator" icon="🎬" description="Content & brand deals" selected={settings.userMode === 'creator'} onClick={() => setSettings({...settings, userMode: 'creator'})} />
          <UserModeOption mode="businessOwner" label="Business Owner" icon="🏢" description="Full CRM & automation" selected={settings.userMode === 'businessOwner'} onClick={() => setSettings({...settings, userMode: 'businessOwner'})} />
        </div>
      </div>

      {/* Privacy Controls */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          Privacy Controls
        </h3>
        
        <div className="space-y-4">
          <PrivacyToggle label="Enable Autopilot" description="Automatically generate daily focus plans and recommendations" checked={settings.permissions.allowAutopilot} onChange={(checked) => setSettings({...settings, permissions: {...settings.permissions, allowAutopilot: checked}})} icon="✨" />
          <PrivacyToggle label="Wellness Guardrails" description="Automatically detect burnout and suggest recovery actions" checked={settings.permissions.allowWellnessGuardrails} onChange={(checked) => setSettings({...settings, permissions: {...settings.permissions, allowWellnessGuardrails: checked}})} icon="🛡️" />
          <PrivacyToggle label="Performance Tracking" description="Track how your actions correlate to revenue and growth" checked={settings.permissions.allowPerformanceTracking} onChange={(checked) => setSettings({...settings, permissions: {...settings.permissions, allowPerformanceTracking: checked}})} icon="📊" />
        </div>
      </div>

      {/* Data Visibility */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          Data Visibility
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Earnings Visibility
            </label>
            <select
              value={settings.permissions.earningsVisibility}
              onChange={(e) => setSettings({...settings, permissions: {...settings.permissions, earningsVisibility: e.target.value}})}
              className="w-full px-4 py-2 glass-input rounded-lg text-gray-900 dark:text-white"
            >
              <option value="private">🔒 Private (only you)</option>
              <option value="owner">👤 Owner can see</option>
              <option value="public">🌐 Public (team can see)</option>
            </select>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Who can see your earnings and revenue data</p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Performance Visibility
            </label>
            <select
              value={settings.permissions.performanceVisibility}
              onChange={(e) => setSettings({...settings, permissions: {...settings.permissions, performanceVisibility: e.target.value}})}
              className="w-full px-4 py-2 glass-input rounded-lg text-gray-900 dark:text-white"
            >
              <option value="private">🔒 Private (only you)</option>
              <option value="owner">👤 Owner can see</option>
              <option value="public">🌐 Public (team can see)</option>
            </select>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Who can see your performance metrics and task completion</p>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Wellness Data Sharing
            </label>
            <select
              value={settings.permissions.wellnessVisibility}
              onChange={(e) => setSettings({...settings, permissions: {...settings.permissions, wellnessVisibility: e.target.value}})}
              className="w-full px-4 py-2 glass-input rounded-lg text-gray-900 dark:text-white"
            >
              <option value="private">🔒 Private (only you)</option>
              <option value="therapist-only">🤖 AI Therapist only</option>
              <option value="owner-aggregate">📊 Owner (aggregated/anonymous)</option>
              <option value="public">🌐 Public (team can see)</option>
            </select>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Control who can see your wellness and burnout data</p>
          </div>
        </div>
      </div>

      {canManageAiPermissions && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-indigo-600" />
            Team AI Automation Permissions
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            As owner, grant or revoke who can run AI auto-replies for messages, comments, and reviews.
          </p>

          {teamMembers.length === 0 ? (
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300">
              No team members found yet. Add team members first, then manage permissions here.
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member) => {
                const enabled = getTeamMemberAiAutomationPermission(member.email || member.key);

                return (
                  <div
                    key={member.key}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  >
                    <div className="flex items-center gap-3">
                      <AvatarImage
                        name={member.name}
                        email={member.email}
                        src={member.avatar}
                        size="sm"
                        className="shadow-sm"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {member.role}{member.email ? ` • ${member.email}` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleMemberAiAccess(member, !enabled)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                        enabled
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {enabled ? 'AI Replies: Allowed' : 'AI Replies: Blocked'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {userData?.userType === 'business' && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600" />
            Employee Approval Requests
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Verify each employee using their authentication code before approving access.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              value={companyCode}
              onChange={(event) => setCompanyCode(event.target.value)}
              placeholder="Enter employer code (e.g., ACME2024)"
              className="flex-1 px-4 py-2 glass-input rounded-lg text-gray-900 dark:text-white"
            />
            <button
              onClick={handleLoadCompanyRequests}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
            >
              Load Requests
            </button>
          </div>

          {approvalMessage && (
            <div className="mb-4 text-xs text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg px-3 py-2">
              {approvalMessage}
            </div>
          )}

          {pendingRequests.length === 0 ? (
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300">
              No pending employee approvals for this company.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((employee) => (
                <div
                  key={employee.email}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{employee.fullName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{employee.email}</p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={verificationInputs[employee.email] || ''}
                      onChange={(event) =>
                        setVerificationInputs((prev) => ({
                          ...prev,
                          [employee.email]: event.target.value,
                        }))
                      }
                      placeholder="Enter employee auth code"
                      className="flex-1 px-3 py-2 glass-input rounded-lg text-sm"
                    />
                    <button
                      onClick={() => handleApproveRequest(employee.email)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Verify + Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Privacy Notice */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-700">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Your Privacy Matters</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              All settings default to private. Wellness data is never shared individually. Autopilot works locally on your device. You have full control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Billing Settings Tab
function BillingSettings() {
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="glass-card rounded-xl p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pro Plan</h3>
            <p className="text-gray-600 dark:text-gray-400">Unlimited everything, full access</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">R499</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">per month</div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:scale-105 transition-all">
            Upgrade Plan
          </button>
          <button className="px-6 py-3 glass-button rounded-xl font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            Cancel
          </button>
        </div>
      </div>

      {/* Billing Info */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-green-600" />
          Payment Method
        </h3>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center text-white font-bold text-xs">
              VISA
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">•••• •••• •••• 4242</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Expires 12/2025</p>
            </div>
          </div>
          <button className="px-4 py-2 glass-button rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
            Update
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Billing History</h3>
        
        <div className="space-y-3">
          <BillingItem date="Feb 1, 2026" amount="R499.00" status="Paid" invoice="INV-2026-002" />
          <BillingItem date="Jan 1, 2026" amount="R499.00" status="Paid" invoice="INV-2026-001" />
          <BillingItem date="Dec 1, 2025" amount="R499.00" status="Paid" invoice="INV-2025-012" />
        </div>
      </div>

      {/* Usage Stats */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Current Usage</h3>
        
        <div className="grid sm:grid-cols-3 gap-4">
          <UsageStat label="Leads" current={342} limit="Unlimited" />
          <UsageStat label="Automations" current={12} limit="Unlimited" />
          <UsageStat label="Team Members" current={1} limit="Unlimited" />
        </div>
      </div>
    </div>
  );
}

// Security Settings Tab
function SecuritySettings({ apiKey, showApiKey, setShowApiKey }: any) {
  return (
    <div className="space-y-6">
      {/* Password */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-red-600" />
          Password & Authentication
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              className="w-full px-4 py-3 glass-input rounded-xl border-0 focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full px-4 py-3 glass-input rounded-xl border-0 focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full px-4 py-3 glass-input rounded-xl border-0 focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
            />
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold hover:scale-105 transition-all">
            Update Password
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-600" />
          Two-Factor Authentication
        </h3>
        
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-1">2FA is currently disabled</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            Enable
          </button>
        </div>
      </div>

      {/* API Keys */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-purple-600" />
          API Keys
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Use API keys to integrate Veltrix with external applications
        </p>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Production API Key</p>
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showApiKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700">
            {showApiKey ? apiKey : apiKey.replace(/./g, '•')}
          </div>
        </div>

        <button className="mt-4 px-4 py-2 glass-button rounded-lg text-sm font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20">
          Generate New Key
        </button>
      </div>

      {/* Active Sessions */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Active Sessions</h3>
        
        <div className="space-y-3">
          <SessionItem device="Windows PC" location="Johannesburg, South Africa" current={true} />
          <SessionItem device="iPhone 13" location="Cape Town, South Africa" current={false} />
        </div>
      </div>
    </div>
  );
}

// Advanced Settings Tab
function AdvancedSettings() {
  return (
    <div className="space-y-6">
      {/* Data Management */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-600" />
          Data Management
        </h3>
        
        <div className="space-y-3">
          <button className="w-full px-6 py-3 glass-button rounded-xl flex items-center justify-between hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Export Data</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Download all your data as JSON</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full px-6 py-3 glass-button rounded-xl flex items-center justify-between hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Import Data</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Upload data from backup or migration</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Developer Options */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-purple-600" />
          Developer Options
        </h3>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 glass-card rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <input type="checkbox" className="w-5 h-5 rounded text-purple-600 focus:ring-2 focus:ring-purple-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Enable Debug Mode</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Show detailed logs in console</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 glass-card rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <input type="checkbox" className="w-5 h-5 rounded text-purple-600 focus:ring-2 focus:ring-purple-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Beta Features</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Access experimental features early</p>
            </div>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card rounded-xl p-6 border-2 border-red-300 dark:border-red-700">
        <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Danger Zone
        </h3>
        
        <div className="space-y-3">
          <button className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-between hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-orange-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Clear All Data</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Reset dashboard to factory settings</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full px-6 py-3 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-between hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-600" />
              <div className="text-left">
                <p className="font-medium text-red-600">Delete Account</p>
                <p className="text-xs text-red-600/70">Permanently delete your account and all data</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== HELPER COMPONENTS ==========

function FocusCheckbox({ label, icon, checked, onChange }: any) {
  return (
    <label className="flex items-center gap-3 p-3 glass-card rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
      />
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
      {checked && <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />}
    </label>
  );
}

function UserModeOption({ mode, label, icon, description, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all text-left ${
        selected
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-lg'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
      }`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-semibold text-gray-900 dark:text-white mb-1">{label}</div>
      <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
      {selected && (
        <div className="mt-2 flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-medium">
          <CheckCircle className="w-3 h-3" />
          Active
        </div>
      )}
    </button>
  );
}

function PrivacyToggle({ label, description, checked, onChange, icon }: any) {
  return (
    <label className="flex items-start gap-3 p-3 glass-card rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-5 h-5 rounded text-purple-600 focus:ring-2 focus:ring-purple-500"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{icon}</span>
          <span className="font-medium text-gray-900 dark:text-white">{label}</span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      {checked && <CheckCircle className="w-4 h-4 text-green-600 mt-1" />}
    </label>
  );
}
// Additional Helper Components for Tab Content

function ThemeOption({ label, icon, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all ${
        selected
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-lg'
          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <div className={selected ? 'text-purple-600' : 'text-gray-600'}>{icon}</div>
        <span className={`text-sm font-medium ${selected ? 'text-purple-600' : 'text-gray-900 dark:text-white'}`}>
          {label}
        </span>
      </div>
    </button>
  );
}

function NotificationToggle({ label, description, checked, onChange }: any) {
  return (
    <label className="flex items-start gap-3 p-3 glass-card rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 mt-0.5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex-1">
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </label>
  );
}

function FrequencyOption({ label, description, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all text-center ${
        selected
          ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-lg'
          : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
      }`}
    >
      <p className={`font-bold mb-1 ${selected ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
        {label}
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
    </button>
  );
}

function IntegrationCard({ name, icon, description, accountData, loading, onConnect, onDisconnect }: any) {
  const connected = accountData?.connected || false;
  const username = accountData?.username || accountData?.businessName || accountData?.phoneNumber || '';
  const profileUrl = accountData?.profileUrl || '';
  const connectedAt = accountData?.connectedAt ? new Date(accountData.connectedAt).toLocaleDateString() : '';
  const followers = accountData?.followers || accountData?.likes || accountData?.connections || '';

  return (
    <div className="p-4 glass-card rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-3xl">{icon}</div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">{name}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
            
            {connected ? (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Connected
                  </p>
                </div>
                
                {/* Account Details */}
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  {username && (
                    <p className="text-xs text-gray-900 dark:text-white font-medium mb-1">
                      {profileUrl ? (
                        <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 flex items-center gap-1">
                          {username}
                          <LinkIcon className="w-3 h-3" />
                        </a>
                      ) : (
                        username
                      )}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                    {followers && (
                      <span>👥 {followers}</span>
                    )}
                    {connectedAt && (
                      <span>📅 {connectedAt}</span>
                    )}
                    {accountData?.verified && (
                      <span className="text-blue-600">✓ Verified</span>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        
        {/* Action Button */}
        <button
          onClick={connected ? onDisconnect : onConnect}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex-shrink-0 ${
            loading
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : connected
              ? 'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? '⏳ Connecting...' : connected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </div>
  );
}

function BillingItem({ date, amount, status, invoice }: any) {
  return (
    <div className="p-4 glass-card rounded-lg flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{date}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Invoice {invoice}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-bold text-gray-900 dark:text-white">{amount}</span>
        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
          {status}
        </span>
        <button className="p-2 glass-button rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
          <Download className="w-4 h-4 text-blue-600" />
        </button>
      </div>
    </div>
  );
}

function UsageStat({ label, current, limit }: any) {
  return (
    <div className="p-4 glass-card rounded-lg">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{current}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400">of {limit}</p>
    </div>
  );
}

function SessionItem({ device, location, current }: any) {
  return (
    <div className="p-4 glass-card rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Smartphone className="w-5 h-5 text-gray-600" />
        <div>
          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            {device}
            {current && <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">Current</span>}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{location}</p>
        </div>
      </div>
      {!current && (
        <button className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium">
          Revoke
        </button>
      )}
    </div>
  );
}