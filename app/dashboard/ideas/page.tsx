'use client';

import { useState, useEffect, useRef, useCallback, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Mic, Square, Play, Pause, Trash2, Lightbulb, Plus, Clock, Calendar, Download, Tag, Share2, FileText, Link2 } from 'lucide-react';

interface Idea {
  id: string;
  title: string;
  audioBlob: string; // Base64 encoded audio
  duration: number;
  createdAt: string;
  category: string;
  notes?: string;
  transcript?: string;
  tags?: string[];
  linkedTask?: string;
  shareToken?: string;
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaCategory, setNewIdeaCategory] = useState('general');
  const [newIdeaNotes, setNewIdeaNotes] = useState('');
  const [newIdeaTags, setNewIdeaTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [linkedTask, setLinkedTask] = useState('');
  const [pendingAudioBlob, setPendingAudioBlob] = useState<string | null>(null);
  const [pendingDuration, setPendingDuration] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [showTranscriptPanel, setShowTranscriptPanel] = useState(false);
  const [activeTranscript, setActiveTranscript] = useState('');
  const [shareCopiedId, setShareCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const fetchIdeas = useCallback(async () => {
    try {
      const response = await fetch('/api/ideas', { cache: 'no-store' });
      const data = await response.json();
      setIdeas(Array.isArray(data.ideas) ? data.ideas : []);
    } catch (error) {
      console.error('Unable to load ideas', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setLiveTranscript('');

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setPendingAudioBlob(base64Audio);
          setPendingDuration(recordingTime);
          setShowTitleModal(true);
        };

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.onresult = (event: any) => {
          const transcriptText = Array.from(event.results)
            .map((result: any) => result[0]?.transcript || '')
            .join(' ');
          setLiveTranscript(transcriptText.trim());
        };
        recognition.onerror = () => {
          recognition.stop();
        };
        recognition.start();
      }

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      alert('Could not access microphone. Please allow microphone permissions.');
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    }
  };

  const saveIdea = async () => {
    if (!newIdeaTitle.trim() || !pendingAudioBlob) {
      alert('Please enter a title for your idea');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newIdeaTitle,
          audioBlob: pendingAudioBlob,
          duration: pendingDuration,
          category: newIdeaCategory,
          notes: newIdeaNotes,
          transcript: liveTranscript || newIdeaNotes,
          tags: newIdeaTags,
          linkedTask,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save idea');
      }

      const data = await response.json();
      const createdIdea = data.idea as Idea;
      setIdeas((prev) => [createdIdea, ...prev]);
      setShowTitleModal(false);
      setNewIdeaTitle('');
      setNewIdeaCategory('general');
      setNewIdeaNotes('');
      setNewIdeaTags([]);
      setTagInput('');
      setLinkedTask('');
      setPendingAudioBlob(null);
      setPendingDuration(0);
      setRecordingTime(0);
      setLiveTranscript('');
    } catch (error) {
      console.error(error);
      alert('Could not save your idea. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const playIdea = (ideaId: string) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;

    if (currentPlayingId === ideaId) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setCurrentPlayingId(null);
      setShowTranscriptPanel(false);
    } else {
      // Start playing
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(idea.audioBlob);
      audioRef.current = audio;
      audio.play();
      setCurrentPlayingId(ideaId);
      if (idea.transcript || idea.notes) {
        setActiveTranscript(idea.transcript || idea.notes || '');
        setShowTranscriptPanel(true);
      } else {
        setActiveTranscript('Transcription not available yet.');
        setShowTranscriptPanel(true);
      }
      
      audio.onended = () => {
        setCurrentPlayingId(null);
        setShowTranscriptPanel(false);
      };
    }
  };

  const deleteIdea = async (ideaId: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) return;

    try {
      const response = await fetch(`/api/ideas?id=${ideaId}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete idea');
      }
      setIdeas((prev) => prev.filter(i => i.id !== ideaId));
      if (currentPlayingId === ideaId) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setCurrentPlayingId(null);
        setShowTranscriptPanel(false);
      }
    } catch (error) {
      console.error(error);
      alert('Unable to delete idea. Please try again.');
    }
  };

  const downloadIdea = (idea: Idea) => {
    const link = document.createElement('a');
    link.href = idea.audioBlob;
    link.download = `${idea.title}.webm`;
    link.click();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTagKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = tagInput.trim();
      if (value && !newIdeaTags.includes(value)) {
        setNewIdeaTags([...newIdeaTags, value]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setNewIdeaTags((prev) => prev.filter((item) => item !== tag));
  };

  const buildShareLink = (idea: Idea) => {
    if (typeof window === 'undefined') return '';
    const token = idea.shareToken || idea.id;
    return `${window.location.origin}/dashboard/ideas?share=${token}`;
  };

  const copyShareLink = async (idea: Idea) => {
    const link = buildShareLink(idea);
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setShareCopiedId(idea.id);
      setTimeout(() => setShareCopiedId(null), 2000);
    } catch (error) {
      console.error('Clipboard error', error);
    }
  };

  const categories = [
    { value: 'general', label: '💡 General', color: 'blue' },
    { value: 'business', label: '💼 Business', color: 'purple' },
    { value: 'product', label: '📦 Product', color: 'green' },
    { value: 'content', label: '🎬 Content', color: 'pink' },
    { value: 'personal', label: '🌟 Personal', color: 'yellow' }
  ];

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || 'gray';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-6 mb-6 shadow-xl">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Lightbulb className="w-8 h-8" />
            Voice Ideas Recorder
          </h1>
          <p className="text-white/90 mt-2">Capture your brilliant ideas instantly with voice notes</p>
        </div>

        {/* Recording Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 mb-6 shadow-lg">
          <div className="text-center">
            <div className="mb-6">
              {isRecording ? (
                <div className="inline-flex flex-col items-center">
                  <div className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center animate-pulse mb-4">
                    <Mic className="w-16 h-16 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {formatTime(recordingTime)}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Recording in progress...</p>
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all"
                  >
                    <Square className="w-6 h-6" />
                    Stop Recording
                  </button>
                </div>
              ) : (
                <div className="inline-flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <Mic className="w-16 h-16 text-white" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Ready to capture your next big idea?</p>
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105"
                  >
                    <Mic className="w-6 h-6" />
                    Start Recording
                  </button>
                </div>
              )}
            </div>
          </div>
            {!speechSupported && (
              <p className="text-center text-sm text-red-500">Live transcription is not supported in this browser. Recording still works.</p>
            )}
        </div>

        {showTranscriptPanel && (
          <div className="fixed bottom-24 right-6 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 shadow-2xl rounded-2xl p-4 w-72 z-40">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Live Transcript</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line max-h-48 overflow-y-auto">
              {activeTranscript || 'Listening...'}
            </p>
          </div>
        )}

        {/* Ideas List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Lightbulb className="w-6 h-6" />
              My Ideas ({ideas.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto animate-spin mb-4"></div>
              <p className="text-gray-500">Loading your recorded ideas...</p>
            </div>
          ) : ideas.length === 0 ? (
            <div className="text-center py-12">
              <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No ideas recorded yet</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">Click the button above to record your first idea!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ideas.map(idea => {
                const categoryColor = getCategoryColor(idea.category);
                const isPlaying = currentPlayingId === idea.id;
                
                return (
                  <div key={idea.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border-l-4 border-purple-600 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{idea.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(idea.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTime(idea.duration)}
                          </span>
                          <span className={`px-2 py-1 bg-${categoryColor}-100 dark:bg-${categoryColor}-900/30 text-${categoryColor}-700 dark:text-${categoryColor}-400 rounded-full text-xs font-semibold`}>
                            {categories.find(c => c.value === idea.category)?.label}
                          </span>
                        </div>
                        {idea.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-2">
                            "{idea.notes}"
                          </p>
                        )}
                        {idea.transcript && (
                          <div className="mt-2 text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span className="truncate">{idea.transcript.slice(0, 80)}{idea.transcript.length > 80 ? '…' : ''}</span>
                          </div>
                        )}
                        {idea.tags && idea.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {idea.tags.map(tag => (
                              <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 rounded-full text-xs font-semibold">
                                <Tag className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {idea.linkedTask && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                            <Link2 className="w-3 h-3" />
                            Linked Task: {idea.linkedTask}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => playIdea(idea.id)}
                          className={`p-3 rounded-lg font-bold transition-all ${
                            isPlaying 
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                          title={isPlaying ? 'Stop' : 'Play'}
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => copyShareLink(idea)}
                          className="p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-bold transition-all"
                          title="Copy share link"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => downloadIdea(idea)}
                          className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-all"
                          title="Download"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteIdea(idea.id)}
                          className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    {shareCopiedId === idea.id && (
                      <p className="text-xs text-green-600 mt-2">Share link copied to clipboard</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Save Idea Modal */}
        {showTitleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Save Your Idea</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Idea Title *
                  </label>
                  <input
                    type="text"
                    value={newIdeaTitle}
                    onChange={(e) => setNewIdeaTitle(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Give your idea a catchy title..."
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newIdeaCategory}
                    onChange={(e) => setNewIdeaCategory(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quick Notes (Optional)
                  </label>
                  <textarea
                    value={newIdeaNotes}
                    onChange={(e) => setNewIdeaNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Add any quick notes about this idea..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    Tags
                    <span className="text-xs text-gray-400">Press Enter to add</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700">
                    {newIdeaTags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 rounded-full text-xs font-semibold">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="text-purple-600 hover:text-purple-900">×</button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-gray-900 dark:text-white"
                      placeholder="Add tag"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Attach to Task / Project
                  </label>
                  <input
                    type="text"
                    value={linkedTask}
                    onChange={(e) => setLinkedTask(e.target.value)}
                    placeholder="e.g., TikTok content sprint"
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Recording duration: <strong>{formatTime(pendingDuration)}</strong>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Transcript preview: {liveTranscript ? liveTranscript.slice(0, 120) + (liveTranscript.length > 120 ? '…' : '') : 'Say something while recording to auto-generate notes.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowTitleModal(false);
                    setPendingAudioBlob(null);
                    setNewIdeaTitle('');
                    setNewIdeaCategory('general');
                    setNewIdeaNotes('');
                    setNewIdeaTags([]);
                    setTagInput('');
                    setLinkedTask('');
                    setLiveTranscript('');
                  }}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500
                           text-gray-900 dark:text-white font-bold py-3 px-4 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={saveIdea}
                  disabled={isSaving}
                  className={`flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? 'Saving...' : 'Save Idea'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
