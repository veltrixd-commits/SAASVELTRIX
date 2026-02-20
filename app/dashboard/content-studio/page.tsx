// Content Studio - For Content Creators
'use client';

import { useState, useRef, useEffect } from 'react';
import { Video, Calendar, TrendingUp, DollarSign, Sparkles, FileText, BarChart3, Users, Camera, Scissors, Download, Upload, Play, Pause, RotateCw } from 'lucide-react';

export default function ContentStudioPage() {
  const [activeTab, setActiveTab] = useState<'scripts' | 'calendar' | 'analytics' | 'deals' | 'camera' | 'editor'>('scripts');
  const [showStatDetail, setShowStatDetail] = useState<string | null>(null);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Content Studio Command
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Script, shoot, schedule, and sell from one board—no drift.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
        <StatCard
          icon={Video}
          label="Videos This Month"
          value="24"
          trend="+12%"
          trendUp={true}
          onClick={() => setShowStatDetail('videos')}
        />
        <StatCard
          icon={Users}
          label="Total Followers"
          value="45.2K"
          trend="+2.4K"
          trendUp={true}
          onClick={() => setShowStatDetail('followers')}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg. Engagement"
          value="8.4%"
          trend="+1.2%"
          trendUp={true}
          onClick={() => setShowStatDetail('engagement')}
        />
        <StatCard
          icon={DollarSign}
          label="Monthly Revenue"
          value="R 12,450"
          trend="+R 2,100"
          trendUp={true}
          onClick={() => setShowStatDetail('revenue')}
        />
      </div>

      {/* Floating Tabs */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-2 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          <TabButton
            active={activeTab === 'camera'}
            onClick={() => setActiveTab('camera')}
            icon={Camera}
            label="Capture"
          />
          <TabButton
            active={activeTab === 'editor'}
            onClick={() => setActiveTab('editor')}
            icon={Scissors}
            label="Edit Suite"
          />
          <TabButton
            active={activeTab === 'scripts'}
            onClick={() => setActiveTab('scripts')}
            icon={Sparkles}
            label="AI Script Ops"
          />
          <TabButton
            active={activeTab === 'calendar'}
            onClick={() => setActiveTab('calendar')}
            icon={Calendar}
            label="Drop Schedule"
          />
          <TabButton
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            icon={BarChart3}
            label="Signal Board"
          />
          <TabButton
            active={activeTab === 'deals'}
            onClick={() => setActiveTab('deals')}
            icon={DollarSign}
            label="Brand Pipeline"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="glass-card rounded-xl p-4 sm:p-6">
        {activeTab === 'camera' && <CameraCapture />}
        {activeTab === 'editor' && <VideoEditor />}
        {activeTab === 'scripts' && <ScriptGenerator />}
        {activeTab === 'calendar' && <ContentCalendar />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'deals' && <BrandDeals />}
      </div>

      {/* Stat Detail Modal */}
      {showStatDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowStatDetail(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {showStatDetail === 'videos' && '🎥 Video Analytics'}
                {showStatDetail === 'followers' && '👥 Follower Growth'}
                {showStatDetail === 'engagement' && '📈 Engagement Insights'}
                {showStatDetail === 'revenue' && '💰 Revenue Breakdown'}
              </h3>
              <button onClick={() => setShowStatDetail(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <div className="space-y-4">
              {showStatDetail === 'videos' && (
                <>
                  <div className="text-center py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                    <div className="text-5xl font-bold text-blue-600 mb-2">24</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Videos Published This Month</div>
                    <div className="text-xs text-green-600 font-semibold mt-2">+12% vs last month</div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">TikTok</span>
                        <span className="text-blue-600 font-bold">12 videos</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avg. 45K views per video</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">YouTube</span>
                        <span className="text-red-600 font-bold">7 videos</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avg. 28K views per video</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">Instagram</span>
                        <span className="text-pink-600 font-bold">5 reels</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avg. 18K views per reel</div>
                    </div>
                  </div>
                </>
              )}
              {showStatDetail === 'followers' && (
                <>
                  <div className="text-center py-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl">
                    <div className="text-5xl font-bold text-pink-600 mb-2">45.2K</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Followers</div>
                    <div className="text-xs text-green-600 font-semibold mt-2">+2.4K this month</div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">TikTok</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">28.5K</div>
                        </div>
                        <div className="text-sm text-green-600 font-semibold">+1.5K</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">YouTube</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">12.4K</div>
                        </div>
                        <div className="text-sm text-green-600 font-semibold">+650</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">Instagram</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">4.3K</div>
                        </div>
                        <div className="text-sm text-green-600 font-semibold">+250</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {showStatDetail === 'engagement' && (
                <>
                  <div className="text-center py-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <div className="text-5xl font-bold text-green-600 mb-2">8.4%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Average Engagement Rate</div>
                    <div className="text-xs text-green-600 font-semibold mt-2">+1.2% vs last month</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-blue-600">12.4K</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Likes</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-purple-600">3.2K</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Comments</div>
                    </div>
                    <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-pink-600">2.8K</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Shares</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="font-semibold mb-2">Top Performing Content Types:</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Tutorials</span><span className="font-semibold">14.2% engagement</span></div>
                      <div className="flex justify-between"><span>Behind the Scenes</span><span className="font-semibold">11.8% engagement</span></div>
                      <div className="flex justify-between"><span>Product Reviews</span><span className="font-semibold">8.9% engagement</span></div>
                    </div>
                  </div>
                </>
              )}
              {showStatDetail === 'revenue' && (
                <>
                  <div className="text-center py-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
                    <div className="text-5xl font-bold text-green-600 mb-2">R 12,450</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue This Month</div>
                    <div className="text-xs text-green-600 font-semibold mt-2">+R 2,100 vs last month</div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">Brand Sponsorships</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">3 active deals</div>
                        </div>
                        <div className="text-xl font-bold text-green-600">R 8,200</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">Ad Revenue</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">YouTube, TikTok</div>
                        </div>
                        <div className="text-xl font-bold text-green-600">R 2,850</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">Affiliate Sales</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Product links</div>
                        </div>
                        <div className="text-xl font-bold text-green-600">R 1,400</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, trendUp, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="glass-card rounded-xl p-4 hover:scale-105 transition-all text-left w-full"
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5 text-blue-600" />
        <span className={`text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </span>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
    </button>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
        active
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const facingModeRef = useRef<'user' | 'environment'>('user');

  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [camError, setCamError] = useState<string | null>(null);

  // Keep ref in sync so startCamera closure always reads latest value
  useEffect(() => { facingModeRef.current = facingMode; }, [facingMode]);

  // Cleanup all tracks on unmount
  useEffect(() => {
    return () => {
      stopAllTracks();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopAllTracks = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async (mode?: 'user' | 'environment') => {
    setCamError(null);
    stopAllTracks();
    const facing = mode ?? facingModeRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
        setIsStreaming(true);
      }
    } catch (err: any) {
      const msg =
        err?.name === 'NotAllowedError'
          ? 'Camera permission denied. Allow camera access in your browser settings.'
          : err?.name === 'NotFoundError'
          ? 'No camera found on this device.'
          : 'Could not start camera. Check permissions or try a different browser.';
      setCamError(msg);
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (isRecording) stopRecording();
    stopAllTracks();
    setIsStreaming(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    setCapturedImage(canvasRef.current.toDataURL('image/png'));
  };

  const startRecording = () => {
    if (!videoRef.current?.srcObject) return;
    chunksRef.current = [];
    const stream = videoRef.current.srcObject as MediaStream;

    // Pick best supported MIME
    const mime = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']
      .find(m => MediaRecorder.isTypeSupported(m)) || '';

    const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mime || 'video/webm' });
      setRecordedVideo(URL.createObjectURL(blob));
    };

    recorder.start(250); // emit every 250 ms to avoid data loss
    setIsRecording(true);
    setRecordSecs(0);
    timerRef.current = setInterval(() => setRecordSecs(s => s + 1), 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsRecording(false);
  };

  const switchCamera = () => {
    const next = facingModeRef.current === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    startCamera(next);
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const downloadBlob = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Camera className="w-6 h-6 text-blue-600" />
        Camera Capture Bay
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Spin up the feed, grab the asset, and push it downline immediately.
      </p>

      {camError && (
        <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
          <span>⚠️</span> {camError}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Camera Preview */}
        <div className="space-y-3">
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />

            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                  <p className="text-white font-medium">Camera not started</p>
                </div>
              </div>
            )}

            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 rounded-full px-3 py-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white text-xs font-mono font-bold">{formatTime(recordSecs)}</span>
              </div>
            )}
          </div>

          {/* Start / Stop / Switch */}
          <div className="flex flex-wrap gap-2">
            {!isStreaming ? (
              <button
                onClick={() => startCamera()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" /> Start Camera
              </button>
            ) : (
              <>
                <button onClick={stopCamera} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium">
                  Stop Camera
                </button>
                <button onClick={switchCamera} title="Flip camera" className="px-4 py-3 bg-gray-600 text-white rounded-lg font-medium">
                  <RotateCw className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Capture / Record controls */}
          {isStreaming && (
            <div className="flex gap-2">
              <button
                onClick={capturePhoto}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" /> Capture Photo
              </button>
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Video className="w-5 h-5" /> Record Video
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 animate-pulse"
                >
                  <Pause className="w-5 h-5" /> Stop · {formatTime(recordSecs)}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Captured Media */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">Captured Media</h4>

          {capturedImage && (
            <div className="space-y-2">
              <div className="relative bg-black rounded-xl overflow-hidden">
                <img src={capturedImage} alt="Captured" className="w-full" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadBlob(capturedImage, `capture-${Date.now()}.png`)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" /> Download Photo
                </button>
                <button onClick={() => setCapturedImage(null)} className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium">
                  Clear
                </button>
              </div>
            </div>
          )}

          {recordedVideo && (
            <div className="space-y-2">
              <div className="relative bg-black rounded-xl overflow-hidden">
                <video src={recordedVideo} controls className="w-full rounded-xl" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadBlob(recordedVideo, `recording-${Date.now()}.webm`)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" /> Download Video
                </button>
                <button onClick={() => setRecordedVideo(null)} className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium">
                  Clear
                </button>
              </div>
            </div>
          )}

          {!capturedImage && !recordedVideo && (
            <div className="h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center">
              <p className="text-gray-400 text-sm text-center px-4">
                No footage yet. Start the camera, then capture a photo or record a video.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoEditor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [textOverlay, setTextOverlay] = useState('');
  const [exportMsg, setExportMsg] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setIsPlaying(false);
    setCurrentTime(0);
    setTrimStart(0);
    setExportMsg('');
  };

  const onLoaded = () => {
    if (!videoRef.current) return;
    const d = videoRef.current.duration || 0;
    setDuration(d);
    setTrimEnd(d);
    videoRef.current.playbackRate = speed;
    videoRef.current.volume = volume;
  };

  const onTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);
    // Loop within trim region
    if (t >= trimEnd) {
      videoRef.current.currentTime = trimStart;
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      if (videoRef.current.currentTime < trimStart || videoRef.current.currentTime >= trimEnd) {
        videoRef.current.currentTime = trimStart;
      }
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const applySpeed = (s: number) => {
    setSpeed(s);
    if (videoRef.current) videoRef.current.playbackRate = s;
  };

  const applyVolume = (v: number) => {
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
  };

  const seekTo = (t: number) => {
    if (videoRef.current) videoRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const handleExport = () => {
    if (!videoFile) return;
    // Download the original file (trim/speed in a real app would use FFmpeg.wasm)
    const a = document.createElement('a');
    a.href = videoUrl!;
    a.download = `edited-${Date.now()}.${videoFile.name.split('.').pop() || 'webm'}`;
    a.click();
    setExportMsg('Your file is downloading. Full in-browser trim/speed export coming in the next release.');
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  const clearVideo = () => {
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.src = ''; }
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoFile(null);
    setVideoUrl(null);
    setIsPlaying(false);
    setDuration(0);
    setCurrentTime(0);
    setTrimStart(0);
    setTrimEnd(0);
    setExportMsg('');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Scissors className="w-6 h-6 text-purple-600" />
        Video Edit Suite
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Load footage, make the cuts, control speed — export direct from the browser.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Player */}
        <div className="space-y-3">
          {!videoUrl ? (
            <label className="cursor-pointer block relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-8 border-2 border-dashed border-purple-300 dark:border-purple-700 text-center hover:border-purple-500 transition-colors">
              <Upload className="w-16 h-16 text-purple-600 mx-auto mb-3" />
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">Upload Video</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">MP4 · MOV · WEBM · AVI</p>
              <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
            </label>
          ) : (
            <div className="space-y-2">
              <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  onLoadedMetadata={onLoaded}
                  onTimeUpdate={onTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                />
                {textOverlay && (
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
                    <span className="bg-black/60 text-white text-sm font-bold px-3 py-1 rounded">
                      {textOverlay}
                    </span>
                  </div>
                )}
              </div>

              {/* Seek bar */}
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.05}
                value={currentTime}
                onChange={(e) => seekTo(Number(e.target.value))}
                className="w-full accent-purple-600"
                aria-label="Seek position"
              />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{fmt(currentTime)}</span>
                <span>{fmt(duration)}</span>
              </div>

              {/* Play + controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-purple-700"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button onClick={clearVideo} className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700">
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Trim */}
          {videoUrl && duration > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
              <h5 className="font-semibold text-gray-900 dark:text-white text-sm">✂️ Trim Region</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <label className="text-xs text-gray-600 dark:text-gray-400 w-14 shrink-0">Start {fmt(trimStart)}</label>
                  <input
                    type="range" min={0} max={trimEnd - 0.1} step={0.1} value={trimStart}
                    onChange={(e) => { const v = Number(e.target.value); setTrimStart(v); seekTo(v); }}
                    className="flex-1 accent-green-600"
                    aria-label="Trim start"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-gray-600 dark:text-gray-400 w-14 shrink-0">End {fmt(trimEnd)}</label>
                  <input
                    type="range" min={trimStart + 0.1} max={duration} step={0.1} value={trimEnd}
                    onChange={(e) => setTrimEnd(Number(e.target.value))}
                    className="flex-1 accent-red-500"
                    aria-label="Trim end"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Clip length: {fmt(trimEnd - trimStart)} · Playback loops between trim points.
                </p>
              </div>
            </div>
          )}

          {/* Speed */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h5 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">⚡ Playback Speed</h5>
            <div className="flex flex-wrap gap-2">
              {[0.25, 0.5, 1, 1.5, 2, 3].map(s => (
                <button
                  key={s}
                  onClick={() => applySpeed(s)}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${speed === s ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'}`}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>

          {/* Volume */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h5 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">🔊 Volume</h5>
            <input
              type="range" min={0} max={1} step={0.05} value={volume}
              onChange={(e) => applyVolume(Number(e.target.value))}
              className="w-full accent-blue-600"
              aria-label="Volume"
            />
            <p className="text-xs text-gray-500 mt-1">{Math.round(volume * 100)}%</p>
          </div>

          {/* Text overlay */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h5 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">📝 Text Overlay</h5>
            <input
              type="text"
              value={textOverlay}
              onChange={(e) => setTextOverlay(e.target.value)}
              placeholder="Caption shown on video…"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
            />
          </div>

          {/* Export */}
          {videoFile && (
            <button
              onClick={handleExport}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all"
            >
              <Download className="w-5 h-5" /> Export Video
            </button>
          )}
          {exportMsg && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{exportMsg}</p>
          )}

          {!videoFile && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Included in Edit Suite</h5>
              <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                {['Trim start / end', 'Loop trim preview', 'Speed: 0.25× – 3×', 'Volume control', 'Text overlay caption', 'Download original'].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-green-600">✓</span>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Placeholder for file-not-loaded state */}
          {!videoFile && (
            <label className="cursor-pointer block w-full px-4 py-3 border-2 border-dashed border-purple-300 dark:border-purple-700 text-center rounded-lg text-purple-600 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
              <Upload className="w-5 h-5 inline mr-2" />
              Upload a video to start editing
              <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

function ScriptGenerator() {
  const [prompt, setPrompt] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');

  const handleGenerate = () => {
    // In production, this would call an AI API
    setGeneratedScript(`
🎬 VIDEO SCRIPT - ${prompt}

HOOK (0-3s):
"Stop scrolling! I just discovered something that's going to change everything..."

INTRO (3-10s):
Hey everyone! Today I'm going to show you [topic]. Stick around because at the end, I'm revealing something you won't want to miss.

MAIN CONTENT (10-50s):
[Your main points here]
- Point 1
- Point 2
- Point 3

CALL TO ACTION (50-60s):
If you found this helpful, make sure to follow for more content like this. Drop a comment with your thoughts!

#hashtag1 #hashtag2 #hashtag3
    `.trim());
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Script Ops</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Drop the hook topic and let the system spit out a ready-to-shoot script.
      </p>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          What's your video about?
        </label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Close 5k followers by Sunday"
          className="w-full px-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
        />
      </div>

      <button
        onClick={handleGenerate}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:scale-105 transition-all flex items-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        Generate Script
      </button>

      {generatedScript && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Generated Script:</h4>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
            {generatedScript}
          </div>
        </div>
      )}
    </div>
  );
}

const CONTENT_SCHEDULE_STORAGE_KEY = 'veltrix_content_schedule';
const defaultContentSchedule = [
  { id: 1, title: 'Morning Routine Video', platform: 'TikTok', date: '2026-02-15', status: 'Scheduled' },
  { id: 2, title: 'Product Review: Tech Gadget', platform: 'YouTube', date: '2026-02-16', status: 'Draft' },
  { id: 3, title: 'Behind the Scenes', platform: 'Instagram', date: '2026-02-17', status: 'Scheduled' },
  { id: 4, title: 'Q&A Session', platform: 'TikTok', date: '2026-02-18', status: 'Idea' },
];

const createDefaultDropForm = () => ({
  title: '',
  platform: 'TikTok',
  date: new Date().toISOString().split('T')[0],
  status: 'Idea',
});

function ContentCalendar() {
  const [showAddContent, setShowAddContent] = useState(false);
  const [scheduledContent, setScheduledContent] = useState(defaultContentSchedule);
  const [newDrop, setNewDrop] = useState(createDefaultDropForm());
  const [calendarToast, setCalendarToast] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONTENT_SCHEDULE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setScheduledContent(parsed);
        }
      }
    } catch (error) {
      console.warn('Failed to load content schedule', error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CONTENT_SCHEDULE_STORAGE_KEY, JSON.stringify(scheduledContent));
  }, [scheduledContent]);

  useEffect(() => {
    if (!calendarToast) return;
    const timeout = window.setTimeout(() => setCalendarToast(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [calendarToast]);

  const handleOpenScheduler = () => {
    setFormError('');
    setNewDrop(createDefaultDropForm());
    setShowAddContent(true);
  };

  const handleScheduleDrop = () => {
    if (!newDrop.title.trim()) {
      setFormError('Add a content title before confirming.');
      return;
    }

    if (!newDrop.date) {
      setFormError('Select a publish date before confirming.');
      return;
    }

    const entry = {
      id: Date.now(),
      title: newDrop.title.trim(),
      platform: newDrop.platform,
      date: newDrop.date,
      status: newDrop.status,
    };

    setScheduledContent((prev) => {
      const next = [entry, ...prev];
      return next.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    setShowAddContent(false);
    setNewDrop(createDefaultDropForm());
    setFormError('');
    setCalendarToast(`Drop scheduled for ${entry.date}.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Drop Schedule</h3>
        <button 
          onClick={handleOpenScheduler}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:scale-105 transition-all"
        >
          Schedule Drop
        </button>
      </div>

      {calendarToast && (
        <div className="p-3 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
          {calendarToast}
        </div>
      )}

      <div className="space-y-3">
        {scheduledContent.map((item) => (
          <div key={item.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 hover:scale-102 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span>{item.platform}</span>
                  <span>•</span>
                  <span>{item.date}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                item.status === 'Scheduled' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                item.status === 'Draft' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Content Modal */}
      {showAddContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 my-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Schedule Drop</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content Title</label>
                <input
                  type="text"
                  placeholder="e.g., Morning Routine Vlog"
                  value={newDrop.title}
                  onChange={(e) => setNewDrop({ ...newDrop, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform</label>
                <select
                  value={newDrop.platform}
                  onChange={(e) => setNewDrop({ ...newDrop, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option>TikTok</option>
                  <option>YouTube</option>
                  <option>Instagram</option>
                  <option>Facebook</option>
                  <option>LinkedIn</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Publish Date</label>
                <input
                  type="date"
                  value={newDrop.date}
                  onChange={(e) => setNewDrop({ ...newDrop, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={newDrop.status}
                  onChange={(e) => setNewDrop({ ...newDrop, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option>Idea</option>
                  <option>Draft</option>
                  <option>Scheduled</option>
                  <option>Published</option>
                </select>
              </div>
            </div>
            {formError && (
              <p className="text-sm text-red-600 mt-2">{formError}</p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddContent(false);
                  setFormError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleDrop}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm Drop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Analytics() {
  // Mock data for videos
  const videos = [
    { id: 1, title: 'Morning Routine 2024', platform: 'TikTok', views: 124000, likes: 15200, comments: 890, shares: 2100, engagement: 14.6, thumbnail: '🌅' },
    { id: 2, title: '5 Productivity Hacks', platform: 'YouTube', views: 98000, likes: 12100, comments: 750, shares: 1800, engagement: 15.0, thumbnail: '⚡' },
    { id: 3, title: 'Day in My Life', platform: 'Instagram', views: 87000, likes: 10500, comments: 620, shares: 1200, engagement: 14.1, thumbnail: '📸' },
    { id: 4, title: 'Tech Setup Tour', platform: 'YouTube', views: 75000, likes: 8900, comments: 480, shares: 950, engagement: 13.8, thumbnail: '💻' },
    { id: 5, title: 'Fitness Journey Update', platform: 'TikTok', views: 68000, likes: 7800, comments: 420, shares: 870, engagement: 13.4, thumbnail: '💪' }
  ];

  // Mock followers
  const latestFollowers = [
    { id: 1, name: 'Sarah Johnson', platform: 'TikTok', avatar: '👩', followedAt: '2 hours ago' },
    { id: 2, name: 'Mike Chen', platform: 'YouTube', avatar: '👨', followedAt: '5 hours ago' },
    { id: 3, name: 'Emily Rodriguez', platform: 'Instagram', avatar: '👧', followedAt: '8 hours ago' },
    { id: 4, name: 'David Kim', platform: 'TikTok', avatar: '🧑', followedAt: '1 day ago' },
    { id: 5, name: 'Lisa Anderson', platform: 'YouTube', avatar: '👩‍🦰', followedAt: '1 day ago' },
    { id: 6, name: 'James Wilson', platform: 'Instagram', avatar: '👨‍💼', followedAt: '2 days ago' }
  ];

  // Revenue sources
  const revenueSources = [
    { source: 'Brand Sponsorships', amount: 8200, percentage: 65.9, color: 'from-green-500 to-emerald-600' },
    { source: 'Ad Revenue', amount: 2850, percentage: 22.9, color: 'from-blue-500 to-blue-600' },
    { source: 'Affiliate Marketing', amount: 1100, percentage: 8.8, color: 'from-purple-500 to-purple-600' },
    { source: 'Merchandise', amount: 300, percentage: 2.4, color: 'from-pink-500 to-pink-600' }
  ];

  // Expenses
  const expenses = [
    { category: 'Equipment', amount: 1500, percentage: 42.9 },
    { category: 'Software', amount: 850, percentage: 24.3 },
    { category: 'Marketing', amount: 680, percentage: 19.4 },
    { category: 'Miscellaneous', amount: 470, percentage: 13.4 }
  ];

  const totalRevenue = revenueSources.reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netIncome = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Performance Analytics</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          Export Report
        </button>
      </div>

      {/* Top Performing Videos */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Video className="h-5 w-5" /> Top 5 Performing Videos
        </h4>
        <div className="space-y-3">
          {videos.map((video, idx) => (
            <div key={video.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-2xl">
                    {video.thumbnail}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 dark:text-white truncate">{video.title}</h5>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className={`px-2 py-0.5 rounded-full ${
                          video.platform === 'TikTok' ? 'bg-black text-white' :
                          video.platform === 'YouTube' ? 'bg-red-500 text-white' :
                          'bg-pink-500 text-white'
                        }`}>{video.platform}</span>
                        <span>#{idx + 1} Most Viewed</span>
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <div className="text-lg font-bold text-blue-600">{video.engagement}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Engagement</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-white">{(video.views / 1000).toFixed(0)}K</div>
                      <div className="text-gray-500 dark:text-gray-400">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-white">{(video.likes / 1000).toFixed(1)}K</div>
                      <div className="text-gray-500 dark:text-gray-400">Likes</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-white">{video.comments}</div>
                      <div className="text-gray-500 dark:text-gray-400">Comments</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 dark:text-white">{(video.shares / 1000).toFixed(1)}K</div>
                      <div className="text-gray-500 dark:text-gray-400">Shares</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Followers */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" /> Latest Followers
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {latestFollowers.map(follower => (
            <div key={follower.id} className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center hover:scale-105 transition-transform">
              <div className="text-4xl mb-2">{follower.avatar}</div>
              <div className="font-medium text-sm text-gray-900 dark:text-white truncate">{follower.name}</div>
              <div className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                follower.platform === 'TikTok' ? 'bg-black text-white' :
                follower.platform === 'YouTube' ? 'bg-red-500 text-white' :
                'bg-pink-500 text-white'
              }`}>
                {follower.platform}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{follower.followedAt}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue & Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> Revenue Breakdown
          </h4>
          
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-green-600 mb-1">R {totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Monthly Revenue</div>
          </div>

          {/* Visual Revenue Distribution */}
          <div className="space-y-3 mb-4">
            {revenueSources.map(source => (
              <div key={source.source}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">{source.source}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">R {source.amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                  <div
                    className={`bg-gradient-to-r ${source.color} rounded-full h-2.5 transition-all`}
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{source.percentage}% of total</div>
              </div>
            ))}
          </div>

          {/* Pie Chart Representation */}
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {revenueSources.map(source => (
                <div key={source.source} className="flex items-center gap-2 text-xs">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${source.color}`} />
                  <span className="text-gray-600 dark:text-gray-400">{source.source.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expenses Breakdown */}
        <div className="bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-900/20 dark:to-orange-800/20 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Expenses & Net Income
          </h4>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">R {totalExpenses.toLocaleString()}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Expenses</div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">R {netIncome.toLocaleString()}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Net Income</div>
            </div>
          </div>

          <div className="space-y-3">
            {expenses.map(expense => (
              <div key={expense.category} className="bg-white dark:bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{expense.category}</span>
                  <span className="font-semibold text-red-600">R {expense.amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-500 to-orange-500 rounded-full h-2 transition-all"
                    style={{ width: `${expense.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{expense.percentage}% of expenses</div>
              </div>
            ))}
          </div>

          {/* Profit Margin */}
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Profit Margin</span>
              <span className="text-2xl font-bold text-green-600">{((netIncome / totalRevenue) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Rate Calculator */}
      <div className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-800/20 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" /> Engagement Rate Analysis
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">8.4%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Overall Engagement</div>
            <div className="text-xs text-green-600 font-semibold mt-1">↑ 1.2%</div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-600">9.2%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">TikTok</div>
            <div className="text-xs text-green-600 font-semibold mt-1">Best Platform</div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">8.1%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">YouTube</div>
            <div className="text-xs text-yellow-600 font-semibold mt-1">Good</div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-pink-600">7.9%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Instagram</div>
            <div className="text-xs text-blue-600 font-semibold mt-1">Growing</div>
          </div>
        </div>
      </div>

      {/* Growth Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">💡 Key Insights & Recommendations</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl">📊</div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Peak Engagement Time</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Your audience is most active between 6:00 PM - 8:00 PM. Post during these hours for maximum reach.</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl">🎯</div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Content Strategy</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tutorial-style videos perform 24% better than other content types. Consider creating more educational content.</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl">👥</div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Audience Demographics</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">18-24 age group shows highest engagement (42%). Tailor content to resonate with this segment.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandDeals() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeal, setNewDeal] = useState({ brand: '', amount: '', deadline: '' });
  
  const deals = [
    { id: 1, brand: 'TechGear Pro', amount: 'R 5,000', status: 'Active', deadline: '2026-02-20' },
    { id: 2, brand: 'Fitness First', amount: 'R 3,500', status: 'Negotiating', deadline: '2026-02-25' },
    { id: 3, brand: 'StyleHub', amount: 'R 2,800', status: 'Pending', deadline: '2026-03-01' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Brand Deal Pipeline</h3>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg text-sm font-medium hover:scale-105 transition-all whitespace-nowrap"
        >
          Log Deal
        </button>
      </div>

      <div className="grid gap-4">
        {deals.map((deal) => (
          <div key={deal.id} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-5 hover:scale-102 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">{deal.brand}</h4>
                <p className="text-2xl font-bold text-green-600">{deal.amount}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                deal.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                deal.status === 'Negotiating' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
              }`}>
                {deal.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Deadline: {deal.deadline}
            </p>
          </div>
        ))}
      </div>

      {/* Add Deal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 my-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Brand Deal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand Name</label>
                <input
                  type="text"
                  value={newDeal.brand}
                  onChange={(e) => setNewDeal({...newDeal, brand: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                  placeholder="e.g., Nike, Adidas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount (R)</label>
                <input
                  type="number"
                  value={newDeal.amount}
                  onChange={(e) => setNewDeal({...newDeal, amount: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deadline</label>
                <input
                  type="date"
                  value={newDeal.deadline}
                  onChange={(e) => setNewDeal({...newDeal, deadline: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  alert(`Deal added: ${newDeal.brand} - R ${newDeal.amount}`);
                  setNewDeal({ brand: '', amount: '', deadline: '' });
                  setShowAddModal(false);
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-medium"
              >
                Add Deal
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContentItem({ title, views, engagement }: any) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-700 rounded-lg p-3">
      <span className="text-sm font-medium text-gray-900 dark:text-white">{title}</span>
      <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
        <span>{views} views</span>
        <span>{engagement}</span>
      </div>
    </div>
  );
}

function InsightItem({ label, value }: any) {
  return (
    <div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</div>
      <div className="font-semibold text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}
