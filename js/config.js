/* =====================================================
   Config Module — API key management & global state
   ===================================================== */

const Config = (() => {
    const STORAGE_KEY = 'leadforge_config';
    const LEADS_KEY = 'leadforge_leads';

    let state = {
        apiKey: '',
        isLiveMode: false,
        domains: [],
        countries: [],
    };

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            apiKey: state.apiKey,
        }));
    }

    function load() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            if (saved.apiKey) {
                state.apiKey = saved.apiKey;
                state.isLiveMode = true;
            }
        } catch (e) { /* ignore */ }
    }

    function setApiKey(key) {
        state.apiKey = key.trim();
        state.isLiveMode = !!state.apiKey;
        save();
    }

    function getApiKey() { return state.apiKey; }
    function isLive() { return state.isLiveMode; }

    // Load domain and country data
    async function loadData() {
        try {
            const [domainsRes, countriesRes] = await Promise.all([
                fetch('data/domains.json'),
                fetch('data/countries.json')
            ]);
            state.domains = await domainsRes.json();
            state.countries = await countriesRes.json();
        } catch (e) {
            console.error('Failed to load data:', e);
        }
    }

    function getDomains() { return state.domains; }
    function getCountries() { return state.countries; }
    function getDomain(id) { return state.domains.find(d => d.id === id); }
    function getCountry(id) { return state.countries.find(c => c.id === id); }

    // Saved leads
    function getSavedLeads() {
        try { return JSON.parse(localStorage.getItem(LEADS_KEY) || '[]'); }
        catch { return []; }
    }

    function saveLead(lead) {
        const leads = getSavedLeads();
        const exists = leads.findIndex(l => l.placeId === lead.placeId);
        if (exists >= 0) leads[exists] = lead;
        else leads.push(lead);
        localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    }

    function removeLead(placeId) {
        const leads = getSavedLeads().filter(l => l.placeId !== placeId);
        localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    }

    function clearLeads() { localStorage.removeItem(LEADS_KEY); }

    load();

    return {
        setApiKey, getApiKey, isLive, loadData,
        getDomains, getCountries, getDomain, getCountry,
        getSavedLeads, saveLead, removeLead, clearLeads,
    };
})();
