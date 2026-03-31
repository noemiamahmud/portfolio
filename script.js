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

function imgPlaceholder(label) {
  return `<div class="modal-inline-img">[${label}]</div>`;
}
function imgRow(label1, label2) {
  return `<div class="modal-img-row">
    <div class="modal-inline-img">[${label1}]</div>
    <div class="modal-inline-img">[${label2}]</div>
  </div>`;
}
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
      <div class="modal-hero-img">[Cover Image — Applied AI Projects]</div>

      <div class="modal-section">
        <h3>Overview</h3>
        <p>A curated portfolio of AI and machine learning projects completed through university coursework, spanning a range of architectures, domains, and techniques. Each project emphasizes hands-on implementation, rigorous evaluation, and clear documentation.</p>
      </div>

      <div class="modal-section">
        <h3>Image Classification with CNNs</h3>
        <p>Built and trained convolutional neural networks from scratch on benchmark datasets. Explored architectures from simple multi-layer nets to ResNet-style skip connections, with systematic ablation studies on depth, dropout, and data augmentation.</p>
        ${imgRow('CNN Architecture Diagram', 'Training Loss Curves')}
      </div>

      <div class="modal-section">
        <h3>Sentiment Analysis with Transformers</h3>
        <p>Fine-tuned a pre-trained BERT model for multi-class sentiment classification on product reviews. Built a preprocessing pipeline, experimented with learning rate schedules, and analyzed attention maps to interpret model decisions.</p>
        ${imgPlaceholder('Attention Heatmap Visualization')}
      </div>

      <div class="modal-section">
        <h3>Reinforcement Learning Agent</h3>
        <p>Implemented Deep Q-Networks (DQN) and Proximal Policy Optimization (PPO) agents in OpenAI Gym environments. Compared convergence speed, reward stability, and generalization across environment variants.</p>
        ${imgRow('Reward Curves — DQN vs PPO', 'Agent Gameplay Recording')}
      </div>

      <div class="modal-section">
        <h3>Generative Models</h3>
        <p>Trained a Variational Autoencoder (VAE) and a small GAN on the CelebA dataset. Explored latent space interpolation, mode collapse mitigation, and FID scoring to evaluate generation quality.</p>
        ${imgPlaceholder('Latent Space Interpolation Grid')}
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['PyTorch', 'TensorFlow', 'scikit-learn', 'Hugging Face', 'NumPy', 'Pandas', 'Matplotlib', 'Jupyter', 'Python'])}
      </div>
    `
  },

  'rag-chatbot': {
    title: 'AI Healthcare RAG Chatbot',
    tag: 'Machine Learning',
    content: () => `
      <div class="modal-hero-img">[Cover Image — RAG Chatbot Interface]</div>

      <div class="modal-section">
        <h3>The Problem</h3>
        <p>Health-related LLM queries are high-stakes — hallucinated medical advice is dangerous. Standard chatbots generate plausible-sounding answers with no way to verify claims or trace them to evidence. We needed a system that grounds every response in retrievable, citable source documents. On the flip side, using the same model, we knew that this could be equally beneficial to the future doctors and nurses of the world, with the aid of agentic patients.</p>
      </div>

      <div class="modal-section">
        <h3>Architecture & Pipeline</h3>
        <p>Designed a Retrieval-Augmented Generation pipeline that ingests curated healthcare documents, medical textbooks, and relevant research, chunks and embeds them into a vector database, retrieves the most relevant passages at query time, and feeds them as context to an LLM for grounded answer synthesis.</p>
        ${imgPlaceholder('System Architecture Diagram')}
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
        ${imgPlaceholder('Chat UI with Inline Citations')}
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['Python', 'LangChain', 'FAISS', 'sentence-transformers', 'OpenAI API', 'Flask', 'React'])}
      </div>
    `
  },

  'deeplabcut': {
    title: 'Rat Behavioral Monitoring System',
    tag: 'Neuroscience Research',
    content: () => `
      <div class="modal-hero-img">[Cover Image — Camera Array Setup]</div>

      <div class="modal-section">
        <h3>Background</h3>
        <p>At the Gulley Lab for Neuropsychopharmacology, behavioral experiments have generated many hours of rodent video data within T-maze experiments. This became a topic of interest when alarming rates of self-administration nose-pokes became a recurrent issue in a particular study. We needed to know if rats were either displaying this behavior accidentally (eg. with their tail instead of nose), or due to other conditions that the rat may have been experiencing. The lab needed an automated pipeline to validate behavioral logs against video evidence.</p>
      </div>

      <div class="modal-section">
        <h3>Camera System Design</h3>
        <p>Designed an ongoing experimetnal application that takes the origional problem statement and utilizes various neural network modeling approaches to classify behaviors within operant self-administration chambers. This project has since been discontinued by the lab, but would ideally adapt to a 12-camera synchronized recording system.</p>
        ${imgRow('Camera Layout Diagram', 'Multi-Angle Sample Frame')}
      </div>

      <div class="modal-section">
        <h3>DeepLabCut Integration</h3>
        <p>Rat Behavior Intelligence is a browser-based neuroscience tool that automates the analysis of rodent behavior from raw video — replacing hours of manual observation with a structured, interpretable pipeline. Users upload a rat video (or record directly from the browser), and the system processes it frame by frame, extracting temporal movement features like confinement, turning patterns, and motion bursts to classify behavioral states including exploration, freezing, grooming, locomotor bursts, stereotypy, and resting. When a local DeepLabCut environment is available, the pipeline upgrades to full pose estimation using a custom-trained ResNet-50 model tracking up to 16 anatomical keypoints — nose, ears, spine segments, paws, and tail — enabling geometry-derived classifications that go far beyond simple motion heuristics.
        The architecture is deliberately staged for interpretability and extensibility. A FastAPI backend handles video ingestion, runs the classification pipeline, and writes annotated outputs; the frontend streams results back as a playable annotated MP4, a timeline.json with frame-level behavior bouts, timestamped event feeds, and a natural-language summary with review-priority flagging. The observer commentary layer is rule-based by default but upgrades transparently to an LLM (OpenAI or a local llama.cpp server) when configured — keeping the core pipeline functional in fully offline or resource-constrained environments.
        What makes this project technically meaningful is its graceful degradation and forward-looking design. When DeepLabCut is unavailable, the system falls back to a motion-based temporal classifier without breaking the user experience. The expanded 16-point skeleton schema and retraining templates are already in place, so improving classification accuracy is a matter of more labeled data rather than architectural rework. The combination of pose estimation, temporal behavior classification, and LLM-augmented summarization positions this as a practical screening tool for neuroscience labs — reducing the manual review burden while keeping a human researcher in the loop on ambiguous or high-priority clips.</p>
        ${imgPlaceholder('Pose Estimation Overlay — Tracked Keypoints')}
      </div>

      <div class="modal-section">
        <h3>Validation Pipeline</h3>
        <p>Developed (and experimentally redeveloping) an end-to-end Python pipeline that cross-references behavioral event logs with synchronized video timestamps. With the use of Claude Code, I am in the process of redeveloping this system to generate visual overlays of tracked poses on raw footage, and flag anomalies where logged events don't match observed behavior.</p>
        ${imgRow('Timestamp Alignment Visualization', 'Anomaly Detection Dashboard')}
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['Python', 'DeepLabCut', 'OpenCV', 'Pandas', 'NumPy', 'Computer Vision', 'Pose Estimation'])}
      </div>
    `
  },

  'neurotech-vr': {
    title: 'NeuroTech R&D — VR Biofeedback System',
    tag: 'Research',
    content: () => `
      <div class="modal-hero-img">[Cover Image — VR Headset with EEG]</div>

      <div class="modal-section">
        <h3>Vision</h3>
        <p>At NeuroTech @ UIUC, we set out to build VR experiences that respond to your brain and body in real time — not scripted interactions, but adaptive environments driven by live physiological data. The question was: can we make neurofeedback feel like a game instead of a clinical tool?</p>
      </div>

      <div class="modal-section">
        <h3>Signal Acquisition</h3>
        <p>While my startup's project details are confidential, a related project of mine is based on the same idea. Neurohack Fall 2025 "Mindlift."

        This project demonstrates a non-invasive approach to brain–computer interaction using natural micro-behavioral signals that are tightly coupled with cognitive intent.
        
        Instead of relying on EEG or invasive neural hardware, we use high-resolution eye movements, subtle facial muscle activations, and head gestures as a proxy for the user’s internal decision-making.
        
        This matters because these signals are fast, reliable, universally accessible, and require no special equipment—showing a path toward everyday BCI interactions.
        
        By turning gaze and micro-expressions into a telekinetic control system, we illustrate how future BCIs can merge computer vision, human cognition, and natural behavior to create interfaces that feel effortless and intuitive. This is a step toward “thought-adjacent” interaction—technology responding to what you intend, not what you physically do.</p>
        ${imgPlaceholder('Signal Pipeline — Raw EEG to Feature Extraction')}
      </div>


      <div class="modal-section">
        <h3>Cozad New Venture Challenge</h3>
        <p>Pitched our startup's first demos of the project as "Brainstorm" at the Cozad New Venture Challenge (Spring 2025) and reached the finals. Contributed to business strategy, competitive positioning, and delivered investor-facing demo materials.</p>
        ${imgPlaceholder('Pitch Deck Slide — Product Vision')}
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['Unity', 'C#', 'Python', 'EEG', 'Heart Rate Sensors', 'VR', 'Biosignal Processing', 'Game AI'])}
        ${linksList([{ label: 'NeuroTech Website', url: 'https://neurotechatuiuc.com' }])}
      </div>
    `
  },

  'brainstorm': {
    title: 'Web-Cite — Assisted Research Tool',
    tag: 'Full Stack',
    content: () => `
      <div class="modal-hero-img">[Cover Image — Web-Cite Dashboard]</div>

      <div class="modal-section">
        <h3>The Problem</h3>
        <p>Academic research involves juggling dozens of papers, extracting key claims, and keeping track of which source said what. Existing tools are either too manual (spreadsheets, sticky notes) or too opaque (LLMs that hallucinate citations). We wanted something in between — a platform that helps you organize and cite, with full traceability.</p>
      </div>

      <div class="modal-section">
        <h3>How It Works</h3>
        <p>Web-Cite is a full-stack research tool built to solve a real friction point in academic work — the fragmented, time-consuming process of finding and organizing related literature. Rather than requiring users to manually chain together searches across databases, Web-Cite automates the discovery of semantically related papers and renders them as an interactive, editable citation web. A user searches PubMed, selects a root article, and the backend takes over: it fetches the article's metadata, computes a local embedding vector from the title, abstract, keywords, and MeSH terms, then searches PubMed for candidate papers, scores each by cosine similarity, and surfaces the top three to four most relevant results as a structured graph — all without any manual input beyond the initial selection.</p>
        ${imgPlaceholder('Upload & Extraction Flow')}
      </div>

      <div class="modal-section">
        <h3>Full Stack Architecture</h3>
        <p>The backend is built with a clean separation of concerns that made cross-team collaboration efficient. A Node.js/Express API handles JWT-authenticated user sessions, PubMed querying, embedding computation, and MongoDB persistence, while the frontend is given full autonomy over graph rendering — receiving structured nodes and edges arrays it can pass directly into React Flow, Cytoscape.js, or D3. Node positions default to {0,0} and are patchable, so layout customization is a frontend concern without any backend coupling. Users can save, revisit, edit, and delete their citation webs from a personal dashboard, making the tool useful across an entire research project rather than just a single session.</p>
      </div>

      <div class="modal-section">
        <h3>Key Distinctions</h3>
        <p>What distinguishes Web-Cite from existing tools like PubMed or EBSCO is the combination of automated semantic discovery with user-editable output. Existing citation graph tools either require users to build the web manually or produce static, non-customizable maps. Web-Cite generates the initial graph automatically from embedding similarity, then hands control back to the researcher — letting them reposition nodes, update titles, and build keyword webs that reflect their own mental model of a topic. The result is a tool that reduces the cold-start burden of literature review while preserving the researcher's agency over how their knowledge is organized.</p>
        ${imgPlaceholder('PDF Parsing Pipeline')}
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['React', 'FastAPI', 'Python', 'LangChain', 'Vector DB', 'PDF Parsing', 'LLM', 'Tailwind CSS'])}
      </div>
    `
  },

  'melodify': {
    title: 'Melodify — AI Music Generator',
    tag: 'Hackathon',
    content: () => `
      <div class="modal-hero-img">[Cover Image — Melodify Interface]</div>

      <div class="modal-section">
        <h3>The Concept</h3>
        <p>What if you could describe a mood or a scene in words and get original music back? Melodify turns natural language prompts into audio using Meta's AudioCraft model. Built at Dev-Ada 2024, the goal was to make generative music feel like a real product — not a research demo.</p>
      </div>

      <div class="modal-section">
        <h3>User Experience</h3>
        <p>Designed the flow to feel intuitive: type a prompt ("upbeat jazz for a coffee shop morning"), see a generation progress indicator, then play back the result with waveform visualization. Users can iterate, save favorites, and download tracks.</p>
        ${imgRow('Prompt Input Screen', 'Waveform Playback View')}
      </div>

      <div class="modal-section">
        <h3>Technical Implementation</h3>
        <ul>
          <li>React frontend with real-time generation state management and audio playback</li>
          <li>Flask backend wrapping AudioCraft's MusicGen model</li>
          <li>Async job queue to handle generation latency without blocking the UI</li>
          <li>Audio post-processing for consistent volume normalization and fade-outs</li>
        </ul>
        ${imgPlaceholder('Architecture — Frontend to Model Pipeline')}
      </div>

      <div class="modal-section">
        <h3>Hackathon Delivery</h3>
        <p>Shipped a fully working demo within 24 hours. Prioritized features that made the end-to-end experience coherent and easy to explain during judging. The team coordinated across frontend, backend, and model integration tracks.</p>
        ${imgPlaceholder('Team Demo at Dev-Ada 2024')}
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['React', 'Flask', 'Python', 'Meta AudioCraft', 'MusicGen', 'Web Audio API'])}
        ${linksList([{ label: 'GitHub', url: 'https://github.com/noemiamahmud/melodify_noemia' }])}
      </div>
    `
  },

  'datathon': {
    title: 'Datathon — Neural Network Modeling',
    tag: 'Hackathon',
    content: () => `
      <div class="modal-hero-img">[Cover Image — Datathon Competition]</div>

      <div class="modal-section">
        <h3>The Competition</h3>
        <p>Competed in a datathon challenge focused on building predictive models from complex, real-world datasets. Our team tackled the problem using neural network architectures, iterating through data preprocessing, feature engineering, and model selection under tight time constraints.</p>
      </div>

      <div class="modal-section">
        <h3>Data Exploration & Preprocessing</h3>
        <p>Spent the first phase deeply exploring the dataset — identifying missing values, class imbalances, and feature correlations. Built a cleaning pipeline that standardized inputs, handled nulls with domain-informed imputation, and engineered new features from raw columns.</p>
        ${imgRow('Exploratory Data Analysis — Feature Distributions', 'Correlation Heatmap')}
      </div>

      <div class="modal-section">
        <h3>Model Architecture</h3>
        <p>Designed and trained a feedforward neural network in PyTorch, experimenting with layer depth, dropout rates, batch normalization, and learning rate schedules. Benchmarked against traditional ML baselines (Random Forest, XGBoost) to validate the neural approach.</p>
        ${imgPlaceholder('Model Architecture Diagram')}
      </div>

      <div class="modal-section">
        <h3>Training & Evaluation</h3>
        <p>Implemented k-fold cross-validation to prevent overfitting and used early stopping based on validation loss. Tracked metrics across experiments using structured logging to compare configurations systematically.</p>
        ${imgRow('Training Loss Curves', 'Confusion Matrix — Final Model')}
      </div>

      <div class="modal-section">
        <h3>Results & Presentation</h3>
        <p>Presented findings to judges, walking through our methodology, model decisions, and performance metrics. Emphasized interpretability — showing which features drove predictions and where the model struggled.</p>
        ${imgPlaceholder('Final Presentation Slide')}
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['Python', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'Matplotlib', 'XGBoost'])}
      </div>
    `
  },

  'code-to-cure': {
    title: 'Student Wellness — Patient-Doctor Matching',
    tag: 'Hackathon',
    content: () => `
      <div class="modal-hero-img">[Cover Image — Matching Platform UI]</div>

      <div class="modal-section">
        <h3>The Challenge</h3>
        <p>Students often struggle to find the right healthcare provider — especially for mental health, where fit matters enormously. At the Code Ada hackathon, we built a platform that translates unstructured symptom descriptions into structured categories and matches patients with the best-fit provider.</p>
      </div>

      <div class="modal-section">
        <h3>How Matching Works</h3>
        <p>Users complete a structured survey about their symptoms, preferences, and constraints. The backend clusters symptom descriptions into medical categories using rule-based NLP, then scores providers based on specialty match, availability, and patient preference weights.</p>
        ${imgPlaceholder('Survey Flow — Symptom Input to Match Result')}
      </div>

      <div class="modal-section">
        <h3>Backend Architecture</h3>
        <ul>
          <li>Flask API with RESTful endpoints for survey submission and match retrieval</li>
          <li>SQLite database for provider profiles, patient submissions, and match logs</li>
          <li>Symptom clustering with keyword extraction and weighted scoring</li>
          <li>Match ranking with configurable priority weights</li>
        </ul>
        ${imgRow('API Endpoint Map', 'Database Schema')}
      </div>

      <div class="modal-section">
        <h3>Demo & Results</h3>
        <p>Delivered a clean, working prototype with a complete flow from survey input to provider recommendation in under 24 hours. The demo emphasized clarity — every match came with an explanation of why that provider was recommended.</p>
        ${imgPlaceholder('Final Demo — Match Results Screen')}
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['Flask', 'Python', 'SQLite', 'HTML/CSS', 'JavaScript', 'NLP'])}
        ${linksList([{ label: 'GitHub', url: 'https://github.com/noemiamahmud/Code-ADA-2024-For_Portfolio' }])}
      </div>
    `
  },

  'neurotech-site': {
    title: 'NeuroTech @ UIUC Website',
    tag: 'Web Development',
    content: () => `
      <div class="modal-hero-img">[Cover Image — NeuroTech Homepage]</div>

      <div class="modal-section">
        <h3>About the Organization</h3>
        <p>NeuroTech @ UIUC is a student organization focused on brain-computer interfaces, neurofeedback, and computational neuroscience research. The club needed a public-facing site that communicated its mission, showcased ongoing projects, and recruited new members.</p>
      </div>

      <div class="modal-section">
        <h3>Design Process</h3>
        <p>Started with stakeholder interviews to understand what the site needed to communicate. Designed wireframes prioritizing clarity for first-time visitors — a recruiter or a curious freshman should understand what NeuroTech does within 10 seconds of landing.</p>
        ${imgRow('Wireframe — Homepage Layout', 'Color Palette & Typography')}
      </div>

      <div class="modal-section">
        <h3>Implementation</h3>
        <p>Built with vanilla HTML, CSS, and JavaScript for maximum simplicity and zero build tooling. Responsive across all devices with clean section transitions and consistent branding.</p>
        ${imgPlaceholder('Desktop & Mobile Side-by-Side')}
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['HTML', 'CSS', 'JavaScript', 'Responsive Design'])}
        ${linksList([{ label: 'Visit Site', url: 'https://neurotechatuiuc.com' }])}
      </div>
    `
  },

  'illini-speed': {
    title: 'Illini Speed Website',
    tag: 'Web Development',
    content: () => `
      <div class="modal-hero-img">[Cover Image — Illini Speed Homepage]</div>

      <div class="modal-section">
        <h3>The Organization</h3>
        <p>Illini Speed is UIUC's short track speed skating club — one of the largest student skating organizations in the Midwest. As Registration Management Chair, I own the entire digital registration experience: the website, signup forms, and member communications.</p>
      </div>

      <div class="modal-section">
        <h3>UX Redesign</h3>
        <p>The original site confused new skaters with unclear navigation and buried logistics info. Restructured the information architecture to put the most important things upfront: practice times, safety requirements, equipment needs, and registration links.</p>
        ${imgRow('Before — Old Layout', 'After — Redesigned Layout')}
      </div>

      <div class="modal-section">
        <h3>Registration Flow</h3>
        <p>Built a streamlined signup experience that collects member info, waivers, and payment confirmation in a single clean flow. Reduced support questions by making every step self-explanatory with inline help text and progress indicators.</p>
        ${imgPlaceholder('Registration Form — Step-by-Step Flow')}
      </div>

      <div class="modal-section">
        <h3>Mobile Optimization</h3>
        <p>Most members access the site on their phones at the rink. Ensured fast load times, tap-friendly buttons, and a layout that works in portrait orientation without horizontal scrolling.</p>
        ${imgPlaceholder('Mobile View — Key Pages')}
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['HTML', 'CSS', 'JavaScript', 'UX Design', 'Responsive Design'])}
        ${linksList([{ label: 'Visit Site', url: 'https://noemiamahmud.github.io/illinispeed/' }])}
      </div>
    `
  },

  'wece-hacks': {
    title: 'WECE Hacks 2025 Website',
    tag: 'Web Development',
    content: () => `
      <div class="modal-hero-img">[Cover Image — WECE Hacks Event]</div>

      <div class="modal-section">
        <h3>The Event</h3>
        <p>WECE Hacks is an annual hackathon hosted by Women in Electrical and Computer Engineering at UIUC. As Operations Lead, I coordinated the full event experience for 80+ participants — from registration through demos — while also building and maintaining the event website.</p>
      </div>

      <div class="modal-section">
        <h3>Website Design</h3>
        <p>The site served as the single source of truth for participants: schedule, venue info, FAQ, sponsor logos, and registration links. Designed for scannability — attendees should find what they need in under 5 seconds.</p>
        ${imgRow('Homepage — Hero & Schedule', 'FAQ & Sponsor Section')}
      </div>

      <div class="modal-section">
        <h3>Event Operations</h3>
        <p>Managed planning timelines, task ownership across a team of volunteers, and day-of execution. Coordinated participant flow through check-in, workshops, hacking periods, and final presentations.</p>
        ${imgPlaceholder('Event Day — Participants Hacking')}
      </div>

      <div class="modal-section">
        <h3>Lessons Learned</h3>
        <p>Running an 80-person event under real constraints (budget, venue, timeline) taught me more about project management than any course. The biggest lesson: clear communication eliminates 90% of logistical problems before they happen.</p>
        ${imgPlaceholder('Team Photo — Post-Event')}
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['HTML', 'CSS', 'JavaScript', 'Event Operations'])}
        ${linksList([{ label: 'Visit Site', url: 'https://noemiamahmud.github.io/wecehacks.github.io/' }])}
      </div>
    `
  },

  'misc': {
    title: 'Fun & Random — Miscellaneous Projects',
    tag: 'Misc',
    content: () => `
      <div class="modal-hero-img">[Cover Image — Assorted Side Projects]</div>

      <div class="modal-section">
        <h3>About This Collection</h3>
        <p>Not everything fits neatly into a category. These are side projects, experiments, and creative builds that came out of curiosity, late-night ideas, or just wanting to learn something new.</p>
      </div>

      <div class="modal-section">
        <h3>Automation Scripts</h3>
        <p>A collection of Python scripts for automating repetitive tasks — file organization, batch image resizing, data format conversion, and web scraping utilities built for personal use and later shared with lab teammates.</p>
        ${imgPlaceholder('Script Output — Batch Processing Log')}
      </div>

      <div class="modal-section">
        <h3>Creative Coding Experiments</h3>
        <p>Generative art sketches, audio visualizers, and interactive canvas animations built for fun. Some made it into other projects (like this portfolio's neural banner), most just lived in a weekend notebook.</p>
        ${imgRow('Generative Art — Particle System', 'Audio Visualizer Screenshot')}
      </div>

      <div class="modal-section">
        <h3>Hardware Tinkering</h3>
        <p>Arduino and Raspberry Pi projects ranging from LED controllers to a simple motion-activated camera trap for wildlife observation near campus.</p>
        ${imgPlaceholder('Hardware Setup — Arduino Project')}
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['Python', 'JavaScript', 'Arduino', 'Raspberry Pi', 'Canvas API', 'p5.js'])}
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

/* ===== Contact form handler (placeholder — no backend) ===== */
function handleContactForm(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sent!';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Send Message';
    btn.disabled = false;
    form.reset();
  }, 2000);
}
