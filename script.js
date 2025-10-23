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

  switch(section) {

    case 'internships':
      infoContent.innerHTML = `
        <h2>Internship Experience</h2>

        <h3>Software Development Intern & Neuroscience Lab Assistant - UIUC (May 2025 - PRESENT)</h3>
        <p>As a Laboratory Assistant in the <a href="https://neuroscience.illinois.edu/gulley-lab" target="_blank">Gulley Laboratory for Neuropsychopharmacology</a>, I contribute to research investigating the behavioral and neural consequences of repeated psychoactive drug exposure...</p>

        <p>Beyond these responsibilities, I’m co-leading a side project to build a 12-camera behavioral monitoring system compatible with <strong>DeepLabCut</strong> for automated pose estimation and behavior tracking.</p>

        <h3>Java Programming Tutor — UIUC (Jan 2024 – Jan 2025)</h3>
        <p>As a tutor for <strong>CS 124</strong>, I supported students learning object-oriented programming and debugging complex logic, strengthening both their understanding and my own teaching abilities.</p>`;
      break;

    case 'student-orgs':
      infoContent.innerHTML = `
        <h2>Student Organizations & Leadership</h2>

        <h3><a href="#" target="_blank">NeuroTech @ UIUC</a> — Virtual Reality Development Engineer & Researcher</h3>
        <p>Integrating EEG data acquisition with real-time feedback in Unity VR environments for neurofeedback therapy. Developed ML models to classify cognitive states.</p>

        <h3>Web Development / UX</h3>
        <p>Registration Management Chair for <strong>Illini Speed</strong>, building an interactive signup website for skating sessions.</p>
        <p><a href="https://noemiamahmud.github.io/illinispeed/" target="_blank">Visit the Illini Speed Website →</a></p>

        <h3>Women in Electrical and Computer Engineering (WECE)</h3>
        <p>Directed operations for <strong>WECE Hacks</strong>, coordinating 80+ participants, budgets, and an event website.</p>
        <p><a href="https://noemiamahmud.github.io/wecehacks.github.io/" target="_blank">View WECE Hacks 2025 Website →</a></p>

        <h3>Women in Computer Science — Dev-Ada & Code-Ada</h3>
        <p>Co-developed <strong>Melodify</strong>, an AI-driven generative music app. Led frontend (React) and backend (Flask) integration.</p>
        <p><a href="https://github.com/noemiamahmud/Code-ADA-2024-For_Portfolio" target="_blank">CODE-ADA GitHub →</a></p>
        <p><a href="https://github.com/noemiamahmud/melodify_noemia" target="_blank">DEV-ADA GitHub →</a></p>`;
      break;

    case 'research':
      infoContent.innerHTML = `
        <h2>Research</h2>

        <h3>Undergraduate Summer Journal Club — Participant</h3>
        <p>Active participant in neuroscience literature analysis focusing on topics such as synaptic plasticity, neuropharmacology, and brain development.</p>
        <p>Presenting studies strengthened my ability to critically evaluate experimental design and interpret results with rigor.</p>

        <h3>Publications</h3>
        <p>My first acknowledgements for data analysis will soon be published by <strong>Dr. Josh Gulley</strong> (UIUC).</p>`;
      break;

    case 'competitions':
      infoContent.innerHTML = `
        <h2>Competitions & Hackathons</h2>

        <h3>Cozad New Venture Challenge — UIUC 2025</h3>
        <p>Finalist with <strong>Brainstorm</strong>, a neurofeedback-based therapeutic platform combining EEG analysis with adaptive AI systems.</p>

        <h3>Code Ada — Code to Cure Hackathon</h3>
        <p>Developed a Flask-based doctor-patient matching platform using survey-driven symptom clustering and SQLite backend.</p>

        <h3>Melodify — Dev-Ada 2024</h3>
        <p>Built a generative AI platform that composes music from prompts using Meta’s AudioCraft and Flask integration.</p>`;
      break;

    case 'extracurriculars':
      infoContent.innerHTML = `
        <h2>Recreational Extracurriculars</h2>

        <h3>Illini Speed — Coach & Registrar Executive (Aug 2023 – Present)</h3>
        <p>Coach beginner and intermediate short track skaters, manage registration and safety compliance, and foster team development.</p>
        <p><a href="https://noemiamahmud.github.io/illinispeed/" target="_blank">Visit the Illini Speed Website →</a></p>
        <h3>Competitive Speed Skating History</h3>
        <p>Competed nationally and internationally, achieving 1st place at the <strong>U.S. Nationals 2023</strong>. Skilled in discipline, focus, and leadership on and off the ice.</p>`;
      break;
  }
}

function closePanel() {
  infoPanel.classList.add('hidden');
  buttons.forEach(b => b.classList.remove('active'));
}

