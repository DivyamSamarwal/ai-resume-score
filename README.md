# Base100 - AI Resume Evaluator 💯

Base100 is a powerful, AI-driven recruitment tool that performs a rigorous, 100-point calibrated evaluation of software engineering resumes. Inspired by the concepts behind [interviewstreet/hiring-agent](https://github.com/interviewstreet/hiring-agent), Base100 goes further by offering a stunning neo-brutalist UI, multi-LLM support, automatic GitHub analysis, and dynamic Job Description matching.

![Base100 Dashboard Preview](https://via.placeholder.com/800x450.png?text=Base100+Dashboard)

## ✨ Features

- **Multi-Model Support**: Bring your own API key to evaluate resumes using **Gemini 2.0 Flash**, **DeepSeek**, **Groq (LLaMA-3)**, or any model via **OpenRouter**.
- **Deep GitHub Integration**: Automatically detects GitHub usernames from the uploaded PDF, securely fetches the candidate's real repository data, commit history, and top languages using a GitHub PAT, and factors it into the evaluation.
- **Dynamic Job Description Matching**: Paste a specific Job Description to instantly tailor the AI's scoring rubric. The AI will heavily scrutinize the candidate against the exact requirements of the role.
- **100-Point Rigorous Rubric**: Candidates are graded across 4 specific pillars:
  - Open Source Contributions (25 pts)
  - Self-Made Projects (25 pts)
  - Production Experience (25 pts)
  - Technical Skills & Practices (25 pts)
- **Local History**: Your evaluations are securely saved to your browser's local storage, allowing you to quickly jump between past candidates using the History Sidebar.
- **Export to PDF**: Generate a clean, single-page professional report of the evaluation dashboard with a single click.
- **Privacy First**: API keys and resumes are processed entirely client-side or securely routed through serverless edge functions without being logged or stored on our servers.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- API Keys for the models you wish to use (Gemini, DeepSeek, Groq, etc.)
- (Optional) A GitHub Personal Access Token (PAT) to prevent rate limiting when analyzing GitHub profiles.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/base100.git
   cd base100
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

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: Vanilla CSS (Neo-Brutalist aesthetics)
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF Parsing**: `pdf-parse` (Edge-compatible extraction)
- **Schema Validation**: Zod

## 🚢 Deployment

Base100 is designed to be effortlessly deployed on **Vercel**. 

Since all API keys are inputted dynamically by the user on the client side, there is **no need to configure complex environment variables**. 

1. Push your code to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Click **Deploy**.

## 🤝 Acknowledgements

- Inspired by the open-source work of [interviewstreet/hiring-agent](https://github.com/interviewstreet/hiring-agent).
- Built for recruiters, hiring managers, and engineers who want an honest, unbiased assessment of talent.
