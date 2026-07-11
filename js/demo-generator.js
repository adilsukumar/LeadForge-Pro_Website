/* =====================================================
   Demo Generator — Premium Awwwards Style UI/UX
   Features: Light/Dark Mode, Custom Cursor, Parallax, 
   Glassmorphism, Magnetic Buttons, Marquee, 3D Reveals
   ===================================================== */

const DemoGenerator = (() => {

    function generate(business, domain, country) {
        const {
            name = 'Your Business',
            address = '',
            phone = '',
            rating = 0,
            totalRatings = 0,
            reviews = [],
            photos = [],
            hours = [],
            website = '',
        } = business;

        const theme = domain.colorTheme || { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8' };
        const features = domain.websiteFeatures || ['Professional Service', 'Expert Team', '24/7 Support'];
        const domainName = domain.name || 'Business';
        const icon = domain.icon || '🏢';

        // Pick photos
        const heroPhoto = photos[0] || '';
        const galleryPhotos = photos.slice(0, 8); // Need enough for marquee
        // If not enough photos, duplicate for marquee effect
        const marqueePhotos = [...galleryPhotos, ...galleryPhotos, ...galleryPhotos].slice(0, 10);

        const topReviews = reviews.slice(0, 3);
        const starsHtml = generateStars(rating);

        return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escHtml(name)} | Premium ${domainName}</title>
    <!-- Premium Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        ${generateCSS(theme, heroPhoto)}
    </style>
</head>
<body>
    <!-- Custom Cursor -->
    <div class="cursor-dot"></div>
    <div class="cursor-outline"></div>

    <!-- Background Orbs -->
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>

    <!-- Watermark -->
    <div class="demo-watermark">
        <span>✨ Demo Website by LeadForge Pro — This could be YOUR website!</span>
    </div>

    <!-- Navigation -->
    <nav class="nav" id="nav">
        <div class="nav-inner">
            <a class="nav-logo hover-target" href="#">
                <span class="nav-icon">${icon}</span>
                <span class="nav-name">${escHtml(name)}</span>
            </a>
            <div class="nav-links">
                <a href="#about" class="hover-target">About</a>
                <a href="#services" class="hover-target">Services</a>
                ${galleryPhotos.length > 0 ? `<a href="#gallery" class="hover-target">Gallery</a>` : ''}
                ${topReviews.length > 0 ? `<a href="#reviews" class="hover-target">Reviews</a>` : ''}
                <button class="theme-toggle hover-target" id="themeToggle" aria-label="Toggle Theme">
                    <svg class="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                    <svg class="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                </button>
                <a href="#contact" class="btn btn-primary magnetic hover-target">Get in Touch</a>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero" id="hero">
        <div class="hero-bg" id="heroBg"></div>
        <div class="hero-overlay"></div>
        <div class="container hero-content">
            <div class="hero-badge reveal-item">${escHtml(domainName)} in ${escHtml(getCity(address))}</div>
            <h1 class="hero-title reveal-item">${escHtml(name)}</h1>
            <p class="hero-subtitle reveal-item">Experience premium ${escHtml(domainName.toLowerCase())} services that elevate your lifestyle.</p>
            
            ${rating > 0 ? `
            <div class="hero-rating reveal-item">
                <div class="stars">${starsHtml}</div>
                <span class="rating-text">${rating.toFixed(1)} / 5.0 ${totalRatings > 0 ? `(${totalRatings} Reviews)` : ''}</span>
            </div>` : ''}
            
            <div class="hero-actions reveal-item">
                <a href="#contact" class="btn btn-primary magnetic hover-target">
                    <span>Book Consultation</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
                <a href="#services" class="btn btn-glass magnetic hover-target">Explore Services</a>
            </div>
        </div>
        <div class="scroll-indicator">
            <div class="mouse"></div>
        </div>
    </section>

    <!-- About Section -->
    <section class="section" id="about">
        <div class="container">
            <div class="split-layout">
                <div class="split-text">
                    <div class="section-tag reveal-scroll">Our Story</div>
                    <h2 class="section-title reveal-scroll">Redefining <span class="gradient-text">${escHtml(domainName)}</span> Standard.</h2>
                    <p class="section-desc reveal-scroll">
                        Located in the heart of ${escHtml(getCity(address))}, ${escHtml(name)} provides unparalleled service. 
                        ${rating >= 4 ? `With a ${rating.toFixed(1)}-star reputation, our commitment to excellence is reflected in every interaction.` : 'Our commitment to excellence is reflected in every interaction.'}
                        We blend modern techniques with timeless dedication to bring you the best.
                    </p>
                    <div class="stats-grid reveal-scroll">
                        ${rating > 0 ? `<div class="stat-card glass-card"><div class="stat-num counter" data-target="${rating}">0</div><div class="stat-label">Star Rating</div></div>` : ''}
                        ${totalRatings > 0 ? `<div class="stat-card glass-card"><div class="stat-num"><span class="counter" data-target="${totalRatings}">0</span>+</div><div class="stat-label">Happy Clients</div></div>` : ''}
                        <div class="stat-card glass-card"><div class="stat-num">100%</div><div class="stat-label">Satisfaction</div></div>
                    </div>
                </div>
                <div class="split-image reveal-scroll">
                    <div class="image-wrapper glass-card">
                        ${heroPhoto ? `<img src="${escHtml(heroPhoto)}" alt="About Us" class="parallax-img">` : `<div class="placeholder-img"></div>`}
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Services Section -->
    <section class="section section-alternate" id="services">
        <div class="container">
            <div class="section-header center">
                <div class="section-tag reveal-scroll">What We Do</div>
                <h2 class="section-title reveal-scroll">Signature Services</h2>
                <p class="section-desc reveal-scroll">Tailored solutions designed specifically for your needs.</p>
            </div>
            <div class="services-grid">
                ${features.map((feature, i) => `
                <div class="service-card glass-card hover-target reveal-scroll" style="transition-delay: ${i * 0.1}s">
                    <div class="service-icon-wrap">
                        <div class="service-icon">${getServiceIcon(feature)}</div>
                    </div>
                    <h3>${escHtml(feature)}</h3>
                    <p>Experience the highest quality ${escHtml(feature.toLowerCase())}. We ensure every detail is perfect.</p>
                    <a href="#contact" class="service-link">Learn more <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
                </div>`).join('')}
            </div>
        </div>
    </section>

    ${marqueePhotos.length > 0 ? `
    <!-- Gallery Marquee -->
    <section class="section marquee-section" id="gallery">
        <div class="section-tag reveal-scroll" style="margin-left: 5vw;">Visuals</div>
        <h2 class="section-title reveal-scroll" style="margin-left: 5vw; margin-bottom: 40px;">Our Portfolio</h2>
        <div class="marquee-container hover-target">
            <div class="marquee-track">
                ${marqueePhotos.map(photo => `<div class="marquee-item"><img src="${escHtml(photo)}" alt="Gallery"></div>`).join('')}
                ${marqueePhotos.map(photo => `<div class="marquee-item"><img src="${escHtml(photo)}" alt="Gallery"></div>`).join('')}
            </div>
        </div>
    </section>` : ''}

    ${topReviews.length > 0 ? `
    <!-- Reviews -->
    <section class="section" id="reviews">
        <div class="container">
            <div class="section-header center">
                <div class="section-tag reveal-scroll">Testimonials</div>
                <h2 class="section-title reveal-scroll">Client Success Stories</h2>
            </div>
            <div class="reviews-grid">
                ${topReviews.map((review, i) => `
                <div class="review-card glass-card reveal-scroll" style="transition-delay: ${i * 0.15}s">
                    <div class="review-quote">"</div>
                    <div class="review-stars">${generateStars(review.rating || 5)}</div>
                    <p class="review-text">${escHtml(review.text || 'An absolutely phenomenal experience. Highly recommended!')}</p>
                    <div class="review-author">
                        <div class="review-avatar">${(review.author || 'A').charAt(0).toUpperCase()}</div>
                        <div class="review-meta">
                            <div class="review-name">${escHtml(review.author || 'Valued Client')}</div>
                            <div class="review-date">${escHtml(review.time || 'Recent')}</div>
                        </div>
                    </div>
                </div>`).join('')}
            </div>
        </div>
    </section>` : ''}

    <!-- Contact Section -->
    <section class="section section-alternate" id="contact">
        <div class="container">
            <div class="split-layout">
                <div class="contact-form-wrapper glass-card reveal-scroll">
                    <h3 style="font-family: 'Outfit', sans-serif; font-size: 28px; margin-bottom: 8px;">Let's Talk</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 32px; font-size: 15px;">Send us a message and we'll get back to you shortly.</p>
                    <div class="form-group">
                        <input type="text" placeholder="Full Name" class="input-field">
                    </div>
                    <div class="form-group">
                        <input type="email" placeholder="Email Address" class="input-field">
                    </div>
                    <div class="form-group">
                        <textarea placeholder="How can we help?" rows="4" class="input-field"></textarea>
                    </div>
                    <button class="btn btn-primary btn-full magnetic hover-target">Send Request</button>
                </div>
                <div class="contact-info reveal-scroll">
                    <div class="section-tag">Contact Info</div>
                    <h2 class="section-title">Visit <span class="gradient-text">Us</span></h2>
                    
                    <div class="info-list">
                        ${address ? `
                        <div class="info-item hover-target">
                            <div class="info-icon">📍</div>
                            <div class="info-content">
                                <h4>Location</h4>
                                <p>${escHtml(address)}</p>
                            </div>
                        </div>` : ''}
                        
                        ${phone ? `
                        <div class="info-item hover-target">
                            <div class="info-icon">📞</div>
                            <div class="info-content">
                                <h4>Phone</h4>
                                <p>${escHtml(phone)}</p>
                            </div>
                        </div>` : ''}
                        
                        ${hours.length > 0 ? `
                        <div class="info-item hover-target">
                            <div class="info-icon">🕒</div>
                            <div class="info-content">
                                <h4>Business Hours</h4>
                                ${hours.map(h => `<p>${escHtml(h)}</p>`).join('')}
                            </div>
                        </div>` : ''}
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-inner">
                <div class="footer-brand">
                    <span class="nav-icon">${icon}</span>
                    <span>${escHtml(name)}</span>
                </div>
                <p class="footer-desc">Providing premium ${escHtml(domainName.toLowerCase())} experiences since day one.</p>
                <div class="footer-links">
                    <a href="#about" class="hover-target">About</a>
                    <a href="#services" class="hover-target">Services</a>
                    <a href="#contact" class="hover-target">Contact</a>
                </div>
                <div class="footer-bottom">
                    <p>© ${new Date().getFullYear()} ${escHtml(name)}. All rights reserved.</p>
                    <p style="opacity: 0.5; font-size: 12px;">Demo by LeadForge Pro</p>
                </div>
            </div>
        </div>
    </footer>

    <script>
        ${generateJS()}
    </script>
</body>
</html>`;
    }

    function generateCSS(theme, heroPhoto) {
        return `
        :root {
            /* Theme Colors (Injected) */
            --primary: ${theme.primary};
            --secondary: ${theme.secondary};
            --accent: ${theme.accent};
        }

        /* Light/Dark Mode Variables */
        [data-theme="dark"] {
            --bg-base: #050505;
            --bg-alt: #0a0a0a;
            --text-main: #f5f5f7;
            --text-secondary: #a1a1aa;
            --glass-bg: rgba(25, 25, 25, 0.4);
            --glass-border: rgba(255, 255, 255, 0.08);
            --glass-highlight: rgba(255, 255, 255, 0.1);
            --nav-bg: rgba(5, 5, 5, 0.7);
        }

        [data-theme="light"] {
            --bg-base: #fafafa;
            --bg-alt: #f4f4f5;
            --text-main: #09090b;
            --text-secondary: #52525b;
            --glass-bg: rgba(255, 255, 255, 0.6);
            --glass-border: rgba(0, 0, 0, 0.08);
            --glass-highlight: rgba(255, 255, 255, 0.5);
            --nav-bg: rgba(250, 250, 250, 0.7);
        }

        /* Reset & Base */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        html { scroll-behavior: smooth; cursor: none; }
        
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--bg-base);
            color: var(--text-main);
            line-height: 1.6;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
            transition: background-color 0.5s ease, color 0.5s ease;
        }

        h1, h2, h3, h4, .nav-logo { font-family: 'Outfit', sans-serif; }
        
        a { text-decoration: none; color: inherit; cursor: none; }
        button, input, textarea { font-family: inherit; cursor: none; }

        /* Custom Cursor */
        .cursor-dot {
            position: fixed; top: 0; left: 0; width: 8px; height: 8px;
            background: var(--primary); border-radius: 50%;
            pointer-events: none; z-index: 10000;
            transform: translate(-50%, -50%);
            transition: transform 0.1s ease;
        }
        .cursor-outline {
            position: fixed; top: 0; left: 0; width: 40px; height: 40px;
            border: 1px solid var(--primary); border-radius: 50%;
            pointer-events: none; z-index: 9999;
            transform: translate(-50%, -50%);
            transition: width 0.3s, height 0.3s, background 0.3s, border-color 0.3s;
            transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cursor-hover .cursor-outline {
            width: 60px; height: 60px;
            background: rgba(var(--primary-rgb, 99,102,241), 0.1);
            border-color: transparent;
            mix-blend-mode: difference;
        }

        /* Background Orbs */
        .orb {
            position: fixed; border-radius: 50%; filter: blur(100px);
            z-index: -1; opacity: 0.4; pointer-events: none;
        }
        [data-theme="light"] .orb { opacity: 0.2; }
        .orb-1 {
            width: 40vw; height: 40vw; background: var(--primary);
            top: -10vw; left: -10vw; animation: float1 20s infinite ease-in-out alternate;
        }
        .orb-2 {
            width: 30vw; height: 30vw; background: var(--secondary);
            bottom: 10vw; right: -5vw; animation: float2 25s infinite ease-in-out alternate;
        }
        .orb-3 {
            width: 35vw; height: 35vw; background: var(--accent);
            top: 40vh; left: 30vw; animation: float3 30s infinite ease-in-out alternate;
        }
        @keyframes float1 { 100% { transform: translate(10vw, 10vh) scale(1.1); } }
        @keyframes float2 { 100% { transform: translate(-15vw, -5vh) scale(1.2); } }
        @keyframes float3 { 100% { transform: translate(5vw, -10vh) scale(0.9); } }

        /* Typography & Utilities */
        .container { max-width: 1280px; margin: 0 auto; padding: 0 5vw; }
        .gradient-text {
            background: linear-gradient(135deg, var(--primary), var(--accent));
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .section { padding: 120px 0; position: relative; }
        .section-alternate { background: var(--bg-alt); }
        .center { text-align: center; }

        .section-tag {
            display: inline-block; padding: 6px 16px; border-radius: 100px;
            background: rgba(var(--primary-rgb, 99,102,241), 0.1);
            border: 1px solid var(--primary);
            font-size: 12px; font-weight: 700; color: var(--primary);
            text-transform: uppercase; letter-spacing: 2px; margin-bottom: 24px;
        }
        .section-title { font-size: clamp(32px, 5vw, 56px); font-weight: 800; line-height: 1.1; margin-bottom: 24px; letter-spacing: -1px; }
        .section-desc { font-size: 18px; color: var(--text-secondary); max-width: 600px; line-height: 1.7; margin-bottom: 48px; }
        .center .section-desc { margin-left: auto; margin-right: auto; }

        /* Glassmorphism */
        .glass-card {
            background: var(--glass-bg);
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-top: 1px solid var(--glass-highlight);
            border-radius: 24px;
            box-shadow: 0 30px 60px rgba(0,0,0,0.05);
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
        }
        .glass-card:hover { transform: translateY(-8px); box-shadow: 0 40px 80px rgba(0,0,0,0.1); border-color: var(--primary); }

        /* Watermark */
        .demo-watermark {
            position: fixed; top: 0; left: 0; right: 0; z-index: 10000;
            background: linear-gradient(90deg, var(--primary), var(--secondary), var(--primary));
            background-size: 200% 100%; animation: shimmer 3s linear infinite;
            color: white; text-align: center; padding: 6px; font-size: 12px; font-weight: 600;
        }
        @keyframes shimmer { 100% { background-position: -200% 0; } }

        /* Navigation */
        .nav {
            position: fixed; top: 32px; left: 0; right: 0; z-index: 1000;
            padding: 0 5vw; transition: top 0.4s, padding 0.4s;
        }
        .nav-inner {
            background: var(--nav-bg); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
            border: 1px solid var(--glass-border); border-radius: 100px;
            padding: 12px 24px; display: flex; align-items: center; justify-content: space-between;
            max-width: 1280px; margin: 0 auto;
        }
        .nav.scrolled { top: 12px; }
        .nav-logo { display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 800; }
        .nav-icon { font-size: 24px; }
        .nav-links { display: flex; align-items: center; gap: 24px; }
        .nav-links a { font-size: 14px; font-weight: 600; color: var(--text-secondary); transition: color 0.3s; }
        .nav-links a:hover { color: var(--text-main); }
        .theme-toggle {
            background: transparent; border: none; color: var(--text-main);
            display: flex; align-items: center; justify-content: center;
            width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--glass-border);
            transition: background 0.3s;
        }
        .theme-toggle:hover { background: var(--glass-border); }
        [data-theme="dark"] .sun-icon { display: block; }
        [data-theme="dark"] .moon-icon { display: none; }
        [data-theme="light"] .sun-icon { display: none; }
        [data-theme="light"] .moon-icon { display: block; }

        /* Buttons */
        .btn {
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            padding: 14px 28px; border-radius: 100px; font-size: 14px; font-weight: 700;
            border: none; position: relative; overflow: hidden;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .btn-primary {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white; box-shadow: 0 10px 30px rgba(var(--primary-rgb, 99,102,241), 0.3);
        }
        .btn-primary:hover { box-shadow: 0 15px 40px rgba(var(--primary-rgb, 99,102,241), 0.5); }
        .btn-glass {
            background: var(--glass-bg); backdrop-filter: blur(10px);
            border: 1px solid var(--glass-border); color: var(--text-main);
        }
        .btn-glass:hover { background: rgba(255,255,255,0.1); border-color: var(--primary); }
        .btn-full { width: 100%; }

        /* Hero */
        .hero {
            position: relative; min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
            padding-top: 80px; overflow: hidden;
        }
        .hero-bg {
            position: absolute; top: -10%; left: 0; right: 0; bottom: -10%;
            background: ${heroPhoto ? `url('${heroPhoto}') center/cover no-repeat` : `linear-gradient(135deg, var(--primary), var(--bg-base))`};
            z-index: -2; will-change: transform;
        }
        .hero-overlay {
            position: absolute; inset: 0; z-index: -1;
            background: linear-gradient(180deg, var(--bg-base) 0%, transparent 40%, var(--bg-base) 100%),
                        radial-gradient(circle at center, transparent 0%, var(--bg-base) 100%);
            opacity: 0.9;
        }
        [data-theme="light"] .hero-overlay { opacity: 0.95; }
        
        .hero-content { text-align: center; max-width: 900px; z-index: 1; }
        .hero-badge { margin: 0 auto 24px; }
        .hero-title { font-size: clamp(48px, 8vw, 96px); font-weight: 800; letter-spacing: -2px; line-height: 1.05; margin-bottom: 24px; }
        .hero-subtitle { font-size: clamp(18px, 2vw, 24px); max-width: 700px; margin: 0 auto 40px; color: var(--text-secondary); }
        .hero-actions { display: flex; gap: 16px; justify-content: center; }
        .hero-rating { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 32px; }
        .stars { display: flex; gap: 4px; color: #fbbf24; font-size: 20px; }
        .star-empty { color: var(--glass-border); }

        .scroll-indicator { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); }
        .mouse {
            width: 26px; height: 40px; border: 2px solid var(--text-secondary); border-radius: 20px;
            position: relative;
        }
        .mouse::before {
            content: ''; position: absolute; top: 6px; left: 50%; transform: translateX(-50%);
            width: 4px; height: 6px; background: var(--text-secondary); border-radius: 2px;
            animation: scrollWheel 2s infinite;
        }
        @keyframes scrollWheel { 0% { transform: translate(-50%, 0); opacity: 1; } 100% { transform: translate(-50%, 12px); opacity: 0; } }

        /* Layouts */
        .split-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        
        /* Stats */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 20px; margin-top: 40px; }
        .stat-card { padding: 24px; text-align: center; }
        .stat-num { font-size: 36px; font-weight: 800; font-family: 'Outfit', sans-serif; color: var(--primary); margin-bottom: 4px; line-height: 1; }
        .stat-label { font-size: 13px; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }

        /* Image Parallax */
        .image-wrapper { position: relative; overflow: hidden; aspect-ratio: 4/5; border-radius: 24px; }
        .parallax-img { width: 100%; height: 120%; object-fit: cover; position: absolute; top: -10%; left: 0; will-change: transform; }
        .placeholder-img { width: 100%; height: 100%; background: linear-gradient(135deg, var(--glass-bg), transparent); }

        /* Services Grid */
        .services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
        .service-card { padding: 40px 32px; display: flex; flex-direction: column; }
        .service-icon-wrap {
            width: 64px; height: 64px; border-radius: 16px;
            background: rgba(var(--primary-rgb, 99,102,241), 0.1);
            display: flex; align-items: center; justify-content: center;
            font-size: 28px; margin-bottom: 24px; border: 1px solid var(--glass-border);
        }
        .service-card h3 { font-size: 22px; margin-bottom: 12px; }
        .service-card p { color: var(--text-secondary); flex-grow: 1; margin-bottom: 24px; }
        .service-link { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; color: var(--primary); }
        .service-link svg { transition: transform 0.3s; }
        .service-card:hover .service-link svg { transform: translateX(4px); }

        /* Marquee */
        .marquee-section { padding: 80px 0; overflow: hidden; }
        .marquee-container {
            width: 100%; overflow: hidden; display: flex;
            mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        .marquee-track { display: flex; gap: 24px; padding: 0 12px; width: max-content; animation: marquee 30s linear infinite; }
        .marquee-container:hover .marquee-track { animation-play-state: paused; }
        .marquee-item { width: 300px; height: 400px; border-radius: 24px; overflow: hidden; flex-shrink: 0; }
        .marquee-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
        .marquee-item:hover img { transform: scale(1.05); }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-50% - 12px)); } }

        /* Reviews */
        .reviews-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
        .review-card { padding: 32px; position: relative; }
        .review-quote { position: absolute; top: 16px; right: 24px; font-size: 80px; font-family: serif; color: var(--glass-border); line-height: 1; }
        .review-stars { margin-bottom: 20px; font-size: 16px; }
        .review-text { font-size: 16px; font-style: italic; color: var(--text-main); margin-bottom: 32px; line-height: 1.8; position: relative; z-index: 1; }
        .review-author { display: flex; align-items: center; gap: 16px; }
        .review-avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; color: white; }
        .review-name { font-weight: 700; font-size: 16px; }
        .review-date { font-size: 13px; color: var(--text-secondary); }

        /* Contact Info */
        .contact-form-wrapper { padding: 48px; }
        .input-field { width: 100%; background: var(--bg-base); border: 1px solid var(--glass-border); border-radius: 12px; padding: 16px; color: var(--text-main); font-size: 15px; outline: none; transition: border-color 0.3s; }
        .input-field:focus { border-color: var(--primary); }
        .form-group { margin-bottom: 16px; }
        
        .info-list { margin-top: 32px; display: flex; flex-direction: column; gap: 24px; }
        .info-item { display: flex; gap: 20px; align-items: flex-start; }
        .info-icon { width: 48px; height: 48px; border-radius: 50%; background: var(--glass-bg); border: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .info-content h4 { font-size: 18px; margin-bottom: 8px; }
        .info-content p { color: var(--text-secondary); font-size: 15px; }

        /* Footer */
        .footer { padding: 80px 0 40px; border-top: 1px solid var(--glass-border); }
        .footer-inner { display: flex; flex-direction: column; align-items: center; text-align: center; }
        .footer-brand { display: flex; align-items: center; gap: 8px; font-size: 24px; font-weight: 800; margin-bottom: 16px; font-family: 'Outfit', sans-serif; }
        .footer-desc { color: var(--text-secondary); margin-bottom: 32px; max-width: 400px; }
        .footer-links { display: flex; gap: 32px; margin-bottom: 48px; font-weight: 600; }
        .footer-bottom { width: 100%; display: flex; justify-content: space-between; align-items: center; padding-top: 32px; border-top: 1px solid var(--glass-border); color: var(--text-secondary); font-size: 14px; }

        /* Animations (3D Reveals) */
        .reveal-item { opacity: 0; transform: translateY(40px) rotateX(10deg); transition: opacity 1s cubic-bezier(0.2, 1, 0.3, 1), transform 1s cubic-bezier(0.2, 1, 0.3, 1); }
        .reveal-item.active { opacity: 1; transform: translateY(0) rotateX(0); }
        
        /* Stagger for hero items */
        .hero .reveal-item:nth-child(1) { transition-delay: 0.1s; }
        .hero .reveal-item:nth-child(2) { transition-delay: 0.2s; }
        .hero .reveal-item:nth-child(3) { transition-delay: 0.3s; }
        .hero .reveal-item:nth-child(4) { transition-delay: 0.4s; }
        .hero .reveal-item:nth-child(5) { transition-delay: 0.5s; }

        .reveal-scroll { opacity: 0; transform: translateY(40px); transition: opacity 0.8s cubic-bezier(0.2, 1, 0.3, 1), transform 0.8s cubic-bezier(0.2, 1, 0.3, 1); }
        .reveal-scroll.active { opacity: 1; transform: translateY(0); }

        /* Responsive */
        @media (max-width: 992px) {
            .split-layout { grid-template-columns: 1fr; gap: 40px; }
            .nav-links { display: none; }
            .hero-title { font-size: 48px; }
            .footer-bottom { flex-direction: column; gap: 16px; }
        }
        `;
    }

    function generateJS() {
        return `
        // Custom Cursor
        const cursorDot = document.querySelector('.cursor-dot');
        const cursorOutline = document.querySelector('.cursor-outline');
        const hoverTargets = document.querySelectorAll('.hover-target, a, button, input, textarea');

        let mouseX = 0, mouseY = 0;
        let outlineX = 0, outlineY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.transform = \`translate(\${mouseX}px, \${mouseY}px) translate(-50%, -50%)\`;
        });

        // Smooth trailing for outline
        function animateCursor() {
            outlineX += (mouseX - outlineX) * 0.15;
            outlineY += (mouseY - outlineY) * 0.15;
            cursorOutline.style.transform = \`translate(\${outlineX}px, \${outlineY}px) translate(-50%, -50%)\`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            target.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });

        // Magnetic Buttons
        const magneticBtns = document.querySelectorAll('.magnetic');
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = \`translate(\${x * 0.2}px, \${y * 0.2}px)\`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0px, 0px)';
            });
        });

        // Theme Toggle
        const themeToggle = document.getElementById('themeToggle');
        const html = document.documentElement;
        themeToggle.addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
        });

        // Scroll Reveal Animations
        const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal-scroll').forEach(el => observer.observe(el));

        // Initial Hero Reveal
        setTimeout(() => {
            document.querySelectorAll('.hero .reveal-item').forEach(el => el.classList.add('active'));
        }, 100);

        // Parallax Effects
        const heroBg = document.getElementById('heroBg');
        const parallaxImgs = document.querySelectorAll('.parallax-img');
        const nav = document.getElementById('nav');

        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            
            // Nav shrink
            if (scrolled > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }

            // Hero background parallax
            if (heroBg) {
                heroBg.style.transform = \`translateY(\${scrolled * 0.4}px)\`;
            }

            // Image parallax
            parallaxImgs.forEach(img => {
                const rect = img.parentElement.getBoundingClientRect();
                // Only animate if in viewport
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const progress = 1 - (rect.top / window.innerHeight);
                    img.style.transform = \`translateY(\${-10 + (progress * 20)}%)\`;
                }
            });
        });

        // Number Counter Animation
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    const target = parseFloat(entry.target.getAttribute('data-target'));
                    let current = 0;
                    const increment = target / 40;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        entry.target.textContent = (target % 1 === 0 ? Math.floor(current) : current.toFixed(1));
                    }, 30);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Form prevent default
        document.querySelectorAll('button').forEach(btn => {
            if(btn.id !== 'themeToggle') {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    alert('This is a highly-converting template powered by LeadForge Pro!');
                });
            }
        });
        `;
    }

    function generateStars(rating) {
        if (!rating) return '';
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return '★'.repeat(full) + (half ? '★' : '') + '<span class="star-empty">' + '★'.repeat(empty) + '</span>';
    }

    function getCity(address) {
        if (!address) return 'your area';
        const parts = address.split(',');
        if (parts.length >= 2) {
            return parts[parts.length - 2].trim();
        }
        return 'your area';
    }

    function getServiceIcon(feature) {
        const text = feature.toLowerCase();
        if (text.includes('home') || text.includes('house')) return '🏠';
        if (text.includes('repair') || text.includes('fix')) return '🔧';
        if (text.includes('clean')) return '✨';
        if (text.includes('food') || text.includes('restaurant')) return '🍽️';
        if (text.includes('health') || text.includes('care')) return '⚕️';
        if (text.includes('design') || text.includes('creative')) return '🎨';
        if (text.includes('consult') || text.includes('manage')) return '📊';
        if (text.includes('auto') || text.includes('car')) return '🚗';
        return '💎';
    }

    function escHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    return { generate };
})();
