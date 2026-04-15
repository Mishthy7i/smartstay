# 🏠 Smart Student Housing Discovery Platform  
### Priority-Based Swipe Recommendation System (PWA)

---

## 📌 Problem Statement

Finding suitable rental accommodation near colleges is a stressful and inefficient process for students, especially those relocating from other cities. Existing solutions such as brokers, social media groups, and generic property platforms are not designed specifically for students and often result in:

- Fake or outdated listings  
- High brokerage fees  
- Poor personalization  
- Information overload  
- Static, non-adaptive recommendations  

Students have highly individual preferences such as distance from college, budget, safety, furnishing, and amenities. However, most platforms treat all users similarly and rely heavily on manual filtering, leading to repeated searching, decision fatigue, and compromised housing decisions.

There is a strong need for a **student-centric, intelligent rental platform** that dynamically adapts to user preferences while ensuring **safety, transparency, and ease of use**.

---

## 🎯 Proposed Solution

A **Progressive Web App (PWA)** built specifically for student rentals near colleges, powered by a **Priority-Based + Swipe-Based Recommendation Engine**.

The platform connects students directly with nearby landlords and continuously improves room recommendations by combining:

- **Explicit preferences** (user-defined priorities)
- **Implicit behavior** (swipe interactions)

This results in a smarter, personalized, and evolving rental discovery experience.

---

## 🧠 Key Innovation: Priority + Swipe-Based Recommendation Engine

### 1️⃣ Priority-Based Onboarding

During first-time onboarding, students provide minimal yet essential details:

- College name  
- Budget range  
- Room type  
- Distance preference  
- Safety / gender preference (optional)  

Users then **rank or assign priority** to key factors:

- 📍 Distance from college  
- 💰 Rent  
- 🛏 Furnishing & amenities  
- 🚺 Safety / gender preference  

**Example:**
- Distance >>> Rent >>> Furnishing

Each priority is converted into **weighted scores**, guiding the initial recommendation logic.

---

### 2️⃣ Swipe-Based Preference Learning

Students interact with listings using a **swipe-based interface**:

- 👉 Right Swipe → Like  
- 👈 Left Swipe → Dislike  

Each swipe is recorded and analyzed to identify behavioral patterns. Over time, the system learns:

- Preferred rent range  
- Ideal distance from college  
- Room type preferences  
- Importance of amenities  

The recommendation engine dynamically **re-adjusts feature weights**, ensuring future recommendations reflect **real user behavior**, not just initial inputs.

---

### 3️⃣ Smart & Safe Recommendations

- Female users are shown women-friendly or women-only accommodations by default  
- Listings are ranked using a weighted scoring algorithm  
- Transparent explanations are shown (e.g., *“Recommended because it matches your top priority: Distance”*)  

---


### 🔄 Data Flow Explanation

1. **User Interaction**
   - Students and landlords access the platform via a browser or installed PWA.

2. **Frontend Layer**
   - Built using React + Vite.
   - Handles UI, swipe interactions, onboarding, and preference ranking.
   - Uses Firebase SDK for authentication and secure communication.

3. **Authentication**
   - Firebase Authentication manages user identity (Google Sign-In / Email).
   - Secure tokens are sent with API requests.

4. **Backend (FastAPI)**
   - Exposes REST APIs for listings, swipes, preferences, and recommendations.
   - Implements priority-based weighted scoring.
   - Continuously updates recommendation logic using swipe data.

5. **Database & Storage**
   - Cloud Firestore stores user profiles, preferences, swipe history, and listings.
   - Firebase Storage stores room images and media.

6. **Location Services**
   - Google Maps & Geocoding APIs calculate distances between college and listings.
   - Distance data feeds directly into recommendation scoring.

7. **Deployment**
   - Frontend deployed on Firebase Hosting.
   - Backend containerized with Docker and deployed on Google Cloud Run.

---

## 🔧 Platform Features

### 👨‍🎓 For Students
- College-based rental discovery  
- Swipe-based room browsing  
- Personalized recommendations  
- Priority-based preference control  
- Save / bookmark rooms  
- Direct landlord contact (no broker)  

### 🏠 For Landlords
- Easy room / PG / flat listing  
- Upload photos, rules, and rent details  
- Reach genuine student tenants  
- Efficient inquiry management  

---

## 🌐 Why Progressive Web App (PWA)?

- App-like experience without Play Store installation  
- Installable on mobile devices  
- Fast loading on low internet  
- Offline access to saved listings  
- Ideal for admission and relocation seasons  

---

## 🏆 Impact & Benefits

- Reduces stress and search time for students  
- Eliminates brokerage dependency  
- Improves decision-making through personalization  
- Encourages safe and transparent student housing  
- Provides landlords with targeted student visibility  

---

## 🧑‍💻 Tech Stack (Google-First)

### 🌐 Frontend
- React + Vite  
- Progressive Web App (PWA)  
- Material UI (MUI)  
- Firebase Web SDK  
- Google Maps JavaScript API  
- Firebase Hosting  

### 🔐 Authentication
- Firebase Authentication  
- Google Sign-In  
- Email / Password (optional)  

### ⚙ Backend
- FastAPI (Python)  
- Docker  
- Google Cloud Run  
- Google Cloud Build (optional CI/CD)  

### 🗄 Database & Storage
- Cloud Firestore  
- Firebase Storage  

### 🧠 Recommendation Engine
- Rule-based + behavior-driven logic  
- Priority-based weighted scoring  
- Swipe learning algorithm  

### 🔒 Security & Monitoring (Optional)
- Firebase Security Rules  
- Firebase App Check  
- Google Cloud Logging  

---

## 🔮 Future Scope

- ML-based collaborative filtering  
- Roommate matching using similar swipe patterns  
- Review and rating system  
- AI-based fraud detection  
- Expansion to multiple colleges and cities  

---

## ✅ Conclusion

By integrating **priority-based onboarding** with **swipe-driven behavioral learning**, this platform transforms traditional rental searching into an intelligent, engaging, and student-first experience.

The solution directly addresses real-world accommodation challenges faced by students while remaining **feasible, scalable, and impactful**, making it ideal for hackathons and real-world deployment.

---

### 🚀 Built for Students. Powered by Intelligence. Designed for Scale.


