"""Course category and subcategory definitions for forms and catalog filters."""

from __future__ import annotations

COURSE_CATEGORIES: dict[str, dict] = {
    "technology_it": {
        "label": "Technology & IT",
        "subcategories": {
            "web_development": "Web Development",
            "mobile_development": "Mobile Development",
            "data_science": "Data Science & Analytics",
            "ai_machine_learning": "AI & Machine Learning",
            "cybersecurity": "Cybersecurity",
            "cloud_devops": "Cloud & DevOps",
            "software_engineering": "Software Engineering",
            "databases": "Databases & SQL",
            "networking": "Networking & Infrastructure",
            "it_support": "IT Support & Help Desk",
        },
    },
    "business": {
        "label": "Business & Entrepreneurship",
        "subcategories": {
            "entrepreneurship": "Entrepreneurship",
            "startup": "Startups & Venture",
            "management": "Management & Leadership",
            "project_management": "Project Management",
            "operations": "Operations & Supply Chain",
            "business_strategy": "Business Strategy",
            "ecommerce": "E-commerce",
            "real_estate": "Real Estate Business",
            "freelancing": "Freelancing & Consulting",
        },
    },
    "marketing_sales": {
        "label": "Marketing & Sales",
        "subcategories": {
            "digital_marketing": "Digital Marketing",
            "social_media": "Social Media Marketing",
            "seo": "SEO & Content Marketing",
            "copywriting": "Copywriting",
            "branding": "Branding",
            "sales": "Sales & Negotiation",
            "email_marketing": "Email Marketing",
            "advertising": "Paid Advertising",
        },
    },
    "design_creative": {
        "label": "Design & Creative Arts",
        "subcategories": {
            "graphic_design": "Graphic Design",
            "ui_ux": "UI/UX Design",
            "web_design": "Web Design",
            "illustration": "Illustration",
            "photography": "Photography",
            "video_editing": "Video Editing & Production",
            "animation": "Animation & Motion Graphics",
            "3d_modeling": "3D Modeling & CAD",
        },
    },
    "finance_accounting": {
        "label": "Finance & Accounting",
        "subcategories": {
            "personal_finance": "Personal Finance",
            "investing": "Investing & Trading",
            "accounting": "Accounting",
            "corporate_finance": "Corporate Finance",
            "cryptocurrency": "Cryptocurrency & Blockchain",
            "taxes": "Taxes & Bookkeeping",
        },
    },
    "health_wellness": {
        "label": "Health & Wellness",
        "subcategories": {
            "fitness": "Fitness & Exercise",
            "nutrition": "Nutrition & Diet",
            "mental_health": "Mental Health & Mindfulness",
            "yoga": "Yoga & Meditation",
            "healthcare": "Healthcare & Nursing",
            "first_aid": "First Aid & Safety",
        },
    },
    "personal_development": {
        "label": "Personal Development",
        "subcategories": {
            "productivity": "Productivity & Time Management",
            "communication": "Communication Skills",
            "leadership": "Leadership & Influence",
            "career": "Career Development",
            "public_speaking": "Public Speaking",
            "confidence": "Confidence & Motivation",
        },
    },
    "language_learning": {
        "label": "Language Learning",
        "subcategories": {
            "english": "English",
            "french": "French",
            "spanish": "Spanish",
            "german": "German",
            "mandarin": "Mandarin Chinese",
            "other_languages": "Other Languages",
        },
    },
    "music_audio": {
        "label": "Music & Audio",
        "subcategories": {
            "music_production": "Music Production",
            "instruments": "Instruments",
            "singing": "Singing & Vocals",
            "music_theory": "Music Theory",
            "podcasting": "Podcasting",
            "audio_engineering": "Audio Engineering",
        },
    },
    "academic": {
        "label": "Academic & Test Prep",
        "subcategories": {
            "mathematics": "Mathematics",
            "science": "Science",
            "engineering": "Engineering",
            "humanities": "Humanities & Social Sciences",
            "test_prep": "Test Preparation",
            "research": "Research & Writing",
        },
    },
    "lifestyle_hobbies": {
        "label": "Lifestyle & Hobbies",
        "subcategories": {
            "cooking": "Cooking & Baking",
            "crafts": "Crafts & DIY",
            "gardening": "Gardening",
            "travel": "Travel & Culture",
            "gaming": "Game Development & Design",
            "pets": "Pet Care & Training",
        },
    },
    "legal_compliance": {
        "label": "Legal & Compliance",
        "subcategories": {
            "business_law": "Business Law",
            "intellectual_property": "Intellectual Property",
            "compliance": "Regulatory Compliance",
            "contract_law": "Contracts & Agreements",
        },
    },
}


def category_choices() -> list[tuple[str, str]]:
    return [(key, data["label"]) for key, data in COURSE_CATEGORIES.items()]


def subcategory_choices(category: str | None = None) -> list[tuple[str, str]]:
    if not category or category not in COURSE_CATEGORIES:
        choices: list[tuple[str, str]] = []
        for data in COURSE_CATEGORIES.values():
            for sub_key, sub_label in data["subcategories"].items():
                choices.append((sub_key, sub_label))
        return choices
    return list(COURSE_CATEGORIES[category]["subcategories"].items())


def category_label(category: str) -> str:
    data = COURSE_CATEGORIES.get(category)
    return data["label"] if data else category.replace("_", " ").title()
