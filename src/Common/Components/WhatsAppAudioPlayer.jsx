import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause, X } from "lucide-react";

const WhatsAppAudioPlayer = ({ file, src, onRemove }) => {
  const waveformRef = useRef(null);
  const waveSurferRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!waveformRef.current) return;

    waveSurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#94a3b8", // slate-400
      progressColor: "#22c55e", // green-500
      height: 24, // Reduced height
      barWidth: 2,
      barGap: 3,
      barRadius: 4,
      cursorWidth: 0,
      normalize: true,
    });

    const objectUrl = file ? URL.createObjectURL(file) : null;
    const url = src || objectUrl;
    if (url) {
      console.log("WhatsAppAudioPlayer loading URL:", url);
      waveSurferRef.current.load(url);
    }

    waveSurferRef.current.on("ready", () => {
      const dur = waveSurferRef.current.getDuration();
      console.log("WhatsAppAudioPlayer ready - Duration:", dur);
      setDuration(dur);
    });

    waveSurferRef.current.on("error", (err) => {
      console.error("WhatsAppAudioPlayer WaveSurfer Error:", err);
    });

    waveSurferRef.current.on("audioprocess", () => {
      setCurrent(waveSurferRef.current.getCurrentTime());
    });

    waveSurferRef.current.on("finish", () => {
      setIsPlaying(false);
    });

    return () => {
      waveSurferRef.current.destroy();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file, src]);

  const togglePlay = () => {
    waveSurferRef.current.playPause();
    setIsPlaying((p) => !p);
  };

  const formatTime = (t) =>
    `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-lg p-2 transition-all hover:bg-white hover:shadow-sm">
      {/* Play / Pause */}
      <button
        type="button"
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 hover:bg-green-600 transition-colors shadow-sm cursor-pointer"
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>

      {/* Waveform */}
      <div className="flex-1 min-w-0">
        <div ref={waveformRef} className="cursor-pointer" />
        <div className="flex justify-between items-center mt-0.5">
          <span className="text-[10px] font-medium text-gray-500">
            {formatTime(current)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Remove */}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 transition-all shrink-0 cursor-pointer"
          title="Remove recording"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
};

export default WhatsAppAudioPlayer;
