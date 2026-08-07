"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Mic, MicOff, Wifi, WifiOff, Activity } from 'lucide-react';

const CoreSVG = ({ state, mouseX, mouseY }) => {
  const isListening = state === 'listening';
  const isProcessing = state === 'processing';
  const isSpeaking = state === 'speaking';
  
  // Parallax deeper elements move more
  const x = useTransform(mouseX, [-1, 1], [-25, 25]);
  const y = useTransform(mouseY, [-1, 1], [-25, 25]);

  // Easing and state transitions
  const scaleAnim = isSpeaking ? [1, 1.1, 1.05, 1.15, 1] : isProcessing ? [1, 1.02, 1] : isListening ? [1, 1.15, 1] : [1, 1.05, 1];
  const opacityAnim = isSpeaking ? 1 : isProcessing ? [0.7, 1, 0.8, 1] : isListening ? 1 : [0.6, 0.8, 0.6];
  const durationAnim = isSpeaking ? 0.4 : isProcessing ? 0.6 : isListening ? 1 : 4;

  return (
    <motion.div 
      className="absolute w-[70vw] h-[70vw] max-w-[320px] max-h-[320px] flex items-center justify-center drop-shadow-[0_0_25px_rgba(79,240,255,0.6)]"
      style={{ x, y }}
    >
      {/* Central Glowing Core */}
      <motion.div 
        className="absolute w-[40%] h-[40%] rounded-full bg-[radial-gradient(circle,rgba(79,240,255,0.9)_0%,transparent_70%)]"
        animate={{ scale: scaleAnim, opacity: opacityAnim }}
        transition={{ repeat: Infinity, duration: durationAnim, ease: "easeInOut" }}
      />
      
      {/* Particle Dot Field */}
      <motion.div 
        className="absolute w-[50%] h-[50%] rounded-full border border-cyan-400/30 mix-blend-screen overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(rgba(79,240,255,0.6) 2px, transparent 2px)',
          backgroundSize: '12px 12px',
          backgroundPosition: 'center'
        }}
        animate={{ rotate: isProcessing ? 90 : 0 }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />
      
      <svg viewBox="0 0 400 400" className="absolute w-full h-full">
        {/* Core Ring 1 (Inner segmented) */}
        <motion.circle 
          cx="200" cy="200" r="90" 
          fill="none" stroke="#4ff0ff" strokeWidth="4" 
          strokeDasharray="20 10 5 10" 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }} 
          style={{ transformOrigin: "200px 200px" }}
        />
        {/* Core Ring 2 (Middle thick arcs) */}
        <motion.circle 
          cx="200" cy="200" r="110" 
          fill="none" stroke="#4ff0ff" strokeWidth="8" 
          strokeDasharray="50 30" 
          animate={{ rotate: -360 }} 
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }} 
          style={{ transformOrigin: "200px 200px" }}
        />
        {/* Core Ring 3 (Outer fine dotted ring) */}
        <motion.circle 
          cx="200" cy="200" r="130" 
          fill="none" stroke="#4ff0ff" strokeWidth="2" 
          strokeDasharray="2 15" strokeLinecap="round"
          animate={{ rotate: 360, opacity: isProcessing ? [0.4, 1, 0.4] : 0.8 }} 
          transition={{ rotate: { repeat: Infinity, duration: 30, ease: "linear" }, opacity: { repeat: Infinity, duration: 1 } }} 
          style={{ transformOrigin: "200px 200px" }}
        />
        
        {/* Activity Accelerator Ring */}
        <AnimatePresence>
          {(isProcessing || isSpeaking) && (
            <motion.circle
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, rotate: 360 }}
              exit={{ opacity: 0, scale: 1.1 }}
              cx="200" cy="200" r="145"
              fill="none" stroke="#ffffff" strokeWidth="3"
              strokeDasharray="100 800" strokeLinecap="round"
              transition={{ 
                rotate: { repeat: Infinity, duration: isProcessing ? 1 : 0.4, ease: "linear" },
                opacity: { duration: 0.3 },
                scale: { type: "spring" }
              }}
              style={{ transformOrigin: "200px 200px", filter: 'drop-shadow(0 0 5px #ffffff)' }}
            />
          )}
        </AnimatePresence>
      </svg>
    </motion.div>
  );
};

const ConcentricRings = ({ state, mouseX, mouseY }) => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', { hour12: false });
  const dateStr = time.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
  
  // Parallax outer rings move less
  const outerX = useTransform(mouseX, [-1, 1], [-10, 10]);
  const outerY = useTransform(mouseY, [-1, 1], [-10, 10]);
  
  const midX = useTransform(mouseX, [-1, 1], [-15, 15]);
  const midY = useTransform(mouseY, [-1, 1], [-15, 15]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60 mix-blend-screen">
      {/* Outer Decorative Ring */}
      <motion.div className="absolute w-[140vw] h-[140vw] max-w-[700px] max-h-[700px]" style={{ x: outerX, y: outerY }}>
        <motion.svg viewBox="0 0 700 700" className="w-full h-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 60, ease: "linear" }}>
          <circle cx="350" cy="350" r="340" fill="none" stroke="#4ff0ff" strokeWidth="1" strokeDasharray="2 10" opacity="0.4" />
          <circle cx="350" cy="350" r="320" fill="none" stroke="#4ff0ff" strokeWidth="1.5" strokeDasharray="150 50 20 50" opacity="0.6" />
        </motion.svg>
      </motion.div>
      
      {/* Middle Status Ring */}
      <motion.div className="absolute w-[120vw] h-[120vw] max-w-[600px] max-h-[600px]" style={{ x: midX, y: midY }}>
        <motion.svg viewBox="0 0 600 600" className="w-full h-full" animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 45, ease: "linear" }}>
          <circle cx="300" cy="300" r="280" fill="none" stroke="#4ff0ff" strokeWidth="2" strokeDasharray="4 8" opacity="0.3" />
          {/* Arc indicating state activity */}
          <motion.circle cx="300" cy="300" r="290" fill="none" stroke="#4ff0ff" strokeWidth="4" 
            strokeDasharray="1822"
            animate={{ strokeDashoffset: state === 'idle' ? 1800 : state === 'listening' ? 1400 : state === 'processing' ? 1000 : 1600 }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
            strokeLinecap="round"
          />
        </motion.svg>
      </motion.div>

      {/* Inner Clock Ring */}
      <motion.div className="absolute w-[100vw] h-[100vw] max-w-[500px] max-h-[500px]" style={{ x: midX, y: midY }}>
        <svg viewBox="0 0 500 500" className="w-full h-full">
          <circle cx="250" cy="250" r="240" fill="none" stroke="#4ff0ff" strokeWidth="1" opacity="0.2" />
          <path d="M 250 10 A 240 240 0 0 1 490 250" fill="none" stroke="#4ff0ff" strokeWidth="3" opacity="0.5" />
        </svg>
        {/* Time Readout */}
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 flex flex-col items-center text-cyan-300 font-mono tracking-widest text-sm drop-shadow-[0_0_8px_#4ff0ff]">
          <div>{timeStr}</div>
          <div className="text-[10px] opacity-70">{dateStr}</div>
        </div>
      </motion.div>
    </div>
  );
};

// Sub-components for panels to clean up main HUD component
const TranscriptList = ({ items, endRef }) => (
  <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-4 pr-2 custom-scrollbar mask-image-fade-top h-full w-full">
    <AnimatePresence initial={false}>
      {items.map((item, index) => (
        <motion.div 
          key={item.id}
          layout
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 15,
            delay: (items.length - index < 3) ? (items.length - index) * 0.05 : 0 
          }}
          className="flex flex-col gap-1"
        >
          <span className={`text-[9px] uppercase tracking-widest font-bold ${item.speaker === 'YOU' ? 'text-cyan-500' : 'text-white'}`}>
            {item.speaker}
          </span>
          <span className="text-sm font-sans tracking-wide text-cyan-100 leading-relaxed bg-cyan-950/20 p-2 rounded border border-cyan-500/10 backdrop-blur-sm">
            {item.text}
          </span>
        </motion.div>
      ))}
    </AnimatePresence>
    <div ref={endRef} />
  </div>
);

const AuditLogList = ({ items, endRef }) => (
  <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-1 pr-2 custom-scrollbar text-[10px] text-cyan-300/60 font-mono tracking-tight mask-image-fade-top h-full w-full">
    <AnimatePresence initial={false}>
      {items.map((log, index) => (
        <motion.div 
          key={log.id} 
          layout
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="break-words hover:text-cyan-100 transition-colors"
        >
          {log.text}
        </motion.div>
      ))}
    </AnimatePresence>
    <div ref={endRef} />
  </div>
);

export default function HUD() {
  const [state, setState] = useState('idle');
  const [transcriptHistory, setTranscriptHistory] = useState([]);
  const [logs, setLogs] = useState([{ id: Date.now(), text: `[${new Date().toISOString().substring(11, 23)}] SYS_BOOT_SEQ_INIT` }]);
  const [isCloudMode, setIsCloudMode] = useState(false);
  const [latency, setLatency] = useState(0);
  const [mobileTab, setMobileTab] = useState('transcript'); // transcript | logs
  
  const wsRef = useRef(null);
  const recognitionRef = useRef(null);
  const initWebSocketRef = useRef(null);
  
  const transcriptEndRef = useRef(null);
  const logsEndRef = useRef(null);

  // Mouse Parallax values
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  const springX = useSpring(rawMouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(rawMouseY, { stiffness: 100, damping: 30 });

  const handleMouseMove = useCallback((e) => {
    // Disable on touch devices via primary hover check
    if (window.matchMedia("(hover: none)").matches) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    rawMouseX.set(x);
    rawMouseY.set(y);
  }, [rawMouseX, rawMouseY]);

  const addLog = useCallback((action) => {
    const timestamp = new Date().toISOString().substring(11, 23);
    setLogs(prev => [...prev.slice(-49), { id: Date.now() + Math.random(), text: `[${timestamp}] ${action}` }]);
  }, []);
  
  const addTranscript = useCallback((speaker, text) => {
    setTranscriptHistory(prev => [...prev.slice(-19), { speaker, text, id: Date.now() + Math.random() }]);
  }, []);

  // Auto-scroll panels
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcriptHistory]);
  
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const initWebSocket = useCallback((url, fallbackUrl = null) => {
    const ws = new WebSocket(url);
    wsRef.current = ws;
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'state') {
          setState(data.state);
          if (data.transcript) {
            addTranscript('YOU', data.transcript);
            addLog(`RCV_USER_AUDIO: ${data.transcript.substring(0, 15)}...`);
          }
        } else if (data.type === 'response' && isCloudMode) {
          addTranscript('ARYA', data.text);
          addLog(`RES_GENERATED: ${data.text.substring(0, 15)}...`);
          
          const utterance = new SpeechSynthesisUtterance(data.text);
          utterance.pitch = 0.8;
          utterance.rate = 0.95;
          
          const voices = window.speechSynthesis.getVoices();
          // JARVIS-like deep male voice fallback chain
          const aiVoice = voices.find(v => v.name.toLowerCase().includes('daniel')) ||
                          voices.find(v => v.name.toLowerCase().includes('uk english male')) ||
                          voices.find(v => v.name.toLowerCase().includes('david')) ||
                          voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male')) ||
                          voices.find(v => v.lang.startsWith('en'));
          if (aiVoice) {
            utterance.voice = aiVoice;
            addLog(`SYS_VOICE_CFG: ${aiVoice.name}`);
          }
          
          window.speechSynthesis.speak(utterance);
          
          if (data.action) {
              addLog(`EXEC_ACTION: ${data.action} -> ${data.payload}`);
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
        addLog("ERR: WS_PARSE_FAULT");
      }
    };
    
    ws.onopen = () => {
      addLog(`SYS_ONLINE: MUX_CONNECTED ${url}`);
      setIsCloudMode(url !== 'ws://127.0.0.1:8000/ws');
      setState('idle');
      setInterval(() => setLatency(Math.floor(Math.random() * 40) + 12), 3000);
    };
    
    ws.onerror = () => {
      if (fallbackUrl) {
        addLog(`WARN: LOCAL_FAILED, OVERRIDE_CLOUD`);
        if (initWebSocketRef.current) initWebSocketRef.current(fallbackUrl);
      }
    };

    ws.onclose = () => {
      if (!fallbackUrl) {
        addLog(`CRIT: NEURAL_LINK_SEVERED`);
        setState('offline');
      }
    };
  }, [addLog, addTranscript, isCloudMode]);

  initWebSocketRef.current = initWebSocket;

  useEffect(() => {
    const cloudUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL || process.env.NEXT_PUBLIC_WS_URL || 'wss://arya.swarajchattaraj.tech/ws';
    setTimeout(() => {
      initWebSocket('ws://127.0.0.1:8000/ws', cloudUrl);
    }, 1000);
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        addLog(`MIC_CAPTURE: SUCCESS`);
        addTranscript('YOU', text);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'query', text }));
          setState('processing');
        }
      };
      
      recognition.onerror = (e) => {
        addLog(`MIC_ERR: ${e.error.toUpperCase()}`);
        setState('idle');
      };
      recognition.onend = () => {
        if (state === 'listening') setState('idle');
      };
      recognitionRef.current = recognition;
    } else {
      addLog("WARN: SPEECH_RECOGNITION_API_UNAVAILABLE");
    }
    
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [initWebSocket]);

  const handleTapToSpeak = () => {
    const unlock = new window.SpeechSynthesisUtterance('');
    window.speechSynthesis.speak(unlock);
    
    if (state === 'offline') return;
    if (recognitionRef.current) {
      setState('listening');
      addLog("MIC_ACTIVATED: LISTENING");
      recognitionRef.current.start();
    } else {
      setState('listening');
      setTimeout(() => {
        setState('processing');
        addTranscript('YOU', 'Simulated voice input.');
        setTimeout(() => {
          setState('speaking');
          addTranscript('ARYA', 'Voice API not available. This is a simulated response.');
          setTimeout(() => setState('idle'), 3000);
        }, 1500);
      }, 2000);
    }
  };

  return (
    <>
      <div className="scanlines" />
      <div className="vignette" />
      
      <div 
        className="relative w-screen h-screen font-mono text-[#4ff0ff] selection:bg-cyan-900 overflow-hidden flex flex-col md:flex-row"
        onMouseMove={handleMouseMove}
      >
        
        {/* Dynamic Background Glow */}
        <motion.div 
          className="absolute inset-0 z-0 pointer-events-none opacity-30 mix-blend-screen"
          animate={{
            background: state === 'listening' ? 'radial-gradient(circle at 50% 50%, rgba(79,240,255,0.15) 0%, transparent 60%)' :
                        state === 'processing' ? 'radial-gradient(circle at 50% 50%, rgba(0,255,166,0.15) 0%, transparent 60%)' :
                        state === 'speaking' ? 'radial-gradient(circle at 50% 50%, rgba(0,153,255,0.15) 0%, transparent 60%)' :
                        'radial-gradient(circle at 50% 50%, rgba(79,240,255,0.05) 0%, transparent 60%)'
          }}
          transition={{ duration: 1 }}
        />
        
        {/* Top Strip (Fixed) */}
        <div className="absolute top-4 left-6 right-6 z-40 flex justify-between items-start pointer-events-none">
          <div className="flex flex-col gap-1">
            <h1 className="font-sans text-xl md:text-3xl font-bold tracking-[0.3em] uppercase drop-shadow-[0_0_10px_#4ff0ff]">
              ARYA<span className="text-[10px] ml-2 tracking-normal text-cyan-200/50 hidden sm:inline">mk.IV</span>
            </h1>
            <div className="flex flex-wrap gap-2 md:gap-4 text-[10px] md:text-xs font-bold tracking-widest mt-1 md:mt-2 border-t border-cyan-500/30 pt-1 md:pt-2">
               <div className="flex items-center gap-1 md:gap-2">
                 {state === 'offline' ? <WifiOff size={12} className="text-red-500 md:w-3.5 md:h-3.5" /> : <Wifi size={12} className="md:w-3.5 md:h-3.5" />}
                 <span className={state === 'offline' ? 'text-red-500' : ''}>
                   {state === 'offline' ? 'OFFLINE' : `LINK: ${isCloudMode ? 'CLOUD' : 'LOCAL'}`}
                 </span>
               </div>
               <div className="flex items-center gap-1 md:gap-2">
                 <Activity size={12} className="md:w-3.5 md:h-3.5" />
                 <span>LATENCY: {state === 'offline' ? '---' : `${latency}ms`}</span>
               </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1 md:gap-2 text-[10px] md:text-xs tracking-widest uppercase">
            <AnimatePresence mode="popLayout">
              <motion.div 
                key={state}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-cyan-900/40 border border-cyan-400/50 px-2 md:px-3 py-1 rounded backdrop-blur-sm flex items-center gap-2"
              >
                 SYS_MODE: 
                 <span className={`font-bold ${state === 'processing' ? 'text-yellow-400 animate-pulse' : state === 'listening' ? 'text-white' : 'text-cyan-300'}`}>
                   {state}
                 </span>
              </motion.div>
            </AnimatePresence>
            <div className="text-[8px] md:text-[10px] text-cyan-500/70">PROTOCOL: WS_STREAM_V2</div>
          </div>
        </div>

        {/* Desktop Left Panel (Transcript) */}
        <div className="hidden md:flex absolute top-28 bottom-32 left-6 w-[22vw] max-w-[320px] z-20 pointer-events-auto flex-col gap-2">
          <div className="text-[10px] tracking-[0.3em] text-cyan-500/80 uppercase font-bold border-b border-cyan-500/30 pb-1">Comm_Transcript</div>
          <TranscriptList items={transcriptHistory} endRef={transcriptEndRef} />
        </div>

        {/* Center Main HUD */}
        <div className="relative flex-1 flex flex-col items-center justify-center min-h-[55vh] md:min-h-screen pt-16 md:pt-0 z-10">
          <ConcentricRings state={state} mouseX={springX} mouseY={springY} />
          <CoreSVG state={state} mouseX={springX} mouseY={springY} />
          
          {/* Desktop Tap to Talk (Absolute on desktop, relative inside mobile panel) */}
          <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex-col items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTapToSpeak}
              disabled={state === 'offline' || state === 'listening'}
              className={`
                relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center 
                backdrop-blur-xl border-2 transition-colors duration-300 cursor-pointer
                ${state === 'listening' ? 'border-white bg-cyan-500/20 shadow-[0_0_30px_rgba(255,255,255,0.4)]' : 
                  state === 'offline' ? 'border-red-500/50 text-red-500/50 bg-transparent opacity-50 cursor-not-allowed' :
                  'border-cyan-400 bg-cyan-950/50 text-cyan-400 hover:bg-cyan-900/50 shadow-[0_0_15px_rgba(79,240,255,0.3)]'
                }
              `}
            >
              {state === 'listening' ? (
                <Mic className="w-6 h-6 md:w-8 md:h-8 text-white animate-pulse" />
              ) : state === 'offline' ? (
                <MicOff className="w-6 h-6 md:w-8 md:h-8" />
              ) : (
                <Mic className="w-6 h-6 md:w-8 md:h-8" />
              )}
              {state === 'listening' && (
                 <div className="absolute inset-[-10px] rounded-full border border-white/50 animate-ping" />
              )}
            </motion.button>
            <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-500/70 font-bold text-center">
              {state === 'listening' ? 'Awaiting Input...' : state === 'processing' ? 'Processing...' : 'Tap To Initialize'}
            </div>
          </div>
        </div>

        {/* Desktop Right Panel (Audit Log) */}
        <div className="hidden md:flex absolute top-28 bottom-32 right-6 w-[22vw] max-w-[320px] z-20 pointer-events-auto flex-col gap-2">
           <div className="text-[10px] tracking-[0.3em] text-cyan-500/80 uppercase font-bold border-b border-cyan-500/30 pb-1 text-right">Audit_Log</div>
           <AuditLogList items={logs} endRef={logsEndRef} />
        </div>

        {/* Mobile Bottom Sheet Layout */}
        <div className="md:hidden flex-1 w-full bg-cyan-950/40 backdrop-blur-md border-t border-cyan-500/30 z-30 flex flex-col pointer-events-auto relative">
           
           {/* Mobile Tap to Talk (Docked at top of bottom sheet) */}
           <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-40">
             <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={handleTapToSpeak}
                disabled={state === 'offline' || state === 'listening'}
                className={`
                  relative w-16 h-16 rounded-full flex items-center justify-center 
                  backdrop-blur-xl border-2 transition-colors duration-300 shadow-lg
                  ${state === 'listening' ? 'border-white bg-cyan-500 shadow-[0_0_20px_rgba(255,255,255,0.6)]' : 
                    state === 'offline' ? 'border-red-500/50 bg-gray-900/80 text-red-500/50 opacity-80' :
                    'border-cyan-400 bg-cyan-900 text-cyan-300 shadow-[0_0_15px_rgba(79,240,255,0.4)]'
                  }
                `}
              >
                {state === 'listening' ? <Mic className="w-6 h-6 text-white" /> : 
                 state === 'offline' ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </motion.button>
           </div>

           {/* Mobile Tabs */}
           <div className="flex justify-around border-b border-cyan-500/20 pt-8 pb-2 mt-2">
              <button 
                className={`text-xs tracking-widest font-bold transition-colors ${mobileTab === 'transcript' ? 'text-cyan-300' : 'text-cyan-700'}`} 
                onClick={() => setMobileTab('transcript')}
              >
                TRANSCRIPT
              </button>
              <button 
                className={`text-xs tracking-widest font-bold transition-colors ${mobileTab === 'logs' ? 'text-cyan-300' : 'text-cyan-700'}`} 
                onClick={() => setMobileTab('logs')}
              >
                AUDIT LOG
              </button>
           </div>
           
           <div className="flex-1 overflow-hidden p-4">
              {mobileTab === 'transcript' ? <TranscriptList items={transcriptHistory} endRef={transcriptEndRef} /> : <AuditLogList items={logs} endRef={logsEndRef} />}
           </div>
        </div>

      </div>
      
      {/* Custom CSS for scrollbars and mask */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 255, 255, 0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(79, 240, 255, 0.3); border-radius: 4px; }
        .mask-image-fade-top {
          mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 100%);
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 100%);
        }
      `}} />
    </>
  );
}
