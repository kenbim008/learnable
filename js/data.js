// Currency conversion rates (as of 2024)
const currencyRates = {
    'US': { symbol: '$', rate: 1, name: 'USD' },
    'NG': { symbol: '₦', rate: 1550, name: 'NGN' },
    'GB': { symbol: '£', rate: 0.79, name: 'GBP' },
    'EU': { symbol: '€', rate: 0.92, name: 'EUR' },
    'CA': { symbol: 'C$', rate: 1.36, name: 'CAD' }
};

let currentCountry = 'US';

// Sample courses data
const courses = [
    {
        id: 1,
        title: "Complete Web Development Bootcamp",
        instructor: "Sarah Johnson",
        priceUSD: 49.99,
        rating: 4.8,
        image: "💻",
        hasPreview: true
    },
    {
        id: 2,
        title: "Python for Data Science",
        instructor: "Dr. Mike Chen",
        priceUSD: 59.99,
        rating: 4.9,
        image: "🐍",
        hasPreview: true
    },
    {
        id: 3,
        title: "UI/UX Design Masterclass",
        instructor: "Emma Davis",
        priceUSD: 39.99,
        rating: 4.7,
        image: "🎨",
        hasPreview: false
    },
    {
        id: 4,
        title: "Digital Marketing Fundamentals",
        instructor: "David Lee",
        priceUSD: 34.99,
        rating: 4.6,
        image: "📱",
        hasPreview: true
    },
    {
        id: 5,
        title: "Machine Learning A-Z",
        instructor: "Dr. Robert Kim",
        priceUSD: 69.99,
        rating: 4.9,
        image: "🤖",
        hasPreview: false
    },
    {
        id: 6,
        title: "React - The Complete Guide",
        instructor: "Lisa Anderson",
        priceUSD: 44.99,
        rating: 4.8,
        image: "⚛️",
        hasPreview: true
    }
];

// Shopping cart
let cart = [];

