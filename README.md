# LeadForge Pro

LeadForge Pro is a premium international lead generation and website sales platform. It allows digital agencies to find local businesses without websites worldwide, generate customized bilingual sales scripts, and automatically build hyper-personalized demo websites to close deals.

## Features

### 1. Global Lead Finder
- **SerpApi Integration:** Search Google Maps data directly from the app to find businesses in 40+ countries.
- **"No Website" Filter:** Instantly filter out businesses that already have a website.
- **Smart Data Extraction:** Pulls name, address, phone number, rating, review counts, and business type.

### 2. Live Demo Website Generator
- **Instant Generation:** Automatically builds a stunning, customized demo website for any lead in one click.
- **Premium Aesthetics:** Features Awwwards-style UI/UX with glassmorphism, parallax scrolling, magnetic cursors, and fluid animations.
- **Theme Engine:** Built-in Light/Dark mode toggle for the generated demos.
- **Localized Content:** Demos automatically include the lead's country flag, local currency pricing (e.g., CHF in Switzerland), and tailored services based on their domain.

### 3. Bilingual Sales Script & Cold Email Engine
- **Phone Scripts:** Generates a highly personalized sales script tailored to the lead's domain, rating, and location.
- **Cold Email Outreach:** Generates a personalized cold email template focusing on their specific market gaps.
- **MyMemory Translation:** Automatically translates scripts into the lead's native language (French, German, Spanish, Arabic, etc.) for free using the MyMemory API.
- **WhatsApp Integration:** 1-Click "WhatsApp Outreach" button pre-fills a `wa.me` link with the translated pitch to instantly message the owner.

### 4. Competitor Analysis
- Generates a fear-of-missing-out (FOMO) pitch by analyzing and displaying 2-3 local competitors in the same city who *do* have websites.

### 5. PDF Proposal Generator
- Generates and downloads a sleek, branded 1-page PDF proposal showing the market opportunity, ROI calculations, and pricing strategy.

### 6. Interactive ROI Calculator
- Calculate and demonstrate the exact return on investment for the client based on their average project value and projected new leads.

### 7. Geo-Arbitrage Priority Matrix
- **Data-Driven Targeting:** Ranks countries based on GDP per capita, English proficiency, and price savings vs. local web developers.
- Helps agencies identify the most lucrative markets (e.g., Switzerland, Norway) to target for geo-arbitrage.

### 8. CSV Export
- Export all searched or saved leads to CSV.
- Includes a direct "Demo Link" and the full "Sales Script" directly inside the spreadsheet.

## Deployment to Vercel

LeadForge Pro is configured for instant deployment to Vercel. 

1. Push this repository to GitHub.
2. Import the project in Vercel.
3. In the Vercel project settings, add an Environment Variable:
   - `SERPAPI_KEY` = `your_serpapi_key_here`
4. Deploy!

The app uses Vercel Serverless Functions (`/api/search.js` and `/api/account.js`) to securely proxy SerpApi requests without exposing your API key or running into CORS issues.

## Local Development

To run the app locally without Vercel:

1. Ensure you have Node.js installed.
2. Add your SerpApi key to the Settings tab in the app, or create a `.env` file with `SERPAPI_KEY=your_key`.
3. Run the local proxy server:
   ```bash
   node server.js
   ```
4. Open `http://localhost:3847` in your browser.
