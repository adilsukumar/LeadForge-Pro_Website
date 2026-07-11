/* =====================================================
   App.js — Core application logic
   Ties together all modules, handles routing & events
   ===================================================== */

const App = (() => {
    let currentDomain = null;
    let currentCountry = null;

    /**
     * Initialize the application
     */
    async function init() {
        // Load data and init currency
        await Config.loadData();
        await CurrencyEngine.init();

        updateApiStatus(true);
        initTabs();

        // Populate dropdowns
        populateDropdowns();

        // Bind events
        bindEvents();

        // Fetch remaining searches
        updateSearchesLeft();

        // Check for URL parameters (e.g. from CSV links)
        const urlParams = new URLSearchParams(window.location.search);
        const demoId = urlParams.get('demo');
        if (demoId) {
            // Wait a moment for data to settle, then open demo
            setTimeout(() => generateDemo(demoId), 500);
            
            // Clean up URL so it doesn't stay there if they refresh
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    /**
     * Fetch and update remaining SerpApi searches
     */
    async function updateSearchesLeft() {
        try {
            const apiKey = Config.getApiKey() || '';
            const res = await fetch(`/api/account?api_key=${encodeURIComponent(apiKey)}`);
            const data = await res.json();
            
            if (data.searches_per_month && typeof data.plan_searches_left !== 'undefined') {
                const badge = document.getElementById('searchesLeftBadge');
                const count = document.getElementById('searchesLeftCount');
                if (badge && count) {
                    badge.style.display = 'inline-flex';
                    count.textContent = data.plan_searches_left;
                }
            }
        } catch (e) {
            console.error('Failed to fetch remaining searches', e);
        }
    }

    /**
     * Populate all select dropdowns with domain/country data
     */
    function populateDropdowns() {
        const domains = Config.getDomains();
        const countries = Config.getCountries();

        // Group domains by category
        const domainsByCategory = {};
        domains.forEach(d => {
            if (!domainsByCategory[d.category]) domainsByCategory[d.category] = [];
            domainsByCategory[d.category].push(d);
        });

        // Build domain options with optgroups
        const domainSelects = document.querySelectorAll('#domainSelect, #scriptDomain');
        domainSelects.forEach(select => {
            select.innerHTML = '<option value="">Select a domain...</option>';
            for (const [category, categoryDomains] of Object.entries(domainsByCategory)) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = category;
                categoryDomains.forEach(d => {
                    const opt = document.createElement('option');
                    opt.value = d.id;
                    opt.textContent = `${d.icon} ${d.name}`;
                    optgroup.appendChild(opt);
                });
                select.appendChild(optgroup);
            }
        });

        // Group countries by region
        const countriesByRegion = {};
        countries.forEach(c => {
            if (!countriesByRegion[c.region]) countriesByRegion[c.region] = [];
            countriesByRegion[c.region].push(c);
        });

        // Build country options
        const countrySelects = document.querySelectorAll('#countrySelect, #scriptCountry');
        countrySelects.forEach(select => {
            select.innerHTML = '<option value="">Select a country...</option>';
            for (const [region, regionCountries] of Object.entries(countriesByRegion)) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = region;
                regionCountries.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c.id;
                    opt.textContent = `${PriorityMatrix.getFlag(c.code)} ${c.name}`;
                    optgroup.appendChild(opt);
                });
                select.appendChild(optgroup);
            }
        });
    }

    /**
     * Bind all event listeners
     */
    function bindEvents() {
        // API Key Modal
        document.getElementById('saveApiKey').addEventListener('click', () => {
            const key = document.getElementById('apiKeyInput').value.trim();
            if (!key) {
                showToast('Please enter an API key', 'error');
                return;
            }
            Config.setApiKey(key);
            document.getElementById('apiKeyModal').classList.remove('active');
            document.getElementById('app').classList.remove('hidden');
            updateApiStatus(true);
            initTabs();
            showToast('🚀 SerpApi key saved! You\'re now in LIVE mode.', 'success');
        });

        // Navigation tabs
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });

        // Search
        document.getElementById('searchBtn').addEventListener('click', performSearch);

        // Allow Enter key on city input
        document.getElementById('cityInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });

        // Export CSV
        document.getElementById('exportCsv').addEventListener('click', () => {
            const results = LeadFinder.getCurrentResults();
            if (results.length === 0) {
                showToast('No results to export', 'error');
                return;
            }
            LeadFinder.exportCsv(results);
            showToast('📁 CSV exported successfully!', 'success');
        });

        // Priority filters
        ['priorityRegion', 'priorityCategory', 'prioritySort'].forEach(id => {
            document.getElementById(id).addEventListener('change', updatePriorityTable);
        });

        // Script generator
        document.getElementById('generateScript').addEventListener('click', generateStandaloneScript);

        // Script tabs (English / Native)
        document.querySelectorAll('.script-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.script-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });

        // Copy script
        document.getElementById('copyScript').addEventListener('click', () => {
            const content = document.getElementById('scriptContent').innerText;
            navigator.clipboard.writeText(content).then(() => {
                showToast('📋 Script copied to clipboard!', 'success');
            });
        });

        // Settings
        document.getElementById('updateApiKey').addEventListener('click', () => {
            const key = document.getElementById('settingsApiKey').value.trim();
            if (!key) {
                showToast('Please enter a valid API key', 'error');
                return;
            }
            Config.setApiKey(key);
            updateApiStatus(true);
            showToast('🔑 API key updated! Now using LIVE mode.', 'success');
        });

        document.getElementById('exportAllLeads').addEventListener('click', () => {
            const leads = Config.getSavedLeads();
            if (leads.length === 0) {
                showToast('No saved leads to export', 'error');
                return;
            }
            LeadFinder.exportCsv(leads);
            showToast('📁 All saved leads exported!', 'success');
        });

        document.getElementById('clearAllLeads').addEventListener('click', () => {
            if (confirm('Are you sure? This will clear all saved leads and data.')) {
                Config.clearLeads();
                updateSavedCount();
                showToast('🗑️ All data cleared.', 'success');
            }
        });

        // Modal close
        document.getElementById('closeModal').addEventListener('click', closeModal);
        document.getElementById('leadModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('leadModal')) closeModal();
        });
    }

    /**
     * Initialize tabs and render initial content
     */
    function initTabs() {
        // Render priority matrix
        PriorityMatrix.calculateScores();
        updatePriorityTable();
        PriorityMatrix.renderPricing(document.getElementById('pricingGrid'));

        // Update saved leads count
        updateSavedCount();

        // Populate settings
        document.getElementById('settingsApiKey').value = Config.getApiKey() || '';
        updateApiKeyBadge();
    }

    /**
     * Switch between tabs
     */
    function switchTab(tabId) {
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.toggle('active', tab.id === `tab-${tabId}`);
        });
    }

    /**
     * Perform lead search
     */
    async function performSearch() {
        const domainId = document.getElementById('domainSelect').value;
        const countryId = document.getElementById('countrySelect').value;
        const city = document.getElementById('cityInput').value.trim();
        const noWebsiteOnly = document.getElementById('noWebsiteOnly').checked;

        if (!domainId || !countryId) {
            showToast('Please select both a business domain and country', 'error');
            return;
        }

        const domain = Config.getDomain(domainId);
        const country = Config.getCountry(countryId);
        currentDomain = domain;
        currentCountry = country;

        // Show loading state
        const searchBtn = document.getElementById('searchBtn');
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div> Searching...';

        // Hide empty state, show results section
        document.getElementById('emptyState').classList.add('hidden');
        document.getElementById('resultsSection').classList.remove('hidden');
        document.getElementById('resultsGrid').innerHTML = `
            <div class="loading-more" style="grid-column: 1/-1;">
                <div class="spinner"></div>
                <span>Searching for ${domain.icon} ${domain.name} businesses in ${PriorityMatrix.getFlag(country.code)} ${country.name}...</span>
            </div>
        `;

        try {
            const results = await LeadFinder.search(domainId, countryId, city, noWebsiteOnly);

            // Update remaining searches after the API call (delayed to let SerpApi process the deduction)
            setTimeout(updateSearchesLeft, 2000);

            // Update results header
            const leads = results.filter(r => !r.hasWebsite);
            document.getElementById('resultsTitle').textContent =
                `${domain.icon} ${domain.name} in ${PriorityMatrix.getFlag(country.code)} ${country.name}${city ? `, ${city}` : ''}`;
            document.getElementById('totalCount').textContent = `${results.length} found`;
            document.getElementById('leadsCount').textContent = `${leads.length} leads (no website)`;

            // Render cards
            LeadFinder.renderResults(results, document.getElementById('resultsGrid'), domain, country);

            showToast(`Found ${results.length} businesses, ${leads.length} without websites!`, 'success');
        } catch (e) {
            console.error('Search failed:', e);
            showToast('Search failed. Please try again.', 'error');
        } finally {
            searchBtn.disabled = false;
            searchBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <span>Search Leads</span>
            `;
        }
    }

    /**
     * Update priority table with current filters
     */
    function updatePriorityTable() {
        const filters = {
            region: document.getElementById('priorityRegion').value,
            category: document.getElementById('priorityCategory').value,
            sort: document.getElementById('prioritySort').value,
        };
        PriorityMatrix.render(document.getElementById('priorityTable'), filters);
    }

    /**
     * Search from priority matrix row
     */
    function searchFromPriority(domainId, countryId) {
        switchTab('leads');
        document.getElementById('domainSelect').value = domainId;
        document.getElementById('countrySelect').value = countryId;
        document.getElementById('cityInput').value = '';
        performSearch();
    }

    /**
     * Check website for a lead (calls Google Places Details)
     */
    async function checkWebsite(placeId) {
        const lead = LeadFinder.getLeadById(placeId);
        if (!lead) return;

        showToast('Checking website status...', 'info');

        const details = await LeadFinder.getPlaceDetails(placeId);
        if (details) {
            // Update lead with details
            Object.assign(lead, details);
            lead._needsDetails = false;

            // Re-render results
            LeadFinder.renderResults(
                LeadFinder.getCurrentResults(),
                document.getElementById('resultsGrid'),
                currentDomain,
                currentCountry
            );

            if (details.hasWebsite) {
                showToast(`${lead.name} has a website: ${details.website}`, 'info');
            } else {
                showToast(`🎯 ${lead.name} has NO website — perfect lead!`, 'success');
            }
        }
    }

    /**
     * Generate and open a demo website for a lead
     */
    async function generateDemo(placeId) {
        let lead = LeadFinder.getLeadById(placeId);
        if (!lead) lead = Config.getSavedLeads().find(l => l.placeId === placeId);
        if (!lead) return;

        // OPEN TAB SYNCHRONOUSLY to bypass popup blockers
        const demoWindow = window.open('', '_blank');
        demoWindow.document.write('<html><body style="background:#0a0a1a;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><h2>Generating Demo Website...</h2></body></html>');

        // If live mode and needs details, fetch them first
        if (lead._needsDetails && Config.isLive()) {
            showToast('Fetching business details...', 'info');
            const details = await LeadFinder.getPlaceDetails(placeId);
            if (details) Object.assign(lead, details);
        }

        const domain = lead._domain || currentDomain;
        const country = lead._country || currentCountry;

        showToast(`🖥️ Generating demo website for ${lead.name}...`, 'success');

        // Generate HTML and write to the already-open tab
        const html = DemoGenerator.generate(lead, domain, country);
        demoWindow.document.open();
        demoWindow.document.write(html);
        demoWindow.document.close();
    }

    /**
     * Generate a sales script for a lead
     */
    async function generateLeadScript(placeId) {
        let lead = LeadFinder.getLeadById(placeId);
        if (!lead) lead = Config.getSavedLeads().find(l => l.placeId === placeId);
        if (!lead) return;

        // If live mode and needs details, fetch them first
        if (lead._needsDetails && Config.isLive()) {
            const details = await LeadFinder.getPlaceDetails(placeId);
            if (details) Object.assign(lead, details);
        }

        const domain = lead._domain || currentDomain;
        const country = lead._country || currentCountry;

        // Open modal with script
        const modal = document.getElementById('leadModal');
        const content = document.getElementById('modalContent');

        content.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div class="spinner" style="margin: 0 auto 16px;"></div>
                <p>Generating script for ${lead.name}...</p>
            </div>
        `;
        modal.classList.add('active');

        try {
            const script = await ScriptEngine.generate(lead, domain, country);
            const coldEmail = ScriptEngine.generateColdEmail(lead, domain, country);

            content.innerHTML = `
                <div id="proposalContent" style="background: var(--bg-primary); padding: 10px;">
                    <h2 style="margin-bottom: 4px;">🎯 Sales Pitch: ${escHtml(lead.name)}</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">
                        ${domain.icon} ${domain.name} | ${PriorityMatrix.getFlag(country.code)} ${country.name}
                    </p>
                    <div class="script-tabs">
                        <button class="script-tab active" onclick="App.switchScriptLang(this, 'en')">🇬🇧 English</button>
                        ${script.nativeLang ? `<button class="script-tab" onclick="App.switchScriptLang(this, 'native')">🌐 ${script.nativeLang}</button>` : ''}
                        <button class="script-tab" onclick="App.switchScriptLang(this, 'email')">📧 Cold Email</button>
                        <button class="script-tab" onclick="App.switchScriptLang(this, 'roi')">💰 ROI Calculator</button>
                    </div>
                    
                    <div id="modalScriptEn" class="script-content" style="max-height: 50vh; overflow-y: auto; margin-top: 16px;">
                        ${script.english}
                    </div>
                    
                    ${script.native ? `
                    <div id="modalScriptNative" class="script-content" style="max-height: 50vh; overflow-y: auto; margin-top: 16px; display: none;">
                        <div class="script-section" style="border-color: var(--accent-primary);">
                            <h4>🌐 ${script.nativeLang} Translation</h4>
                            <p id="nativeScriptText" style="white-space: pre-wrap; line-height: 1.8;">${escHtml(script.native)}</p>
                        </div>
                    </div>` : ''}

                    <div id="modalScriptEmail" class="script-content" style="max-height: 50vh; overflow-y: auto; margin-top: 16px; display: none;">
                        ${coldEmail.html}
                    </div>

                    <div id="modalScriptRoi" class="script-content" style="max-height: 50vh; overflow-y: auto; margin-top: 16px; display: none;">
                        <div class="script-section" style="border-color: var(--success);">
                            <h4>💰 Interactive ROI Calculator</h4>
                            <div style="background: var(--bg-input); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                                <label style="display: block; margin-bottom: 8px;">Average Customer Value ($):</label>
                                <input type="number" id="roiAvgValue" value="500" class="form-control" style="width: 100%; margin-bottom: 16px;" oninput="App.calculateRoi()">
                                <label style="display: block; margin-bottom: 8px;">Expected New Leads/Month from Website:</label>
                                <input type="number" id="roiLeads" value="5" class="form-control" style="width: 100%; margin-bottom: 16px;" oninput="App.calculateRoi()">
                                <hr style="border-color: var(--border-subtle); margin: 16px 0;">
                                <h3 style="color: var(--success);">Estimated Monthly ROI: <span id="roiTotal">$2,500</span></h3>
                            </div>
                        </div>
                        <div id="competitorSection" class="script-section" style="border-color: var(--warning); margin-top: 16px;">
                            <h4>⚔️ Competitor Analysis</h4>
                            <button class="btn btn-secondary btn-sm" onclick="App.loadCompetitors('${placeId}')">Find Local Competitors</button>
                            <div id="competitorsList" style="margin-top: 12px;"></div>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-subtle);">
                    <button class="btn btn-primary btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('modalScriptEn').innerText).then(()=>showToast('Copied!','success'))">
                        📋 Copy Script
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="App.generateDemo('${placeId}')">
                        🖥️ Generate Demo
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="App.downloadScript('${placeId}')">
                        💾 Download Script
                    </button>
                    ${lead.phone ? `
                    <button class="btn btn-secondary btn-sm" style="background: #25D366; color: white; border: none;" onclick="App.openWhatsApp('${placeId}')">
                        💬 WhatsApp
                    </button>` : ''}
                    <button class="btn btn-secondary btn-sm" onclick="App.generatePdf('${placeId}')">
                        📄 PDF Proposal
                    </button>
                </div>
            `;
        } catch (e) {
            console.error('Script generation failed:', e);
            content.innerHTML = `<p style="color: var(--danger);">Failed to generate script. Please try again.</p>`;
        }
    }

    /**
     * Switch between English and native language in script modal
     */
    function switchScriptLang(btn, lang) {
        document.querySelectorAll('#leadModal .script-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');

        const divs = {
            'en': document.getElementById('modalScriptEn'),
            'native': document.getElementById('modalScriptNative'),
            'email': document.getElementById('modalScriptEmail'),
            'roi': document.getElementById('modalScriptRoi'),
        };

        for (const [key, el] of Object.entries(divs)) {
            if (el) el.style.display = lang === key ? 'block' : 'none';
        }
    }

    function calculateRoi() {
        const val = parseFloat(document.getElementById('roiAvgValue').value) || 0;
        const leads = parseFloat(document.getElementById('roiLeads').value) || 0;
        const total = val * leads;
        document.getElementById('roiTotal').innerText = '$' + total.toLocaleString();
    }

    async function loadCompetitors(placeId) {
        let lead = LeadFinder.getLeadById(placeId);
        if (!lead) lead = Config.getSavedLeads().find(l => l.placeId === placeId);
        if (!lead) return;

        const list = document.getElementById('competitorsList');
        list.innerHTML = '<div class="spinner" style="width:20px;height:20px;margin-bottom:10px;"></div> Finding competitors with websites...';

        try {
            const competitors = await LeadFinder.getCompetitors(lead);
            if (competitors.length === 0) {
                list.innerHTML = '<p style="color:var(--text-secondary);">No competitors found in this area with websites. Huge opportunity!</p>';
                return;
            }
            
            list.innerHTML = competitors.map(c => `
                <div style="background:var(--bg-card); padding:10px; margin-bottom:8px; border-radius:var(--radius-sm); display:flex; align-items:center; gap:10px;">
                    <div style="flex:1;">
                        <strong style="display:block;">${escHtml(c.name)}</strong>
                        <span style="font-size:12px; color:var(--text-secondary);">⭐ ${c.rating} | ${c.hasWebsite ? '✅ Has Website' : ''}</span>
                    </div>
                </div>
            `).join('');
        } catch(e) {
            list.innerHTML = '<p style="color:var(--danger);">Error fetching competitors.</p>';
        }
    }

    function openWhatsApp(placeId) {
        let lead = LeadFinder.getLeadById(placeId);
        if (!lead) lead = Config.getSavedLeads().find(l => l.placeId === placeId);
        if (!lead || !lead.phone) return;

        const domain = lead._domain || currentDomain;
        const country = lead._country || currentCountry;

        // Generate clean WhatsApp script
        const text = ScriptEngine.generateWhatsAppScript(lead, domain, country);

        // Clean phone number (keep digits and +)
        let finalPhone = lead.phone.replace(/[^0-9+]/g, '');
        
        // If the phone doesn't already start with a '+', we prepend the country's calling code
        if (!finalPhone.startsWith('+') && country.callingCode) {
            // Strip any leading 0s before prepending country code (e.g. UK 0161 -> 161)
            finalPhone = country.callingCode + finalPhone.replace(/^0+/, '');
        }
        
        // wa.me URL requires the number without the '+' sign
        finalPhone = finalPhone.replace(/\+/g, '');
        
        const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }

    function generatePdf(placeId) {
        if (typeof html2pdf === 'undefined') {
            showToast('PDF generator not loaded.', 'error');
            return;
        }

        let lead = LeadFinder.getLeadById(placeId);
        if (!lead) lead = Config.getSavedLeads().find(l => l.placeId === placeId);
        if (!lead) return;

        const domain = lead._domain || currentDomain;
        const country = lead._country || currentCountry;
        const ourPricing = country.ourPricing || { basic: 299, standard: 599, premium: 999, currency: 'USD' };

        showToast('Generating formal proposal...', 'info');

        // Create a hidden formal proposal div
        const proposalDiv = document.createElement('div');
        proposalDiv.style.padding = '40px';
        proposalDiv.style.fontFamily = 'Arial, sans-serif';
        proposalDiv.style.color = '#333';
        proposalDiv.style.backgroundColor = '#fff';
        proposalDiv.style.width = '800px';

        const today = new Date().toLocaleDateString();

        proposalDiv.innerHTML = `
            <div style="border-bottom: 2px solid ${domain.colorTheme.primary}; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <h1 style="margin: 0; color: ${domain.colorTheme.primary}; font-size: 28px;">Website Development Proposal</h1>
                    <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Prepared for: <strong>${escHtml(lead.name)}</strong></p>
                </div>
                <div style="text-align: right; color: #666; font-size: 14px;">
                    <p style="margin: 0;">Date: ${today}</p>
                    <p style="margin: 5px 0 0 0;">Valid for 30 days</p>
                </div>
            </div>

            <h2 style="font-size: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">1. Executive Summary</h2>
            <p style="line-height: 1.6; font-size: 14px;">
                Currently, <strong>${escHtml(lead.name)}</strong> does not have an active website. In today's digital landscape, 97% of consumers search online before making a purchasing decision. By establishing a professional, mobile-responsive online presence, we estimate a significant increase in client acquisition and retention for your business in ${escHtml(lead.city || 'your area')}.
            </p>

            <h2 style="font-size: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">2. Proposed Solution</h2>
            <p style="line-height: 1.6; font-size: 14px;">We will design and develop a custom, high-converting website that includes:</p>
            <ul style="line-height: 1.6; font-size: 14px;">
                ${domain.websiteFeatures.map(f => `<li>${escHtml(f)}</li>`).join('')}
                <li>Mobile-Responsive Design (Optimized for all devices)</li>
                <li>Google Maps & Contact Integration</li>
                <li>Search Engine Optimization (SEO) setup</li>
            </ul>

            <h2 style="font-size: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">3. Investment Options</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
                <thead>
                    <tr style="background-color: #f8f9fa;">
                        <th style="padding: 12px; border: 1px solid #dee2e6; text-align: left;">Package</th>
                        <th style="padding: 12px; border: 1px solid #dee2e6; text-align: left;">Description</th>
                        <th style="padding: 12px; border: 1px solid #dee2e6; text-align: right;">Investment</th>
                        <th style="padding: 12px; border: 1px solid #dee2e6; text-align: center;">Selection</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Basic</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6;">One-page website, contact form, mobile-responsive.</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6; text-align: right;">${ourPricing.currency} ${ourPricing.basic.toLocaleString()}</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6; text-align: center;"><div style="width: 20px; height: 20px; border: 1px solid #000; margin: 0 auto;"></div></td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Standard (Recommended)</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6;">Multi-page, photo gallery, online booking, SEO.</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6; text-align: right;">${ourPricing.currency} ${ourPricing.standard.toLocaleString()}</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6; text-align: center;"><div style="width: 20px; height: 20px; border: 1px solid #000; margin: 0 auto;"></div></td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Premium</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6;">Custom design, animations, e-commerce, 3mo support.</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6; text-align: right;">${ourPricing.currency} ${ourPricing.premium.toLocaleString()}</td>
                        <td style="padding: 12px; border: 1px solid #dee2e6; text-align: center;"><div style="width: 20px; height: 20px; border: 1px solid #000; margin: 0 auto;"></div></td>
                    </tr>
                </tbody>
            </table>

            <h2 style="font-size: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">4. Next Steps & Approval</h2>
            <p style="line-height: 1.6; font-size: 14px;">
                To proceed, please check the box for your desired package above, sign below, and return this document. We will begin development immediately upon receiving the initial deposit.
            </p>
            
            <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                <div style="width: 45%;">
                    <div style="border-bottom: 1px solid #000; height: 30px;"></div>
                    <p style="font-size: 12px; margin-top: 5px;">Client Signature</p>
                </div>
                <div style="width: 45%;">
                    <div style="border-bottom: 1px solid #000; height: 30px;"></div>
                    <p style="font-size: 12px; margin-top: 5px;">Date</p>
                </div>
            </div>
        `;

        document.body.appendChild(proposalDiv);
        
        const opt = {
            margin:       [15, 15, 15, 15],
            filename:     `${lead.name.replace(/[^a-z0-9]/gi, '_')}_Proposal.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(proposalDiv).save().then(() => {
            document.body.removeChild(proposalDiv);
            showToast('Formal Proposal Downloaded!', 'success');
        });
    }

    /**
     * Generate standalone script from Scripts tab
     */
    async function generateStandaloneScript() {
        const domainId = document.getElementById('scriptDomain').value;
        const countryId = document.getElementById('scriptCountry').value;
        const bizName = document.getElementById('scriptBizName').value.trim();
        const city = document.getElementById('scriptCity').value.trim();
        const rating = parseFloat(document.getElementById('scriptRating').value) || 0;

        if (!domainId || !countryId) {
            showToast('Please select a domain and country', 'error');
            return;
        }

        const domain = Config.getDomain(domainId);
        const country = Config.getCountry(countryId);

        const business = {
            name: bizName || `[${domain.name} Business]`,
            address: city ? `${city}, ${country.name}` : country.name,
            city: city || '',
            rating: rating,
            totalRatings: rating > 0 ? Math.floor(Math.random() * 100) + 10 : 0,
            phone: '',
            website: '',
            hasWebsite: false,
            reviews: [],
            photos: [],
            hours: [],
        };

        const generateBtn = document.getElementById('generateScript');
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div> Generating...';

        try {
            const script = await ScriptEngine.generate(business, domain, country);

            const output = document.getElementById('scriptOutput');
            output.classList.remove('hidden');

            // Update script tabs
            const tabsContainer = output.querySelector('.script-tabs');
            tabsContainer.innerHTML = `
                <button class="script-tab active" data-lang="en" onclick="App.switchStandaloneScriptLang(this, 'en')">🇬🇧 English</button>
                ${script.nativeLang ? `<button class="script-tab" data-lang="native" onclick="App.switchStandaloneScriptLang(this, 'native')">🌐 ${script.nativeLang}</button>` : ''}
            `;

            const contentContainer = document.getElementById('scriptContent');
            contentContainer.innerHTML = `
                <div id="standaloneScriptEn">${script.english}</div>
                ${script.native ? `
                <div id="standaloneScriptNative" style="display: none;">
                    <div class="script-section" style="border-color: var(--accent-primary);">
                        <h4>🌐 ${script.nativeLang} Translation</h4>
                        <p style="white-space: pre-wrap; line-height: 1.8;">${escHtml(script.native)}</p>
                    </div>
                </div>` : ''}
            `;

            showToast('📝 Script generated successfully!', 'success');
        } catch (e) {
            console.error('Script generation failed:', e);
            showToast('Script generation failed. Please try again.', 'error');
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/></svg>
                Generate Script
            `;
        }
    }

    function switchStandaloneScriptLang(btn, lang) {
        document.querySelectorAll('#tab-scripts .script-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');

        const enDiv = document.getElementById('standaloneScriptEn');
        const nativeDiv = document.getElementById('standaloneScriptNative');
        if (enDiv) enDiv.style.display = lang === 'en' ? 'block' : 'none';
        if (nativeDiv) nativeDiv.style.display = lang === 'native' ? 'block' : 'none';
    }

    /**
     * Save a lead to local storage
     */
    function saveLead(placeId) {
        const lead = LeadFinder.getLeadById(placeId);
        if (!lead) return;
        Config.saveLead({
            ...lead,
            _domain: { id: lead._domain?.id, name: lead._domain?.name, icon: lead._domain?.icon },
            _country: { id: lead._country?.id, name: lead._country?.name, code: lead._country?.code },
            savedAt: new Date().toISOString(),
        });
        updateSavedCount();
        showToast(`💾 ${lead.name} saved to leads!`, 'success');
    }

    function downloadScript(placeId) {
        let lead = LeadFinder.getLeadById(placeId);
        if (!lead) lead = Config.getSavedLeads().find(l => l.placeId === placeId);
        if (!lead) return;

        if (typeof html2pdf === 'undefined') {
            showToast('PDF generator not loaded.', 'error');
            return;
        }

        const domain = lead._domain || currentDomain;
        const country = lead._country || currentCountry;
        
        showToast('Generating PDF Script...', 'info');
        
        const script = ScriptEngine.generateQuick(lead, domain, country);
        
        // Convert plain text to simple HTML
        const htmlContent = script.plainText.split('\n').map(line => {
            if(line.trim().startsWith('•') || line.trim().startsWith('→')) return `<p style="margin: 5px 0 5px 20px;">${escHtml(line)}</p>`;
            if(line.trim().toUpperCase() === line.trim() && line.trim().length > 5 && !line.includes('•')) return `<h2 style="font-size: 16px; margin-top: 20px; color: ${domain.colorTheme?.primary || '#333'}">${escHtml(line)}</h2>`;
            return `<p style="margin: 5px 0;">${escHtml(line)}</p>`;
        }).join('');

        const scriptDiv = document.createElement('div');
        scriptDiv.style.padding = '40px';
        scriptDiv.style.fontFamily = 'Arial, sans-serif';
        scriptDiv.style.color = '#333';
        scriptDiv.style.backgroundColor = '#fff';
        scriptDiv.style.width = '800px';
        
        scriptDiv.innerHTML = `
            <div style="border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px;">
                <h1 style="font-size: 24px; margin: 0;">Sales Script: ${escHtml(lead.name)}</h1>
                <p style="color: #666; margin: 5px 0 0 0;">${domain.icon} ${domain.name} | ${country.name}</p>
            </div>
            <div style="font-size: 14px; line-height: 1.6;">
                ${htmlContent}
            </div>
        `;
        
        document.body.appendChild(scriptDiv);
        
        const opt = {
            margin:       15,
            filename:     `${lead.name.replace(/[^a-z0-9]/gi, '_')}_Script.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(scriptDiv).save().then(() => {
            document.body.removeChild(scriptDiv);
            showToast('Script PDF Downloaded!', 'success');
        });
    }

    /**
     * Close modal
     */
    function closeModal() {
        document.getElementById('leadModal').classList.remove('active');
    }


    /**
     * Update API status indicator
     */
    function updateApiStatus(isLive) {
        const status = document.getElementById('apiStatus');
        if (isLive) {
            status.classList.add('connected');
            status.querySelector('.status-text').textContent = 'API Connected';
        } else {
            status.classList.remove('connected');
            status.querySelector('.status-text').textContent = 'API Required';
        }
    }

    function updateApiKeyBadge() {
        const badge = document.getElementById('apiKeyBadge');
        if (Config.isLive()) {
            badge.textContent = 'Active';
            badge.className = 'badge badge-active';
        } else {
            badge.textContent = 'Not Set';
            badge.className = 'badge';
        }
    }

    function updateSavedCount() {
        const leads = Config.getSavedLeads();
        document.getElementById('savedLeadsCount').textContent = `${leads.length} saved`;

        const list = document.getElementById('savedLeadsList');
        if (!list) return;
        
        if (leads.length === 0) {
            list.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary); border: 1px dashed var(--border-subtle); border-radius: 8px;">No leads saved yet.</div>';
            return;
        }

        list.innerHTML = leads.map(lead => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 8px;">
                <div>
                    <h4 style="margin: 0; font-size: 15px;">${escHtml(lead.name)}</h4>
                    <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                        ${lead._domain?.icon || '🏢'} ${escHtml(lead._domain?.name || 'General')} | ${escHtml(lead.address)}
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-secondary btn-sm" onclick="App.generateLeadScript('${lead.placeId}')">📝 Script</button>
                    ${!lead.hasWebsite ? `<button class="btn btn-secondary btn-sm" onclick="App.generateDemo('${lead.placeId}')">🖥️ Demo</button>` : ''}
                </div>
            </div>
        `).join('');
    }

    function escHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function toggleTheme() {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
        document.getElementById('themeIconLight').style.display = isLight ? 'block' : 'none';
        document.getElementById('themeIconDark').style.display = isLight ? 'none' : 'block';
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API (needed for onclick handlers in dynamic HTML)
    return {
        checkWebsite,
        generateDemo,
        generateLeadScript,
        saveLead,
        downloadScript,
        searchFromPriority,
        switchScriptLang,
        switchStandaloneScriptLang,
        toggleTheme,
        calculateRoi,
        loadCompetitors,
        openWhatsApp,
        generatePdf,
    };
})();

/**
 * Global toast notification
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
