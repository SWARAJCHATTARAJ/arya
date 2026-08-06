"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';

function Orb({ state }) {
  const meshRef = useRef();
  
  const speed = state === 'listening' ? 4 : state === 'processing' ? 2 : state === 'speaking' ? 5 : 1;
  const distort = state === 'listening' ? 0.6 : state === 'processing' ? 0.4 : state === 'speaking' ? 0.8 : 0.2;
  const color = state === 'processing' ? '#00ffcc' : state === 'speaking' ? '#00aaff' : '#00ffff';

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * speed * 0.2;
      meshRef.current.rotation.y += delta * speed * 0.2;
    }
  });

  return (
    <Sphere args={[1, 64, 64]} ref={meshRef}>
      <MeshDistortMaterial 
        color={color} 
        attach="material" 
        distort={distort} 
        speed={speed} 
        roughness={0.2} 
        metalness={0.8}
        emissive={color}
        emissiveIntensity={state === 'idle' ? 0.2 : 0.8}
      />
    </Sphere>
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
            addLog(`> ${data.transcript}`);
          }
        } else if (data.type === 'response' && isCloudMode) {
          // Speak the response in cloud mode with a deep male voice
          const utterance = new SpeechSynthesisUtterance(data.text);
          utterance.pitch = 0.4; // Extremely low pitch for a deep voice
          utterance.rate = 0.85; // Slower cadence
          
          // Try to select a male voice if available on the device
          const voices = window.speechSynthesis.getVoices();
          const maleVoice = voices.find(v => 
            v.lang.startsWith('en') && 
            (v.name.toLowerCase().includes('male') || 
             v.name.toLowerCase().includes('daniel') || 
             v.name.toLowerCase().includes('guy') ||
             v.name.toLowerCase().includes('david') ||
             v.name.toLowerCase().includes('mark'))
          );
          if (maleVoice) {
             utterance.voice = maleVoice;
          }
          
          window.speechSynthesis.speak(utterance);
          
          // Execute Native Action Bridge if present
          if (data.action) {
              setTimeout(() => {
                  if (data.action === 'call') {
                      window.location.href = `tel:${data.payload}`;
                  } else if (data.action === 'music') {
                      window.location.href = `spotify:search:${encodeURIComponent(data.payload)}`;
                  }
              }, 500); // Wait 500ms for TTS to start before deep linking
          }
        }
      } catch (e) {
        console.error("WS parsing error", e);
      }
    };
    
    ws.onopen = () => {
      addLog(`> SYSTEM_ONLINE: Connected to Arya Core at ${url}`);
      setIsCloudMode(url !== 'ws://127.0.0.1:8000/ws');
    };
    
    ws.onerror = () => {
      if (fallbackUrl) {
        addLog(`> Local connection failed, trying Cloud fallback...`);
        initWebSocket(fallbackUrl);
      }
    };

    ws.onclose = () => {
      if (!fallbackUrl) {
        addLog(`> SYSTEM_OFFLINE: Connection lost`);
        setState('offline');
      }
    };
  }, [addLog, isCloudMode]);

  useEffect(() => {
    // Try local first, fallback to cloud
    const cloudUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://arya.swarajchattaraj.tech/ws';
    initWebSocket('ws://127.0.0.1:8000/ws', cloudUrl);
    
    // Init speech recognition for cloud mode
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        addLog(`> Recognized: ${text}`);
        setTranscript(text);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'query', text }));
        }
      };
      
      recognition.onerror = (e) => addLog(`> Mic error: ${e.error}`);
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
    <div className="relative w-screen h-screen bg-black overflow-hidden font-mono text-cyan-400 selection:bg-cyan-900">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 relative">
            <Canvas camera={{ position: [0, 0, 3] }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[2, 2, 2]} intensity={1} />
            <Orb state={state} />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate={state === 'processing'} />
            </Canvas>
            
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-cyan-500/30"
              animate={{ 
                scale: state === 'listening' ? [1, 1.1, 1] : 1,
                opacity: state === 'speaking' ? [0.3, 0.8, 0.3] : 0.5
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
        </div>
      </div>

      <div className="absolute top-8 left-8 z-20 flex flex-col gap-2 pointer-events-none">
        <h1 className="text-2xl font-bold tracking-widest text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">ARYA // SYSTEM</h1>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${state === 'offline' ? 'bg-red-500' : 'bg-cyan-400'} shadow-[0_0_10px_currentColor] animate-pulse`} />
          <span className="uppercase tracking-widest text-sm opacity-80">
            {state === 'offline' ? 'DISCONNECTED' : `STATUS: ${state} ${isCloudMode ? '(CLOUD)' : ''}`}
          </span>
        </div>
      </div>

      {isCloudMode && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30">
          <button 
            onClick={handleTapToSpeak}
            className="px-6 py-3 border-2 border-cyan-500 text-cyan-400 rounded-full bg-cyan-900/30 hover:bg-cyan-500/30 backdrop-blur-md uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(0,255,255,0.4)] active:scale-95 transition-all"
          >
            {state === 'listening' ? 'Listening...' : 'Tap to Speak'}
          </button>
        </div>
      )}

      <div className="absolute bottom-8 right-8 z-20 w-80 h-48 sm:w-96 sm:h-64 border border-cyan-500/30 bg-black/50 backdrop-blur-md p-4 flex flex-col pointer-events-none">
        <div className="text-xs uppercase tracking-widest opacity-60 border-b border-cyan-500/30 pb-2 mb-2">Terminal Feed</div>
        <div className="flex-1 overflow-hidden flex flex-col justify-end text-sm opacity-80 gap-1">
          <AnimatePresence>
            {logs.map((log, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="break-all"
              >
                {log}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-8 sm:bottom-16 sm:left-1/2 sm:-translate-x-1/2 z-20 text-center max-w-xl w-full pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={transcript}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg sm:text-xl text-cyan-100 font-light drop-shadow-[0_0_5px_rgba(0,255,255,0.5)] bg-black/40 backdrop-blur-sm p-4 rounded-lg border border-cyan-500/20"
          >
            {transcript || "Waiting for command..."}
          </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="absolute inset-0 z-50 pointer-events-none opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
    </div>
  );
}
