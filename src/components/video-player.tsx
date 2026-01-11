'use client';

import { useRef, useEffect } from 'react';
import { useAppContext, MediaFile } from '@/context/app-context';

interface VideoPlayerProps {
  file: MediaFile;
  isMuted?: boolean;
  showControls?: boolean;
  isControlling?: boolean;
  className?: string;
  containerClassName?: string;
}

export function VideoPlayer({ 
    file, 
    isMuted = false, 
    showControls = true, 
    isControlling = true,
    className, 
    containerClassName 
}: VideoPlayerProps) {
  const { mediaPlaybackState, setMediaPlaybackState } = useAppContext();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video && mediaPlaybackState) {
        if (Math.abs(video.currentTime - mediaPlaybackState.currentTime) > 1.5) {
            video.currentTime = mediaPlaybackState.currentTime;
        }
        if (video.paused && mediaPlaybackState.isPlaying) {
            video.play().catch(console.error);
        } else if (!video.paused && !mediaPlaybackState.isPlaying) {
            video.pause();
        }
    }
  }, [mediaPlaybackState]);

  const handleStateChange = () => {
    const video = videoRef.current;
    if (video && showControls) {
        setMediaPlaybackState({
            isPlaying: !video.paused,
            currentTime: video.currentTime,
            timestamp: Date.now(),
        });
    }
  };

  return (
    <div className={containerClassName || "w-full aspect-video bg-black rounded-lg overflow-hidden"}>
      <video
        ref={videoRef}
        key={file.url}
        src={file.url}
        controls={showControls}
        muted={isMuted || !isControlling}
        playsInline
        autoPlay={mediaPlaybackState?.isPlaying}
        className={className || "w-full h-full object-contain"}
        onPlay={handleStateChange}
        onPause={handleStateChange}
        onSeeked={handleStateChange}
        onTimeUpdate={handleStateChange}
      />
    </div>
  );
}
