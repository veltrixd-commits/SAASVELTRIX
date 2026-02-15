// Alarm Clock & Task Alerts System
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, Bell, BellRing, Plus, X, Trash2, Moon, Sun } from 'lucide-react';

interface Alarm {
  id: string;
  time: string;
  label: string;
  type: 'sleep' | 'wake' | 'task';
  enabled: boolean;
  days?: string[];
}

interface TaskAlert {
  id: string;
  title: string;
  time: string;
  enabled: boolean;
}

export default function AlarmClock() {
  const [showModal, setShowModal] = useState(false);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [taskAlerts, setTaskAlerts] = useState<TaskAlert[]>([]);
  const [newAlarm, setNewAlarm] = useState({
    time: '',
    label: '',
    type: 'wake' as 'sleep' | 'wake' | 'task',
    days: [] as string[]
  });

  const triggerAlarm = useCallback((alarm: Alarm) => {
    // Trigger browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${alarm.type === 'sleep' ? '😴' : '☀️'} ${alarm.label}`, {
        body: `It's time: ${alarm.time}`,
        icon: '/icon.png',
        badge: '/badge.png'
      });
    }

    // Play sound (if available)
    const audio = new Audio('/alarm.mp3');
    audio.play().catch(() => {});

    // Show in-app alert
    alert(`⏰ ${alarm.label}\nTime: ${alarm.time}`);
  }, []);

  const triggerTaskAlert = useCallback((task: TaskAlert) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('📋 Task Reminder', {
        body: task.title,
        icon: '/icon.png'
      });
    }
    alert(`📋 Task Reminder\n${task.title}`);
  }, []);

  const checkAlarms = useCallback(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];

    alarms.forEach(alarm => {
      if (alarm.enabled && alarm.time === currentTime) {
        if (!alarm.days || alarm.days.length === 0 || alarm.days.includes(currentDay)) {
          triggerAlarm(alarm);
        }
      }
    });

    taskAlerts.forEach(alert => {
      if (alert.enabled && alert.time === currentTime) {
        triggerTaskAlert(alert);
      }
    });
  }, [alarms, taskAlerts, triggerAlarm, triggerTaskAlert]);

  useEffect(() => {
    // Load alarms from localStorage
    const storedAlarms = localStorage.getItem('userAlarms');
    const storedTasks = localStorage.getItem('taskAlerts');
    
    if (storedAlarms) {
      try {
        setAlarms(JSON.parse(storedAlarms));
      } catch (e) {
        console.error('Failed to load alarms');
      }
    }

    if (storedTasks) {
      try {
        setTaskAlerts(JSON.parse(storedTasks));
      } catch (e) {
        console.error('Failed to load task alerts');
      }
    }
  }, []);

  useEffect(() => {
    // Check alarms immediately on load
    checkAlarms();

    // Check alarms every minute
    const interval = setInterval(checkAlarms, 60000);
    return () => clearInterval(interval);
  }, [checkAlarms]);

  const addAlarm = () => {
    if (!newAlarm.time || !newAlarm.label) {
      alert('Please fill in all fields');
      return;
    }

    const alarm: Alarm = {
      id: Date.now().toString(),
      time: newAlarm.time,
      label: newAlarm.label,
      type: newAlarm.type,
      enabled: true,
      days: newAlarm.days
    };

    const updated = [...alarms, alarm];
    setAlarms(updated);
    localStorage.setItem('userAlarms', JSON.stringify(updated));

    setNewAlarm({ time: '', label: '', type: 'wake', days: [] });
    setShowModal(false);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const toggleAlarm = (id: string) => {
    const updated = alarms.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    );
    setAlarms(updated);
    localStorage.setItem('userAlarms', JSON.stringify(updated));
  };

  const deleteAlarm = (id: string) => {
    const updated = alarms.filter(a => a.id !== id);
    setAlarms(updated);
    localStorage.setItem('userAlarms', JSON.stringify(updated));
  };

  const toggleDay = (day: string) => {
    setNewAlarm(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Alarms & Alerts
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your sleep, wake-up times, and task reminders
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Alarm
        </button>
      </div>

      {/* Alarms List */}
      <div className="space-y-3">
        {alarms.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No alarms set. Add your first alarm to get started!
          </div>
        ) : (
          alarms.map(alarm => (
            <div key={alarm.id} className="glass-card rounded-lg p-4 flex items-center justify-between hover:scale-[1.02] transition-all">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-3xl">
                  {alarm.type === 'sleep' ? <Moon className="w-8 h-8 text-indigo-600" /> : <Sun className="w-8 h-8 text-yellow-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{alarm.time}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      alarm.type === 'sleep' 
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {alarm.type === 'sleep' ? 'Sleep' : 'Wake Up'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alarm.label}</p>
                  {alarm.days && alarm.days.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {alarm.days.map(day => (
                        <span key={day} className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                          {day}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAlarm(alarm.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    alarm.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      alarm.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <button
                  onClick={() => deleteAlarm(alarm.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Alarm Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New Alarm</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alarm Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setNewAlarm({...newAlarm, type: 'sleep'})}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      newAlarm.type === 'sleep'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    <Moon className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
                    <div className="text-sm font-medium">Sleep Time</div>
                  </button>
                  <button
                    onClick={() => setNewAlarm({...newAlarm, type: 'wake'})}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      newAlarm.type === 'wake'
                        ? 'border-yellow-600 bg-yellow-50 dark:bg-yellow-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-yellow-300'
                    }`}
                  >
                    <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                    <div className="text-sm font-medium">Wake Up</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={newAlarm.time}
                  onChange={(e) => setNewAlarm({...newAlarm, time: e.target.value})}
                  className="w-full px-4 py-3 glass-input rounded-xl border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Label
                </label>
                <input
                  type="text"
                  value={newAlarm.label}
                  onChange={(e) => setNewAlarm({...newAlarm, label: e.target.value})}
                  placeholder="e.g., Morning Workout, Bedtime Routine"
                  className="w-full px-4 py-3 glass-input rounded-xl border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Repeat Days (Optional)
                </label>
                <div className="flex gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        newAlarm.days.includes(day)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={addAlarm}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-lg"
              >
                Add Alarm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
