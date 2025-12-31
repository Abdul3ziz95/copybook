const currencies = [
    { name: 'الدينار الجزائري', code: 'DZD', flag: '🇩🇿' },
    { name: 'الدرهم المغربي', code: 'MAD', flag: '🇲🇦' },
    { name: 'الريال السعودي', code: 'SAR', flag: '🇸🇦' },
    { name: 'الدينار الأردني', code: 'JOD', flag: '🇯🇴' },
    { name: 'الدينار الكويتي', code: 'KWD', flag: '🇰🇼' },
    { name: 'الجنيه المصري', code: 'EGP', flag: '🇪🇬' },
    { name: 'الدرهم الإماراتي', code: 'AED', flag: '🇦🇪' },
    { name: 'الدينار البحريني', code: 'BHD', flag: '🇧🇭' },
    { name: 'الريال العماني', code: 'OMR', flag: '🇴🇲' },
    { name: 'الريال القطري', code: 'QAR', flag: '🇶🇦' },
    { name: 'جنيه جنوب سوداني', code: 'SSP', flag: '🇸🇸' },
    { name: 'الريال اليمني', code: 'YER', flag: '🇾🇪' },
    { name: 'الدينار التونسي', code: 'TND', flag: '🇹🇳' },
    { name: 'الليرة السورية', code: 'SYP', flag: '🇸🇾' },
    { name: 'الليرة اللبنانية', code: 'LBP', flag: '🇱🇧' },
    { name: 'الريال الصومالي', code: 'SOS', flag: '🇸🇴' },
    { name: 'الأوقية الموريتانية', code: 'MRU', flag: '🇲🇷' },
    { name: 'الدينار الليبي', code: 'LYD', flag: '🇱🇾' },
    { name: 'الريال الفلسطيني', code: 'ILS', flag: '🇵🇸' }
];

const currencySelect = document.getElementById('currency-select');
const searchResults = document.getElementById('currency-search-results');

// إضافة العملات إلى القائمة المنسدلة
currencies.forEach(currency => {
    const option = document.createElement('option');
    option.value = currency.code;
    option.textContent = `${currency.name} (${currency.code}) ${currency.flag}`;
    currencySelect.appendChild(option);
});

// عرض نتائج البحث عند الكتابة
document.getElementById('currency-search').addEventListener('input', function() {
    const filter = this.value.toUpperCase();
    searchResults.innerHTML = '';
    let filteredCurrencies = currencies.filter(currency => currency.name.toUpperCase().includes(filter));

    if (filteredCurrencies.length > 0) {
        searchResults.style.display = 'block';
        filteredCurrencies.forEach(currency => {
            const resultItem = document.createElement('div');
            resultItem.textContent = `${currency.name} (${currency.code}) ${currency.flag}`;
            resultItem.onclick = function() {
                document.getElementById('currency-search').value = currency.name;
                searchResults.style.display = 'none';
            };
            searchResults.appendChild(resultItem);
        });
    } else {
        searchResults.style.display = 'none';
    }
});

// دالة إظهار الأقسام
function showExpenses() {
    document.getElementById("expenses-section").style.display = "block";
    document.getElementById("debts-section").style.display = "none";
    document.getElementById("rights-section").style.display = "none";
}

function showDebts() {
    document.getElementById("expenses-section").style.display = "none";
    document.getElementById("debts-section").style.display = "block";
    document.getElementById("rights-section").style.display = "none";
}

function showRights() {
    document.getElementById("expenses-section").style.display = "none";
    document.getElementById("debts-section").style.display = "none";
    document.getElementById("rights-section").style.display = "block";
}

function showTransactionDetails(transaction) {
    alert("تفاصيل المعاملة: " + transaction);
}