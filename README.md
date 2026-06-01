# Pokémon Web Search Application

A full-stack, serverless web application that allows users to filter, search, and explore a comprehensive Pokémon database with real-time feedback. Built using a decoupled architecture with a native JavaScript frontend and a Python Flask serverless backend deployed on Vercel, backed by a Supabase PostgreSQL database.

## 🚀 Live Demo
Check out the live deployment here: https://pokemon-websearch.vercel.app

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+, Fetch API)
- **Backend:** Python, Flask, Flask-CORS, Python-dotenv
- **Database:** PostgreSQL (Hosted on Supabase)
- **Deployment & Hosting:** Vercel (Serverless Functions)

---

## 📁 Project Architecture

The project utilizes modern serverless infrastructure where routing requests are intercepted by Vercel and handled adaptively depending on the requested path.

```text
pokemon_project/
├── api/
│   └── index.py          # Serverless Flask backend & SQL Query Engine
├── JS/
│   ├── index.js          # Core frontend application & UI Event listeners
│   └── index_test.js     # Frontend testing sandbox
├── static/
│   ├── audio/            # Background music tracks
│   ├── CSS/              # UI stylesheets (style.css)
│   └── image/            # Asset sprites and interactive UI toggles
├── templates/
│   └── index.html        # Main user interface dashboard
├── requirements.txt      # Compiled Python dependencies for production
└── vercel.json           # Cloud routing rewrites configuration
