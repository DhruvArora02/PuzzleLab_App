# 🧩 PuzzleLab

**PuzzleLab** is a full-stack web application for creating, editing, and solving crossword puzzles. It allows users to register, manage their puzzles, and enjoy an interactive puzzle-solving experience — all within a responsive and intuitive UI.

---

## 🚀 Features

- 🔐 User authentication with JWT
- ✏️ Manual crossword creation with grid editor
- 🧠 Puzzle solving mode with interactivity
- 📁 User puzzle library (edit/play/share)
- 🖼️ Puzzle preview thumbnails
- ⚙️ Settings and avatar customization
- 📬 Password reset with email support
- 📦 Dockerized setup for easy deployment

---

## 🛠️ Tech Stack

### Frontend
- **React** with **TypeScript**
- **Next.js App Router**
- **Tailwind CSS** for styling
- **ShadCN/UI** components
- **Context API** for state management

### Backend
- **Java 17** with **Quarkus 3.19.1**
- **Hibernate ORM Panache**
- **MySQL** for persistent storage
- **REST API** (JSON with Jackson)
- **JWT-based Authentication**
- **Mailer module** for password recovery

### DevOps & Tools
- **Docker & Docker Compose** – containerized setup
- **Git** and **GitLab** – collaboration and version control
- **VS Code** / **IntelliJ** – development
- **bcrypt** – password hashing

---

## ⚙️ Getting Started

### 🧩 Prerequisites

- Docker + Docker Compose
- Node.js + npm (for frontend dev)
- Java 17
- MySQL (or use Docker container)

---

### 📦 Run the App

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/PuzzleLab.git
   cd PuzzleLab
