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
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/20 via-black/30 to-black/50 transition-opacity hover:bg-black/40 cursor-pointer backdrop-blur-[2px]"
          aria-label="Play video"
        >
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#482090]/40 backdrop-blur-xl backdrop-saturate-150 border border-[#A06AFF]/30 shadow-lg shadow-[#482090]/50 hover:bg-[#482090]/50 hover:backdrop-blur-2xl hover:border-[#A06AFF]/50 hover:shadow-[#482090]/70 transition-all duration-300 hover:scale-110">
            <Play className="w-10 h-10 text-white ml-1" fill="currentColor" />
          </div>
        </button>
      )}
    </div>
  );
}
