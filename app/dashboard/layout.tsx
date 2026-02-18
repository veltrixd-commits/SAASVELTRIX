// Dashboard Layout with Sidebar
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AIChatbot from '@/components/AIChatbot';
import IdeaRecorderWidget from '@/components/ideas/IdeaRecorderWidget';
import { getCurrentUserType, getFeatureLabel } from '@/lib/accessControl';
import { getCurrentUser, getPostLoginRoute, isAuthenticated, signOut } from '@/lib/auth';
import { AvatarImage } from '@/components/AvatarImage';
import { 
  Home, 
  Inbox, 
  Users, 
  MessageCircle, 
  Package, 
  Truck, 
  DollarSign, 
  FileText, 
  Zap, 
  Target, 
  BarChart3,
  Bell,
  Search,
  Menu,
  Settings,
  X,
  Flame,
  ArrowRight,
  Moon,
  Sun,
  Calendar,
  Sparkles,
  Heart,
  TrendingUp,
  Video,
  ShoppingCart,
  Lightbulb,
  LogOut
} from 'lucide-react';
import { initializeDemoData } from '@/lib/demoData';
import { useSubscription } from '@/lib/subscription-context';

const POS_STOREFRONT_STORAGE_KEY = 'posStorefrontMode';
const POS_STOREFRONT_EVENT = 'pos-storefront-mode-change';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [userType, setUserType] = useState<'business' | 'employee' | 'creator' | 'individual'>('business');
  const [hasAccess, setHasAccess] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const [accountInfo, setAccountInfo] = useState({
    name: 'Demo User',
    email: 'demo@veltrix.com',
    avatar: '',
  });
  const [storefrontMode, setStorefrontMode] = useState(false);
  const isPosRoute = pathname?.startsWith('/dashboard/pos');
  const kioskActive = Boolean(storefrontMode && isPosRoute);
  const { planType, permissions } = useSubscription();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.replace('/login');
      return;
    }

    const postLoginRoute = getPostLoginRoute(currentUser);
    if (postLoginRoute !== '/dashboard') {
      router.replace(postLoginRoute);
      return;
    }

    setAccountInfo({
      name: currentUser.fullName?.trim() || currentUser.email || 'Veltrix User',
      email: currentUser.email || 'user@veltrix.com',
      avatar: currentUser.avatar || '',
    });

    setHasAccess(true);
  }, [router]);

  // Load user type and optional demo data toggle
  useEffect(() => {
    setUserType(getCurrentUserType());

    const shouldInitDemo = localStorage.getItem('enableDemoData') === 'true';
    if (shouldInitDemo) {
      initializeDemoData();
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const readStorefrontState = () => {
      const stored = localStorage.getItem(POS_STOREFRONT_STORAGE_KEY);
      setStorefrontMode(stored === 'true');
    };

    readStorefrontState();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === POS_STOREFRONT_STORAGE_KEY) {
        setStorefrontMode(event.newValue === 'true');
      }
    };

    const handleCustomEvent = (event: Event) => {
      const enabled = Boolean((event as CustomEvent<boolean>).detail);
      setStorefrontMode(enabled);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(POS_STOREFRONT_EVENT, handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(POS_STOREFRONT_EVENT, handleCustomEvent as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  // Enforce route-level feature access by plan + user type
  useEffect(() => {
    if (!pathname) return;

    const routePermissionMap: Array<{ prefix: string; permission: keyof typeof permissions }> = [
      { prefix: '/dashboard/inbox', permission: 'canAccessInbox' },
      { prefix: '/dashboard/leads', permission: 'canAccessLeads' },
      { prefix: '/dashboard/conversations', permission: 'canAccessConversations' },
      { prefix: '/dashboard/products', permission: 'canAccessProducts' },
      { prefix: '/dashboard/pos', permission: 'canAccessPOS' },
      { prefix: '/dashboard/delivery', permission: 'canAccessDelivery' },
      { prefix: '/dashboard/finance', permission: 'canAccessFinance' },
      { prefix: '/dashboard/invoices', permission: 'canAccessInvoices' },
      { prefix: '/dashboard/automations', permission: 'canAccessAutomations' },
      { prefix: '/dashboard/pipelines', permission: 'canAccessPipelines' },
      { prefix: '/dashboard/analytics', permission: 'canAccessAnalytics' },
      { prefix: '/dashboard/scheduler', permission: 'canAccessScheduler' },
      { prefix: '/dashboard/wellness', permission: 'canAccessWellness' },
      { prefix: '/dashboard/performance', permission: 'canAccessPerformance' },
      { prefix: '/dashboard/content-studio', permission: 'canAccessContentStudio' },
      { prefix: '/dashboard/productivity', permission: 'canAccessProductivity' },
    ];

    const match = routePermissionMap.find((item) => pathname.startsWith(item.prefix));
    if (match && permissions[match.permission] !== true) {
      if (typeof window !== 'undefined') {
        const message = planType === 'free_trial'
          ? 'This feature is not available on Free Trial. Please upgrade your plan.'
          : 'You do not have access to this feature for your user type.';
        localStorage.setItem('accessDeniedMessage', message);
      }
      router.push('/dashboard');
    }
  }, [pathname, permissions, planType, router]);

  // Theme detection and auto-switching
  useEffect(() => {
    // Check system preference
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check time of day (dark mode between 6 PM and 6 AM)
    const getTimeBasedTheme = () => {
      const hour = new Date().getHours();
      return (hour >= 18 || hour < 6) ? 'dark' : 'light';
    };

    // Check localStorage for user preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    
    // Priority: saved preference > system preference > time-based
    const initialTheme = savedTheme || 
                         (darkModeMediaQuery.matches ? 'dark' : 'light') ||
                         getTimeBasedTheme();
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');

    // Listen for system theme changes
    const handleThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      }
    };

    darkModeMediaQuery.addEventListener('change', handleThemeChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  // Toggle theme manually
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleSignOut = () => {
    signOut();
    setUserMenuOpen(false);
    router.replace('/login');
  };

  // Keyboard shortcut for search (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setUserMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!kioskActive) return;
    setSidebarOpen(false);
    setNotificationsOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [kioskActive]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (kioskActive) {
      document.body.classList.add('pos-storefront-active');
    } else {
      document.body.classList.remove('pos-storefront-active');
    }

    return () => {
      document.body.classList.remove('pos-storefront-active');
    };
  }, [kioskActive]);

  // Demo notifications
  const notifications = [
    { id: 1, type: 'lead', title: 'New Hot Lead', message: 'Sarah Johnson is interested in pricing', time: '5 mins ago', unread: true },
    { id: 2, type: 'message', title: 'WhatsApp Message', message: 'Michael Chen sent a message', time: '12 mins ago', unread: true },
    { id: 3, type: 'invoice', title: 'Invoice Paid', message: 'Invoice #1001 paid - R2,999', time: '1 hour ago', unread: true },
    { id: 4, type: 'delivery', title: 'Order Fulfilled', message: 'Order #1234 marked as complete', time: '2 hours ago', unread: false },
    { id: 5, type: 'automation', title: 'Automation Completed', message: 'Follow-up sequence sent to 5 leads', time: '3 hours ago', unread: false },
  ];

  // Quick search results
  const searchResults = [
    { type: 'page', title: 'Leads', icon: '👥', path: '/dashboard/leads' },
    { type: 'page', title: 'Inbox', icon: '📥', path: '/dashboard/inbox' },
    { type: 'page', title: 'Products', icon: '📦', path: '/dashboard/products' },
    { type: 'page', title: 'Finance', icon: '💰', path: '/dashboard/finance' },
    { type: 'lead', title: 'Sarah Johnson', icon: '🔥', path: '/dashboard/leads/lead1', subtitle: 'Hot Lead - TikTok' },
    { type: 'lead', title: 'Michael Chen', icon: '💬', path: '/dashboard/leads/lead2', subtitle: 'WhatsApp - Demo Request' },
  ].filter(item => 
    searchQuery.length > 0 && 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userInitial = accountInfo.name?.charAt(0)?.toUpperCase() || 'U';

  const navLinks = [
    // Autopilot Primary Entry
    { href: '/dashboard/today', label: 'Today', icon: Sparkles, color: 'text-purple-600', section: 'main', permission: null },
    { href: '/dashboard', label: 'Dashboard', icon: Home, color: 'text-blue-600', section: 'main', permission: null },
    
    // Personal OS Section
    { href: '/dashboard/productivity', label: 'Productivity', icon: Target, color: 'text-purple-600', section: 'personal', permission: 'canAccessProductivity' },
    { href: '/dashboard/ideas', label: 'Ideas', icon: Lightbulb, color: 'text-yellow-500', section: 'personal', permission: null },
    { href: '/dashboard/wellness', label: 'Wellness', icon: Heart, color: 'text-green-600', section: 'personal', permission: 'canAccessWellness' },
    { href: '/dashboard/performance', label: 'Performance', icon: TrendingUp, color: 'text-yellow-600', section: 'personal', permission: 'canAccessPerformance' },
    { href: '/dashboard/content-studio', label: 'Content Studio', icon: Video, color: 'text-pink-600', section: 'personal', permission: 'canAccessContentStudio' },
    { href: '/dashboard/budget', label: 'Personal Budget', icon: DollarSign, color: 'text-green-600', section: 'personal', permission: null },
    
    // Business Tools
    { href: '/dashboard/inbox', label: 'Inbox', icon: Inbox, color: 'text-purple-600', section: 'business', permission: 'canAccessInbox' },
    { href: '/dashboard/leads', label: 'Leads', icon: Users, color: 'text-pink-600', section: 'business', permission: 'canAccessLeads' },
    { href: '/dashboard/conversations', label: 'Conversations', icon: MessageCircle, color: 'text-green-600', section: 'business', permission: 'canAccessConversations' },
    { href: '/dashboard/products', label: 'Products', icon: Package, color: 'text-orange-600', section: 'business', permission: 'canAccessProducts' },
    { href: '/dashboard/pos', label: 'Point of Sale', icon: ShoppingCart, color: 'text-teal-600', section: 'business', permission: 'canAccessPOS' },
    { href: '/dashboard/delivery', label: 'Delivery', icon: Truck, color: 'text-cyan-600', section: 'business', permission: 'canAccessDelivery' },
    { href: '/dashboard/finance', label: 'Finance Centre', icon: DollarSign, color: 'text-emerald-600', section: 'business', permission: 'canAccessFinance' },
    { href: '/dashboard/invoices', label: 'Invoices', icon: FileText, color: 'text-indigo-600', section: 'business', permission: 'canAccessInvoices' },
    { href: '/dashboard/automations', label: 'Automations', icon: Zap, color: 'text-yellow-600', section: 'business', permission: 'canAccessAutomations' },
    { href: '/dashboard/pipelines', label: 'Pipelines', icon: Target, color: 'text-red-600', section: 'business', permission: 'canAccessPipelines' },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, color: 'text-violet-600', section: 'business', permission: 'canAccessAnalytics' },
    { href: '/dashboard/scheduler', label: 'Scheduler', icon: Calendar, color: 'text-purple-500', section: 'business', permission: 'canAccessScheduler' },
    
    // Settings
    { href: '/dashboard/settings', label: 'Settings', icon: Settings, color: 'text-gray-600', section: 'settings', permission: null },
  ].filter(link => {
    // If no permission required (null), always show
    if (!link.permission) return true;
    
    // Check if user has permission
    return permissions[link.permission as keyof typeof permissions] === true;
  });

  if (!hasAccess) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${kioskActive ? 'overflow-hidden' : ''}`}>
      {/* Mobile Overlay */}
      {!kioskActive && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Notification Panel Overlay */}
      {!kioskActive && notificationsOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setNotificationsOpen(false)}
        />
      )}

      {/* Search Modal Overlay */}
      {!kioskActive && searchOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setSearchOpen(false)}
        />
      )}

      {/* Sidebar */}
      {!kioskActive && (
        <aside
          className={`fixed top-0 left-0 h-full w-64 glass-panel transform transition-all duration-300 ease-in-out z-50 flex flex-col ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
        >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Veltrix
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 glass-button rounded-lg text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar min-h-0">
          {/* Main Dashboard */}
          <div className="mb-6">
            {navLinks.filter(link => link.section === 'main').map((link, index) => {
              const IconComponent = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-3 glass-nav rounded-xl transition-all font-medium group text-gray-700 hover:text-primary-600"
                  onClick={() => setSidebarOpen(false)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <IconComponent className={`w-5 h-5 ${link.color} group-hover:scale-110 transition-all duration-200`} />
                  <span className="text-sm">{link.label}</span>
                </a>
              );
            })}
          </div>

          {/* Personal OS Section */}
          <div className="mb-6">
            <div className="px-4 mb-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Personal OS</span>
            </div>
            <div className="space-y-2">
              {navLinks.filter(link => link.section === 'personal').map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 glass-nav rounded-xl transition-all font-medium group text-gray-700 hover:text-primary-600"
                    onClick={() => setSidebarOpen(false)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <IconComponent className={`w-5 h-5 ${link.color} group-hover:scale-110 transition-all duration-200`} />
                    <span className="text-sm">{link.label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Business Tools Section */}
          <div className="mb-4">
            <div className="px-4 mb-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Business Tools</span>
            </div>
            <div className="space-y-2">
              {navLinks.filter(link => link.section === 'business').map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 glass-nav rounded-xl transition-all font-medium group text-gray-700 hover:text-primary-600"
                    onClick={() => setSidebarOpen(false)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <IconComponent className={`w-5 h-5 ${link.color} group-hover:scale-110 transition-all duration-200`} />
                    <span className="text-sm">{link.label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Settings Section */}
          <div className="mb-4">
            <div className="space-y-2">
              {navLinks.filter(link => link.section === 'settings').map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 glass-nav rounded-xl transition-all font-medium group text-gray-700 hover:text-primary-600"
                    onClick={() => setSidebarOpen(false)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <IconComponent className={`w-5 h-5 ${link.color} group-hover:scale-110 transition-all duration-200`} />
                    <span className="text-sm">{link.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex-shrink-0">
          <div className="glass-card rounded-xl p-3">
            <div className="flex items-center gap-3 mb-3">
              <AvatarImage
                name={accountInfo.name}
                email={accountInfo.email}
                src={accountInfo.avatar}
                size="sm"
                className="shadow-lg"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{accountInfo.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{accountInfo.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <a
                href="/dashboard/tour"
                className="w-full px-3 py-2 text-xs glass-button rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                Take Tour
              </a>
              <button
                onClick={() => router.push('/dashboard/settings')}
                className="w-full px-3 py-2 text-xs glass-button rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                Settings
              </button>
              <button
                onClick={handleSignOut}
                className="w-full px-3 py-2 text-xs glass-button rounded-lg font-medium text-red-600 hover:text-red-700 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>
      )}

      {/* Main Content Area */}
      <div className={`${kioskActive ? '' : 'lg:pl-64'} min-h-screen bg-gray-50 dark:bg-gray-900`}>
        {/* Top Bar */}
        {!kioskActive && (
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-sm border-b border-gray-200 dark:border-gray-800">
          <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
            {/* Left: Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 glass-button rounded-xl hover:scale-105 transition-transform"
            >
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Center: Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-md mx-auto">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-2 glass-input rounded-xl text-left text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-all"
              >
                <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="text-sm">Search anything...</span>
                <kbd className="ml-auto px-2 py-1 text-xs glass-button rounded">⌘K</kbd>
              </button>
            </div>

            {/* Right: Notifications and Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Button (Mobile) */}
              <button
                onClick={() => setSearchOpen(true)}
                className="md:hidden p-2.5 glass-button rounded-xl hover:scale-105 transition-all relative group"
              >
                <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>

              {/* Notifications */}
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2.5 glass-button rounded-xl hover:scale-105 transition-all relative group"
              >
                <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
                  {notifications.filter(n => n.unread).length}
                </span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 glass-button rounded-xl hover:scale-105 transition-all group"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-700" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-500" />
                )}
              </button>

              {/* User Avatar (Mobile) */}
              <div className="relative lg:hidden" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="rounded-xl shadow-lg hover:scale-110 transition-transform"
                  aria-label="Open account menu"
                >
                  <AvatarImage
                    name={accountInfo.name}
                    email={accountInfo.email}
                    src={accountInfo.avatar}
                    size="sm"
                    className="w-9 h-9"
                    showBorder={false}
                  />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 glass-panel rounded-2xl shadow-2xl p-4 animate-in fade-in">
                    <div className="flex items-center gap-3 mb-3">
                      <AvatarImage
                        name={accountInfo.name}
                        email={accountInfo.email}
                        src={accountInfo.avatar}
                        size="sm"
                        className="w-10 h-10"
                        showBorder={false}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{accountInfo.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{accountInfo.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setUserMenuOpen(false); router.push('/dashboard/settings'); }}
                      className="w-full px-3 py-2 text-xs glass-button rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-between"
                    >
                      <span>Account Settings</span>
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full mt-2 px-3 py-2 text-xs glass-button rounded-lg font-medium text-red-600 hover:text-red-700 flex items-center justify-between"
                    >
                      <span>Sign Out</span>
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        )}

        {/* Notification Panel */}
        {!kioskActive && notificationsOpen && (
          <div className="fixed right-4 top-20 w-80 sm:w-96 max-h-[80vh] glass-panel rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-right">
            <div className="p-4 border-b border-white/20 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </h3>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="p-1 glass-button rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500">You have {notifications.filter(n => n.unread).length} unread notifications</p>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-white/10 hover:bg-white/50 transition-all cursor-pointer ${
                    notif.unread ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      notif.type === 'lead' ? 'bg-red-100' :
                      notif.type === 'message' ? 'bg-green-100' :
                      notif.type === 'invoice' ? 'bg-purple-100' :
                      notif.type === 'delivery' ? 'bg-orange-100' :
                      'bg-blue-100'
                    }`}>
                      {notif.type === 'lead' ? <Flame className="w-5 h-5 text-red-600" /> :
                       notif.type === 'message' ? <MessageCircle className="w-5 h-5 text-green-600" /> :
                       notif.type === 'invoice' ? <DollarSign className="w-5 h-5 text-purple-600" /> :
                       notif.type === 'delivery' ? <Package className="w-5 h-5 text-orange-600" /> :
                       <Zap className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{notif.title}</p>
                        {notif.unread && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notif.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-white/20">
              <button className="w-full px-4 py-2 glass-button rounded-xl text-sm font-medium text-primary-600 hover:scale-105 transition-all">
                View All Notifications
              </button>
            </div>
          </div>
        )}

        {/* Search Modal */}
        {!kioskActive && searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <div className="w-full max-w-2xl glass-panel rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-4 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search pages, leads, products..."
                    autoFocus
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <button
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                    className="p-1.5 glass-button rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {searchQuery.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((result, index) => (
                      <a
                        key={index}
                        href={result.path}
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        className="flex items-center gap-3 p-4 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all border-b border-white/10 dark:border-gray-700 cursor-pointer"
                      >
                        <span className="text-2xl">{result.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white">{result.title}</p>
                          {result.subtitle && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{result.subtitle}</p>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </a>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Quick Links</p>
                  <div className="grid grid-cols-2 gap-3">
                    <a href="/dashboard/leads" className="glass-button p-3 rounded-xl text-center hover:scale-105 transition-all">
                      <Users className="w-8 h-8 mx-auto mb-1 text-pink-600" />
                      <span className="text-xs font-medium">Leads</span>
                    </a>
                    <a href="/dashboard/inbox" className="glass-button p-3 rounded-xl text-center hover:scale-105 transition-all">
                      <Inbox className="w-8 h-8 mx-auto mb-1 text-purple-600" />
                      <span className="text-xs font-medium">Inbox</span>
                    </a>
                    <a href="/dashboard/products" className="glass-button p-3 rounded-xl text-center hover:scale-105 transition-all">
                      <Package className="w-8 h-8 mx-auto mb-1 text-orange-600" />
                      <span className="text-xs font-medium">Products</span>
                    </a>
                    <a href="/dashboard/finance" className="glass-button p-3 rounded-xl text-center hover:scale-105 transition-all">
                      <DollarSign className="w-8 h-8 mx-auto mb-1 text-emerald-600" />
                      <span className="text-xs font-medium">Finance</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className={`${kioskActive ? 'p-0 h-screen' : 'p-4 sm:p-6 lg:p-8'}`}>
          <div className={kioskActive ? 'h-full' : 'max-w-7xl mx-auto'}>
            {children}
          </div>
        </main>
      </div>

      {/* Global AI Chatbot */}
      {!kioskActive && <AIChatbot />}
      {!kioskActive && <IdeaRecorderWidget />}
    </div>
  )
}
