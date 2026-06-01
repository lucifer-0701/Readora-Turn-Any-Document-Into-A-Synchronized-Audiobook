# Readora — Transform Documents into Interactive Audio Experiences

Readora is a high-performance, browser-native, private reading companion designed to extract text from images, documents, and PDFs entirely in the client browser (no server storage, 100% private) and read it aloud with real-time synchronized word highlighting.

This project is fully optimized, accessible, structured, and ready to be deployed directly to Cloudflare Pages.

---

## 🌟 Key Features

1. **Client-Side OCR (Tesseract.js)**: Drag, drop or select images containing text, and parse them completely in-browser. Features a live percentage loading spinner.
2. **Offline PDF Parsing (PDF.js)**: Instantly read multipage PDF files locally. Progress is reported page-by-page.
3. **Smart Page Pagination**: Multi-page documents are parsed, paginated, and split logically to prevent broken mid-sentence jumps.
4. **Natural Speech Control (Web Speech API)**: Play, Pause, Resume, Stop, and control speed rates (1.0x → 2.0x) with clear, high-fidelity browser voice synthesizers.
5. **Synchronized Word-by-Word Highlight**: High-performance, low-latency ambient visual highlighting follows along with the voice.
6. **Reading Progress Persistence**: Saves and restores your active document, page, playback rate, and last-read word index upon reload. Includes a master Reset option.
7. **Reading History logs**: Slide-over Sidebar library logs files processed, dates, and total counts.
8. **Toast Alerts**: Floating glassmorphic alerts announce statuses (Success, Info, Errors) beautifully.
9. **Universal Accessibility (a11y)**: Fully semantic landmarks, keybind listeners, modal escape boundaries, and aria tags.

---

## 🛠️ Technological Stack

* **Frontend Orchestration**: React (Vite environment)
* **Styling & Theme**: HSL Harmonious Dark UI (Tailwind CSS)
* **Client-Side OCR**: Tesseract.js
* **Document Parsing**: PDF.js (configured securely in-browser)
* **Voice Synthesis**: Web Speech API (TTS)
* **Typography**: Outfit & Inter sans (Google Fonts)
* **Iconography**: Lucide React

---

## 📂 Folder Structure Explanation

```bash
project-root/
│
├── frontend/                 # Complete frontend directory module
│   ├── public/               # Static assets & SPA configurations
│   │   ├── favicon.svg       # Premium branding favicon
│   │   └── _redirects        # Cloudflare Pages SPA deep routing redirects
│   │
│   ├── src/                  # React source codes
│   │   ├── assets/           # React SVGs & PNG components
│   │   ├── components/       # Reusable modular UI components
│   │   │   ├── AudioControls.jsx   # Waveform tracking & vocal triggers
│   │   │   ├── Header.jsx          # Header brand & library controls
│   │   │   ├── HistorySidebar.jsx  # Slide-over sidebar for logs
│   │   │   ├── TextDisplay.jsx     # Spoken highlights & pagination board
│   │   │   ├── UploadSection.jsx   # Drag-drop panel & paste terminal
│   │   │   └── WelcomeScreen.jsx   # Blurred glassmorphism landing screen
│   │   │
│   │   ├── styles/           # Standard HSL stylesheets
│   │   │   ├── index.css     # Main Tailwind overrides & glass classes
│   │   │   └── App.css       # Custom local micro-animations
│   │   │
│   │   ├── App.jsx           # Master state manager & toast containers
│   │   └── main.jsx          # Root mount script
│   │
│   ├── index.html            # Primary index file & SEO meta-tags
│   ├── package.json          # Node dependencies & modular build scripts
│   ├── vite.config.js        # Vite compilation configuration (with path aliases)
│   ├── postcss.config.js     # PostCSS styling rules
│   ├── tailwind.config.js    # Tailwind palette presets
│   ├── eslint.config.js      # Linter settings
│   └── .env.example          # Environment variable reference template
│
├── README.md                 # Primary directory guide
├── .gitignore                # Complete root-level git exclusion list
└── deployment-guide.md       # High-fidelity Cloudflare Pages deployment roadmap
```

---

## 🚀 Local Installation & Setup

Set up and launch the application locally in seconds:

1. **Clone or Open the workspace**:
   Make sure you are at the workspace root directory.

2. **Navigate into the frontend subdirectory**:
   ```bash
   cd frontend
   ```

3. **Install clean packages**:
   ```bash
   npm install
   ```

4. **Boot the Vite Development Server**:
   ```bash
   npm run dev
   ```
   * Open your browser and navigate to `http://localhost:5173` to interact with the system live!

5. **Generate a production bundle**:
   ```bash
   npm run build
   ```
   * Compiles optimized bundles under `frontend/dist/`.

---

## ☁️ Cloudflare Pages Quick Deploy

1. Connect your project repository to the **Cloudflare Pages** dashboard.
2. Configure **Build Settings**:
   * **Root directory**: `frontend`
   * **Build command**: `npm run build`
   * **Build output directory**: `dist`
3. Click **Save and Deploy**!

For detailed step-by-step instructions, troubleshooting tips, and custom domain setup, refer to the [deployment-guide.md](deployment-guide.md).
