# 🚀 ServiceIQ Pro - AI-Powered Smart Service Management

ServiceIQ Pro is a state-of-the-art service dispatch and management platform designed for modern workforce optimization. It leverages an **AI Decision Engine** to instantly match service requests with the most qualified, highest-rated, and closest available professionals.

![ServiceIQ Pro Hero](https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=2070)

## ✨ Features

- **🧠 AI Decision Engine**: Uses a sophisticated scoring algorithm to auto-assign jobs based on:
    - Skill Match Accuracy (30%)
    - Proximity/Distance (40%)
    - Professional Rating (20%)
    - Real-time Availability (10%)
- **🛡️ Command Center (Admin Dashboard)**: Monitor system metrics, view live job statuses, and simulate emergency incidents to see the AI in action.
- **📱 Instant Request (Customer App)**: Intuitive interface for customers to request services and track their assigned professional in real-time.
- **💼 Active Dispatch (Worker App)**: Streamlined dashboard for service professionals to manage their availability and mark jobs as completed.
- **⚡ Real-time Updates**: Polling-based live data synchronization for a seamless, "live" experience.

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS 4, Framer Motion |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Backend** | Node.js, Express 5 |
| **API** | Axios |

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

Clone the repository and install all dependencies:

```bash
npm run install-all
```

### Running the Application

To start both the frontend and backend simultaneously:

```bash
npm run dev
```

The application will be available at:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`

## 📊 AI Scoring Algorithm

The AI assigns jobs using the following formula:

$$Score = (\frac{1}{Distance} \times 40) + (SkillMatch \times 30) + (Rating \times 20) + (Availability \times 10)$$

The highest-scoring professional who is currently available is automatically dispatched.

---

Built with ❤️ for the Hackathon 2026.
