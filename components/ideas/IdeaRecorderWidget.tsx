'use client';

import { useState, useEffect, useCallback, useRef, type KeyboardEvent } from 'react';
import { Mic, Square, X, Play, Pause, Tag, Share2, Loader2, Lightbulb, FileText } from 'lucide-react';

interface VoiceIdea {
  id: string;
  title: string;
  audioBlob: string;
  duration: number;
  createdAt: string;
  category: string;
  notes?: string;
  transcript?: string;
  tags?: string[];
  linkedTask?: string;
  shareToken?: string;
}

const categories = [
  { value: 'general', label: 'General' },
  { value: 'business', label: 'Business' },
  { value: 'product', label: 'Product' },
  { value: 'content', label: 'Content' },
  { value: 'personal', label: 'Personal' },
];

const IdeaRecorderWidget = () => {
  const [open, setOpen] = useState(false);
  const [ideas, setIdeas] = useState<VoiceIdea[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [pendingAudio, setPendingAudio] = useState<string | null>(null);
  const [pendingDuration, setPendingDuration] = useState(0);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [linkedTask, setLinkedTask] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [transcriptVisible, setTranscriptVisible] = useState(false);
  const [activeTranscript, setActiveTranscript] = useState('');
  const [shareCopiedId, setShareCopiedId] = useState<string | null>(null);

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
      console.error('Idea widget fetch error', error);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchIdeas();
    }
  }, [open, fetchIdeas]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetForm = () => {
    setTitle('');
    setCategory('general');
    setNotes('');
    setTags([]);
    setTagInput('');
    setLinkedTask('');
    setPendingAudio(null);
    setPendingDuration(0);
    setLiveTranscript('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      setLiveTranscript('');

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setPendingAudio(base64Audio);
          setPendingDuration(recordingTime);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
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
        recognition.onerror = () => recognition.stop();
        recognition.start();
      }

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      alert('Unable to access your microphone. Please allow permissions.');
      console.error('Recorder widget error:', error);
    }
  };

  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  const saveIdea = async () => {
    if (!pendingAudio || !title.trim()) {
      alert('Add a title before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          audioBlob: pendingAudio,
          duration: pendingDuration,
          category,
          notes,
          transcript: liveTranscript || notes,
          tags,
          linkedTask,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save idea');
      }

      const data = await response.json();
      setIdeas((prev) => [data.idea as VoiceIdea, ...prev]);
      resetForm();
    } catch (error) {
      console.error(error);
      alert('Could not save your idea.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = tagInput.trim();
      if (value && !tags.includes(value)) {
        setTags([...tags, value]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter(item => item !== tag));
  };

  const buildShareLink = (idea: VoiceIdea) => {
    if (typeof window === 'undefined') return '';
    const token = idea.shareToken || idea.id;
    return `${window.location.origin}/dashboard/ideas?share=${token}`;
  };

  const copyShareLink = async (idea: VoiceIdea) => {
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

  const playIdea = (idea: VoiceIdea) => {
    if (currentPlayingId === idea.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setCurrentPlayingId(null);
      setTranscriptVisible(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(idea.audioBlob);
    audioRef.current = audio;
    audio.play();
    setCurrentPlayingId(idea.id);
    setActiveTranscript(idea.transcript || idea.notes || 'Transcription not available yet.');
    setTranscriptVisible(true);

    audio.onended = () => {
      setCurrentPlayingId(null);
      setTranscriptVisible(false);
    };
  };

  const latestIdeas = ideas.slice(0, 4);

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-24 z-50 flex flex-col items-end gap-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-pink-500 text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-transform"
      >
        <Lightbulb className="w-5 h-5" />
        Quick Idea
      </button>

      {open && (
        <div className="mt-3 w-[360px] sm:w-[420px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-5"> 
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase text-gray-400">Voice Capture</p>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Idea Recorder</h3>
            </div>
            <button onClick={() => { setOpen(false); setTranscriptVisible(false); }} className="p-2 text-gray-400 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="rounded-2xl border border-dashed border-purple-200 dark:border-purple-800 p-4 mb-4 bg-purple-50/40 dark:bg-purple-900/20 text-center">
            {isRecording ? (
              <>
                <div className="w-16 h-16 mx-auto mb-3 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <p className="text-2xl font-bold text-red-600 mb-3">{formatTime(recordingTime)}</p>
                <button onClick={stopRecording} className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-full font-semibold shadow">
                  <Square className="w-4 h-4" /> Stop
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Capture thoughts without leaving your flow.</p>
                <button onClick={startRecording} className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-full font-semibold shadow">
                  <Mic className="w-4 h-4" /> Start Recording
                </button>
                {!speechSupported && (
                  <p className="text-xs text-red-500 mt-2">Transcription unavailable in this browser.</p>
                )}
              </>
            )}
          </div>

          {pendingAudio ? (
            <div className="space-y-3 mb-5">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Idea title"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-purple-500 outline-none"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-purple-500 outline-none"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Optional notes"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-purple-500 outline-none"
              />
              <div className="flex flex-wrap items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-purple-600">×</button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add tag"
                  className="flex-1 min-w-[100px] bg-transparent outline-none text-sm"
                />
              </div>
              <input
                type="text"
                value={linkedTask}
                onChange={(e) => setLinkedTask(e.target.value)}
                placeholder="Attach to project/task"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-purple-500 outline-none"
              />
              <div className="bg-gray-50 rounded-2xl p-3 text-sm text-gray-600">
                <p className="font-semibold mb-1">Transcript preview</p>
                <p className="text-gray-700">{liveTranscript || 'Start speaking to generate instant notes.'}</p>
              </div>
              <button
                onClick={saveIdea}
                disabled={isSaving}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-purple-600 to-pink-600 shadow ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save Idea'}
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mb-4 text-center">Stop the recorder to add title, tags, and tasks.</p>
          )}

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Recent ideas</p>
              <a href="/dashboard/ideas" className="text-xs text-purple-600">Open board</a>
            </div>
            {latestIdeas.length === 0 ? (
              <p className="text-xs text-gray-500">No voice ideas yet. Start recording to seed this list.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {latestIdeas.map((idea) => {
                  const isPlaying = currentPlayingId === idea.id;
                  return (
                    <div key={idea.id} className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-gray-50 dark:bg-gray-800">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{idea.title}</p>
                        <p className="text-xs text-gray-500">{formatTime(idea.duration)} · {new Date(idea.createdAt).toLocaleDateString()}</p>
                        {idea.tags && idea.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {idea.tags.map(tag => (
                              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px]">
                                <Tag className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => playIdea(idea)}
                          className={`p-2 rounded-full ${isPlaying ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyShareLink(idea)}
                          className="p-2 rounded-full bg-indigo-500 text-white"
                          title="Copy share link"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {shareCopiedId && (
              <p className="text-xs text-green-600 mt-2">Share link copied!</p>
            )}
          </div>

          {transcriptVisible && (
            <div className="mt-4 p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">Transcript</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-100 max-h-32 overflow-y-auto">{activeTranscript}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IdeaRecorderWidget;
