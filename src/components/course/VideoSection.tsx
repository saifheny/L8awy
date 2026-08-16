'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { fetchPlaylistVideos } from '@/lib/youtube';
import type { CourseVideo, Video } from '@/lib/types';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { IoPlay, IoPause, IoVolumeHigh, IoVolumeMute, IoExpand } from 'react-icons/io5';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function extractYouTubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/);
  return match?.[1] || url;
}

export default function VideoSection({ playlistId, customVideos }: { playlistId?: string; customVideos?: CourseVideo[] }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  // YouTube IFrame player state
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const [ytReady, setYtReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0); // 0-1 fraction
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setYtReady(true);
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    window.onYouTubeIframeAPIReady = () => setYtReady(true);
  }, []);

  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      try {
        const data = customVideos !== undefined
          ? customVideos.map((video) => ({ ...video, videoId: video.videoId || extractYouTubeId(video.videoUrl || '') }))
          : await fetchPlaylistVideos(playlistId || '');
        setVideos(data);
        if (data.length > 0) setSelectedVideo(data[0]);
      } catch (error) {
        console.error('Failed to load videos', error);
      } finally {
        setLoading(false);
      }
    };
    loadVideos();
  }, [playlistId, customVideos]);

  const destroyPlayer = useCallback(() => {
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch {}
      playerRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const createPlayer = useCallback((videoId: string) => {
    if (!ytReady || !iframeContainerRef.current) return;
    destroyPlayer();

    // Clear the container
    iframeContainerRef.current.innerHTML = '<div id="yt-player-div"></div>';

    playerRef.current = new window.YT.Player('yt-player-div', {
      videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        modestbranding: 1,
        rel: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
      },
      events: {
        onReady: (e: any) => {
          const dur = e.target.getDuration();
          setDuration(dur);
          setPlayed(0);
          if (muted) e.target.mute();
        },
        onStateChange: (e: any) => {
          if (e.data === window.YT.PlayerState.PLAYING) {
            setPlaying(true);
            // Start progress tracking
            if (progressTimerRef.current) clearInterval(progressTimerRef.current);
            progressTimerRef.current = setInterval(() => {
              if (playerRef.current?.getCurrentTime && playerRef.current?.getDuration) {
                const cur = playerRef.current.getCurrentTime();
                const dur = playerRef.current.getDuration();
                if (dur > 0) setPlayed(cur / dur);
              }
            }, 500);
          } else if (e.data === window.YT.PlayerState.PAUSED || e.data === window.YT.PlayerState.ENDED) {
            setPlaying(false);
            if (progressTimerRef.current) clearInterval(progressTimerRef.current);
          }
        },
      },
    });
  }, [ytReady, muted, destroyPlayer]);

  // Create player when video or ytReady changes
  useEffect(() => {
    if (selectedVideo && ytReady) {
      setPlaying(false);
      setPlayed(0);
      createPlayer(selectedVideo.videoId);
    }
    return () => {};
  }, [selectedVideo, ytReady, createPlayer]);

  // Cleanup on unmount
  useEffect(() => () => destroyPlayer(), [destroyPlayer]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (playing) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (muted) {
      playerRef.current.unMute();
      setMuted(false);
    } else {
      playerRef.current.mute();
      setMuted(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setPlayed(val);
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(val * duration, true);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (loading) return <SkeletonLoader count={3} type="video" />;
  if (videos.length === 0) return <div className="glass p-12 text-center rounded-2xl">لا توجد فيديوهات متاحة حالياً.</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-2/3">
        <div
          ref={playerContainerRef}
          className="rounded-2xl overflow-hidden aspect-video relative bg-black group"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => playing && setShowControls(false)}
        >
          {selectedVideo && (
            <>
              {/* YouTube IFrame Container */}
              <div ref={iframeContainerRef} className="absolute inset-0 pointer-events-none w-full h-full" />

              {/* Click overlay to play/pause */}
              <div
                className="absolute inset-0 cursor-pointer z-10 flex items-center justify-center"
                onClick={togglePlay}
              >
                {!playing && (
                  <div className="w-18 h-18 bg-blue-600/80 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xl transition-transform hover:scale-110 w-20 h-20">
                    <IoPlay className="text-white text-4xl ml-1" />
                  </div>
                )}
              </div>

              {/* Custom Controls */}
              <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 z-20 flex flex-col gap-2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
              >
                {/* Progress Bar */}
                <input
                  type="range"
                  min={0}
                  max={1}
                  step="any"
                  value={played}
                  onChange={handleSeek}
                  dir="rtl"
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to left, #3b82f6 ${played * 100}%, #4b5563 ${played * 100}%)`
                  }}
                />

                <div className="flex items-center justify-between text-white mt-1">
                  <div className="flex items-center gap-4">
                    <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="hover:text-blue-400 transition-colors">
                      {playing ? <IoPause size={24} /> : <IoPlay size={24} />}
                    </button>
                    <div className="flex items-center gap-1 text-sm font-cairo dir-ltr">
                      <span>{formatTime(played * duration)}</span>
                      <span>/</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="hover:text-blue-400 transition-colors">
                      {muted ? <IoVolumeMute size={22} /> : <IoVolumeHigh size={22} />}
                    </button>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }} className="hover:text-blue-400 transition-colors">
                    <IoExpand size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <h2 className="text-2xl font-bold mt-4 mb-2 font-cairo">{selectedVideo?.title}</h2>
      </div>

      {/* Playlist */}
      <div className="w-full lg:w-1/3 flex flex-col gap-3 h-[400px] lg:h-[600px] overflow-y-auto pr-2">
        {videos.map(video => (
          <button
            key={video.id}
            onClick={() => { setSelectedVideo(video); setPlaying(true); }}
            className={`glass flex gap-3 p-3 rounded-xl text-right transition-all hover:bg-white/10 ${selectedVideo?.id === video.id ? 'border border-blue-500 bg-white/10' : ''}`}
          >
            <div className="w-32 h-20 shrink-0 rounded-lg overflow-hidden relative bg-black/50">
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
              {selectedVideo?.id === video.id && playing && (
                <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center">
                  <IoPause className="text-white text-2xl" />
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h4 className="text-sm font-bold line-clamp-2 font-cairo">{video.title}</h4>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
