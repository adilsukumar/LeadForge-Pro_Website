/* =====================================================
   Script Engine — Bilingual sales scripts per business
   Uses MyMemory Translation API (free, no key needed)
   ===================================================== */

const ScriptEngine = (() => {

    /**
     * Generate a complete sales script for a business
     * @param {Object} business - Business data
     * @param {Object} domain - Domain metadata
     * @param {Object} country - Country metadata
     * @returns {Object} { english: string, native: string, nativeLang: string }
     */
    async function generate(business, domain, country) {
        const englishScript = generateEnglishScript(business, domain, country);

        // Find the primary non-English language
        const nativeLang = country.languages.find(l => l.code !== 'en');
        let nativeScript = null;

        if (nativeLang) {
            try {
                nativeScript = await translateScript(englishScript.plainText, nativeLang.code);
            } catch (e) {
                console.warn('Translation failed:', e);
                nativeScript = `[Translation to ${nativeLang.name} failed — try again or translate manually]`;
            }
        }

        return {
            english: englishScript.html,
            englishPlain: englishScript.plainText,
            native: nativeScript,
            nativeLang: nativeLang ? nativeLang.name : null,
            nativeLangCode: nativeLang ? nativeLang.code : null,
        };
    }

    /**
     * Generate synchronous script (English only) for CSV export
     */
    function generateQuick(business, domain, country) {
        return generateEnglishScript(business, domain, country);
    }

    /**
     * Generate highly personalized cold email
     */
    function generateColdEmail(business, domain, country) {
        const name = business.name || '[Business Name]';
        const city = business.city || getCity(business.address) || '[City]';
        const domainName = domain.name || 'business';
        const rating = business.rating || 0;
        const reviewCount = business.totalRatings || 0;
        
        let intro = `Hi ${name} Team,`;
        let hook = `I was searching for a ${domainName.toLowerCase()} in ${city} and found your Google Maps listing.`;
        
        if (rating > 4.0) {
            hook = `I was searching for a ${domainName.toLowerCase()} in ${city} and was blown away by your ${rating}-star rating! Clearly, you're doing incredible work.`;
        }

        const plainText = `Subject: Quick question about ${name}'s online presence
        
${intro}

${hook}

However, I noticed that you don't currently have a website linked. In today's market, 97% of consumers check a business's website before visiting or calling, which means you might be losing potential clients to local competitors who are easier to find online.

My name is [Your Name], and I specialize in building highly converting websites for ${domainName.toLowerCase()} businesses. Because I work with a talented global team, I can offer premium, modern websites at a fraction of what local web agencies in ${country.name || 'your country'} typically charge.

I've actually taken the liberty of creating a custom demo website specifically for ${name} to show you exactly how it would look and function.

Would you be open to a quick 5-minute chat this week so I can share the demo link with you?

Best regards,
[Your Name]
LeadForge Pro Partner
`;
        
        const html = `
            <div class="script-section">
                <h4>📧 Cold Email Template</h4>
                <div style="background: var(--bg-input); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                    <strong>Subject:</strong> Quick question about ${escHtml(name)}'s online presence<br><br>
                    ${escHtml(intro)}<br><br>
                    ${escHtml(hook)}<br><br>
                    However, I noticed that you don't currently have a website linked. In today's market, 97% of consumers check a business's website before visiting or calling, which means you might be losing potential clients to local competitors who are easier to find online.<br><br>
                    My name is [Your Name], and I specialize in building highly converting websites for ${escHtml(domainName.toLowerCase())} businesses. Because I work with a talented global team, I can offer premium, modern websites at a fraction of what local web agencies in ${escHtml(country.name || 'your country')} typically charge.<br><br>
                    I've actually taken the liberty of creating a custom demo website specifically for ${escHtml(name)} to show you exactly how it would look and function.<br><br>
                    Would you be open to a quick 5-minute chat this week so I can share the demo link with you?<br><br>
                    Best regards,<br>
                    [Your Name]<br>
                    LeadForge Pro Partner
                </div>
            </div>
        `;

        return { plainText, html };
    }

    /**
     * Generate English script with HTML formatting
     */
    function generateEnglishScript(business, domain, country) {
        const name = business.name || '[Business Name]';
        const city = business.city || getCity(business.address) || '[City]';
        const domainName = domain.name || 'business';
        const rating = business.rating || 0;
        const reviewCount = business.totalRatings || 0;
        const phone = business.phone || '[Phone]';
        const hasWebsite = !!business.website;
        const countryName = country.name || '[Country]';

        // Pricing
        const ourPricing = country.ourPricing || { basic: 299, standard: 599, premium: 999, currency: 'USD' };
        const localPricing = country.avgWebsiteCostLocal || { min: 3000, max: 10000 };
        const savings = Math.round((1 - ourPricing.basic / localPricing.min) * 100);

        // Pain points
        const painPoints = domain.painPoints || [];
        const features = domain.websiteFeatures || [];

        // Build script sections
        const opening = `Hi, is this ${name}? My name is [YOUR NAME], and I specialize in building professional websites for ${domainName.toLowerCase()} businesses like yours.

I noticed that ${name} doesn't currently have a website, and I wanted to reach out because I've helped many ${domainName.toLowerCase()} businesses in ${countryName} increase their customer base by 40-60% just by having a professional online presence.

Do you have a quick minute? I'd love to show you something I've already prepared for you.`;

        // Build knowledge section (avoiding nested template literals)
        let ratingLine = '• Your customers speak highly of you — let\'s showcase that online';
        if (rating > 0) {
            ratingLine = '• You have an excellent ' + rating.toFixed(1) + '-star rating';
            if (reviewCount > 0) ratingLine += ' from ' + reviewCount + ' customers';
            ratingLine += ' — that\'s great social proof!';
        }

        let phoneLine = '';
        if (phone) {
            phoneLine = '\n• Your phone number is ' + phone + ' — but customers today want to find you online before calling';
        }

        const painPoint0 = painPoints[0] || ('Most ' + domainName.toLowerCase() + ' businesses are losing 30-50% of potential customers by not being online');
        const painPoint1 = painPoints[1] || 'Your competitors who DO have websites are capturing the leads you could be getting';

        const knowledge = 'Here\'s what I know about your business:\n'
            + '• You\'re ' + name + ', a ' + domainName.toLowerCase() + ' business located in ' + city + ', ' + countryName + '\n'
            + ratingLine
            + phoneLine + '\n'
            + '• ' + painPoint0 + '\n'
            + '• ' + painPoint1;

        const featuresText = features.slice(0, 5).map(function(f) { return '• ' + f; }).join('\n');
        const offer = 'Here\'s what I\'m offering you:\n\n'
            + 'I\'ve actually already created a demo website specifically for ' + name + ' — let me share my screen and show it to you right now.\n\n'
            + 'This website includes:\n'
            + featuresText + '\n'
            + '• Mobile-responsive design (' + getCountryMobileStats(country) + ')\n'
            + '• Google Maps integration so customers can find you\n'
            + '• SEO optimized to rank on Google for "' + domainName.toLowerCase() + ' in ' + city + '"\n\n'
            + 'And here\'s the best part — I\'m based in India, which means I can offer you premium quality at a fraction of what local developers charge.';

        const pricing = `Here's my pricing for ${countryName}:

📦 BASIC — ${ourPricing.currency} ${ourPricing.basic.toLocaleString()} (one-time)
   Complete one-page website, mobile responsive, contact form, Google Maps
   
📦 STANDARD — ${ourPricing.currency} ${ourPricing.standard.toLocaleString()} (one-time)
   Multi-page website, photo gallery, online booking, SEO optimization
   
📦 PREMIUM — ${ourPricing.currency} ${ourPricing.premium.toLocaleString()} (one-time)
   Full custom website, animations, blog, e-commerce integration, 3 months support

Compare this to local developers in ${countryName} who charge ${localPricing.currency} ${localPricing.min.toLocaleString()}-${localPricing.max.toLocaleString()} for similar work. You're saving up to ${savings}%.

Optional: Monthly maintenance at just ${ourPricing.currency} 29/month (hosting, updates, security).`;

        const objections = `COMMON OBJECTIONS & RESPONSES:

❓ "I don't need a website, I get enough business"
→ "That's great to hear! But think about it this way — a website works for you 24/7, even when you're sleeping. ${painPoints[0] || 'Most customers search online before making a decision.'} A website doesn't replace your current business — it multiplies it."

❓ "It's too expensive"
→ "I completely understand budgets are important. But consider this: if your website brings you just ${getMinCustomers(domain)} extra customers a month, that's ${ourPricing.currency} ${getMonthlyRevenue(domain).toLocaleString()} in additional revenue. The website pays for itself in the first month. Plus, local developers in ${countryName} charge ${localPricing.currency} ${localPricing.min.toLocaleString()}+ — I'm offering you premium quality at ${savings}% less."

❓ "I'll think about it"
→ "Of course, take your time. But let me leave you with this — every day without a website is another day your competitors are getting the customers who are searching for you online. I've already built your demo, so whenever you're ready, we can go live in just 48 hours."

❓ "I already use social media"
→ "Social media is great for engagement, but it's not a replacement for a website. A website is YOUR property — you control the branding, the messaging, and most importantly, you own the customer relationship. Plus, Google ranks websites, not social media posts."

❓ "How do I know you'll deliver quality?"
→ "Great question! That's exactly why I've already built a demo for your business — you can see the quality right now. I also offer a 100% satisfaction guarantee. If you're not happy with the final product, you don't pay."`;

        const close = `CLOSING:

So, ${name.split(' ')[0] || 'friend'}, I've already created this demo specifically for your business. I can have the full website live and running within 48-72 hours.

Would you like to go with the Basic, Standard, or Premium package? 

[If hesitant]: How about this — I'll keep the demo live for you for 48 hours so you can share it with your team. If you decide to move forward within this week, I'll include a free Google My Business optimization worth $99.

Thank you for your time, and I look forward to helping ${name} grow online! 🚀`;

        const salesTip = country.salesTip || '';

        // HTML version
        const html = buildScriptHtml(opening, knowledge, offer, pricing, objections, close, salesTip, countryName);

        // Plain text version
        const plainText = `OPENING:\n${opening}\n\nWHAT I KNOW ABOUT YOU:\n${knowledge}\n\nWHAT I'M OFFERING:\n${offer}\n\nPRICING:\n${pricing}\n\nOBJECTION HANDLING:\n${objections}\n\nCLOSING:\n${close}`;

        return { html, plainText };
    }

    /**
     * Replaces HTML logic to include email if requested
     */

    function buildScriptHtml(opening, knowledge, offer, pricing, objections, close, salesTip, countryName) {
        return `
            ${salesTip ? `<div class="script-section" style="border-color: #f472b6; background: rgba(244,114,182,0.05);">
                <h4>🎯 Country Tip: ${escHtml(countryName)}</h4>
                <p><strong>${escHtml(salesTip)}</strong></p>
            </div>` : ''}

            <div class="script-section script-section-opening">
                <h4>📞 Opening Hook</h4>
                <p>${formatScriptText(opening)}</p>
            </div>

            <div class="script-section script-section-knowledge">
                <h4>📋 What I Know About You</h4>
                <p>${formatScriptText(knowledge)}</p>
            </div>

            <div class="script-section script-section-offer">
                <h4>💎 What I'm Offering</h4>
                <p>${formatScriptText(offer)}</p>
            </div>

            <div class="script-section script-section-pricing">
                <h4>💰 Pricing Presentation</h4>
                <p>${formatScriptText(pricing)}</p>
            </div>

            <div class="script-section script-section-objection">
                <h4>🛡️ Objection Handling</h4>
                <p>${formatScriptText(objections)}</p>
            </div>

            <div class="script-section script-section-close">
                <h4>🎯 Close & Next Steps</h4>
                <p>${formatScriptText(close)}</p>
            </div>
        `;
    }

    function formatScriptText(text) {
        return escHtml(text)
            .replace(/\n/g, '<br>')
            .replace(/•/g, '<br>•')
            .replace(/→/g, '<span class="highlight">→</span>')
            .replace(/❓/g, '<br><br>❓')
            .replace(/📦/g, '<br><br>📦')
            .replace(/\[YOUR NAME\]/g, '<span class="highlight">[YOUR NAME]</span>')
            .replace(/\[([^\]]+)\]/g, '<span class="highlight">[$1]</span>');
    }

    /**
     * Translate text using MyMemory API (free, no key needed)
     */
    async function translateScript(text, targetLang) {
        // MyMemory has a 500 char limit per request, so we chunk
        const chunks = chunkText(text, 450);
        const translated = [];

        for (const chunk of chunks) {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|${targetLang}`;
            try {
                const res = await fetch(url);
                const data = await res.json();
                if (data.responseStatus === 200 && data.responseData) {
                    translated.push(data.responseData.translatedText);
                } else {
                    translated.push(chunk); // fallback to original
                }
                // Small delay to respect rate limits
                await new Promise(r => setTimeout(r, 300));
            } catch (e) {
                translated.push(chunk);
            }
        }

        return translated.join(' ');
    }

    function chunkText(text, maxLen) {
        const chunks = [];
        const sentences = text.split(/(?<=[.!?\n])\s+/);
        let current = '';

        for (const sentence of sentences) {
            if ((current + ' ' + sentence).length > maxLen && current) {
                chunks.push(current.trim());
                current = sentence;
            } else {
                current += (current ? ' ' : '') + sentence;
            }
        }
        if (current.trim()) chunks.push(current.trim());
        return chunks;
    }

    function getCity(address) {
        if (!address) return '';
        const parts = address.split(',');
        return parts.length >= 2 ? parts[parts.length - 2].trim() : parts[0].trim();
    }

    function getCountryMobileStats(country) {
        const penetration = country.internetPenetration || 85;
        return `${penetration}% of internet users in ${country.name} use mobile`;
    }

    function getMinCustomers(domain) {
        const potentials = {
            'plumbing': 3, 'electrician': 3, 'hvac': 2, 'restaurant': 20,
            'dental': 5, 'salon': 10, 'gym': 8, 'law_firm': 2,
            'auto_repair': 4, 'bakery': 15, 'cleaning': 8,
        };
        return potentials[domain.id] || 5;
    }

    function getMonthlyRevenue(domain) {
        const revenues = {
            'plumbing': '900-1500', 'electrician': '600-2400', 'hvac': '600-4000',
            'restaurant': '2000-5000', 'dental': '1000-10000', 'salon': '300-1500',
            'gym': '240-800', 'law_firm': '2000-20000', 'auto_repair': '600-4000',
            'bakery': '150-1500', 'cleaning': '800-2400', 'cafe': '500-2000',
        };
        return revenues[domain.id] || '500-2000';
    }

    function escHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /**
     * Quick generate for a lead card (no translation)
     */
    function generateQuick(business, domain, country) {
        return generateEnglishScript(business, domain, country);
    }

    function generateColdEmail(business, domain, country) {
        const name = business.name || '[Business Name]';
        const city = business.city || getCity(business.address) || '[City]';
        const domainName = domain.name || 'business';
        const rating = business.rating || 0;
        
        let intro = `Hi ${name} Team,`;
        let hook = `I was searching for a ${domainName.toLowerCase()} in ${city} and found your Google Maps listing.`;
        
        if (rating > 4.0) {
            hook = `I was searching for a ${domainName.toLowerCase()} in ${city} and was blown away by your ${rating}-star rating! Clearly, you're doing incredible work.`;
        }

        const plainText = `Subject: Quick question about ${name}'s online presence
        
${intro}

${hook}

However, I noticed that you don't currently have a website linked. In today's market, 97% of consumers check a business's website before visiting or calling, which means you might be losing potential clients to local competitors who are easier to find online.

My name is [Your Name], and I specialize in building highly converting websites for ${domainName.toLowerCase()} businesses. Because I work with a talented global team, I can offer premium, modern websites at a fraction of what local web agencies in ${country.name || 'your country'} typically charge.

I've actually taken the liberty of creating a custom demo website specifically for ${name} to show you exactly how it would look and function.

Would you be open to a quick 5-minute chat this week so I can share the demo link with you?

Best regards,
[Your Name]
LeadForge Pro Partner`;
        
        const html = `
            <div class="script-section" style="border-color: var(--accent-secondary);">
                <h4>📧 Cold Email Template</h4>
                <div style="background: var(--bg-input); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                    <strong>Subject:</strong> Quick question about ${escHtml(name)}'s online presence<br><br>
                    ${escHtml(intro)}<br><br>
                    ${escHtml(hook)}<br><br>
                    However, I noticed that you don't currently have a website linked. In today's market, 97% of consumers check a business's website before visiting or calling, which means you might be losing potential clients to local competitors who are easier to find online.<br><br>
                    My name is [Your Name], and I specialize in building highly converting websites for ${escHtml(domainName.toLowerCase())} businesses. Because I work with a talented global team, I can offer premium, modern websites at a fraction of what local web agencies in ${escHtml(country.name || 'your country')} typically charge.<br><br>
                    I've actually taken the liberty of creating a custom demo website specifically for ${escHtml(name)} to show you exactly how it would look and function.<br><br>
                    Would you be open to a quick 5-minute chat this week so I can share the demo link with you?<br><br>
                    Best regards,<br>
                    [Your Name]<br>
                    LeadForge Pro Partner
                </div>
            </div>
        `;

        return { plainText, html };
    }

    function generateWhatsAppScript(business, domain, country) {
        const name = business.name || '[Business Name]';
        const city = business.city || getCity(business.address) || '[City]';
        const domainName = domain.name || 'business';
        const rating = business.rating || 0;
        const reviewCount = business.totalRatings || 0;
        
        const ourPricing = country.ourPricing || { basic: 299, standard: 599, premium: 999, currency: 'USD' };
        
        let hook = `I was searching for a ${domainName.toLowerCase()} in ${city} and found your Google Maps listing.`;
        if (rating > 4.0) {
            hook = `I was searching for a ${domainName.toLowerCase()} in ${city} and was blown away by your *${rating}-star rating* from ${reviewCount} customers!`;
        }

        return `*Hi ${name} Team,* 👋

${hook}

However, I noticed that you don't currently have a website linked. 🚨

In today's market, *97% of consumers check a website before calling*. Without one, you're likely losing potential clients to local competitors who are easier to find online.

My name is [Your Name], and I specialize in building highly converting websites for ${domainName.toLowerCase()} businesses. Because I work with a talented global team, I can offer premium, modern websites at a fraction of local agency costs (starting at just *${ourPricing.currency} ${ourPricing.basic}*).

I've actually taken the liberty of creating a *custom demo website specifically for ${name}* to show you exactly how it would look! 🖥️✨

Would you be open to a quick 5-minute chat this week so I can share the demo link with you?

Best,
*[Your Name]*
_LeadForge Pro Partner_`;
    }

    return {
        generate,
        generateQuick,
        generateColdEmail,
        generateWhatsAppScript,
    };
})();
