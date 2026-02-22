const iframe = document.getElementById('sketchfab-frame');
const infoPanel = document.getElementById('info-panel');
const infoContent = document.getElementById('info-content');
const buttons = document.querySelectorAll('.overlay-buttons button');

const client = new Sketchfab('1.12.1', iframe);
let api;

client.init('20e930a5fae5457fa6d1738afa00c7bb', {
  success: (viewerAPI) => {
    api = viewerAPI;
    api.start();
    api.addEventListener('viewerready', () => {
      console.log('Sketchfab viewer ready.');
      setupButtons();
    });
  },
  error: () => console.error('Sketchfab API initialization failed.')
});

function setupButtons() {
  buttons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      api.gotoAnnotation(index);
      showInfo(btn.dataset.section);
    });
  });
}

function showInfo(section) {
  infoPanel.classList.remove('hidden');

  switch (section) {
    case 'internships':
      infoContent.innerHTML = `
        <h2>Internship Experience</h2>

        <h3>Software Development Intern & Neuroscience Lab Assistant — UIUC (May 2025 – Present)</h3>
        <p>
          As a Laboratory Assistant in the
          <a href="https://neuroscience.illinois.edu/gulley-lab" target="_blank" rel="noopener noreferrer">
            Gulley Laboratory for Neuropsychopharmacology
          </a>,
          I support ongoing research on how repeated psychoactive drug exposure alters behavior and neural function.
          My work spans both experimental workflow and data-focused tasks, with an emphasis on creating cleaner, more reproducible pipelines for behavioral analysis.
        </p>
        <ul>
          <li><strong>Behavioral + experimental support:</strong> assist with study prep, session logistics, and standardized lab procedures that improve reliability across cohorts.</li>
          <li><strong>Data organization & quality control:</strong> clean and structure raw session outputs so they’re easier to analyze, reproduce, and audit later.</li>
          <li><strong>Automation mindset:</strong> actively identify repetitive steps in the workflow and convert them into repeatable scripts/processes to reduce human error.</li>
        </ul>

        <p>
          Beyond these responsibilities, I’m co-leading a side project to build a <strong>12-camera behavioral monitoring system</strong>
          compatible with <strong>DeepLabCut</strong> for automated pose estimation and high-throughput behavior tracking.
          The goal is to make multi-angle recordings easier to synchronize, label, and analyze, so the lab can scale up experiments without sacrificing accuracy.
        </p>
        <ul>
          <li><strong>System design:</strong> camera layout planning, capture standards, and synchronization strategy for multi-view recording.</li>
          <li><strong>Analysis integration:</strong> designing the workflow so videos can be processed cleanly through DeepLabCut and exported into downstream analysis tools.</li>
          <li><strong>Documentation:</strong> writing setup and usage steps so future lab members can deploy and maintain the system.</li>
        </ul>

        <hr style="margin: 18px 0; opacity: 0.2;" />

        <h3>Java Programming Tutor — UIUC (Jan 2024 – Jan 2025)</h3>
        <p>
          As a tutor for <strong>CS 124</strong>, I supported students learning object-oriented programming fundamentals and debugging strategies.
          I focused on teaching students how to reason about code (not just “fix it”), so they could become more independent problem-solvers over time.
        </p>
        <ul>
          <li><strong>Core topics:</strong> classes/objects, inheritance, interfaces, recursion, algorithmic thinking, and test-driven debugging.</li>
          <li><strong>Debugging coaching:</strong> break down error messages, trace execution, and build simple test cases to isolate logic bugs.</li>
          <li><strong>Communication:</strong> explain complex concepts in clear, student-friendly language while keeping explanations technically accurate.</li>
        </ul>
      `;
      break;

    case 'student-orgs':
      infoContent.innerHTML = `
        <h2>Student Organizations & Leadership</h2>

        <h3>AI Healthcare System (RAG Chatbot) — Developer (Feb 2026 – Present)</h3>
        <p>
          Developing a <strong>Retrieval-Augmented Generation (RAG)</strong> healthcare chatbot that answers user questions with
          <strong>source-cited</strong>, grounded information. Instead of relying on a “pure” LLM response, the system retrieves relevant
          documents from a curated healthcare knowledge base and then synthesizes an explanation while linking back to the evidence.
        </p>
        <ul>
          <li><strong>Reliability-first design:</strong> prioritize retrieval accuracy and citation quality to reduce hallucinations in health-related queries.</li>
          <li><strong>Knowledge base workflow:</strong> help curate and structure scraped public healthcare sources so they’re searchable, auditable, and update-friendly.</li>
          <li><strong>Explainability:</strong> craft responses that are clear to non-experts while still preserving clinical nuance and showing where each claim comes from.</li>
          <li><strong>Complex-query support:</strong> optionally include structured reasoning for multi-step questions (while keeping final answers concise and user-safe).</li>
        </ul>

        <hr style="margin: 18px 0; opacity: 0.2;" />

        <p>
          <a href="https://neurotechatuiuc.com" target="_blank" rel="noopener noreferrer">
            Visit the official NeuroTech website created by me! →
          </a>
        </p>

        <h3>NeuroTech @ UIUC — VR Development Engineer & Researcher</h3>
        <p>
          Building interactive neurotech experiences that connect physiological data to real-time feedback in immersive environments.
          My focus is developing Unity-based VR systems that can integrate signals like EEG or heart rate and adapt gameplay in a way that is
          both technically reliable and meaningful for users.
        </p>
        <ul>
          <li><strong>Unity VR development:</strong> prototype and implement interactive mechanics designed around attention, stress, and performance feedback.</li>
          <li><strong>Data-to-feedback loops:</strong> help integrate signal acquisition pipelines into gameplay logic so feedback feels immediate and interpretable.</li>
          <li><strong>Research-minded iteration:</strong> design experiments and tuning strategies so the project can support real evaluation, not just demos.</li>
        </ul>

        <hr style="margin: 18px 0; opacity: 0.2;" />

        <h3>Illini Speed — Registration Management Chair (Web Development / UX)</h3>
        <p>
          Own the registration experience for a large student athletics organization by maintaining a clean, accessible, and reliable signup flow.
          I build pages and forms that are easy to navigate, reduce friction for new members, and clearly communicate logistics (times, safety requirements, fees).
        </p>
        <ul>
          <li><strong>UX improvements:</strong> simplify pages, clarify instructions, and reduce confusion for first-time skaters.</li>
          <li><strong>Operational reliability:</strong> keep registration information accurate and up to date throughout the semester.</li>
          <li><strong>Public-facing site:</strong> ensure the site looks professional and loads quickly on mobile and desktop.</li>
        </ul>
        <p>
          <a href="https://noemiamahmud.github.io/illinispeed/" target="_blank" rel="noopener noreferrer">
            Visit the Illini Speed Website →
          </a>
        </p>

        <hr style="margin: 18px 0; opacity: 0.2;" />

        <h3>Women in Electrical and Computer Engineering (WECE) — WECE Hacks Operations Lead</h3>
        <p>
          Directed event operations for <strong>WECE Hacks</strong>, coordinating participant flow, schedules, logistics, and web presence.
          I helped create a smooth end-to-end experience for attendees while balancing constraints like timelines, budgets, and team capacity.
        </p>
        <ul>
          <li><strong>Event coordination:</strong> manage planning timelines, task ownership, and day-of execution details.</li>
          <li><strong>Website + communication:</strong> maintain clear public-facing info so participants always know what to do next.</li>
          <li><strong>Scale:</strong> supported an event with <strong>80+ participants</strong>, ensuring coordination stayed organized and responsive.</li>
        </ul>
        <p>
          <a href="https://noemiamahmud.github.io/wecehacks.github.io/" target="_blank" rel="noopener noreferrer">
            View WECE Hacks 2025 Website →
          </a>
        </p>

        <hr style="margin: 18px 0; opacity: 0.2;" />

        <h3>Women in Computer Science — Dev-Ada & Code-Ada</h3>
        <p>
          Collaborated on <strong>Melodify</strong>, an AI-driven generative music project that converts user prompts into music outputs.
          I focused on bridging product experience and engineering execution by implementing a responsive UI and integrating it with a working backend.
        </p>
        <ul>
          <li><strong>Frontend:</strong> React-based interface design for prompt input, generation states, and playback UX.</li>
          <li><strong>Backend integration:</strong> connect UI to Flask endpoints and ensure predictable, user-friendly responses.</li>
          <li><strong>Team collaboration:</strong> align features with constraints and ship a working demo under hackathon timelines.</li>
        </ul>
        <p>
          <a href="https://github.com/noemiamahmud/Code-ADA-2024-For_Portfolio" target="_blank" rel="noopener noreferrer">
            CODE-ADA GitHub →
          </a>
        </p>
        <p>
          <a href="https://github.com/noemiamahmud/melodify_noemia" target="_blank" rel="noopener noreferrer">
            DEV-ADA GitHub →
          </a>
        </p>
      `;
      break;

    case 'research':
      infoContent.innerHTML = `
        <h2>Research</h2>

        <h3>Undergraduate Summer Journal Club — Participant</h3>
        <p>
          Active participant in a neuroscience journal club focused on reading, presenting, and discussing research papers.
          The emphasis is on learning how to evaluate evidence critically — understanding experimental design choices,
          interpreting figures accurately, and identifying limitations that affect real conclusions.
        </p>
        <ul>
          <li><strong>Core themes:</strong> synaptic plasticity, neuropharmacology, development, learning/memory, and systems-level cognition.</li>
          <li><strong>Presentation skills:</strong> translate complex methods and results into clear summaries with strong takeaway points.</li>
          <li><strong>Scientific thinking:</strong> practice asking “what would convince me?” and “what alternative explanations exist?”</li>
        </ul>

        <hr style="margin: 18px 0; opacity: 0.2;" />

        <h3>Publications / Acknowledgements</h3>
        <p>
          Preparing for my first acknowledgements for data analysis work with <strong>Dr. Josh Gulley</strong> (UIUC).
          I’m especially interested in research that combines behavioral neuroscience with computational analysis and automation,
          so findings are easier to validate and reproduce.
        </p>
      `;
      break;

    case 'competitions':
      infoContent.innerHTML = `
        <h2>Competitions & Hackathons</h2>

        <h3>Cozad New Venture Challenge — UIUC 2025 (Finalist)</h3>
        <p>
          Finalist with <strong>Brainstorm</strong>, a neurofeedback-based therapeutic platform concept that blends biosignal analysis with adaptive AI.
          The project explored how personalized feedback loops could help users train attention and regulation skills in an engaging, measurable way.
        </p>
        <ul>
          <li><strong>Pitch development:</strong> help define the product story, user value, and competitive positioning.</li>
          <li><strong>Technical feasibility:</strong> map the concept to realistic data collection, modeling, and feedback constraints.</li>
          <li><strong>Outcome:</strong> delivered a clear concept and narrative under a competitive evaluation process.</li>
        </ul>

        <hr style="margin: 18px 0; opacity: 0.2;" />

        <h3>Code Ada — Code to Cure Hackathon</h3>
        <p>
          Built a Flask-based doctor–patient matching platform using structured survey input to route patients toward relevant providers.
          The focus was translating messy symptom descriptions into usable categories and building a simple, functional web app under time pressure.
        </p>
        <ul>
          <li><strong>Backend:</strong> Flask API endpoints and SQLite data storage for submissions and matching logic.</li>
          <li><strong>Logic design:</strong> symptom clustering and rule-based pairing to generate a “best-fit” provider match.</li>
          <li><strong>Delivery:</strong> shipped a working prototype with a clean demo flow.</li>
        </ul>

        <hr style="margin: 18px 0; opacity: 0.2;" />

        <h3>Melodify — Dev-Ada 2024</h3>
        <p>
          Developed a generative music platform that turns user prompts into audio using Meta’s <strong>AudioCraft</strong>.
          I focused on making the experience feel product-like: clear prompts, visible progress states, and a smooth path from generation to playback.
        </p>
        <ul>
          <li><strong>Product UX:</strong> streamlined prompt input and results display so users understand what the model is doing.</li>
          <li><strong>Integration:</strong> connected UI actions to backend generation endpoints with predictable output handling.</li>
          <li><strong>Demo readiness:</strong> prioritized features that made the end-to-end experience coherent and easy to explain.</li>
        </ul>
      `;
      break;

    case 'extracurriculars':
      infoContent.innerHTML = `
        <h2>Recreational Extracurriculars</h2>

        <h3>Illini Speed — Coach & Registrar Executive (Aug 2023 – Present)</h3>
        <p>
          Coach beginner and intermediate short track skaters while also supporting operational leadership through registration,
          communication, and safety compliance. I focus on creating a supportive team culture where new skaters can progress quickly and safely.
        </p>
        <ul>
          <li><strong>Coaching:</strong> teach fundamentals (starts, corners, pacing, and technique) and help skaters build confidence on the ice.</li>
          <li><strong>Leadership:</strong> coordinate registration flows, onboarding, and clear communication so the team runs smoothly.</li>
          <li><strong>Safety:</strong> ensure compliance with equipment requirements and best practices to reduce injury risk.</li>
        </ul>
        <p>
          <a href="https://noemiamahmud.github.io/illinispeed/" target="_blank" rel="noopener noreferrer">
            Visit the Illini Speed Website →
          </a>
        </p>

        <hr style="margin: 18px 0; opacity: 0.2;" />

        <h3>Competitive Speed Skating History</h3>
        <p>
          Competed nationally and internationally in short track speed skating. My training background shaped how I work:
          disciplined practice, fast iteration, and staying calm under pressure — skills I carry directly into technical projects and leadership roles.
        </p>
        <ul>
          <li><strong>Highlights:</strong> 1st place at <strong>U.S. Nationals 2023</strong>.</li>
          <li><strong>Strengths:</strong> focus, resilience, and performance in high-stakes environments.</li>
        </ul>
      `;
      break;
  }
}

function closePanel() {
  infoPanel.classList.add('hidden');
  buttons.forEach(b => b.classList.remove('active'));
}