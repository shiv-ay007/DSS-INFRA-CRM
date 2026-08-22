import React, { useRef, useState, useEffect } from "react";
import {
  Plus,
  Mic,
  Image,
  Video,
  Pause,
  Play,
  Headphones,
  X,
  CircleStop,
  FileText,
} from "lucide-react";
import WhatsAppAudioPlayer from "./WhatsAppAudioPlayer";

const CommentWithMedia = ({
  title = "Write Your Comments",
  placeholder = "Write your comment...",
  value = "",
  onChange,
  files = [],
  onFilesChange,
  allowMedia = true,
}) => {
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const optionBoxRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const [showOptions, setShowOptions] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordTime, setRecordTime] = useState(0);

  /* ⏱️ Recording Timer */
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused]);

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(
      sec % 60,
    ).padStart(2, "0")}`;

  /* Outside click */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionBoxRef.current && !optionBoxRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOptions]);

  /* File select */
  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("image")
        ? "image"
        : file.type.startsWith("video")
        ? "video"
        : file.type.startsWith("audio")
        ? "audio"
        : "document",
      name: file.name,
      size: file.size,
    }));

    if (newFiles.length) {
      onFilesChange?.([...files, ...newFiles]);
    }
    e.target.value = "";
  };

  /* Remove file */
  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    onFilesChange?.(updated);
  };

  /* 🎤 Start Recording */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) =>
        audioChunksRef.current.push(e.data);

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        onFilesChange?.([
          ...files,
          {
            file,
            preview: URL.createObjectURL(file),
            type: "audio",
            name: `Recording-${Date.now()}.webm`,
            size: blob.size,
          },
        ]);
        setRecordTime(0);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Please allow microphone access to record audio.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
    }
    setIsRecording(false);
    setIsPaused(false);
  };

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
      clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs relative z-0">
      <div className="px-4 py-2 border-b border-gray-100 flex gap-2 items-center bg-gray-50/50 rounded-t-xl">
        <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
          {title}
        </h2>
      </div>

      <div className="p-3.5 relative">
        <div className="flex items-start gap-2 border border-gray-200 rounded-lg bg-gray-50/50 px-3 py-2">
          <textarea
            value={value}
            onChange={(e) => {
              onChange?.(e.target.value);
            }}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-xs sm:text-sm text-slate-800 min-h-[70px] py-1 resize-none scrollbar-thin placeholder:text-slate-400"
          />

          {allowMedia && (
            <button
              type="button"
              onClick={() => setShowOptions((p) => !p)}
              title="Upload Media"
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all cursor-pointer mt-1"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              title="Voice Recording"
              className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition-all cursor-pointer mt-1"
            >
              <Mic className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 mt-1 bg-white px-2 py-1 rounded-full border border-gray-200 shadow-xs">
              <span className="text-xs font-semibold text-red-600 flex gap-1 items-center">
                <span className="relative flex h-2.5 w-2.5">
                  {!isPaused && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  )}
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="w-10"> {formatTime(recordTime)} </span>
              </span>

              {!isPaused ? (
                <button
                  type="button"
                  onClick={pauseRecording}
                  title="Pause"
                  className="p-1.5 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 transition-colors cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resumeRecording}
                  title="Resume"
                  className="p-1.5 rounded-full bg-green-100 hover:bg-green-200 text-green-700 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={stopRecording}
                title="Stop"
                className="p-1.5 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors cursor-pointer"
              >
                <CircleStop className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {showOptions && (
          <div
            ref={optionBoxRef}
            className="absolute bottom-16 right-4 bg-white border border-gray-200 rounded-lg shadow-lg w-40 z-[60] overflow-hidden py-1"
          >
            <button
              type="button"
              onClick={() => {
                imageInputRef.current.click();
                setShowOptions(false);
              }}
              className="p-2.5 flex gap-2.5 w-full items-center text-xs font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <Image className="w-4 h-4 text-blue-600" /> Image
            </button>
            <button
              type="button"
              onClick={() => {
                audioInputRef.current.click();
                setShowOptions(false);
              }}
              className="p-2.5 flex gap-2.5 w-full items-center text-xs font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <Headphones className="w-4 h-4 text-orange-600" /> Audio
            </button>
            <button
              type="button"
              onClick={() => {
                videoInputRef.current.click();
                setShowOptions(false);
              }}
              className="p-2.5 flex gap-2.5 w-full items-center text-xs font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <Video className="w-4 h-4 text-purple-600" /> Video
            </button>
          </div>
        )}

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFileSelect}
        />
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          multiple
          hidden
          onChange={handleFileSelect}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          multiple
          hidden
          onChange={handleFileSelect}
        />

        {files.length > 0 && (
          <p className="mt-2 text-xs font-semibold text-slate-500 text-end">
            📎 {files.length} file{files.length > 1 ? "s" : ""} selected
          </p>
        )}
      </div>

      {/* 🔥 PREVIEW SECTION */}
      {files.length > 0 && (
        <div className="px-4 pb-4 space-y-3">
          {/* Images & Videos Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {files.map((item, i) => {
              const { file, preview, type } = item;
              const isImage =
                file?.type?.startsWith("image") ||
                type?.toLowerCase() === "image";
              const isVideo =
                file?.type?.startsWith("video") ||
                type?.toLowerCase() === "video";

              if (!isImage && !isVideo) return null;

              return (
                <div
                  key={i}
                  className="relative border rounded-lg overflow-hidden bg-gray-50 group"
                >
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 z-10 bg-white/90 rounded-full p-1 shadow-sm hover:bg-red-50 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 text-red-500" />
                  </button>

                  {isImage && (
                    <img
                      src={preview}
                      alt=""
                      onClick={() => window.open(preview, "_blank")}
                      className="h-28 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  )}

                  {isVideo && (
                    <video
                      src={preview}
                      controls
                      className="h-28 w-full object-cover bg-black"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* 🎧 Audio List */}
          <div className="space-y-2 flex flex-col gap-2">
            {files.map((item, i) => {
              const { file, preview, type } = item;
              const isAudio =
                file?.type?.startsWith("audio") ||
                type?.toLowerCase() === "audio";

              if (!isAudio) return null;

              return (
                <div key={i} className="w-full">
                  <WhatsAppAudioPlayer
                    file={file}
                    src={preview}
                    onRemove={() => removeFile(i)}
                  />
                </div>
              );
            })}
          </div>

          {/* 📄 Other Documents */}
          <div className="flex flex-wrap gap-2">
            {files.map((item, i) => {
              const { file, preview, type } = item;
              const isImage =
                file?.type?.startsWith("image") ||
                type?.toLowerCase() === "image";
              const isVideo =
                file?.type?.startsWith("video") ||
                type?.toLowerCase() === "video";
              const isAudio =
                file?.type?.startsWith("audio") ||
                type?.toLowerCase() === "audio";

              if (isImage || isVideo || isAudio) return null;

              return (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50 hover:bg-white transition-all group"
                >
                  <FileText className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                  <a
                    href={preview}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-gray-700 truncate max-w-[150px] hover:text-blue-600"
                  >
                    {file?.name || item.name || "View Document"}
                  </a>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="p-1 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentWithMedia;
