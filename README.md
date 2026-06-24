# 🌾 AgriOS AI — Autonomous Farm Intelligence Platform

## 📋 Overview

**AgriOS AI** is an AI-powered operating system for farmers that helps them make better decisions throughout the entire farming lifecycle. Unlike traditional agriculture apps that only provide crop recommendations or weather updates, AgriOS AI acts as a **digital farm manager**, **risk predictor**, and **AI copilot**.

### 🎯 The Vision

> *"Transform agriculture through AI — helping farmers predict problems before they occur, optimize resources, increase profitability, and make data-driven decisions."*

### 👥 Target Users

* 🧑‍🌾 **Farmers** — Daily farm management and decision support
* 👨‍💼 **Agricultural Consultants** — Advising multiple farmers
* 🏢 **Cooperatives** — Managing member farms
* 🏦 **Banks & Insurance** — Risk assessment and loan evaluation
* 🏛️ **Government** — Policy making and scheme management

---

## ✨ Features

| #  | Feature                   | Description                                                                       |
| -- | ------------------------- | --------------------------------------------------------------------------------- |
| 1  | 🤖 AI Copilot             | ChatGPT-like assistant for farming advice, disease diagnosis, and crop management |
| 2  | 🌱 Crop Recommendation    | AI-powered crop suggestions based on soil type, location, and season              |
| 3  | 🦠 Disease Detection      | Upload leaf images for instant disease diagnosis with treatment recommendations   |
| 4  | 💧 Smart Irrigation       | AI-optimized irrigation scheduling to save water and maximize yield               |
| 5  | 📈 Yield Forecasting      | Predict crop yields with confidence scores and regional comparisons               |
| 6  | 💰 Profit Forecasting     | ROI analysis, break-even calculations, and profit margin estimation               |
| 7  | 🏪 Market Intelligence    | Real-time crop prices, price trends, and demand analysis                          |
| 8  | 📋 Government Schemes     | Discover eligible schemes with benefits, deadlines, and application process       |
| 9  | 🔔 Alerts & Notifications | Real-time farm alerts for weather, diseases, market, and schemes                  |
| 10 | 🌍 Multi-Language Support | Hindi, Telugu, Kannada, Tamil, Marathi, and English                               |
| 11 | 📊 Farm Dashboard         | Comprehensive farm health score and intelligence overview                         |
| 12 | 👤 Farm Profile           | Complete farm management with soil, crops, and irrigation details                 |

---

## 🛠️ Tech Stack

### Frontend

| Technology               | Purpose                       |
| ------------------------ | ----------------------------- |
| React 18 + TypeScript    | UI Framework with Type Safety |
| Tailwind CSS + ShadCN UI | Modern Responsive Design      |
| React Router             | Client-Side Routing           |
| React Query              | Data Fetching & Caching       |
| Recharts                 | Data Visualization            |
| Lucide React             | Icons                         |

### Backend

| Technology         | Purpose                       |
| ------------------ | ----------------------------- |
| FastAPI            | High Performance Backend APIs |
| Python 3.12        | Core Programming Language     |
| PostgreSQL         | Relational Database           |
| SQLAlchemy         | ORM                           |
| JWT Authentication | Secure User Access            |
| Groq API (Llama 3) | AI Copilot                    |
| OpenCV             | Image Processing              |
| TensorFlow         | Disease Detection Model       |

### DevOps

| Technology     | Purpose                  |
| -------------- | ------------------------ |
| Docker         | Containerization         |
| Docker Compose | Multi-Service Deployment |
| GitHub Actions | CI/CD Automation         |

---

## 🚀 Quick Start

### Prerequisites

| Tool           | Version |
| -------------- | ------- |
| Docker         | Latest  |
| Docker Compose | Latest  |
| Python         | 3.12+   |
| Node.js        | 18+     |

---

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Thummutukuri-Pavan-Kumar/agrios-ai.git
cd agrios-ai
```

---

### 2️⃣ Start PostgreSQL

```bash
docker compose up postgres -d
```

---

### 3️⃣ Backend Environment

Create:

```env
backend/.env
```

```env
DATABASE_URL=postgresql://agrios:agrios_secret@localhost:5432/agrios_db

SECRET_KEY=change-this-secret-key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30

REFRESH_TOKEN_EXPIRE_DAYS=7

GROQ_API_KEY=your_groq_api_key
```

---

### 4️⃣ Run Backend

```bash
cd backend

python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

Linux/Mac:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start server:

```bash
uvicorn app.main:app --reload --port 8000
```

---

### 5️⃣ Frontend Environment

Create:

```env
frontend/.env
```

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Install dependencies:

```bash
cd frontend

npm install

npm run dev
```

---

### 6️⃣ Open Application

```text
http://localhost:5173
```

---

## 📁 Project Structure

```text
agrios-ai/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── auth.py
│   │   │       ├── copilot.py
│   │   │       ├── farm.py
│   │   │       ├── crops.py
│   │   │       ├── disease.py
│   │   │       ├── irrigation.py
│   │   │       ├── yield_forecast.py
│   │   │       ├── profit.py
│   │   │       ├── market.py
│   │   │       ├── schemes.py
│   │   │       ├── alerts.py
│   │   │       └── translate.py
│   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │
│   │   ├── models/
│   │   ├── schemas/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── vite.config.ts
│   └── .env
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## 🔐 API Endpoints

| Method | Endpoint                     | Description         |
| ------ | ---------------------------- | ------------------- |
| POST   | /api/v1/auth/register        | Register User       |
| POST   | /api/v1/auth/login           | Login User          |
| GET    | /api/v1/farm/my-farm         | Get Farm Details    |
| POST   | /api/v1/farm/create          | Create Farm         |
| POST   | /api/v1/copilot/chat         | AI Chat             |
| POST   | /api/v1/crops/recommend      | Crop Recommendation |
| POST   | /api/v1/disease/detect       | Disease Detection   |
| POST   | /api/v1/irrigation/recommend | Smart Irrigation    |
| POST   | /api/v1/yield/forecast       | Yield Forecast      |
| POST   | /api/v1/profit/forecast      | Profit Forecast     |
| POST   | /api/v1/market/prices        | Market Prices       |
| POST   | /api/v1/schemes/recommend    | Government Schemes  |
| GET    | /api/v1/alerts               | Alerts              |
| POST   | /api/v1/translate            | Translation         |

---

## 🔮 Future Roadmap

* 📱 React Native Mobile App
* 🌦️ Real-Time Weather Integration
* 🐛 AI Pest Detection
* 🔄 Crop Rotation Planning
* 🚚 Supply Chain Intelligence
* 🎙️ Voice Assistant
* 🛰️ Satellite Monitoring
* 🤖 Autonomous Farm Insights

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch

```bash
git checkout -b feature/amazing-feature
```

3. Commit changes

```bash
git commit -m "Add amazing feature"
```

4. Push changes

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request

---

## 📄 License

Licensed under the MIT License.

---

## 👨‍💻 Author

### Thummutukuri Pavan Kumar

**MCA Student | AI/ML Enthusiast | Backend Developer |Frontend Developer**

📧 Email: [pavankumarthummutukuri@gmail.com](mailto:pavankumarthummutukuri@gmail.com)

🔗 LinkedIn: www.linkedin.com/in/thummutukuri-pavan-kumar-2a097b2b6

🐙 GitHub: https://github.com/Thummutukuri-Pavan-Kumar

---

## 🙏 Acknowledgements

* Groq AI
* FastAPI Community
* React Community
* Open Source Contributors
* Indian Farmers

---

## ⭐ Support

If you found this project useful:

⭐ Star the repository

🍴 Fork the project

🧑‍💻 Contribute to development

📢 Share with others

---

# 🌾 Built with ❤️ for Indian Farmers 🇮🇳

### “Empowering Agriculture Through Artificial Intelligence”
