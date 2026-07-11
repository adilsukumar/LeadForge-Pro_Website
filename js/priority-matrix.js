/* =====================================================
   Priority Matrix — Scoring & rendering of domain × country
   combinations ranked by conversion potential
   ===================================================== */

const PriorityMatrix = (() => {

    let matrixData = [];

    /**
     * Calculate priority scores for all domain × country combinations
     */
    function calculateScores() {
        const domains = Config.getDomains();
        const countries = Config.getCountries();
        matrixData = [];

        for (const country of countries) {
            for (const domain of domains) {
                const score = calculateScore(domain, country);
                matrixData.push({
                    domain,
                    country,
                    score: score.total,
                    breakdown: score,
                    reason: generateReason(domain, country, score),
                });
            }
        }

        // Sort by score descending
        matrixData.sort((a, b) => b.score - a.score);
        return matrixData;
    }

    /**
     * Calculate individual score for a domain × country pair
     * Score is 0-100 based on weighted factors
     */
    function calculateScore(domain, country) {
        // Weights
        const W_OPPORTUNITY = 0.25;  // % of SMBs without websites
        const W_GDP = 0.20;          // GDP per capita (can they pay?)
        const W_SAVINGS = 0.20;      // How much cheaper are we vs local?
        const W_ENGLISH = 0.15;      // English proficiency (easier to sell)
        const W_DIGITAL = 0.10;      // Digital adoption (do they value websites?)
        const W_INTERNET = 0.10;     // Internet penetration

        // Normalize each factor to 0-100
        const opportunityScore = Math.min(100, (country.smbWithoutWebsite / 75) * 100);
        const gdpScore = Math.min(100, (country.gdpPerCapita / 80000) * 100);
        const englishScore = country.englishProficiency;
        const digitalScore = country.digitalAdoption;
        const internetScore = country.internetPenetration;

        // Calculate savings %
        const localAvg = (country.avgWebsiteCostLocal.min + country.avgWebsiteCostLocal.max) / 2;
        const ourAvg = (country.ourPricing.basic + country.ourPricing.standard) / 2;
        const savingsPercent = Math.max(0, ((localAvg - ourAvg) / localAvg) * 100);
        const savingsScore = Math.min(100, savingsPercent);

        // Domain-specific bonus
        let domainBonus = 0;
        const highValueDomains = ['restaurant', 'dental', 'law_firm', 'real_estate', 'plumbing', 'salon'];
        if (highValueDomains.includes(domain.id)) domainBonus += 5;

        // Calculate weighted total
        const total = Math.round(
            (opportunityScore * W_OPPORTUNITY) +
            (gdpScore * W_GDP) +
            (savingsScore * W_SAVINGS) +
            (englishScore * W_ENGLISH) +
            (digitalScore * W_DIGITAL) +
            (internetScore * W_INTERNET) +
            domainBonus
        );

        return {
            total: Math.min(100, total),
            opportunity: Math.round(opportunityScore),
            gdp: Math.round(gdpScore),
            savings: Math.round(savingsScore),
            english: Math.round(englishScore),
            digital: Math.round(digitalScore),
            internet: Math.round(internetScore),
            savingsPercent: Math.round(savingsPercent),
        };
    }

    /**
     * Generate a human-readable reason for the priority ranking
     */
    function generateReason(domain, country, score) {
        const reasons = [];

        if (country.smbWithoutWebsite >= 50) {
            reasons.push(`${country.smbWithoutWebsite}% of SMBs lack websites`);
        }
        if (score.savingsPercent >= 70) {
            reasons.push(`${score.savingsPercent}% cheaper than local devs`);
        }
        if (country.englishProficiency >= 80) {
            reasons.push('English-speaking market');
        }
        if (country.gdpPerCapita >= 50000) {
            reasons.push('High purchasing power');
        }
        if (country.smbWithoutWebsite >= 40 && country.gdpPerCapita >= 30000) {
            reasons.push('High opportunity + ability to pay');
        }

        if (reasons.length === 0) {
            reasons.push(country.salesTip || 'Growing digital market');
        }

        return reasons.slice(0, 2).join('. ');
    }

    /**
     * Render the priority table with filters
     */
    function render(container, filters = {}) {
        if (matrixData.length === 0) calculateScores();

        let filtered = [...matrixData];

        // Apply filters
        if (filters.region) {
            filtered = filtered.filter(d => d.country.region === filters.region);
        }
        if (filters.category) {
            filtered = filtered.filter(d => d.domain.category === filters.category);
        }

        // Apply sort
        switch (filters.sort) {
            case 'opportunity':
                filtered.sort((a, b) => b.breakdown.opportunity - a.breakdown.opportunity);
                break;
            case 'gdp':
                filtered.sort((a, b) => b.country.gdpPerCapita - a.country.gdpPerCapita);
                break;
            case 'savings':
                filtered.sort((a, b) => b.breakdown.savingsPercent - a.breakdown.savingsPercent);
                break;
            case 'english':
                filtered.sort((a, b) => b.country.englishProficiency - a.country.englishProficiency);
                break;
            default:
                filtered.sort((a, b) => b.score - a.score);
        }

        // Limit to top 100
        filtered = filtered.slice(0, 100);

        // Build table HTML
        const tableHtml = `
            <table class="priority-table">
                <thead>
                    <tr>
                        <th style="width:50px">#</th>
                        <th>Domain</th>
                        <th>Country</th>
                        <th>Score</th>
                        <th>No Website %</th>
                        <th>Our Price</th>
                        <th>Local Price</th>
                        <th>You Save Them</th>
                        <th>Why</th>
                        <th style="width:100px">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map((item, i) => renderRow(item, i)).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = tableHtml;
    }

    function renderRow(item, index) {
        const rank = index + 1;
        const rankClass = rank === 1 ? 'priority-rank-1' : rank === 2 ? 'priority-rank-2' : rank === 3 ? 'priority-rank-3' : 'priority-rank-n';
        const scoreClass = item.score >= 75 ? 'high' : item.score >= 50 ? 'mid' : 'low';
        const barClass = scoreClass === 'high' ? 'score-bar-high' : scoreClass === 'mid' ? 'score-bar-mid' : 'score-bar-low';
        const badgeClass = `badge-score badge-score-${scoreClass}`;

        const ourPrice = item.country.ourPricing;
        const localPrice = item.country.avgWebsiteCostLocal;

        return `
            <tr>
                <td>
                    <div class="priority-rank ${rankClass}">${rank}</div>
                </td>
                <td>
                    <div class="priority-domain-cell">
                        <span class="priority-domain-icon">${item.domain.icon}</span>
                        <span class="priority-domain-name">${escHtml(item.domain.name)}</span>
                    </div>
                </td>
                <td>
                    <div class="priority-country-cell">
                        <span>${getFlag(item.country.code)}</span>
                        <span>${escHtml(item.country.name)}</span>
                    </div>
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="badge ${badgeClass}">${item.score}</span>
                        <div class="score-bar">
                            <div class="score-bar-fill ${barClass}" style="width: ${item.score}%"></div>
                        </div>
                    </div>
                </td>
                <td>
                    <span style="color: ${item.country.smbWithoutWebsite >= 40 ? 'var(--danger)' : 'var(--text-secondary)'}; font-weight: 600;">
                        ${item.country.smbWithoutWebsite}%
                    </span>
                </td>
                <td>
                    <span style="color: var(--success); font-weight: 600;">
                        ${ourPrice.currency} ${ourPrice.basic.toLocaleString()}-${ourPrice.premium.toLocaleString()}
                    </span>
                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                        ~ ${CurrencyEngine.convertAndFormat(ourPrice.basic, ourPrice.currency)} - ${CurrencyEngine.convertAndFormat(ourPrice.premium, ourPrice.currency)}
                    </div>
                </td>
                <td>
                    <span style="color: var(--text-muted);">
                        ${localPrice.currency} ${localPrice.min.toLocaleString()}-${localPrice.max.toLocaleString()}
                    </span>
                    <div style="font-size: 11px; color: var(--text-muted); opacity: 0.7; margin-top: 2px;">
                        ~ ${CurrencyEngine.convertAndFormat(localPrice.min, localPrice.currency)} - ${CurrencyEngine.convertAndFormat(localPrice.max, localPrice.currency)}
                    </div>
                </td>
                <td>
                    <span class="pricing-card-savings">
                        Save ${item.breakdown.savingsPercent}%
                    </span>
                </td>
                <td>
                    <span class="priority-reason">${escHtml(item.reason)}</span>
                </td>
                <td>
                    <button class="priority-action-btn" onclick="App.searchFromPriority('${item.domain.id}', '${item.country.id}')">
                        🔍 Find Leads
                    </button>
                </td>
            </tr>
        `;
    }

    /**
     * Render pricing comparison cards
     */
    function renderPricing(container) {
        const countries = Config.getCountries();

        // Show top 12 countries by GDP (highest value clients)
        const topCountries = [...countries]
            .sort((a, b) => b.gdpPerCapita - a.gdpPerCapita)
            .slice(0, 12);

        container.innerHTML = topCountries.map(country => {
            const local = country.avgWebsiteCostLocal;
            const ours = country.ourPricing;
            const localAvg = (local.min + local.max) / 2;
            const ourAvg = (ours.basic + ours.premium) / 2;
            const savingsPct = Math.round((1 - ourAvg / localAvg) * 100);
            const localBarWidth = 100;
            const ourBarWidth = Math.round((ourAvg / localAvg) * 100);

            return `
                <div class="pricing-card">
                    <div class="pricing-card-header">
                        <div class="pricing-card-country">
                            ${getFlag(country.code)} ${escHtml(country.name)}
                        </div>
                        <div class="pricing-card-savings">Save ${savingsPct}%</div>
                    </div>
                    <div class="pricing-bars">
                        <div class="pricing-bar-row">
                            <div class="pricing-bar-label">Local Devs</div>
                            <div class="pricing-bar-track">
                                <div class="pricing-bar-fill pricing-bar-local" style="width: ${localBarWidth}%">
                                    ${local.currency} ${local.min.toLocaleString()}-${local.max.toLocaleString()}
                                </div>
                            </div>
                            <div style="font-size: 10px; color: var(--text-muted); text-align: right; margin-top: 2px; opacity: 0.8;">
                                ~ ${CurrencyEngine.convertAndFormat(local.min, local.currency)} - ${CurrencyEngine.convertAndFormat(local.max, local.currency)}
                            </div>
                        </div>
                        <div class="pricing-bar-row">
                            <div class="pricing-bar-label">Your Price</div>
                            <div class="pricing-bar-track">
                                <div class="pricing-bar-fill pricing-bar-ours" style="width: ${Math.max(ourBarWidth, 15)}%">
                                    ${ours.currency} ${ours.basic.toLocaleString()}-${ours.premium.toLocaleString()}
                                </div>
                            </div>
                            <div style="font-size: 10px; color: var(--text-muted); text-align: right; margin-top: 2px; opacity: 0.8;">
                                ~ ${CurrencyEngine.convertAndFormat(ours.basic, ours.currency)} - ${CurrencyEngine.convertAndFormat(ours.premium, ours.currency)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Get flag emoji from country code
     */
    function getFlag(code) {
        if (!code) return '🌐';
        const codePoints = [...code.toUpperCase()].map(c => 127397 + c.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    }

    function escHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    return { calculateScores, render, renderPricing, getFlag };
})();
