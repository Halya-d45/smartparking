# 🚗 Smart Parking System

A premium, full-stack web application for real-time parking discovery and slot management. Built with a modern, high-performance aesthetic and integrated with real-world geographical data.

![Dashboard Preview](https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1200)

## ✨ Key Features

- **📍 Dynamic Map Discovery**: Uses OpenStreetMap & Overpass API to find parking lots in real-time near any searched location.
- **🔐 Secure Authentication**: Robust Login/Signup system with Bcrypt password hashing and JWT (JSON Web Token) session management.
- **📊 Interactive Dashboard**: Real-time statistics, integrated dark-themed map (CartoDB), and instant availability updates.
- **🅿️ Slot Selection**: User-friendly grid interface for selecting specific parking slots (e.g., P-1, P-2).
- **📅 Booking History**: Comprehensive log of user's active and past parking sessions.
- **💎 Premium UI/UX**: Glassmorphism design, smooth animations, and a fully responsive layout using custom CSS variables.

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, Custom CSS3 (Design System), Leaflet.js (Maps).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB with Mongoose ODM.
- **Security**: Bcryptjs, Jsonwebtoken, Dotenv.
- **APIs**: Overpass API (OpenStreetMap), Nominatim (Geocoding).

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- MongoDB (local or Atlas)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   ```
4. Run the server:
   ```bash
   npm start
   ```
5. Open `http://localhost:5000` in your browser.

## 📱 Mobile Responsive
The application is fully optimized for all screen sizes, from mobile phones to high-resolution desktops.

---
Built with ❤️ for a seamless urban parking experience.
