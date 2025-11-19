// Currency conversion rates (as of 2024)
const currencyRates = {
    'US': { symbol: '$', rate: 1, name: 'USD' },
    'NG': { symbol: '₦', rate: 1550, name: 'NGN' },
    'GB': { symbol: '£', rate: 0.79, name: 'GBP' },
    'EU': { symbol: '€', rate: 0.92, name: 'EUR' },
    'CA': { symbol: 'C$', rate: 1.36, name: 'CAD' }
};

let currentCountry = 'US';

// Courses data - will be populated from approved courses in localStorage
const courses = [];

// Shopping cart
let cart = [];

