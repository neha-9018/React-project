# 🛡️ Phish Blocker AI  

![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python)
![Framework](https://img.shields.io/badge/Framework-Flask%20%7C%20FastAPI-green)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Status](https://img.shields.io/badge/Status-Active-success)
![Contributions](https://img.shields.io/badge/Contributions-Welcome-orange)

> 🚫 **Phish Blocker AI** is an **AI-powered phishing detection system** that intelligently analyzes URLs and website content to detect phishing attempts in real-time.  
It provides an easy-to-use web interface and can be integrated with browsers for proactive phishing prevention.

---

## 🚀 Features
- 🔍 **AI-based Phishing Detection** – Detects phishing URLs using trained machine learning models.  
- 🌐 **Content Analysis using NLP** – Evaluates text and structure of webpages for authenticity.  
- ⚙️ **Real-Time Browser Extension Support** – Integrate with browser extensions for instant detection.  
- 📊 **Admin Dashboard** – Monitor phishing attempts, accuracy, and logs.  
- 🧰 **REST API Support** – Provides endpoints for detection requests.  
- 💾 **Database Logging** – Stores detection reports for future analytics.  

---

## 🧠 Tech Stack
**Frontend:** HTML, CSS, JavaScript  
**Backend:** Python (Flask / FastAPI)  
**ML Frameworks:** scikit-learn, TensorFlow / PyTorch  
**Database:** SQLite / PostgreSQL  
**Other Tools:** BeautifulSoup, Requests, Pandas, NumPy  

---

## ⚙️ Installation Guide

### 1️⃣ Clone the repository
```bash
git clone https://github.com/<your-username>/phish-blocker-ai.git
cd phish-blocker-ai
2️⃣ Set up a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
3️⃣ Install dependencies
pip install -r requirements.txt

4️⃣ Run the application
python app.py

🧩 Usage

Enter a suspicious URL in the input field.

The model analyzes it and returns either Safe or Phishing.

You can view logs and reports via the dashboard.

📁 Project Structure
README.md
phish-blocker-ai-main/.env
phish-blocker-ai-main/.gitignore
phish-blocker-ai-main/README.md
phish-blocker-ai-main/bun.lockb
phish-blocker-ai-main/components.json
phish-blocker-ai-main/eslint.config.js
phish-blocker-ai-main/index.html
phish-blocker-ai-main/package-lock.json
phish-blocker-ai-main/package.json
phish-blocker-ai-main/postcss.config.js
phish-blocker-ai-main/tailwind.config.ts
phish-blocker-ai-main/tsconfig.app.json
phish-blocker-ai-main/tsconfig.json
phish-blocker-ai-main/tsconfig.node.json
phish-blocker-ai-main/vite.config.ts
phish-blocker-ai-main/public/favicon.ico
phish-blocker-ai-main/public/placeholder.svg
phish-blocker-ai-main/public/robots.txt
phish-blocker-ai-main/src/App.tsx
phish-blocker-ai-main/src/index.css
phish-blocker-ai-main/src/main.tsx
phish-blocker-ai-main/src/vite-env.d.ts
phish-blocker-ai-main/src/components/AnalyzeMessageDialog.tsx
phish-blocker-ai-main/src/components/AudioRecorder.tsx

🧪 Model Details

The AI model uses supervised learning algorithms like Logistic Regression, Random Forest, or Neural Networks trained on phishing and legitimate website datasets.
It extracts URL-based and content-based features like:

Domain length

HTTPS presence

Redirections

HTML structure and keywords

🧩 Future Enhancements

🌍 Deploy model as a REST API microservice

🔒 Integrate with Chrome/Edge browser extensions

📈 Improve accuracy using deep learning (BERT for URL text)

🧭 Real-time phishing URL database updates

🤝 Contributing

Contributions are always welcome 💡

To contribute:

Fork the repository

Create a new branch (feature-branch)

Commit your changes

Push the branch and open a Pull Request
