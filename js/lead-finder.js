/* =====================================================
   Lead Finder — SerpApi integration
   Finds businesses, checks for websites, renders cards
   ===================================================== */

const LeadFinder = (() => {
    let currentResults = [];
    let isSearching = false;

    /**
     * Search for businesses using SerpApi
     */
    async function search(domainId, countryId, city, noWebsiteOnly) {
        const domain = Config.getDomain(domainId);
        const country = Config.getCountry(countryId);
        if (!domain || !country) {
            showToast('Please select both a domain and country', 'error');
            return [];
        }

        isSearching = true;
        const searchQuery = `${domain.searchQuery} in ${city ? city + ', ' : ''}${country.name}`;

        return searchLive(searchQuery, domain, country, noWebsiteOnly);
    }

    /**
     * Live search using SerpApi Google Local Scraper via CORS proxy
     */
    async function searchLive(query, domain, country, noWebsiteOnly) {
        try {
            const apiKey = Config.getApiKey();
            // Use our local Node.js proxy server to completely bypass CORS restrictions
            const proxyUrl = `/api/search?q=${encodeURIComponent(query)}&api_key=${encodeURIComponent(apiKey)}`;
            
            const response = await fetch(proxyUrl);
            let data;
            try {
                data = await response.json();
            } catch (e) {
                // If it fails to parse JSON (e.g. 404 HTML page on static hosting)
                if (!response.ok) {
                    showToast('Backend API not found. You must run the server.js proxy locally, or host on Vercel.', 'error');
                    return [];
                }
                throw e;
            }
            
            if (!response.ok || data.error) {
                if (data.error === 'Missing_API_Key') {
                    showToast('API Key required. Please provide it in the setup window.', 'error');
                    document.getElementById('apiKeyModal').classList.add('active');
                } else {
                    showToast(`SerpApi Error: ${data.error || 'Request failed'}`, 'error');
                }
                isSearching = false;
                return [];
            }
            
            const results = data.local_results || [];

            // Map SerpApi results to our standard format
            let leads = results.map(place => ({
                placeId: place.place_id || Math.random().toString(36).substr(2, 9),
                name: place.title || 'Unknown Business',
                businessType: place.type || '',
                address: place.address || '',
                rating: place.rating || 0,
                totalRatings: place.reviews || 0,
                hasWebsite: !!(place.links?.website || place.website),
                website: place.links?.website || place.website || null,
                phone: place.phone || null,
                photos: place.thumbnail ? [place.thumbnail] : [],
                icon: place.thumbnail,
                location: place.gps_coordinates ? {
                    lat: place.gps_coordinates.latitude,
                    lng: place.gps_coordinates.longitude,
                } : null,
                _needsDetails: false, // SerpApi gives us everything in one go!
                _domain: domain,
                _country: country,
                reviews: [], // Can be enriched later if needed
                hours: place.hours ? [place.hours] : []
            }));

            if (noWebsiteOnly) {
                leads = leads.filter(l => !l.hasWebsite);
            }

            currentResults = leads;
            isSearching = false;
            return leads;
        } catch (err) {
            console.error('Search failed:', err);
            showToast('Search failed to execute. Check console.', 'error');
            isSearching = false;
            return [];
        }
    }

    /**
     * Legacy method: with SerpApi we get details in the initial search.
     * We just return the already-fetched lead to keep App.js compatible.
     */
    function getPlaceDetails(placeId) {
        return new Promise((resolve) => {
            const lead = getLeadById(placeId);
            resolve(lead || null);
        });
    }

    /**
     * Get local competitors that HAVE websites
     */
    async function getCompetitors(lead) {
        const domain = lead._domain || Config.getDomain('all');
        const country = lead._country || { name: 'USA', code: 'us' };
        // We do a fresh live search for the same city/domain, but KEEP websites
        const query = `${domain.searchQuery} in ${lead.address}`;
        const allResults = await searchLive(query, domain, country, false);
        
        // Filter out the lead itself, and ONLY return businesses WITH websites
        return allResults
            .filter(r => r.hasWebsite && r.placeId !== lead.placeId)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 3); // Return top 3 competitors
    }

    /**
     * Render lead cards to the results grid
     */
    function renderResults(leads, container, domain, country) {
        container.innerHTML = '';

        if (leads.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; padding: 40px;">
                    <div class="empty-icon">🔍</div>
                    <h3>No results found</h3>
                    <p>Try a different domain, country, or city combination.</p>
                </div>`;
            return;
        }

        leads.forEach((lead, index) => {
            const card = document.createElement('div');
            card.className = 'lead-card';
            card.style.animationDelay = `${index * 0.05}s`;

            const websiteBadge = lead.hasWebsite === null
                ? '<span class="badge">⏳ Checking...</span>'
                : lead.hasWebsite
                    ? '<span class="badge badge-has-website">✅ Has Website</span>'
                    : '<span class="badge badge-no-website">❌ No Website</span>';

            card.innerHTML = `
                <div class="lead-card-header">
                    <div class="lead-card-name">${domain.icon} ${escHtml(lead.name)}</div>
                    ${lead.rating > 0 ? `
                    <div class="lead-card-rating">
                        ⭐ ${lead.rating.toFixed(1)}
                        <span style="color: var(--text-muted); font-weight: 400; font-size: 12px;">(${lead.totalRatings})</span>
                    </div>` : ''}
                </div>
                <div class="lead-card-address">📍 ${escHtml(lead.address)}</div>
                ${lead.phone ? `<div class="lead-card-phone">📞 <a href="tel:${lead.phone.replace(/[^0-9+]/g, '')}" style="color:inherit;text-decoration:none;">${escHtml(lead.phone)}</a></div>` : `<div class="lead-card-phone"><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name + ' ' + lead.address)}" target="_blank" style="color:var(--accent-primary);text-decoration:none;font-weight:500;">📞 Find Phone on Maps ↗</a></div>`}
                <div class="lead-card-meta">
                    ${websiteBadge}
                    <span class="badge">${domain.id === 'all' && lead.businessType ? escHtml(lead.businessType) : escHtml(domain.name)}</span>
                </div>
                <div class="lead-card-actions">
                    ${!lead.hasWebsite ? `
                    <button class="btn btn-primary btn-sm" onclick="App.generateDemo('${lead.placeId}')">
                        🖥️ Generate Demo
                    </button>` : ''}
                    <button class="btn btn-secondary btn-sm" onclick="App.generateLeadScript('${lead.placeId}')">
                        📝 Script
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="App.saveLead('${lead.placeId}')">
                        💾
                    </button>
                </div>
            `;

            container.appendChild(card);
        });
    }

    function getLeadById(placeId) {
        return currentResults.find(l => l.placeId === placeId);
    }

    function escHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /**
     * Export leads to CSV
     */
    function exportCsv(leads) {
        const headers = ['Name', 'Address', 'Phone', 'Rating', 'Reviews', 'Has Website', 'Website URL', 'Domain', 'Country', 'Demo Link', 'Sales Script'];
        const rows = leads.map(l => {
            const domain = l._domain || { name: 'Business' };
            const country = l._country || { name: 'Country' };
            
            // Generate synchronous english script for the CSV
            let scriptText = '';
            try {
                if (typeof ScriptEngine !== 'undefined') {
                    scriptText = ScriptEngine.generateQuick(l, domain, country).plainText;
                }
            } catch(e) { console.error('CSV Script error:', e); }

            // Generate local demo link
            const demoLink = !l.hasWebsite ? `http://localhost:3847/?demo=${l.placeId}` : '';

            return [
                l.name, l.address, l.phone || '', l.rating, l.totalRatings,
                l.hasWebsite ? 'Yes' : 'No', l.website || '',
                domain.name, country.name,
                demoLink, scriptText
            ];
        });

        const csv = [headers, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return {
        search, getPlaceDetails, renderResults,
        getLeadById, exportCsv, getCompetitors,
        getCurrentResults: () => currentResults,
    };
})();
