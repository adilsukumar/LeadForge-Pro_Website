<div align="center">
  
  <img src="https://img.shields.io/badge/LeadForge-Pro-3b82f6?style=for-the-badge&logo=google&logoColor=white" alt="LeadForge Pro" />
  <h1>🚀 LeadForge Pro</h1>
  <p><strong>The Ultimate Geo-Arbitrage & Web Agency Lead Generation Platform</strong></p>
  
  <p>
    <a href="#-features">Features</a> •
    <a href="#-how-it-works">How It Works</a> •
    <a href="#-the-geo-arbitrage-model">Geo-Arbitrage</a> •
    <a href="#-deployment">Deployment</a>
  </p>

  <img src="https://img.shields.io/badge/Version-Premium_Edition-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Status-Live-success?style=flat-square" />
  <img src="https://img.shields.io/badge/Vercel-Ready-black?style=flat-square&logo=vercel" />
</div>

<br/>

LeadForge Pro is a premium, all-in-one international lead generation and website sales platform built for modern digital agencies. It completely automates the process of finding local businesses without websites worldwide, generates customized bilingual sales pitches, and automatically builds hyper-personalized, high-converting demo websites to close deals instantly.

---

## ✨ Features

### 🌍 1. Global Lead Finder
* **SerpApi Integration:** Search real-time Google Maps data directly from the app to find high-value businesses in 40+ countries.
* **"No Website" Filter:** Instantly filter out businesses that already have a website, leaving you with perfect, warm leads.
* **Smart Data Extraction:** Automatically pulls the business name, address, phone number, rating, review counts, and exact business type.

### 🎨 2. Awwwards-Style Demo Website Generator
* **1-Click Generation:** Automatically builds a stunning, customized demo website for *any* lead in under a second.
* **Premium Aesthetics:** Features glassmorphism, parallax scrolling, magnetic cursors, and fluid 60fps animations.
* **Hyper-Personalized:** Demos automatically include the lead's country flag, local currency pricing (e.g., CHF in Switzerland), and tailored copywriting based on their specific industry (e.g., Plumbers vs. Dentists).

### 💬 3. 1-Click WhatsApp & Email Engine
* **WhatsApp Outreach:** Instantly message leads directly to their phone with a single click. The link pre-fills a highly engaging, emoji-rich WhatsApp pitch.
* **Bilingual Translation (MyMemory):** Automatically translates your sales scripts into the lead's native language (French, German, Spanish, etc.) to establish local trust.
* **Cold Email Generator:** Generates a personalized cold email template focusing on their specific market gaps and lost revenue.

### ⚔️ 4. Live Competitor FOMO Analysis
* Generate massive Fear-Of-Missing-Out (FOMO) by analyzing and displaying 2-3 local competitors in their exact city who *do* have websites and are actively stealing their customers.

### 📄 5. Automated PDF Proposals
* Instantly generate and download a sleek, branded 1-page PDF proposal featuring an Executive Summary, Market Opportunity, Interactive Pricing Options, and a formal Signature Line.

### 📊 6. Geo-Arbitrage Priority Matrix
* **Data-Driven Targeting:** Ranks countries based on GDP per capita, English proficiency, digital adoption, and price savings vs. local web developers.
* Identifies the most lucrative, untapped markets (e.g., Switzerland, Norway, Singapore) for you to target.

### 📁 7. Bulk CSV Export
* Export all your saved leads to a beautifully formatted Excel/CSV file.
* Includes direct Demo Website Links and the full translated Sales Scripts inside the spreadsheet for easy CRM import.

---

## 🛠️ How It Works

1. **Find a Market:** Use the Priority Matrix to find a high-GDP country with low local web developer competition (e.g., Roofers in London).
2. **Search Leads:** Click "Search" to scrape Google Maps and instantly filter out businesses that don't have websites.
3. **Generate Demo:** Click "Generate Demo" on a lead. Within 1 second, LeadForge Pro builds a premium, fully customized website with their name and local currency.
4. **Pitch:** Click "WhatsApp" to instantly send them a pre-translated message with a link to their new demo website and a PDF proposal.
5. **Close:** The business owner is blown away by the live demo and the FOMO of their competitors, and hires you instantly!

---

## 🚀 Deployment (Vercel)

LeadForge Pro is perfectly configured for instant, secure deployment to Vercel. 

1. Push this repository to your GitHub account.
2. Go to **[Vercel.com](https://vercel.com/new)** and log in.
3. Click **Add New... -> Project**.
4. Import your `LeadForge-Pro_Website` GitHub repository.
5. In the Environment Variables section, add:
   * **Name:** `SERPAPI_KEY`
   * **Value:** *(Your SerpApi Key)*
6. Click **Deploy**.

> **Note:** The app utilizes Vercel Serverless Functions (`/api/search.js`) to completely hide your API key from the public frontend and bypass all CORS restrictions.

---

## 💻 Local Development

To run the app locally on your own machine without Vercel:

1. Clone the repository.
2. Create a `.env` file in the root directory and add:
   ```env
   SERPAPI_KEY=your_api_key_here
   ```
3. Start the local Node.js proxy server:
   ```bash
   node local-server.js
   ```
4. Open `http://localhost:3847` in your browser.
