"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshTransmissionMaterial, MeshDistortMaterial, Environment, Float, Sparkles } from '@react-three/drei';

function RealisticOrb({ state }) {
  const innerRef = useRef();
  
  const speed = state === 'listening' ? 6 : state === 'processing' ? 3 : state === 'speaking' ? 8 : 1.5;
  const distort = state === 'listening' ? 0.7 : state === 'processing' ? 0.3 : state === 'speaking' ? 0.8 : 0.2;
  const coreColor = state === 'processing' ? '#00ffa6' : state === 'speaking' ? '#0099ff' : '#00e5ff';
  const glowIntensity = state === 'idle' ? 1.5 : 4.0;

  useFrame((state, delta) => {
    if (innerRef.current) {
      innerRef.current.rotation.x += delta * speed * 0.3;
      innerRef.current.rotation.y += delta * speed * 0.4;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      {/* Outer Glass Shell */}
      <Sphere args={[1.2, 64, 64]}>
        <MeshTransmissionMaterial 
          backside
          backsideThickness={0.5}
          thickness={0.5}
          chromaticAberration={0.1}
          anisotropicBlur={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={2}
          resolution={512}
          transmission={1}
          roughness={0}
          color="#ffffff"
        />
      </Sphere>

      {/* Inner Distorted Energy Core */}
      <Sphere args={[0.9, 64, 64]} ref={innerRef}>
        <MeshDistortMaterial 
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={glowIntensity}
          distort={distort} 
          speed={speed} 
          roughness={0.1} 
          metalness={0.8}
        />
      </Sphere>

      {/* Ambient particles when speaking/listening */}
      {(state === 'listening' || state === 'speaking') && (
        <Sparkles count={100} scale={3} size={2} speed={0.4} opacity={0.6} color={coreColor} />
      )}
    </Float>
  );
}

export default function HUD() {
  const [state, setState] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [logs, setLogs] = useState([]);
  const [isCloudMode, setIsCloudMode] = useState(false);
  const wsRef = useRef(null);
  const recognitionRef = useRef(null);

  const addLog = useCallback((log) => {
    setLogs(prev => [...prev.slice(-9), log]);
  }, []);

  const initWebSocket = useCallback((url, fallbackUrl = null) => {
    const ws = new WebSocket(url);
    wsRef.current = ws;
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'state') {
          setState(data.state);
          if (data.transcript) {
            setTranscript(data.transcript);
            addLog(`> USER: ${data.transcript}`);
          }
        } else if (data.type === 'response' && isCloudMode) {
          const utterance = new SpeechSynthesisUtterance(data.text);
          utterance.pitch = 0.4;
          utterance.rate = 0.85;
          
          const voices = window.speechSynthesis.getVoices();
          const maleVoice = voices.find(v => 
            v.lang.startsWith('en') && 
            (v.name.toLowerCase().includes('male') || 
             v.name.toLowerCase().includes('daniel') || 
             v.name.toLowerCase().includes('guy') ||
             v.name.toLowerCase().includes('david') ||
             v.name.toLowerCase().includes('mark'))
          );
          if (maleVoice) utterance.voice = maleVoice;
          
          window.speechSynthesis.speak(utterance);
          
          if (data.action) {
              setTimeout(() => {
                  if (data.action === 'call') {
                      window.location.href = `tel:${data.payload}`;
                  } else if (data.action === 'music') {
                      window.location.href = `spotify:search:${encodeURIComponent(data.payload)}`;
                  }
              }, 500);
          }
        }
      } catch (e) {
        console.error("WS parsing error", e);
      }
    };
    
    ws.onopen = () => {
      addLog(`> SYSTEM_ONLINE: Connected to ${url}`);
      setIsCloudMode(url !== 'ws://127.0.0.1:8000/ws');
    };
    
    ws.onerror = () => {
      if (fallbackUrl) {
        addLog(`> Local failed, attempting cloud override...`);
        initWebSocket(fallbackUrl);
      }
    };

    ws.onclose = () => {
      if (!fallbackUrl) {
        addLog(`> CRITICAL: NEURAL LINK SEVERED`);
        setState('offline');
      }
    };
  }, [addLog, isCloudMode]);

  useEffect(() => {
    const cloudUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://arya.swarajchattaraj.tech/ws';
    initWebSocket('ws://127.0.0.1:8000/ws', cloudUrl);
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        addLog(`> TRANSCRIBED: ${text}`);
        setTranscript(text);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'query', text }));
        }
      };
      
      recognition.onerror = (e) => addLog(`> SENSOR ERROR: ${e.error}`);
      recognition.onend = () => setState('idle');
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [initWebSocket]);

  const handleTapToSpeak = () => {
    if (isCloudMode && recognitionRef.current) {
      setState('listening');
      recognitionRef.current.start();
    }
  };

  return (
    <div className="relative w-screen h-screen bg-[#02050a] overflow-hidden font-mono text-cyan-400 selection:bg-cyan-900">
      
      {/* Dynamic Background Gradient overlay based on state */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none opacity-40"
        animate={{
          background: state === 'listening' ? 'radial-gradient(circle at 50% 50%, rgba(0,229,255,0.2) 0%, rgba(2,5,10,1) 60%)' :
                      state === 'processing' ? 'radial-gradient(circle at 50% 50%, rgba(0,255,166,0.2) 0%, rgba(2,5,10,1) 60%)' :
                      state === 'speaking' ? 'radial-gradient(circle at 50% 50%, rgba(0,153,255,0.2) 0%, rgba(2,5,10,1) 60%)' :
                      'radial-gradient(circle at 50% 50%, rgba(0,229,255,0.05) 0%, rgba(2,5,10,1) 60%)'
        }}
        transition={{ duration: 1 }}
      />
      
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] relative">
            <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 5, 5]} intensity={2} />
              <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#00ffff" />
              <Environment preset="city" />
              <RealisticOrb state={state} />
              <OrbitControls enableZoom={false} enablePan={false} autoRotate={state === 'processing'} autoRotateSpeed={4} />
            </Canvas>
        </div>
      </div>

      {/* Top Bar - Glassmorphism */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-1 pointer-events-none">
        <h1 className="text-3xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 drop-shadow-[0_0_15px_rgba(0,255,255,0.6)]">
          ARYA
        </h1>
        <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
          <motion.div 
            className={`w-2 h-2 rounded-full ${state === 'offline' ? 'bg-red-500' : 'bg-cyan-400'}`} 
            animate={{ opacity: [1, 0.4, 1] }} 
            transition={{ repeat: Infinity, duration: state === 'offline' ? 0.5 : 2 }}
            style={{ boxShadow: `0 0 10px ${state === 'offline' ? '#ef4444' : '#22d3ee'}` }}
          />
          <span className="uppercase tracking-[0.2em] text-[10px] text-white/80 font-bold">
            {state === 'offline' ? 'OFFLINE' : `SYS: ${state} ${isCloudMode ? '(NET)' : '(LOC)'}`}
          </span>
        </div>
      </div>

      {/* Main Action Button */}
      {isCloudMode && (
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-30">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleTapToSpeak}
            className={`
              relative overflow-hidden px-8 py-4 rounded-2xl 
              backdrop-blur-xl border border-white/20 
              uppercase tracking-widest font-bold text-sm
              transition-all duration-500
              ${state === 'listening' ? 'bg-white/10 text-white border-cyan-400 shadow-[0_0_30px_rgba(0,229,255,0.4)]' : 'bg-black/40 text-cyan-200 hover:bg-white/5'}
            `}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
            <span className="relative z-10">{state === 'listening' ? 'Listening...' : 'Initialize Audio'}</span>
          </motion.button>
        </div>
      )}

      {/* Glassmorphism Terminal */}
      <div className="absolute bottom-8 right-8 z-20 w-80 h-48 sm:w-[400px] sm:h-56 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-5 flex flex-col pointer-events-none shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
          <div className="text-[10px] text-white/50 uppercase tracking-[0.3em] font-bold">Diagnostic Log</div>
          <div className="flex gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
             <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
             <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          </div>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col justify-end text-xs opacity-90 gap-1.5 text-cyan-100/70">
          <AnimatePresence>
            {logs.map((log, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="break-all font-light tracking-wide"
              >
                {log}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Transcript Overlay */}
      <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-1/2 sm:-translate-x-1/2 z-20 text-center max-w-2xl w-full pointer-events-none">
        <AnimatePresence mode="wait">
          {transcript && (
            <motion.div
              key={transcript}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="text-lg sm:text-2xl text-white font-medium drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] bg-black/50 backdrop-blur-2xl px-8 py-5 rounded-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
            >
              "{transcript}"
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
    </div>
  );
}
