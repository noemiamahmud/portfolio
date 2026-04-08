/* ===== Neural Network Banner Animation =====
   Draws floating nodes connected by lines on a dark background,
   giving a futuristic brain-computer network aesthetic.
   Present on every page via the .neural-banner canvas. */
(function initNeuralBanner() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, nodes, animId;
  const NODE_COUNT = 80;
  const CONNECT_DIST = 130;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = canvas.width = rect.width * devicePixelRatio;
    height = canvas.height = rect.height * devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  function createNodes() {
    const w = width / devicePixelRatio;
    const h = height / devicePixelRatio;
    nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
      // Nodes pulse slightly — each has its own phase
      phase: Math.random() * Math.PI * 2
    }));
  }

  function draw(time) {
    const w = width / devicePixelRatio;
    const h = height / devicePixelRatio;
    ctx.clearRect(0, 0, w, h);

    // Update positions
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.35;
          ctx.strokeStyle = `rgba(120, 130, 255, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes with pulsing glow
    const t = time * 0.001;
    for (const n of nodes) {
      const pulse = 0.6 + 0.4 * Math.sin(t * 1.5 + n.phase);
      const r = n.r * (0.8 + pulse * 0.4);

      // Glow
      ctx.beginPath();
      ctx.arc(n.x, n.y, r + 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 120, 255, ${pulse * 0.15})`;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(160, 170, 255, ${0.5 + pulse * 0.5})`;
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  resize();
  createNodes();
  animId = requestAnimationFrame(draw);

  // Debounced resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      createNodes();
    }, 150);
  });
})();

/* ===== Navbar scroll shadow ===== */
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
});

/* ===== Mobile nav toggle ===== */
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

/* ===== Project data — rich HTML content per project =====
   Each project returns its full modal body HTML via a content() function,
   so every modal can have unique layout, multiple images, and storytelling sections. */

function techList(items) {
  return `<div class="modal-tech-list">${items.map(t => `<span>${t}</span>`).join('')}</div>`;
}
function linksList(items) {
  if (!items.length) return '';
  return `<div class="modal-links">${items.map(l =>
    `<a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.label}</a>`
  ).join('')}</div>`;
}

const projectData = {

  'applied-ai': {
    title: 'Applied AI — Course Projects Collection',
    tag: 'Applied AI',
    content: () => `
      <div class="modal-section">
        <p>A collection of AI/ML projects from coursework — spanning neural networks, NLP, computer vision, and reinforcement learning.</p>
      </div>

      <div class="modal-project-list">
        <div class="modal-project-item">
          <div class="modal-project-info">
            <h3>RAG Tutor - Study any topic! </h3>
            <a href="https://github.com/noemiamahmud/RAG_Tutor" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
        <div class="modal-project-item">
          <div class="modal-project-info">
            <h3>LLM DJ BOT</h3>
            <a href="https://github.com/noemiamahmud/LLM_DJ_BOT" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>

        <div class="modal-project-item">
          <div class="modal-project-info">
            <h3>Multi Agent Debater - Debate on Ethics of AI Art </h3>
            <a href="https://github.com/noemiamahmud/The_ART_Debate" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>

        <div class="modal-project-item">
          <div class="modal-project-info">
            <h3>Text Operations Toolkit</h3>
            <a href="https://github.com/noemiamahmud/Text_Operations_LLM" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>

        <div class="modal-project-item">
          <div class="modal-project-info">
            <h3>RecurrentAI - interactive pygame app </h3>
            <a href="https://github.com/noemiamahmud/RecurrentAI/tree/main" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>

        <h3>... and more being added from GitHub soon! </h3>

      </div>
    `
  },

  'rag-chatbot': {
    title: 'AI Healthcare RAG Chatbot',
    tag: 'Machine Learning',
    content: () => `
      <div class="modal-hero-img"><img src="medassist.png" alt="" /></div>

      <div class="modal-section">
        <h3>The Problem</h3>
        <p>Health-related LLM queries are high-stakes — hallucinated medical advice is dangerous. Standard chatbots generate plausible-sounding answers with no way to verify claims or trace them to evidence. We needed a system that grounds every response in retrievable, citable source documents. On the flip side, using the same model, we knew that this could be equally beneficial to the future doctors and nurses of the world, with the aid of agentic patients.</p>
      </div>

      <div class="modal-section">
        <h3>Architecture & Pipeline</h3>
        <p>Designed a Retrieval-Augmented Generation pipeline that ingests curated healthcare documents, medical textbooks, and relevant research, chunks and embeds them into a vector database, retrieves the most relevant passages at query time, and feeds them as context to an LLM for grounded answer synthesis.</p>
        <div class="modal-inline-img"><img src="medassist2.png" alt="" /></div>
        <ul>
          <li>Document ingestion with chunking, overlap, and metadata tagging</li>
          <li>Embedding generation via sentence-transformers</li>
          <li>Vector search with FAISS for sub-second retrieval</li>
          <li>LLM synthesis with explicit citation formatting</li>
        </ul>
      </div>


      <div class="modal-section">
        <h3>User Interface</h3>
        <p>I later developed a clean chat interface where each response includes inline citations with expandable source previews, so users can verify claims without leaving the conversation. Users could also upload their own medical documents to have them broken down and explained for clarity, particularly useful for large and complex diagnoses.</p>
        <div class="modal-inline-img"><img src="medassist3.png" alt="" /></div>
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['Python', 'LangChain', 'FAISS', 'sentence-transformers', 'OpenAI API', 'Flask', 'React'])}
        ${linksList([{ label: 'GitHub', url: 'https://github.com/Agentic-AI-UIUC/fall-agentic-ai-healthcare-search' }])}
      </div>
    `
  },

  'deeplabcut': {
    title: 'Rat Behavioral Monitoring System',
    tag: 'Neuroscience Research',
    content: () => `
      <div class="modal-section">
        <video src="annotated.mp4" autoplay loop muted playsinline class="modal-video"></video>
      </div>

      <div class="modal-section">
        <h3>Background</h3>
        <p>At the Gulley Lab for Neuropsychopharmacology, behavioral experiments have generated many hours of rodent video data within T-maze experiments. This became a topic of interest when alarming rates of self-administration nose-pokes became a recurrent issue in a particular study. We needed to know if rats were either displaying this behavior accidentally (eg. with their tail instead of nose), or due to other conditions that the rat may have been experiencing. The lab needed an automated pipeline to validate behavioral logs against video evidence.</p>
      </div>

      <div class="modal-section">
        <h3>Camera System Design</h3>
        <p>Designed an ongoing experimental application that takes the original problem statement and utilizes various neural network modeling approaches to classify behaviors within operant self-administration chambers. This project has since been discontinued by the lab, but would ideally adapt to a 12-camera synchronized recording system.</p>
      </div>

      <div class="modal-section">
        <h3>DeepLabCut Integration</h3>
        <p>Rat Behavior Intelligence is a browser-based neuroscience tool that automates the analysis of rodent behavior from raw video - replacing hours of manual observation with a structured, interpretable pipeline. Users upload a rat video (or record directly from the browser), and the system processes it frame by frame, extracting temporal movement features like confinement, turning patterns, and motion bursts to classify behavioral states including exploration, freezing, grooming, locomotor bursts, stereotypy, and resting. When a local DeepLabCut environment is available, the pipeline upgrades to full pose estimation using a custom-trained ResNet-50 model tracking up to 16 anatomical keypoints - nose, ears, spine segments, paws, and tail - enabling geometry-derived classifications that go far beyond simple motion heuristics.</p>
        <p>The architecture is deliberately staged for interpretability and extensibility. A FastAPI backend handles video ingestion, runs the classification pipeline, and writes annotated outputs; the frontend streams results back as a playable annotated MP4, a timeline.json with frame-level behavior bouts, timestamped event feeds, and a natural-language summary with review-priority flagging. The observer commentary layer is rule-based by default but upgrades transparently to an LLM (OpenAI or a local llama.cpp server) when configured - keeping the core pipeline functional in fully offline or resource-constrained environments.</p>
        <p>What makes this project technically meaningful is its graceful degradation and forward-looking design. When DeepLabCut is unavailable, the system falls back to a motion-based temporal classifier without breaking the user experience. The expanded 16-point skeleton schema and retraining templates are already in place, so improving classification accuracy is a matter of more labeled data rather than architectural rework. The combination of pose estimation, temporal behavior classification, and LLM-augmented summarization positions this as a practical screening tool for neuroscience labs - reducing the manual review burden while keeping a human researcher in the loop on ambiguous or high-priority clips.</p>
      </div>

      <div class="modal-section">
        <h3>Validation Pipeline</h3>
        <p>Developed (and experimentally redeveloping) an end-to-end Python pipeline that cross-references behavioral event logs with synchronized video timestamps. With the use of Claude Code, I am in the process of redeveloping this system to generate visual overlays of tracked poses on raw footage, and flag anomalies where logged events don't match observed behavior.</p>
      </div>

      <div class="modal-img-row">
        <div class="modal-inline-img"><img src="Image 3-31-26 at 11.15 AM.png" alt="" /></div>
        <div class="modal-inline-img"><img src="ratcode.png" alt="" /></div>
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['Python', 'DeepLabCut', 'OpenCV', 'Pandas', 'NumPy', 'Computer Vision', 'Pose Estimation'])}
        ${linksList([{ label: 'GitHub', url: 'https://github.com/noemiamahmud/rat-surveillance-app' }])}
      </div>
    `
  },

  'neurotech-vr': {
    title: 'Engineering Open House',
    tag: 'Research',
    content: () => `
      <div class="modal-hero-img"><img src="PNG image.png" alt="" /></div>

      <div class="modal-section">
        <h3>NeuroHacks Project</h3>
        <p>MindLift is a browser-based interaction prototype that uses real-time hand tracking to let players "lift" and navigate objects through increasingly complex mazes using only their hand gestures. Built with MediaPipe, the game tracks hand landmarks at low latency — pinching to grab, opening to release — while a live mirrored camera preview with rendered landmarks stays visible in the corner throughout play. An attention monitoring layer watches for prolonged downward gaze and flashes a visual warning after three seconds, keeping the experience grounded in focus and presence. Levels scale in maze density and introduce hazard zones that reset progress, rewarding sustained coordination over raw speed.
        Beyond the game itself, the project doubles as a modular data pipeline. Interaction metrics stream through a WebSocket-to-OSC relay to TouchDesigner and VCV Rack, enabling live audiovisual responses to player behavior — opening the door for performance art, research instrumentation, or generative sound design tied directly to hand and attention data. The architecture is deliberately layered, separating tracking, gesture logic, rendering, and bridge transport into distinct modules so each layer can be extended or swapped independently. The project sits at the intersection of attention-supportive interaction design, hand-eye coordination gameplay, and neurointeractive experience prototyping.</p>
      </div>

      <hr style="border: none; border-top: 1px solid var(--color-border); margin: 32px 0;" />

      <div class="modal-section">
        <h3>NeuroTech R&D — VR Biofeedback System</h3>
        <p>At NeuroTech @ UIUC, we set out to build VR experiences that respond to your brain and body in real time — not scripted interactions, but adaptive environments driven by live physiological data. The question was: can we make neurofeedback feel like a game instead of a clinical tool?</p>
      </div>

      <div class="modal-section">
        <h3>Signal Acquisition & BCI Approach</h3>
        <p>While my startup's project details are confidential, a related project of mine is based on the same idea — Neurohack Fall 2025 "Mindlift." This project demonstrates a non-invasive approach to brain–computer interaction using natural micro-behavioral signals tightly coupled with cognitive intent. Instead of relying on EEG or invasive neural hardware, we use high-resolution eye movements, subtle facial muscle activations, and head gestures as a proxy for the user's internal decision-making.</p>
        <p>By turning gaze and micro-expressions into a telekinetic control system, we illustrate how future BCIs can merge computer vision, human cognition, and natural behavior to create interfaces that feel effortless and intuitive — technology responding to what you intend, not what you physically do.</p>
      </div>

      <div class="modal-section">
        <h3>Cozad New Venture Challenge</h3>
        <p>Pitched our startup's first demos of the project as "Brainstorm" at the Cozad New Venture Challenge (Spring 2025) and reached the finals. Contributed to business strategy, competitive positioning, and delivered investor-facing demo materials.</p>
      </div>

      <div class="modal-section">
        <h3>NeuroTech Tech Stack</h3>
        ${techList(['Unity', 'C#', 'Python', 'EEG', 'Heart Rate Sensors', 'VR', 'Biosignal Processing', 'Game AI'])}
        ${linksList([{ label: 'NeuroTech Website', url: 'https://neurotechatuiuc.com' }])}
        ${linksList([{ label: 'GitHub', url: 'https://github.com/noemiamahmud/Maze-Game' }])}
      </div>

      <hr style="border: none; border-top: 1px solid var(--color-border); margin: 32px 0;" />

      <div class="modal-section">
        <h3>Melodify — AI Music Generator</h3>
        <p>Melodify was one of my first hackathon projects in college — built at Dev-Ada 2024. The idea: describe a mood or scene in plain language and get original audio back. A user types a prompt like "upbeat jazz for a coffee shop morning" and the app returns a generated music clip, powered by Meta's AudioCraft MusicGen model running locally on the backend.</p>
        <div class="modal-inline-img"><img src="Screenshot 2025-09-08 at 7.41.38 PM.png" alt="" /></div>
      </div>

      <div class="modal-section">
        <h3>How It Works</h3>
        <p>The backend is a Flask application structured around the standard app factory pattern. A standalone MusicGen script wraps AudioCraft's generation pipeline, takes a text prompt as input, and writes the output to a generated audio folder that the Flask app then serves back to the user.</p>
        <div class="modal-img-row">
        <div class="modal-inline-img"><img src="Screenshot 2025-09-08 at 7.42.12 PM.png" alt="" /></div>
      </div>
      </div>

      <div class="modal-section">
        <h3>What I Learned</h3>
        <p>As one of my first end-to-end AI integrations, this project was a hands-on introduction to wiring a generative model into a real web application — handling model loading latency, serving binary audio output through a web server, and shipping something coherent under hackathon time pressure.</p>
      </div>

      <div class="modal-section">
        <h3>Melodify Tech Stack</h3>
        ${techList(['Python', 'Flask', 'Meta AudioCraft', 'MusicGen', 'HTML', 'CSS'])}
        ${linksList([{ label: 'GitHub', url: 'https://github.com/noemiamahmud/melodify_noemia' }])}
      </div>
    `
  },

  'brainstorm': {
    title: 'Web-Cite — Assisted Research Tool',
    tag: 'Full Stack',
    content: () => `
      <div class="modal-hero-img"><img src="webcite1.png" alt="" /></div>

      <div class="modal-section">
        <h3>The Problem</h3>
        <p>Academic research involves juggling dozens of papers, extracting key claims, and keeping track of which source said what. Existing tools are either too manual (spreadsheets, sticky notes) or too opaque (LLMs that hallucinate citations). We wanted something in between — a platform that helps you organize and cite, with full traceability.</p>
      </div>

      <div class="modal-section">
        <h3>How It Works</h3>
        <p>Web-Cite is a full-stack research tool built to solve a real friction point in academic work — the fragmented, time-consuming process of finding and organizing related literature. Rather than requiring users to manually chain together searches across databases, Web-Cite automates the discovery of semantically related papers and renders them as an interactive, editable citation web. A user searches PubMed, selects a root article, and the backend takes over: it fetches the article's metadata, computes a local embedding vector from the title, abstract, keywords, and MeSH terms, then searches PubMed for candidate papers, scores each by cosine similarity, and surfaces the top three to four most relevant results as a structured graph — all without any manual input beyond the initial selection.</p>
        <div class="modal-inline-img"><img src="webcite3.png" alt="" /></div>
      </div>

      <div class="modal-section">
        <h3>Full Stack Architecture</h3>
        <p>The backend is built with a clean separation of concerns that made cross-team collaboration efficient. A Node.js/Express API handles JWT-authenticated user sessions, PubMed querying, embedding computation, and MongoDB persistence, while the frontend is given full autonomy over graph rendering — receiving structured nodes and edges arrays it can pass directly into React Flow, Cytoscape.js, or D3. Node positions default to {0,0} and are patchable, so layout customization is a frontend concern without any backend coupling. Users can save, revisit, edit, and delete their citation webs from a personal dashboard, making the tool useful across an entire research project rather than just a single session.</p>
      </div>

      <div class="modal-section">
        <h3>Key Distinctions</h3>
        <p>What distinguishes Web-Cite from existing tools like PubMed or EBSCO is the combination of automated semantic discovery with user-editable output. Existing citation graph tools either require users to build the web manually or produce static, non-customizable maps. Web-Cite generates the initial graph automatically from embedding similarity, then hands control back to the researcher — letting them reposition nodes, update titles, and build keyword webs that reflect their own mental model of a topic. The result is a tool that reduces the cold-start burden of literature review while preserving the researcher's agency over how their knowledge is organized.</p>
        <div class="modal-inline-img"><img src="webcite2.png" alt="" /></div>
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['React', 'FastAPI', 'Python', 'LangChain', 'Vector DB', 'PDF Parsing', 'LLM', 'Tailwind CSS'])}
        ${linksList([{ label: 'GitHub', url: 'https://github.com/noemiamahmud/web-cite' }])}
      </div>
    `
  },

  'melodify': {
    title: 'Melodify — AI Music Generator',
    tag: 'Hackathon',
    content: () => `
      <div class="modal-hero-img"><img src="Screenshot 2025-09-08 at 7.42.12 PM.png" alt="" /></div>

      <div class="modal-section">
        <h3>The Project</h3>
        <p>Melodify was one of my first hackathon projects in college — built at Dev-Ada 2024. The idea: describe a mood or scene in plain language and get original audio back. A user types a prompt like "upbeat jazz for a coffee shop morning" and the app returns a generated music clip, powered by Meta's AudioCraft MusicGen model running locally on the backend.</p>
      </div>

      <div class="modal-section">
        <h3>How It Works</h3>
        <p>The backend is a Flask application structured around the standard app factory pattern — routes, models, and templates organized under an <code>app/</code> directory with a <code>run.py</code> entry point. A standalone <code>MusicGen.py</code> script wraps AudioCraft's generation pipeline, takes a text prompt as input, and writes the output to a <code>generated_audio/</code> folder that the Flask app then serves back to the user.</p>
        <div class="modal-img-row">
      </div>
      </div>

      <div class="modal-section">
        <h3>What I Learned</h3>
        <p>As one of my first end-to-end AI integrations, this project was a hands-on introduction to wiring a generative model into a real web application — handling model loading latency, serving binary audio output through a web server, and shipping something coherent under hackathon time pressure. The AudioCraft library is vendored directly in the repo, which kept the setup self-contained and demo-ready.</p>
        <div class="modal-inline-img"><img src="Screenshot 2025-09-08 at 7.41.38 PM.png" alt="" /></div>
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['Python', 'Flask', 'Meta AudioCraft', 'MusicGen', 'HTML', 'CSS'])}
        ${linksList([{ label: 'GitHub', url: 'https://github.com/noemiamahmud/melodify_noemia' }])}
      </div>
    `
  },

  'datathon': {
    title: 'Datathon — Workforce Forecasting & Optimization',
    tag: 'Hackathon',
    content: () => `
      <div class="modal-hero-img"><img src="stats1.png" alt="" /></div>

      <div class="modal-section">
        <h3>The Problem</h3>
        <p>Placed <b>3rd out of 214 teams (600+ competitors)</b> in the 2026 Illinois Statistics Datathon. The challenge: forecast inbound call volume, customer care time, and abandon rate for August 2025 across 4 client portfolios — at 30-minute granularity — and optimize staffing decisions under an asymmetric cost function where understaffing is significantly more expensive than overstaffing.</p>
      </div>

      <div class="modal-section">
        <h3>Data & Approach</h3>
        <p>Worked with two years of daily call metrics and three months of high-frequency 30-minute interval data across 4 portfolios, with up to 30 missing days in some clients. Identified strong intraday structure (9–11 AM peak, near-zero overnight), day-of-week effects (Monday highest, Sunday lowest), and longer-term seasonal trends. Built preprocessing pipelines to impute gaps, encode temporal and calendar features, and align daily and interval datasets for a two-stage modeling architecture.</p>
      </div>

      <div class="modal-img-row">
        <div class="modal-inline-img"><img src="stats2.png" alt="" /></div>
        <div class="modal-inline-img"><img src="stats3.png" alt="" /></div>
      </div>

      <div class="modal-section">
        <h3>Model Architecture</h3>
        <p><b>Stage 1 — Daily Forecasting (SARIMAX):</b> Trained SARIMAX(1,1,1)(1,1,1,7) models per portfolio per metric — 12 models total — using weekend, US holiday, and near-holiday exogenous regressors to forecast daily totals for call volume (CV), customer care time (CCT), and abandon rate (ABD) across all 31 days of August 2025.</p>
        <p><b>Stage 2 — Intraday Distribution (PyTorch IntradayNet):</b> A lightweight feedforward network (Linear 7→64→48 + Softmax) trained per portfolio on 90 days of interval data, mapping day-of-week one-hot encodings to 48 normalized slot weights. CV intraday forecasts use the learned weights; CCT and ABD use empirical slot-level means for greater stability.</p>
        <p>Final output: SARIMAX daily total × IntradayNet slot weights × 1.07 upward bias = 30-minute interval forecasts.</p>
      </div>

      <div class="modal-inline-img"><img src="stats4.png" alt="" /></div>

      <div class="modal-section">
        <h3>Asymmetric Cost Optimization</h3>
        <p>The competition scoring penalized understaffing more heavily than overstaffing. Rather than minimizing raw forecast error, we applied a deliberate +7% upward bias to all CV forecasts post-prediction — shifting the error distribution to favor overstaffing, which carries a lower penalty. CCT and ABD were left unbiased since staffing capacity is driven by call volume alone.</p>
      </div>

      <div class="modal-img-row">
        <div class="modal-inline-img"><img src="stats5.png" alt="" /></div>
        <div class="modal-inline-img"><img src="stats6.png" alt="" /></div>
      </div>

      <div class="modal-section">
        <h3>Results</h3>
        <p>Delivered 1,488 rows of 30-minute forecasts (31 days × 48 slots × 4 portfolios) covering CV, CCT, and ABD — 5,952 total forecast points. Translated predictions into a staffing capacity overlay flagging high-risk understaffing days as an early-warning system for SLA risk. 16 trained models total (12 SARIMAX + 4 IntradayNet), fully reproducible across a four-notebook pipeline.</p>
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['Python', 'PyTorch', 'Statsmodels (SARIMAX)', 'Pandas', 'NumPy', 'Scikit-learn', 'Matplotlib'])}
        ${linksList([{ label: 'View Presentation', url: 'https://mediaspace.illinois.edu/media/t/1_dmkfx20x' }])}
      </div>
    `
  },

  'code-to-cure': {
    title: 'Student Wellness — Patient-Doctor Matching',
    tag: 'Hackathon',
    content: () => `
      <div class="modal-hero-img"><img src="Screenshot 2025-09-08 at 7.33.11 PM.png" alt="" /></div>

      <div class="modal-section">
        <h3>The Idea</h3>
        <p>BTHealth is a full-stack mental health provider matching platform designed specifically for college students — a population that faces disproportionately high rates of mental health challenges while simultaneously navigating one of the most opaque and discouraging healthcare experiences: finding a therapist. The platform distills a typically hours-long search process into a three-step flow. Students create an account, submit a brief intake form specifying their zip code, maximum budget, and symptom selections, and receive a ranked list of providers who are available right now, priced within their means, and specialized in what they actually need. The matching algorithm enforces hard constraints — location, budget ceiling, and open patient panels — before applying a soft relevance score based on symptom overlap, so results are always actionable rather than aspirational.</p>
      </div>

      <div class="modal-section">
        <h3>Backend Architecture</h3>
        <p>The technical architecture reflects a deliberate focus on correctness and maintainability. The backend is built in Flask with SQLAlchemy handling a normalized relational schema where symptoms act as a shared vocabulary between patients and providers — linked through PatientSymptom and ProviderSpecialty junction tables — making it straightforward to extend the symptom taxonomy or add new matching criteria without restructuring the core data model. JWT authentication keeps sessions stateless, and a public_id UUID on the Provider model decouples internal database keys from anything exposed to the client. The React frontend communicates through a centralized fetch wrapper that handles JWT injection uniformly, keeping authentication logic out of individual page components.</p>
        <div class="modal-img-row">
        <div class="modal-inline-img"><img src="Screenshot 2025-09-08 at 7.30.34 PM.png" alt="" /></div>
        <div class="modal-inline-img"><img src="Screenshot 2025-09-08 at 7.38.21 PM.png" alt="" /></div>
      </div>
      </div>

      <div class="modal-section">
        <h3>The Motivation</h3>
        <p>What makes BTHealth more than a filtered directory is its commitment to transparency at the point of decision. Each matched result includes a human-readable explanation of why the provider was surfaced and a clear budget label — "within your budget" or "partially within your budget" — so students never invest time in a provider only to discover a cost conflict at intake. Results are capped at ten and sorted by match score, reducing the decision paralysis that causes students to abandon their search entirely. The project is grounded in a straightforward conviction: the barrier to getting mental health care should not be the process of finding it.</p>
      </div>

      <div class="modal-section">
      <h3>Tech Stack</h3>
      ${techList(['React 19', 'React Router DOM 7', 'Vite', 'Flask', 'Python', 'Flask-SQLAlchemy', 'Flask-Migrate', 'Flask-JWT-Extended', 'SQLite', 'Vanilla CSS'])}
      ${linksList([{ label: 'GitHub', url: 'https://github.com/noemiamahmud/Code-ADA-2024-For_Portfolio' }])}
    </div>
    `
  },

  'neurotech-site': {
    title: 'NeuroTech @ UIUC Website',
    tag: 'Web Development',
    content: () => `
      <div class="modal-section">
        <h3>My Role</h3>
        <p>As Webmaster for NeuroTech @ UIUC, I designed and built the club's public-facing website from scratch — creating a central hub to connect students with opportunities in neurotechnology, showcase ongoing research projects, and drive membership recruitment.</p>
      </div>

      <div class="modal-section">
        <h3>Live Preview</h3>
        <iframe src="https://neurotechatuiuc.com/" class="modal-iframe" title="NeuroTech @ UIUC Live Preview"></iframe>
      </div>

      <div class="modal-section">
        <h3>What I Built</h3>
        <p>The site spans eight pages covering the club's mission, active projects, upcoming events, team roster, a member matching feature, and a join flow. Each page was designed to be immediately legible to someone encountering NeuroTech for the first time — whether a curious freshman or a faculty collaborator — while giving current members a reliable place to stay connected.</p>
      </div>

      <div class="modal-section">
        <h3>Implementation</h3>
        <p>Built entirely with vanilla HTML, CSS, and JavaScript — no frameworks or build tooling — keeping the site lightweight, easy to hand off, and maintainable by future officers. Fully responsive across desktop and mobile with consistent branding throughout.</p>
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['HTML', 'CSS', 'JavaScript', 'Responsive Design'])}
        ${linksList([
          { label: 'GitHub', url: 'https://github.com/noemiamahmud/Neurotech' },
          { label: 'Visit Site', url: 'https://neurotechatuiuc.com' }
        ])}
      </div>
    `
  },

  'illini-speed': {
    title: 'IlliniSpeed — Single Page Website',
    tag: 'Web Development',
    content: () => `
      <div class="modal-section">
        <h3>About the Project</h3>
        <p>IlliniSpeed is a fully hand-coded single-page website built for CS 409 (Web Programming) at UIUC. The assignment required implementing a comprehensive set of frontend features from scratch — no libraries, no Bootstrap, no jQuery — using only HTML5, SCSS, and vanilla JavaScript.</p>
      </div>

      <div class="modal-section">
        <h3>Live Preview</h3>
        <iframe src="https://noemiamahmud.github.io/illinispeed/" class="modal-iframe" title="IlliniSpeed Live Preview"></iframe>
      </div>

      <div class="modal-section">
        <h3>What I Built</h3>
        <p>The site implements a full suite of interactive UI features: a sticky navbar that resizes on scroll with an active section position indicator, smooth scrolling navigation, a multi-slide carousel with arrow controls, modal windows, an embedded HTML5 video, fixed-position background images, a multi-column layout, and CSS3 animations. All content is fully responsive across four target resolutions from 1024x768 up to 1920x1080.</p>
      </div>

      <div class="modal-section">
        <h3>Implementation</h3>
        <p>Built with SCSS (using variables and mixins as required), ES6 JavaScript, and semantic HTML5. Bundled with Webpack and deployed via GitHub Actions to GitHub Pages. No inline styles, no inline scripts, and no table-based layouts — all layout and interactivity written by hand against the spec.</p>
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['HTML5', 'SCSS', 'JavaScript (ES6)', 'Webpack', 'Babel', 'GitHub Actions', 'GitHub Pages'])}
        ${linksList([
          { label: 'GitHub', url: 'https://github.com/noemiamahmud/illinispeed' },
          { label: 'Live Site', url: 'https://noemiamahmud.github.io/illinispeed' }
        ])}
      </div>
    `
  },

  'wece-hacks': {
    title: 'WECE Hacks 2025 Website',
    tag: 'Web Development',
    content: () => `
      <div class="modal-section">
        <h3>The Event</h3>
        <p>WECE Hacks is a three-day hackathon hosted by Women in Electrical and Computer Engineering at UIUC, open to all majors and genders. The 2025 event ran February 21-23 in the ECE Building and featured hardware, software, and cybersecurity (CTF) challenges — with workshops, sponsor networking, and a closing demo day. Sponsors included Union Pacific, Collins Aerospace, Marvell, and National Instruments.</p>
      </div>

      <div class="modal-section">
        <h3>Live Preview</h3>
        <iframe src="https://noemiamahmud.github.io/wecehacks.github.io/" class="modal-iframe" title="WECE Hacks 2025 Live Preview"></iframe>
      </div>

      <div class="modal-section">
        <h3>Website</h3>
        <p>I built and maintained the event website as the single source of truth for participants. The site covers registration, a live countdown timer, the full three-day schedule, sponsor recognition, an FAQ, and a curated tools and resources section to help first-time hackers get set up with VS Code, Git, and GitHub before arriving.</p>
      </div>

      <div class="modal-section">
        <h3>Event Operations</h3>
        <p>As Operations Lead, I coordinated the full event experience — from pre-event registration and team formation logistics through day-of check-in, workshop flow, hacking periods, and final presentations. The event ran across three days with structured workshops in hardware and software, an open working period with a sponsor tech table, and a Sunday CTF co-organized with SIGPwny.</p>
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['HTML', 'CSS', 'JavaScript', 'GitHub Pages'])}
        ${linksList([
          { label: 'GitHub', url: 'https://github.com/noemiamahmud/wecehacks.github.io' },
          { label: 'Visit Site', url: 'https://noemiamahmud.github.io/wecehacks.github.io/' }
        ])}
      </div>
    `
  },

  'misc': {
    title: 'Short Track Speed Skating',
    tag: 'Misc',
    content: () => `
      <div class="modal-hero-img"><img src="IMG_6747.JPG" alt="" /></div>

      <div class="modal-section">
        <h3>The Sport</h3>
        <p>Short track speed skating is one of the most explosive and tactical ice sports in the world — races happen on a 111-meter oval, skaters reach speeds over 30 mph, and positioning matters as much as raw speed. I've been competing since childhood, and the sport has shaped how I approach everything — from problem-solving under pressure to leading teams.</p>
      </div>

      <div class="modal-section">
        <h3>Competitive Career</h3>
        <p>Throughout high school, I competed at the national level in short track speed skating, earning a national ranking and setting state records. The training was year-round — on-ice technique sessions, off-ice conditioning, and race strategy review. Competing at that level taught me discipline, how to perform under pressure, and how to recover from setbacks quickly.</p>
        <div class="modal-img-row">
        <div class="modal-inline-img"><img src="NorthBurkeOpen2023_173 2.jpg" alt="" /></div>
        <div class="modal-inline-img"><img src="IMG_6375.JPG" alt="" /></div>
      </div>
      </div>

      <div class="modal-section">
        <h3>State Records & National Ranking</h3>
        <p>Held state records and achieved a national ranking that placed me among the top competitors in my age group. Every record came from months of incremental improvement — shaving fractions of a second through better crossover technique, sharper cornering, and smarter race tactics.</p>
        <div class="modal-inline-img"><img src="IMG_9809.png" alt="" /></div>
      </div>

      <div class="modal-section">
        <h3>Transition to College</h3>
        <p>Coming to UIUC, I transitioned from competitor to community builder. I helped found our Illini speed skating student organization and took on leadership and organizing roles — coordinating practice schedules, recruiting new skaters, and running events to grow the sport on campus.</p>
        <div class="modal-img-row">
        <div class="modal-inline-img"><img src="IMG_77720DAAEC75-1 (1).jpeg" alt="" /></div>
        <div class="modal-inline-img"><img src="IMG_8AF84EE06C93-1 (1).jpeg" alt="" /></div>
      </div>
      </div>


      <div class="modal-section">
        <h3>What Skating Taught Me</h3>
        <p>Speed skating is a sport of margins — the difference between first and fourth is often hundredths of a second. That mentality carries into everything I do: attention to detail, relentless iteration, and the understanding that consistent effort compounds. The resilience and focus I built on the ice directly translate to how I approach engineering problems and team leadership.</p>
      </div>
    `
  }
};

/* ===== Project filtering (projects page) ===== */
const filterBtns = document.querySelectorAll('.filter-btn');
/* Select all project cards including the featured card above the grid */
const projectCards = document.querySelectorAll('.project-card, .project-card-featured');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    projectCards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      if (show) {
        /* Featured card needs flex display; regular cards use default */
        card.style.display = card.classList.contains('project-card-featured') ? 'flex' : '';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

/* ===== Project modal ===== */
const modalOverlay = document.getElementById('project-modal');

if (modalOverlay) {
  const modalClose = modalOverlay.querySelector('.modal-close');

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.project;
      const data = projectData[key];
      if (!data) return;

      const modalBody = document.getElementById('modal-body');
      modalBody.innerHTML = `
        <h2>${data.title}</h2>
        <span class="modal-tag">${data.tag}</span>
        ${data.content()}
      `;

      modalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });
}

function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ===== Deep-link: open modal if URL hash matches a project ID ===== */
function checkHashForProject() {
  const hash = window.location.hash.replace('#', '');
  if (hash && projectData[hash]) {
    const card = document.querySelector(`.project-card[data-project="${hash}"]`);
    if (card) card.click();
  }
}
window.addEventListener('load', checkHashForProject);

/* ===== Contact form handler (Formspree) ===== */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const status = document.getElementById('form-status');
    btn.textContent = 'Sending…';
    btn.disabled = true;
    status.textContent = '';

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (res) {
        if (res.ok) {
          status.textContent = 'Message sent — thank you!';
          status.style.color = 'var(--color-accent)';
          form.reset();
        } else {
          return res.json().then(function (data) {
            throw new Error(data.errors ? data.errors.map(function (err) { return err.message; }).join(', ') : 'Send failed');
          });
        }
      })
      .catch(function (err) {
        status.textContent = 'Something went wrong: ' + err.message;
        status.style.color = '#e74c3c';
      })
      .finally(function () {
        btn.textContent = 'Send Message';
        btn.disabled = false;
      });
  });
})();
