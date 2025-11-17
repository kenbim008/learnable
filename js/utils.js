// Convert price to current currency
function convertPrice(priceUSD) {
    const rate = currencyRates[currentCountry].rate;
    const symbol = currencyRates[currentCountry].symbol;
    const converted = (priceUSD * rate).toFixed(2);
    return `${symbol}${converted}`;
}

// Change country/currency
function changeCountry() {
    currentCountry = document.getElementById('countrySelector').value;
    loadCourses();
    updateInstructorPrice();
    updateCart();
}

// Update instructor pricing
function updateInstructorPrice() {
    const priceElement = document.getElementById('instructorPrice');
    if (priceElement) {
        const rate = currencyRates[currentCountry].rate;
        const symbol = currencyRates[currentCountry].symbol;
        const converted = (9.99 * rate).toFixed(2);
        priceElement.textContent = `${symbol}${converted}`;
    }
}

// Scroll to section
function scrollToSection(sectionId) {
    showPage('landing');
    setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
}

