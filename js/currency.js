/* =====================================================
   Currency Engine — Live exchange rates
   Uses open ExchangeRate-API for base USD and cross rates to INR
   ===================================================== */

const CurrencyEngine = (() => {
    let rates = null;
    let baseCurrency = 'USD';
    let lastFetched = null;

    // Cache key for local storage
    const CACHE_KEY = 'leadforge_currency_rates';
    
    /**
     * Initialize currency rates
     */
    async function init() {
        // Try to load from cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached);
            // Cache valid for 12 hours
            if (Date.now() - parsed.timestamp < 12 * 60 * 60 * 1000) {
                rates = parsed.rates;
                lastFetched = parsed.timestamp;
                return true;
            }
        }

        return await fetchRates();
    }

    /**
     * Fetch rates from API
     */
    async function fetchRates() {
        try {
            // Using ExchangeRate-API open access endpoint
            const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
            const data = await response.json();
            
            if (data.result === 'success') {
                rates = data.rates;
                lastFetched = Date.now();
                
                // Save to cache
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    rates: rates,
                    timestamp: lastFetched
                }));
                
                return true;
            }
            return false;
        } catch (e) {
            console.error('Failed to fetch currency rates:', e);
            
            // If fetch fails but we have stale cache, use it
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                rates = JSON.parse(cached).rates;
                return true;
            }
            return false;
        }
    }

    /**
     * Convert an amount from any currency to INR
     * @param {number} amount - The amount to convert
     * @param {string} fromCurrency - ISO code of source currency (e.g. 'USD', 'CHF')
     * @returns {number} - Amount in INR
     */
    function convertToINR(amount, fromCurrency) {
        if (!rates || !rates.INR || !rates[fromCurrency]) {
            // Fallback hardcoded approximate rates if API failed and cache is empty
            const fallbacks = {
                'USD': 83, 'EUR': 90, 'GBP': 105, 'AUD': 54, 'CAD': 61,
                'CHF': 95, 'AED': 22, 'SGD': 61, 'NZD': 50
            };
            const toInrRate = fallbacks[fromCurrency] || 83; // fallback to USD approx
            return amount * toInrRate;
        }

        // Convert from source to USD (base), then to INR
        // Since rates are based on USD: 
        // 1 USD = rate[fromCurrency]
        // 1 USD = rate.INR
        // Therefore, amount in fromCurrency / rate[fromCurrency] = amount in USD
        // Then multiply by rate.INR
        
        if (fromCurrency === 'USD') return amount * rates.INR;
        if (fromCurrency === 'INR') return amount;
        
        const amountInUSD = amount / rates[fromCurrency];
        return amountInUSD * rates.INR;
    }

    /**
     * Format an INR amount nicely (e.g., 1.2 Lakhs or 50k)
     */
    function formatINR(amountInINR) {
        if (amountInINR >= 100000) {
            return '₹' + (amountInINR / 100000).toFixed(2).replace(/\.00$/, '') + ' Lakhs';
        } else if (amountInINR >= 1000) {
            return '₹' + Math.floor(amountInINR / 1000) + 'k';
        }
        return '₹' + Math.round(amountInINR).toLocaleString('en-IN');
    }

    /**
     * Convert and format
     */
    function convertAndFormat(amount, fromCurrency) {
        const inr = convertToINR(amount, fromCurrency);
        return formatINR(inr);
    }

    return {
        init,
        convertToINR,
        formatINR,
        convertAndFormat
    };
})();
