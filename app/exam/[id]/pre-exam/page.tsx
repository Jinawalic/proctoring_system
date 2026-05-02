"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Camera, Check, Settings, ShieldAlert, User, Smartphone, MonitorOff } from "lucide-react";

export default function PreExamPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamStarted, setStreamStarted] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const unwrappedParams = use(params);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamStarted(true);
        setCameraError("");
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError("Unable to access camera. Please allow camera permissions.");
      setStreamStarted(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleStartExam = () => {
    stopCamera();
    router.push(`/exam/${unwrappedParams.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-3">
          <h1 className="text-3xl font-bold text-zinc-900">Pre-Exam Check</h1>
          <p className="text-zinc-500 mt-2">Please complete the system check and review instructions before starting.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Instructions Column */}
          <div className="space-y-3">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-zinc-900 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Exam Instructions
              </h2>
              <ul className="space-y-3 text-zinc-600">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Ensure you are in a quiet, well-lit room.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>The exam has a strict time limit and will auto-submit when time is up.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Do not refresh the page or open other tabs during the exam.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-red-600 mb-4">
                <ShieldAlert className="w-5 h-5" />
                Proctoring Rules
              </h2>
              <p className="text-sm text-zinc-500 mb-4">
                This exam is strictly proctored using AI. Violations will be logged.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <User className="w-6 h-6 text-red-500" />
                  <span className="text-sm font-medium text-red-800">Only ONE face allowed</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <Smartphone className="w-6 h-6 text-red-500" />
                  <span className="text-sm font-medium text-red-800">No phones or books</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <MonitorOff className="w-6 h-6 text-red-500" />
                  <span className="text-sm font-medium text-red-800">No extra laptops/screens</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <Camera className="w-6 h-6 text-red-500" />
                  <span className="text-sm font-medium text-red-800">Camera MUST remain on</span>
                </div>
              </div>
            </div>
          </div>

          {/* Camera Column */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-zinc-900 mb-4">
                <Settings className="w-5 h-5 text-zinc-500" />
                System Check
              </h2>

              <div className="relative aspect-video bg-zinc-900 rounded-xl overflow-hidden mb-6 flex-1 flex items-center justify-center border border-zinc-800">
                {cameraError ? (
                  <div className="text-center p-6 text-red-400">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-white transition-colors"
                    >
                      Retry Camera
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                    {!streamStarted && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="w-8 h-8 border-4 border-white/20 border-t-brand rounded-full animate-spin" />
                      </div>
                    )}
                  </>
                )}

                {/* Overlay indicating camera is on */}
                {streamStarted && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-medium text-white">Live</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleStartExam}
                disabled={!streamStarted || !!cameraError}
                className="w-full py-4 px-6 bg-brand hover:bg-brand-hover disabled:bg-zinc-300 disabled: disabled:text-zinc-500 text-white rounded-xl font-bold text-lg shadow-sm transition-all flex justify-center items-center gap-2 disabled:cursor-not-allowed"
              >
                Start Exam Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
