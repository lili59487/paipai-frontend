const API_CONFIG = {
    BASE_URL: "https://paipai-backend.onrender.com", // 雲端後端 API 網址
    ENDPOINTS: {
        SEARCH: "/api/search"
    }
};

document.addEventListener('DOMContentLoaded', function () {
    const searchBox = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('results');

    searchButton.addEventListener('click', function () {
        performSearch();
    });

    searchBox.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    async function performSearch() {
        const searchTerms = searchBox.value.trim();
        
        if (!searchTerms) {
            alert('請輸入搜尋關鍵字');
            return;
        }

        resultsContainer.innerHTML = '<div class="loading">搜尋中...</div>';

        try {
            const url = new URL(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEARCH}`);
            url.searchParams.append('keywords', searchTerms);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                console.error('回傳格式錯誤:', data);
                resultsContainer.innerHTML = `<div class="error-message">${data.error || '查詢結果格式錯誤'}</div>`;
                return;
            }
            
            displayResults(data);
        } catch (error) {
            console.error('搜尋錯誤:', error);
            resultsContainer.innerHTML = `<div class="error-message">搜尋時發生錯誤：${error.message}</div>`;
        }
    }

    function displayResults(results) {
        resultsContainer.innerHTML = '';
        
        const searchTerm = searchBox.value;
        const headerDiv = document.createElement('div');
        headerDiv.className = 'result-header';
        headerDiv.textContent = `搜尋 "${searchTerm}" 的結果`;
        resultsContainer.appendChild(headerDiv);

        if (results.length === 0) {
            const noResultElement = document.createElement('div');
            noResultElement.className = 'result-card';
            noResultElement.innerHTML = '<p>找不到符合的結果</p>';
            resultsContainer.appendChild(noResultElement);
            return;
        }

        const noMatchResults = results.filter(p => p.no_match);
        noMatchResults.forEach(p => {
            const card = document.createElement('div');
            card.className = 'result-card error-card';
            if (p.error_message && p.error_message.includes('無共同防治藥劑')) {
                card.innerHTML = `
                    <div class="card-header"><h3>無共同防治藥劑</h3></div>
                    <div class="card-content"><p class="error-message">${p.error_message}</p></div>
                `;
            } else {
                card.innerHTML = `
                    <div class="card-content"><p class="error-message">${p.error_message}</p></div>
                `;
            }
            resultsContainer.appendChild(card);
        });

        const categorizedDisplay = (title, items) => {
            if (items.length === 0) return;

            const header = document.createElement('div');
            header.className = 'result-subheader';
            header.textContent = title;
            resultsContainer.appendChild(header);

            items.forEach((pesticide, idx) => {
                if (!Array.isArray(pesticide.usages)) {
                    console.warn('pesticide.usages 非陣列', pesticide, idx);
                }
            });

            items.forEach(pesticide => {
                const card = document.createElement('div');
                card.className = 'result-card';

                const mechanismBlock = pesticide.作用機制名稱 ? `
                    <div class="mechanism-block">
                        <span class="mechanism-name">${pesticide.作用機制名稱}</span>
                        ${pesticide.作用機制備註 ? `<span class="mechanism-note">${pesticide.作用機制備註}</span>` : ''}
                    </div>` : '';

                // 根據搜尋類型決定顯示內容
                let cardContent = '';
                if (pesticide.is_crop_and_pest_search) {
                    // 作物+病蟲害搜尋
                    cardContent = `
                        <div class="card-header">
                            <h3>${pesticide.中文名稱}</h3>
                            ${mechanismBlock}
                        </div>
                        <div class="card-content">
                            <div class="pesticide-info">
                                <p><strong>劑型：</strong>${pesticide.劑型}</p>
                                <p><strong>含量：</strong>${pesticide.含量}</p>
                                ${pesticide.作用機制名稱 ? `<p><strong>作用機制：</strong>${pesticide.作用機制名稱}</p>` : ''}
                                ${pesticide.作用機制備註 ? `<p><strong>作用機制備註：</strong>${pesticide.作用機制備註}</p>` : ''}
                            </div>
                            <div class="usage-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>病蟲害名稱</th>
                                            <th>安全採收期</th>
                                            <th>稀釋倍數</th>
                                            <th>每公頃使用用藥量</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${Array.isArray(pesticide.usages) 
                                            ? pesticide.usages.map(usage => `
                                                <tr>
                                                    <td>${usage.病蟲害名稱 || ''}</td>
                                                    <td>${usage.安全採收期 || ''}</td>
                                                    <td>${usage.稀釋倍數 || ''}</td>
                                                    <td>${usage.每公頃使用用藥量 || ''}</td>
                                                </tr>
                                            `).join('')
                                            : '<tr><td colspan="4">無使用資料</td></tr>'
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `;
                } else if (pesticide.query_type === '作物+農藥' || pesticide.query_type === '作物+brand' || pesticide.query_type === '作物+barcode') {
                    // 作物+農藥/廠牌/條碼搜尋
                    cardContent = `
                        <div class="card-header">
                            <h3>${pesticide.中文名稱}</h3>
                            ${mechanismBlock}
                        </div>
                        <div class="card-content">
                            <div class="pesticide-info">
                                <p><strong>劑型：</strong>${pesticide.劑型}</p>
                                <p><strong>含量：</strong>${pesticide.含量}</p>
                                ${pesticide.作用機制名稱 ? `<p><strong>作用機制：</strong>${pesticide.作用機制名稱}</p>` : ''}
                                ${pesticide.作用機制備註 ? `<p><strong>作用機制備註：</strong>${pesticide.作用機制備註}</p>` : ''}
                            </div>
                            <div class="usage-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>病蟲害名稱</th>
                                            <th>安全採收期</th>
                                            <th>稀釋倍數</th>
                                            <th>每公頃使用用藥量</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${pesticide.usages.map(usage => `
                                            <tr>
                                                <td>${usage.病蟲害名稱 || ''}</td>
                                                <td>${usage.安全採收期 || ''}</td>
                                                <td>${usage.稀釋倍數 || ''}</td>
                                                <td>${usage.每公頃使用用藥量 || ''}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `;
                } else {
                    // 其他搜尋類型
                    cardContent = `
                        <div class="card-header">
                            <h3>${pesticide.中文名稱}</h3>
                            ${mechanismBlock}
                        </div>
                        <div class="card-content">
                            <div class="pesticide-info">
                                <p><strong>劑型：</strong>${pesticide.劑型}</p>
                                <p><strong>含量：</strong>${pesticide.含量}</p>
                                ${pesticide.作用機制名稱 ? `<p><strong>作用機制：</strong>${pesticide.作用機制名稱}</p>` : ''}
                                ${pesticide.作用機制備註 ? `<p><strong>作用機制備註：</strong>${pesticide.作用機制備註}</p>` : ''}
                            </div>
                            <div class="usage-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>作物名稱</th>
                                            <th>病蟲害名稱</th>
                                            <th>安全採收期</th>
                                            <th>稀釋倍數</th>
                                            <th>每公頃使用用藥量</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${pesticide.usages.map(usage => `
                                            <tr>
                                                <td>${usage.作物名稱 || ''}</td>
                                                <td>${usage.病蟲害名稱 || ''}</td>
                                                <td>${usage.安全採收期 || ''}</td>
                                                <td>${usage.稀釋倍數 || ''}</td>
                                                <td>${usage.每公頃使用用藥量 || ''}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `;
                }

                card.innerHTML = cardContent;
                resultsContainer.appendChild(card);
            });
        }

        categorizedDisplay('共同防治藥劑', results.filter(p => !p.no_match && p.has_common_pesticide));
        categorizedDisplay('其他相關藥劑', results.filter(p => !p.no_match && !p.has_common_pesticide));
    }
});
