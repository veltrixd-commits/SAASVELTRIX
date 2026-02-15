'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Users, DollarSign, Target, Eye, MousePointer, Calendar, Clock } from 'lucide-react';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');

  const stats = [
    { 
      label: 'Total Revenue', 
      value: 'R284,500', 
      change: '+23.5%', 
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      chartData: [45, 52, 48, 65, 70, 68, 75]
    },
    { 
      label: 'Active Users', 
      value: '2,847', 
      change: '+12.3%', 
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      chartData: [120, 135, 142, 138, 155, 148, 165]
    },
    { 
      label: 'Conversion Rate', 
      value: '34.2%', 
      change: '-2.4%', 
      trend: 'down',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      chartData: [38, 36, 35, 37, 34, 33, 34]
    },
    { 
      label: 'Page Views', 
      value: '18,492', 
      change: '+18.7%', 
      trend: 'up',
      icon: Eye,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      chartData: [890, 920, 950, 1020, 1080, 1150, 1200]
    }
  ];

  const channels = [
    { name: 'TikTok', visitors: 8420, conversions: 342, revenue: 'R125,400', color: 'bg-black' },
    { name: 'WhatsApp', visitors: 6840, conversions: 298, revenue: 'R98,250', color: 'bg-green-500' },
    { name: 'Instagram', visitors: 5230, conversions: 215, revenue: 'R67,890', color: 'bg-pink-500' },
    { name: 'Facebook', visitors: 3920, conversions: 178, revenue: 'R52,340', color: 'bg-blue-600' },
    { name: 'LinkedIn', visitors: 2180, conversions: 124, revenue: 'R38,920', color: 'bg-blue-700' }
  ];

  const topPages = [
    { page: '/dashboard', views: 4820, avgTime: '3:24', bounceRate: '12.3%' },
    { page: '/products', views: 3650, avgTime: '4:12', bounceRate: '18.5%' },
    { page: '/pricing', views: 2890, avgTime: '2:45', bounceRate: '24.7%' },
    { page: '/leads', views: 2340, avgTime: '5:18', bounceRate: '8.2%' },
    { page: '/automations', views: 1920, avgTime: '4:56', bounceRate: '15.4%' }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 45000, leads: 120 },
    { month: 'Feb', revenue: 52000, leads: 145 },
    { month: 'Mar', revenue: 48000, leads: 132 },
    { month: 'Apr', revenue: 65000, leads: 178 },
    { month: 'May', revenue: 70000, leads: 195 },
    { month: 'Jun', revenue: 68000, leads: 186 },
    { month: 'Jul', revenue: 75000, leads: 210 }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-violet-500 drop-shadow-[0_0_10px_rgba(139,92,246,0.7)]" />
            Analytics Command Board
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Interrogate every channel, catch the leak, order the next move.</p>
        </div>
      </div>

      {/* Floating Time Range Tabs */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-2">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { label: '24h Damage Scan', value: '24h' },
            { label: '7d Trend Check', value: '7d' },
            { label: '30d Runway View', value: '30d' },
            { label: '90d Pattern Hunt', value: '90d' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                timeRange === range.value
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className={`flex items-center gap-1 text-sm font-semibold ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendIcon className="w-4 h-4" />
                  {stat.change}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{stat.label}</p>
              
              {/* Mini Chart */}
              <div className="flex items-end gap-1 h-12">
                {stat.chartData.map((value, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-blue-600 to-purple-600 rounded-t opacity-70 hover:opacity-100 transition-all"
                    style={{ height: `${(value / Math.max(...stat.chartData)) * 100}%` }}
                  ></div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Revenue vs Lead Throughput</h3>
        <div className="h-80">
          <div className="flex items-end justify-between h-full gap-4">
            {revenueData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full">
                <div className="flex-1 w-full flex flex-col justify-end gap-2">
                  <div className="relative group">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-xl hover:opacity-90 transition-all"
                      style={{ height: `${(data.revenue / 75000) * 200}px` }}
                    ></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                      R{(data.revenue / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <div 
                    className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-xl hover:opacity-90 transition-all"
                    style={{ height: `${(data.leads / 210) * 100}px` }}
                  ></div>
                </div>
                <p className="text-sm font-medium text-gray-600">{data.month}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-8 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
            <span className="text-sm text-gray-600">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-400 rounded"></div>
            <span className="text-sm text-gray-600">Leads</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Channel Pressure Test</h3>
          <div className="space-y-4">
            {channels.map((channel, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 ${channel.color} rounded-full`}></div>
                    <span className="font-semibold text-gray-900 dark:text-white">{channel.name}</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">{channel.visitors.toLocaleString()} visitors</span>
                </div>
                <div className="relative h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`absolute h-full ${channel.color} rounded-full transition-all`}
                    style={{ width: `${(channel.visitors / 8420) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{channel.conversions} conversions</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{channel.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Pages Pulling Their Weight</h3>
          <div className="space-y-3">
            {topPages.map((page, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{page.page}</span>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{page.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {page.avgTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <MousePointer className="w-3 h-3" />
                    {page.bounceRate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
