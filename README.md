# Arya - Personal Voice Assistant

Arya is a free, hybrid local-first personal voice assistant. It features a JARVIS-style 3D HUD that can be run either purely locally on your Windows PC (with native microphone and local STT/TTS) or deployed to free-tier cloud services (Render & Vercel) as an "always-on brain" accessible via a Progressive Web App (PWA) on your phone.

## Architecture

- **Brain**: Gemini API (gemini-2.5-flash) free tier.
- **Orchestration**: Python state machine routing intents.
- **Frontend**: Next.js + React Three Fiber + Framer Motion (PWA enabled).
- **Security**: Strict allowlist for system commands, encrypted database storage, and full audit logging.

### Mode 1: Local Desktop (Heavier)
Runs locally on your machine. Uses `openWakeWord` for offline wake word detection, `faster-whisper` for local STT, and `piper-tts` for local speech synthesis. 

### Mode 2: Cloud PWA (Lightweight)
Runs on Vercel & Render. The backend disables hardware audio libraries. The Next.js frontend is installed as an app on your phone and uses the native Web Speech API to transcribe and synthesize speech, communicating with the cloud backend via WebSockets.

---

## 1. Local Setup Instructions (Windows)

1. **Install Prerequisites**: Python 3.10+, Node.js 18+, Microsoft C++ Build Tools.
2. **Setup Backend**:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   pip install fastapi uvicorn websockets sounddevice soundfile numpy scipy openwakeword faster-whisper piper-tts pyyaml google-generativeai
   ```
3. **Configure API Key**:
   Create `config/secrets.env` and add: `GEMINI_API_KEY=your_key_here`
4. **Run Local Server**:
   ```powershell
   set MODE=local
   python server/main.py
   ```
5. **Run Frontend**:
   In a new terminal:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

---

## 2. Cloud Setup Instructions (Vercel + Render)

Follow these steps to deploy Arya as your "Always-on brain" with Zero-Ops.

### Step A: Push to GitHub
1. Create a new repository on GitHub.
2. Initialize and push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/arya.git
   git push -u origin main
   ```

### Step B: Deploy Backend to Render (Free Tier)
1. Go to [Render](https://render.com) and sign in with GitHub.
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file and deploy the backend.
5. In the Render Dashboard, go to your new `arya-backend` Web Service, navigate to **Environment**, and add:
   - `GEMINI_API_KEY`: `your_actual_gemini_api_key`
   - `ADMIN_PASSWORD`: `your_secure_password`
6. Copy the public URL Render gives you (e.g., `https://arya-backend-xyz.onrender.com`).
   *Note: Change `https` to `wss` when copying the URL for the next step.*

> [!NOTE]
> **Cold Start Behavior**: Render's free web service tier spins down after ~15 minutes of inactivity. When you send your next request (or open the app), it will take ~30-50 seconds to wake up. This is expected behavior and not a bug!

### Step C: Deploy Frontend to Vercel (Free Tier)
1. Go to [Vercel](https://vercel.com) and sign in with GitHub.
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Set the **Root Directory** to `frontend`.
5. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_BACKEND_WS_URL`: `wss://arya-backend-xyz.onrender.com/ws` (use the URL from Step B).
6. Click **Deploy**.

### Step D: Custom Domain & Install the PWA
1. In Vercel, go to the project settings -> Domains.
2. Add your custom domain (`arya.swarajchattaraj.tech`). Vercel will give you the DNS records (CNAME or A record) to configure in your domain registrar.
3. Once the domain is active, open Safari (iOS) or Chrome (Android) on your phone.
4. Navigate to `https://arya.swarajchattaraj.tech`.
5. Tap **Share** -> **Add to Home Screen**.
6. Open the Arya app, tap the glowing orb ("Tap to Speak"), and give it microphone permissions.

---

## Adding New Skills

Skills are modular and loaded dynamically. Create a new directory in `skills/` with a `skill.yaml` manifest and a `handler.py` script. The orchestrator will automatically route commands to it!
