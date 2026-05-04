"use client";

import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as faceapi from "face-api.js";

interface ProctoringViewProps {
  onViolation: (type: string, message: string) => void;
}

export default function ProctoringView({ onViolation }: ProctoringViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cocoModelRef = useRef<cocoSsd.ObjectDetection | null>(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [status, setStatus] = useState<"normal" | "violation">("normal");
  const [violationMsg, setViolationMsg] = useState("");

  const forbiddenObjects = ["cell phone", "laptop", "book"];

  // ---------------- LOAD MODELS ----------------
  const loadModels = async () => {
    try {
      await tf.ready();

      cocoModelRef.current = await cocoSsd.load();
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");

      setModelsLoaded(true);
      console.log("Models loaded successfully");
    } catch (err) {
      console.error("Model loading error:", err);
    }
  };

  // ---------------- START CAMERA ----------------
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  // ---------------- DETECTION ENGINE ----------------
  const detect = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const model = cocoModelRef.current;

    if (!video || !canvas || !model) return;
    if (video.readyState !== 4) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let violation = false;
    let message = "";

    // ---------------- OBJECT DETECTION ----------------
    const predictions = await model.detect(video);
    let objectViolation = false;
    let objectMessage = "";

    predictions.forEach((pred) => {
      if (pred.score < 0.5) return;

      const label = pred.class;

      if (forbiddenObjects.includes(label)) {
        objectViolation = true;
        objectMessage = `${label} detected`;
        onViolation("OBJECT", objectMessage);

        const [x, y, w, h] = pred.bbox;

        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = "red";
        ctx.font = "16px Arial";
        ctx.fillText(label.toUpperCase(), x, y > 10 ? y - 5 : y + 15);
      }
    });

    // ---------------- FACE DETECTION ----------------
    const faces = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions()
    );

    const faceCount = faces.length;
    let faceViolation = false;
    let faceMessage = "";

    if (faceCount !== 1) {
      faceViolation = true;
      faceMessage = faceCount === 0 ? "No face detected" : "Multiple faces detected";
      onViolation("FACE", faceMessage);
    }

    // Draw faces
    faces.forEach((face) => {
      const { x, y, width, height } = face.box;

      const color = faceCount === 1 ? "green" : "red";

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      ctx.fillStyle = color;
      ctx.font = "14px Arial";
      ctx.fillText("Face", x, y > 10 ? y - 5 : y + 15);
    });

    // ---------------- STATUS UPDATE ----------------
    if (objectViolation || faceViolation) {
      setStatus("violation");
      setViolationMsg(objectMessage && faceMessage ? `${objectMessage} & ${faceMessage}` : (objectMessage || faceMessage));
    } else {
      setStatus("normal");
      setViolationMsg("Normal");
    }
  };

  // ---------------- INIT SYSTEM ----------------
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const init = async () => {
      await loadModels();
      await startVideo();

      interval = setInterval(() => {
        detect();
      }, 1000);
    };

    init();

    return () => {
      if (interval) clearInterval(interval);

      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // ---------------- UI ----------------
  return (
    <div className="flex flex-col h-full bg-black rounded-xl overflow-hidden relative">

      {/* STATUS BAR */}
      <div
        className={`p-3 text-white font-bold ${status === "normal" ? "bg-green-600" : "bg-red-600 animate-pulse"
          }`}
      >
        {status === "normal"
          ? "✅ Normal State"
          : `❌ Violation: ${violationMsg}`}
      </div>

      {/* VIDEO AREA */}
      <div className="relative flex-1 flex items-center justify-center">

        {!modelsLoaded && (
          <div className="absolute text-white z-10">
            Loading AI Models...
          </div>
        )}

        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-auto"
            style={{ transform: "scaleX(-1)" }}
          />

          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
            style={{
              transform: "scaleX(-1)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}