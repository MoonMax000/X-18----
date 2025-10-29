import React, { useState, useRef } from "react";
import { Play } from "lucide-react";

interface VideoPlayerProps {
  src: string;
}

export default function VideoPlayer({ src }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handlePlayClick(e);
  };

  return (
    <div className="relative w-full h-full group">
      <video
        ref={videoRef}
        src={src}
        controls={isPlaying}
        className="h-full w-full"
        onClick={handleVideoClick}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      {!isPlaying && (
        <button
          onClick={handlePlayClick}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity hover:bg-black/40 cursor-pointer"
          aria-label="Play video"
        >
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/90 hover:bg-white transition-all duration-200 hover:scale-110">
            <Play className="w-10 h-10 text-black ml-1" fill="currentColor" />
          </div>
        </button>
      )}
    </div>
  );
}
