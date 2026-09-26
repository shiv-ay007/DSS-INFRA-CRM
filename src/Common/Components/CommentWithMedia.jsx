import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Camera,
  RefreshCw,
  Square,
} from "lucide-react";
import { FaImage, FaPlay, FaVideo, FaFileAlt, FaMicrophone } from "react-icons/fa";
import WhatsAppAudioPlayer from "./WhatsAppAudioPlayer";

const CommentWithMedia = ({
  title = "Write Your Comments",
  placeholder = "Write your comment...",
  value = "",
  onChange,
  files = [],
  onFilesChange,
  allowMedia = true,
  iconView = false,
}) => {
  const [activeMediaModal, setActiveMediaModal] = useState(null);
  const [isIconView, setIsIconView] = useState(iconView);

  useEffect(() => {
    setIsIconView(iconView);
  }, [iconView]);

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

  /* 📷 Camera States & Refs */
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState("user");
  const [cameraError, setCameraError] = useState("");
  const [cameraLoading, setCameraLoading] = useState(false);
  const [captureMode, setCaptureMode] = useState("photo"); // "photo" | "video"
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoRecordTime, setVideoRecordTime] = useState(0);

  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const videoRecorderRef = useRef(null);
  const videoChunksRef = useRef([]);
  const videoTimerRef = useRef(null);

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

  /* Detect media type safely from file, type string, or filename / url */
  const getMediaType = (item) => {
    if (!item) return "document";
    const file = item.file;
    const type = (file?.type || item.type || item.fileType || "").toLowerCase();
    const name = (file?.name || item.name || item.filename || "").toLowerCase();
    const url = (item.preview || item.url || (typeof item === "string" ? item : "")).toLowerCase();

    if (
      type.includes("image") ||
      url.startsWith("data:image") ||
      name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
      url.match(/\.(jpg|jpeg|png|gif|webp|svg)($|\?)/i)
    ) {
      return "image";
    }
    if (
      type.includes("audio") ||
      url.startsWith("data:audio") ||
      name.match(/\.(mp3|wav|ogg|m4a|webm|aac)$/i) ||
      url.match(/\.(mp3|wav|ogg|m4a|webm|aac)($|\?)/i) ||
      name.includes("audio") ||
      name.startsWith("recording")
    ) {
      return "audio";
    }
    if (
      type.includes("video") ||
      url.startsWith("data:video") ||
      name.match(/\.(mp4|webm|ogg|mov|mkv)$/i) ||
      url.match(/\.(mp4|webm|ogg|mov|mkv)($|\?)/i) ||
      name.includes("video")
    ) {
      return "video";
    }
    return "document";
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

  /* 📷 Camera Controller Functions */
  const startCamera = async (facing = cameraFacingMode, mode = captureMode) => {
    setIsCameraOpen(true);
    setCameraError("");
    setCameraLoading(true);

    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }

    try {
      let stream = null;
      const needAudio = mode === "video";
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: needAudio,
        });
      } catch (e) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: needAudio,
          });
        } catch (e2) {
          // If mic permission was denied, fallback to video only
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraError(
        "Camera access denied or unavailable. Please allow camera permissions."
      );
    } finally {
      setCameraLoading(false);
    }
  };

  const handleModeChange = (newMode) => {
    if (isRecordingVideo || newMode === captureMode) return;
    setCaptureMode(newMode);
    startCamera(cameraFacingMode, newMode);
  };

  const stopCamera = () => {
    if (videoTimerRef.current) {
      clearInterval(videoTimerRef.current);
      videoTimerRef.current = null;
    }
    if (videoRecorderRef.current && videoRecorderRef.current.state !== "inactive") {
      try {
        videoRecorderRef.current.stop();
      } catch (e) {}
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
    setIsRecordingVideo(false);
    setVideoRecordTime(0);
    setCameraError("");
    setCameraLoading(false);
  };

  const switchCamera = () => {
    if (isRecordingVideo) return;
    const nextFacing = cameraFacingMode === "user" ? "environment" : "user";
    setCameraFacingMode(nextFacing);
    startCamera(nextFacing, captureMode);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 1920;
    const height = video.videoHeight || 1080;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (cameraFacingMode === "user") {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const fileName = `Camera-Photo-${Date.now()}.jpg`;
        const file = new File([blob], fileName, { type: "image/jpeg" });

        const newFile = {
          file,
          preview: URL.createObjectURL(blob),
          type: "image",
          name: fileName,
          size: blob.size,
        };

        onFilesChange?.([...files, newFile]);
        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  const startVideoRecording = () => {
    if (!cameraStreamRef.current) return;
    try {
      let options = { mimeType: "video/webm;codecs=vp9,opus" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "video/webm;codecs=vp8,opus" };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: "video/webm" };
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: "video/mp4" };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
              options = undefined;
            }
          }
        }
      }

      const recorder = new MediaRecorder(cameraStreamRef.current, options);
      videoRecorderRef.current = recorder;
      videoChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          videoChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mime = recorder.mimeType || "video/webm";
        const blob = new Blob(videoChunksRef.current, { type: mime });
        const ext = mime.includes("mp4") ? "mp4" : "webm";
        const fileName = `Camera-Video-${Date.now()}.${ext}`;
        const file = new File([blob], fileName, { type: mime });

        const newFile = {
          file,
          preview: URL.createObjectURL(blob),
          type: "video",
          name: fileName,
          size: blob.size,
        };

        onFilesChange?.([...files, newFile]);
        stopCamera();
      };

      recorder.start(1000);
      setIsRecordingVideo(true);
      setVideoRecordTime(0);

      if (videoTimerRef.current) clearInterval(videoTimerRef.current);
      videoTimerRef.current = setInterval(() => {
        setVideoRecordTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start video recording:", err);
      setCameraError("Failed to record video: " + (err.message || "Camera/Mic error"));
    }
  };

  const stopVideoRecording = () => {
    if (videoTimerRef.current) {
      clearInterval(videoTimerRef.current);
      videoTimerRef.current = null;
    }
    if (videoRecorderRef.current && videoRecorderRef.current.state !== "inactive") {
      try {
        videoRecorderRef.current.stop();
      } catch (e) {}
    }
    setIsRecordingVideo(false);
  };

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (videoTimerRef.current) {
        clearInterval(videoTimerRef.current);
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
                setShowOptions(false);
                startCamera(cameraFacingMode);
              }}
              className="p-2.5 flex gap-2.5 w-full items-center text-xs font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-600" /> Camera
            </button>
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

        {/* 1. FULL RICH PREVIEW MODE (Default) */}
        {files.length > 0 && !isIconView && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                📎 {files.length} file{files.length > 1 ? "s" : ""} selected
              </span>
              <button
                type="button"
                onClick={() => setIsIconView(true)}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
                title="Switch to compact icon view"
              >
                <span>Show as Icons</span>
                <span className="text-xs">🔲</span>
              </button>
            </div>

            {/* Images & Videos Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {files.map((item, i) => {
                const mediaType = getMediaType(item);
                if (mediaType !== "image" && mediaType !== "video") return null;

                const url = item.preview || item.url || (item.file ? URL.createObjectURL(item.file) : "");
                const isImage = mediaType === "image";
                const isVideo = mediaType === "video";

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
                        src={url}
                        alt={item.name || ""}
                        onClick={() => setActiveMediaModal({ type: "image", url, name: item.file?.name || item.name || "Image Preview" })}
                        className="h-28 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      />
                    )}

                    {isVideo && (
                      <video
                        src={url}
                        controls
                        className="h-28 w-full object-cover bg-black"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* 🎧 Audio List with Full WhatsApp Wave Player */}
            <div className="space-y-2 flex flex-col gap-2">
              {files.map((item, i) => {
                const mediaType = getMediaType(item);
                if (mediaType !== "audio") return null;

                const url = item.preview || item.url || (item.file ? URL.createObjectURL(item.file) : "");

                return (
                  <div key={i} className="w-full">
                    <WhatsAppAudioPlayer
                      file={item.file}
                      src={url}
                      onRemove={() => removeFile(i)}
                    />
                  </div>
                );
              })}
            </div>

            {/* 📄 Other Documents */}
            <div className="flex flex-wrap gap-2">
              {files.map((item, i) => {
                const mediaType = getMediaType(item);
                if (mediaType !== "document") return null;

                const url = item.preview || item.url || (item.file ? URL.createObjectURL(item.file) : "");

                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50 hover:bg-white transition-all group"
                  >
                    <FileText className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                    <a
                      href={url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-gray-700 truncate max-w-[150px] hover:text-blue-600"
                    >
                      {item.file?.name || item.name || "View Document"}
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

        {/* 2. COMPACT ICON PREVIEW MODE */}
        {files.length > 0 && isIconView && (
          <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Media ({files.length}):
            </span>
            {files.map((item, i) => {
              const mediaType = getMediaType(item);
              const url = item.preview || item.url || (item.file ? URL.createObjectURL(item.file) : "");
              const fileName = item.file?.name || item.name || `Attachment ${i + 1}`;

              // 1. IMAGE: Emerald/green icon button
              if (mediaType === "image") {
                return (
                  <div key={i} className="relative group shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveMediaModal({ type: "image", url, name: fileName })}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      title={fileName ? `${fileName} (Click to preview image)` : "Click to preview image"}
                    >
                      <FaImage className="w-3.5 h-3.5 text-emerald-600" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-[9px] font-bold shadow-xs cursor-pointer opacity-90 group-hover:opacity-100 transition-opacity"
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                );
              }

              // 2. AUDIO: Amber/orange icon button
              if (mediaType === "audio") {
                return (
                  <div key={i} className="relative group shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveMediaModal({ type: "audio", url, name: fileName })}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-800 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      title={fileName ? `${fileName} (Click to play audio note)` : "Click to play audio note"}
                    >
                      <FaPlay className="w-2.5 h-2.5 text-amber-700 ml-0.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-[9px] font-bold shadow-xs cursor-pointer opacity-90 group-hover:opacity-100 transition-opacity"
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                );
              }

              // 3. VIDEO: Blue icon button
              if (mediaType === "video") {
                return (
                  <div key={i} className="relative group shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveMediaModal({ type: "video", url, name: fileName })}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      title={fileName ? `${fileName} (Click to view video)` : "Click to view video"}
                    >
                      <FaVideo className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-[9px] font-bold shadow-xs cursor-pointer opacity-90 group-hover:opacity-100 transition-opacity"
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                );
              }

              // 4. DOCUMENT: Slate/gray icon button
              return (
                <div key={i} className="relative group shrink-0">
                  <a
                    href={url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => {
                      if (!url) e.preventDefault();
                    }}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                    title={fileName || "View Document"}
                  >
                    <FaFileAlt className="w-3.5 h-3.5 text-slate-600" />
                  </a>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      removeFile(i);
                    }}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-[9px] font-bold shadow-xs cursor-pointer opacity-90 group-hover:opacity-100 transition-opacity"
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => setIsIconView(false)}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer ml-auto flex items-center gap-1.5"
              title="Switch to full view"
            >
              <span>Full View</span>
              <span className="text-xs">🖼️</span>
            </button>
          </div>
        )}
      </div>

      {/* 📸 FULL-SCREEN PHONE-STYLE CAMERA MODAL */}
      {isCameraOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[999999] bg-black text-white flex flex-col justify-between overflow-hidden select-none">
            {/* Background Live Video Feed (Edge to edge full-screen like phone camera) */}
            <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden">
              {cameraLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3 bg-black/80 z-10">
                  <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium tracking-wide">Starting camera...</span>
                </div>
              )}

              {cameraError ? (
                <div className="p-8 text-center text-red-400 text-sm max-w-sm space-y-4 z-10 bg-slate-900/90 rounded-2xl border border-red-500/20 backdrop-blur-md">
                  <p className="leading-relaxed">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => startCamera(cameraFacingMode)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-md"
                  >
                    Retry Camera
                  </button>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    cameraFacingMode === "user" ? "scale-x-[-1]" : ""
                  }`}
                />
              )}

              {/* Viewfinder Target in Center */}
              {!cameraLoading && !cameraError && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 sm:w-72 sm:h-72 border border-white/20 rounded-3xl relative">
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-white/80 rounded-tl-sm -mt-0.5 -ml-0.5" />
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-white/80 rounded-tr-sm -mt-0.5 -mr-0.5" />
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-white/80 rounded-bl-sm -mb-0.5 -ml-0.5" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-white/80 rounded-br-sm -mb-0.5 -mr-0.5" />
                  </div>
                </div>
              )}
            </div>

            {/* Top Bar Floating */}
            <div className="relative z-20 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
              {isRecordingVideo ? (
                <div className="flex items-center gap-2 bg-red-600/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-red-400 text-xs font-bold tracking-wider text-white shadow-lg animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-white" />
                  <span>REC {formatTime(videoRecordTime)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-semibold tracking-wide">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      captureMode === "video" ? "bg-red-500" : "bg-emerald-500"
                    } animate-pulse`}
                  />
                  <span>
                    {captureMode === "video" ? "VIDEO MODE" : "PHOTO MODE"}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={stopCamera}
                className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer shadow-lg"
                title="Close Camera"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Bar Floating (Phone Shutter & Controls) */}
            <div className="relative z-20 pb-8 sm:pb-12 pt-6 px-6 sm:px-12 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
              {/* PHOTO / VIDEO Mode Slider */}
              <div className="flex items-center justify-center gap-6 mb-6">
                <button
                  type="button"
                  disabled={isRecordingVideo}
                  onClick={() => handleModeChange("photo")}
                  className={`text-xs font-bold tracking-widest uppercase transition-all px-3.5 py-1 rounded-full cursor-pointer ${
                    captureMode === "photo"
                      ? "text-amber-400 bg-white/15 shadow-sm scale-110"
                      : "text-white/60 hover:text-white"
                  } disabled:opacity-40`}
                >
                  PHOTO
                </button>
                <button
                  type="button"
                  disabled={isRecordingVideo}
                  onClick={() => handleModeChange("video")}
                  className={`text-xs font-bold tracking-widest uppercase transition-all px-3.5 py-1 rounded-full cursor-pointer ${
                    captureMode === "video"
                      ? "text-amber-400 bg-white/15 shadow-sm scale-110"
                      : "text-white/60 hover:text-white"
                  } disabled:opacity-40`}
                >
                  VIDEO
                </button>
              </div>

              <div className="max-w-md mx-auto flex items-center justify-around">
                {/* Flip Camera */}
                <button
                  type="button"
                  onClick={switchCamera}
                  disabled={cameraLoading || Boolean(cameraError) || isRecordingVideo}
                  title="Switch Camera (Front / Rear)"
                  className="w-13 h-13 rounded-full bg-white/15 hover:bg-white/25 active:scale-90 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span className="text-[9px] font-bold mt-0.5 tracking-wider">FLIP</span>
                </button>

                {/* Shutter Button (Photo vs Video) */}
                {captureMode === "photo" ? (
                  /* Big Phone Camera Shutter Button for PHOTO */
                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={cameraLoading || Boolean(cameraError)}
                    title="Capture Photo"
                    className="w-20 h-20 rounded-full border-4 border-white p-1 flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 shadow-2xl cursor-pointer hover:scale-105"
                  >
                    <div className="w-full h-full rounded-full bg-white hover:bg-slate-100 flex items-center justify-center shadow-inner transition-colors">
                      <div className="w-13 h-13 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md">
                        <Camera className="w-6 h-6" />
                      </div>
                    </div>
                  </button>
                ) : (
                  /* Video Record Button (Red Circle / Stop Square) */
                  <button
                    type="button"
                    onClick={isRecordingVideo ? stopVideoRecording : startVideoRecording}
                    disabled={cameraLoading || Boolean(cameraError)}
                    title={isRecordingVideo ? "Stop Recording" : "Start Video Recording"}
                    className={`w-20 h-20 rounded-full border-4 ${
                      isRecordingVideo ? "border-red-500 animate-pulse" : "border-white"
                    } p-1.5 flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 shadow-2xl cursor-pointer hover:scale-105`}
                  >
                    {isRecordingVideo ? (
                      <div className="w-8 h-8 rounded-md bg-red-600 flex items-center justify-center shadow-lg transition-transform hover:scale-95">
                        <Square className="w-4 h-4 text-white fill-white" />
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center shadow-inner transition-colors">
                        <div className="w-4 h-4 rounded-full bg-white/40" />
                      </div>
                    )}
                  </button>
                )}

                {/* Cancel / Exit Button */}
                <button
                  type="button"
                  onClick={stopCamera}
                  className="w-13 h-13 rounded-full bg-white/15 hover:bg-white/25 active:scale-90 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-white transition-all cursor-pointer shadow-lg"
                  title="Exit Camera"
                >
                  <X className="w-5 h-5" />
                  <span className="text-[9px] font-bold mt-0.5 tracking-wider">EXIT</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 🌟 MEDIA PREVIEW MODALS */}
      {activeMediaModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs cursor-pointer animate-fadeIn"
            onClick={() => setActiveMediaModal(null)}
          >
            <div
              className="relative max-w-2xl w-full bg-white rounded-2xl p-4 shadow-2xl border border-slate-200 overflow-hidden flex flex-col items-center cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[80%]">
                  {activeMediaModal.name || "Media Preview"}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveMediaModal(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer text-xs font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              {activeMediaModal.type === "image" && (
                <img
                  src={activeMediaModal.url}
                  alt={activeMediaModal.name || "Preview"}
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
                />
              )}

              {activeMediaModal.type === "audio" && (
                <div className="w-full bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 flex flex-col items-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <FaMicrophone className="w-7 h-7" />
                  </div>
                  <audio
                    controls
                    autoPlay
                    src={activeMediaModal.url}
                    className="w-full h-10 rounded-lg outline-none"
                  />
                </div>
              )}

              {activeMediaModal.type === "video" && (
                <video
                  controls
                  autoPlay
                  src={activeMediaModal.url}
                  className="max-h-[75vh] w-full rounded-lg bg-black"
                />
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default CommentWithMedia;
