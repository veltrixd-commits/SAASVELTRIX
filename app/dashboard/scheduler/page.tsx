// Content Scheduler - Schedule posts across all platforms
'use client';

import { useState } from 'react';
import { Calendar, Clock, Image, Send, Plus, Edit, Trash2, Music, MessageCircle, Facebook, Instagram, Linkedin, Globe, CheckCircle, XCircle } from 'lucide-react';

interface ScheduledPost {
  id: number;
  content: string;
  platforms: string[];
  scheduledTime: string;
  status: 'scheduled' | 'published' | 'failed';
  imageUrl?: string;
}

export default function SchedulerPage() {
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [postContent, setPostContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');

  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([
    {
      id: 1,
      content: "New product launch! 🚀 Check out our latest collection.",
      platforms: ['TikTok', 'Instagram', 'Facebook'],
      scheduledTime: '2026-02-14 10:00',
      status: 'scheduled',
    },
    {
      id: 2,
      content: "Happy Valentine's Day! ❤️ Special offer inside.",
      platforms: ['WhatsApp', 'Facebook'],
      scheduledTime: '2026-02-14 14:00',
      status: 'scheduled',
    },
    {
      id: 3,
      content: "Flash sale alert! 50% off everything for 24 hours only!",
      platforms: ['TikTok', 'Instagram', 'Facebook', 'LinkedIn'],
      scheduledTime: '2026-02-13 18:00',
      status: 'published',
    },
  ]);

  const platforms = [
    { name: 'TikTok', icon: Music, color: 'bg-black' },
    { name: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500' },
    { name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
    { name: 'Instagram', icon: Instagram, color: 'bg-pink-500' },
    { name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
    { name: 'Website', icon: Globe, color: 'bg-gray-700' },
  ];

  const togglePlatform = (platformName: string) => {
    if (selectedPlatforms.includes(platformName)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platformName));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformName]);
    }
  };

  const handleSchedulePost = () => {
    if (!postContent || !scheduledDate || !scheduledTime || selectedPlatforms.length === 0) {
      alert('Please fill in all fields and select at least one platform');
      return;
    }

    const newPost: ScheduledPost = {
      id: scheduledPosts.length + 1,
      content: postContent,
      platforms: selectedPlatforms,
      scheduledTime: `${scheduledDate} ${scheduledTime}`,
      status: 'scheduled',
    };

    setScheduledPosts([...scheduledPosts, newPost]);
    
    // Reset form
    setPostContent('');
    setScheduledDate('');
    setScheduledTime('');
    setSelectedPlatforms([]);
    setShowModal(false);
  };

  const deletePost = (id: number) => {
    setScheduledPosts(scheduledPosts.filter(post => post.id !== id));
  };

  const getPlatformIcon = (platformName: string) => {
    const platform = platforms.find(p => p.name === platformName);
    if (!platform) return Globe;
    return platform.icon;
  };

  const getPlatformColor = (platformName: string) => {
    const platform = platforms.find(p => p.name === platformName);
    if (!platform) return 'bg-gray-700';
    return platform.color;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-600" />
            Content scheduler command
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Line up every platform in one shot—no spreadsheets, no guesswork.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:scale-105 transition-all shadow-lg hover:shadow-2xl flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Schedule post now
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {scheduledPosts.filter(p => p.status === 'scheduled').length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Queued posts</p>
        </div>
        
        <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {scheduledPosts.filter(p => p.status === 'published').length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Already shipped</p>
        </div>
        
        <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-all">
          <div className="flex items-center justify-between mb-3">
            <Send className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {scheduledPosts.reduce((acc, post) => acc + post.platforms.length, 0)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Placements covered</p>
        </div>
      </div>

      {/* Scheduled Posts List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming & Recent Posts</h2>
        
        {scheduledPosts.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">Nothing queued yet</p>
            <button 
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:scale-105 transition-all"
            >
              Schedule the first post now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {scheduledPosts.map((post) => {
              const Icon = post.status === 'published' ? CheckCircle : 
                          post.status === 'failed' ? XCircle : Clock;
              const statusColor = post.status === 'published' ? 'text-green-600' : 
                                 post.status === 'failed' ? 'text-red-600' : 'text-blue-600';
              
              return (
                <div key={post.id} className="glass-card rounded-2xl p-6 hover:scale-[1.01] transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-5 h-5 ${statusColor}`} />
                        <span className={`text-sm font-semibold ${statusColor} capitalize`}>
                          {post.status}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          • {post.scheduledTime}
                        </span>
                      </div>
                      <p className="text-gray-900 dark:text-white mb-3">{post.content}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {post.platforms.map((platform, idx) => {
                          const PlatformIcon = getPlatformIcon(platform);
                          const platformColor = getPlatformColor(platform);
                          
                          return (
                            <div 
                              key={idx}
                              className={`flex items-center gap-1 px-3 py-1 rounded-lg ${platformColor} text-white text-sm font-medium`}
                            >
                              <PlatformIcon className="w-4 h-4" />
                              {platform}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button className="p-2 glass-button rounded-lg hover:scale-110 transition-all">
                        <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button 
                        onClick={() => deletePost(post.id)}
                        className="p-2 glass-button rounded-lg hover:scale-110 transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Post Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule a post now</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 glass-button rounded-lg hover:scale-110 transition-all"
              >
                <XCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Post Content */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Post content
                </label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What would you like to share?"
                  className="w-full px-4 py-3 glass-input rounded-xl text-gray-900 dark:text-white resize-none"
                  rows={4}
                />
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Attach media
                </label>
                <div className="space-y-3">
                  {!mediaPreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 glass-input rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload image or video</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setMediaFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setMediaPreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  ) : (
                    <div className="relative">
                      {mediaFile?.type.startsWith('video/') ? (
                        <video src={mediaPreview} className="w-full h-48 object-cover rounded-xl" controls />
                      ) : (
                        <img src={mediaPreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                      )}
                      <button
                        onClick={() => {
                          setMediaFile(null);
                          setMediaPreview('');
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select platforms
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {platforms.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = selectedPlatforms.includes(platform.name);
                    
                    return (
                      <button
                        key={platform.name}
                        onClick={() => togglePlatform(platform.name)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                          isSelected 
                            ? `${platform.color} text-white shadow-lg scale-105` 
                            : 'glass-button text-gray-700 dark:text-gray-300 hover:scale-105'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {platform.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add media (photo/video)
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setMediaFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setMediaPreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-4 py-3 glass-input rounded-xl text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                  />
                  {mediaPreview && (
                    <div className="relative">
                      {mediaFile?.type.startsWith('image/') ? (
                        <img src={mediaPreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                      ) : (
                        <video src={mediaPreview} className="w-full h-48 object-cover rounded-xl" controls />
                      )}
                      <button
                        onClick={() => {
                          setMediaFile(null);
                          setMediaPreview('');
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Drop date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-4 py-3 glass-input rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Drop time
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-4 py-3 glass-input rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 glass-button rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:scale-105 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedulePost}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:scale-105 transition-all shadow-lg"
                >
                  Schedule post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
