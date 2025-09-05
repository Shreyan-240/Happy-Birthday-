// src/App.jsx
// Birthday Autoplay React App using iframe
// Replace VIDEO_URLS with your YouTube / Vimeo unlisted URLs
// Background music: public/assets/bg-music.mp3
// Uses: framer-motion, tailwindcss

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---------- CONFIG -------------------------------------------------
const VIDEO_URLS = [
  "https://www.youtube.com/embed/Y3TAdQq0TKM?autoplay=1&enablejsapi=1&controls=0&modestbranding=1&rel=0&fs=0&iv_load_policy=3&disablekb=1"
,
  "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&enablejsapi=1" // Replace with your own
];
const BG_MUSIC_PATH = "/assets/bg-music.mp3";
// -------------------------------------------------------------------

export default function App() {
  const [stage, setStage] = useState("landing"); // 'landing' | 'playing' | 'gallery'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [bgMuted, setBgMuted] = useState(false);

  const bgAudioRef = useRef(null);

  useEffect(() => {
    if (currentIndex < 0) setCurrentIndex(0);
    if (currentIndex >= VIDEO_URLS.length && VIDEO_URLS.length > 0) {
      setStage("gallery");
    }
  }, [currentIndex]);

  const startSequence = async () => {
    try {
      if (bgAudioRef.current) {
        bgAudioRef.current.volume = 0.2;
        await bgAudioRef.current.play();
      }
    } catch (e) {
      console.warn("bg audio couldn't start:", e);
    }
    setStage("playing");
    setCurrentIndex(0);
  };

  const handleEnded = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsTransitioning(false);
      if (currentIndex < VIDEO_URLS.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setStage("gallery");
      }
    }, 600);
  };

  const handleSkip = () => {
    if (currentIndex < VIDEO_URLS.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setStage("gallery");
    }
  };

  const playVideoAt = (index) => {
    setCurrentIndex(index);
    setStage("playing");
    bgAudioRef.current?.play().catch(() => {});
  };

  const replaySequence = () => {
    setCurrentIndex(0);
    setStage("playing");
    bgAudioRef.current?.play().catch(() => {});
  };

  const currentVideo = VIDEO_URLS[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-yellow-50 to-cyan-50 p-6 flex items-center justify-center">
      <audio ref={bgAudioRef} src={BG_MUSIC_PATH} loop preload="auto" muted={bgMuted} />

      <div className="max-w-5xl w-full">
        {/* ---------- LANDING ---------- */}
        {stage === "landing" && (
          <div className="text-center space-y-6 py-20">
            <h1 className="text-4xl md:text-5xl font-extrabold">🎉 Happy Birthday! 🎂</h1>
            <p className="text-lg text-gray-700">A surprise video montage — click below to start the show.</p>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={startSequence}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform"
              >
                Play Surprise
              </button>

              <button
                onClick={() => setStage("gallery")}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                View All Videos
              </button>
            </div>

            <div className="mt-8 text-sm text-gray-600">
              Tip: If you don’t hear music, tap the Play button once (browser autoplay rules).
            </div>
          </div>
        )}

        {/* ---------- PLAYING / AUTOPLAY SEQUENCE ---------- */}
        {stage === "playing" && (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden shadow-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentVideo}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isTransitioning ? 0 : 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="aspect-[16/9] relative">
                    <iframe
                      key={currentVideo}
                      src={
                        currentVideo.includes("youtube.com")
                          ? currentVideo.replace(/\?.*$/, "") +
                            "?autoplay=1&enablejsapi=1&controls=0&modestbranding=1&rel=0&fs=0&iv_load_policy=3&disablekb=1"
                          : currentVideo.includes("vimeo.com")
                            ? currentVideo.split("?")[0] + "?autoplay=1&controls=0&background=0"
                            : currentVideo
                      }
                      title={`Video ${currentIndex + 1}`}
                      className="absolute inset-0 w-full h-full"
                      frameBorder="0"
                      allow="autoplay; encrypted-media; fullscreen"
                      allowFullScreen
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Custom overlay controls */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={handleSkip}
                  className="bg-white/80 backdrop-blur rounded-full w-10 h-10 flex items-center justify-center shadow"
                  title="Skip to next"
                >
                  ⏭
                </button>

                <button
                  onClick={() => setBgMuted((m) => !m)}
                  className="bg-white/80 backdrop-blur rounded-full w-10 h-10 flex items-center justify-center shadow"
                  title={bgMuted ? "Unmute background" : "Mute background"}
                >
                  {bgMuted ? "🔈" : "🔊"}
                </button>

                <button
                  onClick={() => setStage("gallery")}
                  className="bg-white/80 backdrop-blur rounded-full w-10 h-10 flex items-center justify-center shadow"
                  title="End and go to gallery"
                >
                  ⏹
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">Playing {currentIndex + 1} of {VIDEO_URLS.length}</div>
              <div className="text-sm text-gray-500">Autoplay sequence — videos will play back-to-back.</div>
            </div>
          </div>
        )}

        {/* ---------- GALLERY ---------- */}
        {stage === "gallery" && (
          <div className="py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">All Messages</h2>
              <div className="flex gap-2">
                <button onClick={replaySequence} className="px-4 py-2 rounded-md bg-indigo-600 text-white">Replay Sequence</button>
                <button onClick={() => setStage("landing")} className="px-3 py-2 rounded-md border">Back Home</button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {VIDEO_URLS.map((url, i) => {
                const id = extractYouTubeID(url);
                const thumb = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : generateFallbackThumb(i);
                return (
                  <div key={i} className="rounded-md overflow-hidden bg-white shadow cursor-pointer" onClick={() => playVideoAt(i)}>
                    <div className="relative">
                      <img src={thumb} alt={`Video ${i + 1} thumbnail`} className="w-full h-40 object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/40 rounded-full p-3 text-white">▶</div>
                      </div>
                    </div>
                    <div className="p-2 text-sm">Video {i + 1}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------ Helpers ------------------
function extractYouTubeID(url) {
  if (!url) return null;
  const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

function generateFallbackThumb(i) {
  const colors = ["f97316", "fb7185", "60a5fa", "34d399", "f59e0b"];
  const c = colors[i % colors.length];
  return `https://via.placeholder.com/480x270/${c}/ffffff?text=Video+${i + 1}`;
}
