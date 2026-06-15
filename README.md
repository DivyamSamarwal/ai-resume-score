<div align="center">
  <h1>Base100 - AI Resume Evaluator 💯</h1>
  <p><strong>A brutally honest, 100-point AI evaluation for software engineering resumes.</strong></p>

  [![Live Demo](https://img.shields.io/badge/Live_Demo-base100--resume.vercel.app-blue?style=for-the-badge&logo=vercel)](https://base100-resume.vercel.app/)
  
  ![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
  ![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
</div>

<br />

Base100 is a powerful, AI-driven recruitment tool that performs a rigorous, 100-point calibrated evaluation of software engineering resumes. Inspired by the concepts behind [interviewstreet/hiring-agent](https://github.com/interviewstreet/hiring-agent), Base100 goes further by offering a stunning neo-brutalist UI, multi-LLM support, automatic GitHub analysis, and dynamic Job Description matching.

![Base100 Dashboard Preview](https://via.placeholder.com/800x450.png?text=Base100+Dashboard)

---

## 📑 Table of Contents
- [✨ Key Features](#-key-features)
- [🧠 How It Works (The 100-Point Rubric)](#-how-it-works-the-100-point-rubric)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started (Local Dev)](#-getting-started-local-dev)
- [🚢 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)

---

## ✨ Key Features

- **Multi-Format Uploads**: Upload standard **PDFs**, native Microsoft Word **DOCX** files, or **Image** files (`.png`, `.jpg`).
- **Client-Side Image OCR**: Base100 uses `Tesseract.js` directly in your browser to extract text from image screenshots with zero server-side latency or timeout risk.
- **"Paste Text" Fallback**: Have a stubborn, corrupted PDF? Simply paste the raw text. The app aggressively sanitizes hidden characters and spacing dynamically before processing.
- **Bring Your Own Model (BYOK)**: Evaluate resumes using **OpenAI (GPT-4o)**, **Anthropic (Claude 3.5)**, **Gemini 2.0 Flash**, **DeepSeek**, **Groq (LLaMA-3)**, or any model via **OpenRouter**.
- **Deep GitHub Integration**: Automatically detects GitHub usernames from the resume and securely fetches the candidate's real repository data, commit history, and top languages to factor into the final score.
- **Dynamic Job Description Matching**: Paste a specific Job Description to instantly tailor the AI's scoring rubric. The AI will heavily scrutinize the candidate against the exact requirements of the role.
- **Local History & PDF Export**: Your evaluations are securely saved to your browser's local `localStorage`. Generate a clean, professional PDF report of the evaluation dashboard with a single click.
- **Shareable Public Links**: Optionally connect a Supabase PostgreSQL database to automatically generate unique, shareable public URLs for your evaluations so you can easily send them to hiring managers. Reports securely auto-expire after 30 days.
- **Privacy First**: API keys and resumes are processed entirely client-side or securely routed through edge functions. Nothing is logged or stored on our databases.

---

## 🧠 How It Works (The 100-Point Rubric)

Instead of vague feedback, Base100 forces the AI to objectively score the candidate across 4 heavily weighted pillars. The AI must provide concrete "Positive Evidence" and exact point "Deductions" for every score.

1. **🌍 Open Source Contributions (25 pts)**
   - Evidence of merged PRs to major open-source projects.
   - Quality of GitHub commit history and technical impact.
2. **🏗️ Self-Made Projects (25 pts)**
   - Complexity of personal projects (beyond standard bootcamp CRUD apps).
   - Real-world usage, live links, and architectural depth.
3. **💼 Production Experience (25 pts)**
   - Verifiable impact at previous companies (e.g., *"Reduced latency by 40%"* vs *"Worked on the backend"*).
   - Scale of systems worked on.
4. **⚙️ Technical Skills & Practices (25 pts)**
   - Evidence of testing (Unit, E2E), CI/CD pipelines, and cloud infrastructure.
   - Alignment with the provided Job Description (if applicable).

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) |
| **Language** | TypeScript |
| **Styling** | Vanilla CSS (Custom Neo-Brutalist Design System) |
| **Document Parsing** | `unpdf` (PDF), `mammoth` (DOCX), `tesseract.js` (Image OCR) |
| **Validation** | `zod` |
| **Database (Optional)** | [Supabase](https://supabase.com/) (PostgreSQL + `pg_cron`) |
| **Icons** | `lucide-react` |

---

## 🚀 Getting Started (Local Dev)

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm
- API Keys for the models you wish to use (OpenAI, Anthropic, Gemini, DeepSeek, etc.)
- *(Optional)* A GitHub Personal Access Token (PAT) to prevent rate limiting.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DivyamSamarwal/ai-resume-score.git
   cd ai-resume-score
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deployment

Base100 is designed to be effortlessly deployed on **Vercel** with absolutely **zero configuration required**. 

Because the application requires users to securely input their own API keys on the configuration screen, you can deploy it instantly with zero configuration. However, if you want the **Shareable Public Links** feature to work, you must add your Supabase database keys.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDivyamSamarwal%2Fai-resume-score)

1. Click the Deploy button above, or fork the repository.
2. *(Optional)* Add your Supabase keys as Environment Variables in Vercel to enable URL sharing:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Click **Deploy**. Vercel will automatically detect Next.js and build the app in under 2 minutes.

---

## 🤝 Contributing

Contributions are always welcome! Feel free to open an issue or submit a Pull Request if you'd like to add new features, support new LLMs, or improve the parsing algorithms.

## 📈 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=DivyamSamarwal/ai-resume-score&type=Date)](https://star-history.com/#DivyamSamarwal/ai-resume-score&Date)
