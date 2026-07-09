/* =============================================================
   config.js — SINGLE SOURCE OF TRUTH
   Edit this file (and swap the photo) to retarget the site.
   ============================================================= */
const AGENT = {
  name: "Russell Armine",
  firstName: "Russell",
  title: "Owner & Licensed Insurance Agent",
  tagline:
    "Independent personal, commercial, and life insurance from a trusted New Jersey agency serving families and businesses since 2007.",
  bio:
    "Armine Insurance Agency, LLC has been successfully meeting the needs of our customers since 2007. We've grown our successful insurance agency from the ground up, and accumulated years of experience to bring our clients complete peace of mind.\n\nWith 35 years in the insurance industry, I take an independent, service-first approach — shopping trusted carriers to match each client with the right coverage at the right price. Whether you're protecting your family, your home, or your business, my goal is to make insurance simple and make sure you understand exactly what you're paying for.\n\nLicensed across Florida, North Carolina, New Jersey, and New York, I offer personal, commercial, and life insurance solutions backed by relationships with dozens of top-rated carriers.",
  experience: "35",
  photo: "russell-armine.jpg",
  heroImage: "hero-image.jpg", // kept for compatibility — NOT rendered in v3
  phone: "(800) 944-2592",
  phoneHref: "tel:+18009442592",
  email: "raminsurance@aol.com",
  location: "Toms River, NJ",
  address: "2932 Crestview Lane, Toms River, NJ 08755",
  social: { facebook: "#", instagram: "#", linkedin: "#" },
  logo: null, // null → text brand fallback

  hours: [
    { days: "Monday – Sunday", time: "9:00 AM – 6:00 PM" },
  ],

  states: ["FL", "NC", "NJ", "NY"],

  carriers: [
    "MassMutual",
    "Prudential",
    "Travelers",
    "Liberty Mutual",
    "Mutual of Omaha",
    "John Hancock",
    "Pacific Life",
    "Transamerica",
    "Allstate",
    "Aetna",
    "Cigna",
    "Principal",
  ],

  reviews: [], // removed → section auto-hides

  faqs: [
    {
      q: "How do I get a quote for insurance?",
      a: "You can request a quote by contacting me directly or using the Request Quote button on my profile. I'll respond promptly with personalized insurance options based on your needs. <strong>Consultations and quote requests are completely free — there's no cost or obligation.</strong>",
    },
    {
      q: "What types of insurance do you offer?",
      a: "I offer a comprehensive range of life, commercial, and personal insurance solutions. Whether you need protection for your family, or your business, or your personal assets, I can help you find the right policies through trusted providers.",
    },
    {
      q: "How long have you been an insurance agent?",
      a: "I've been helping clients with their insurance needs for 35 years. My experience in the industry has equipped me with the knowledge to guide you through the insurance process and find coverage that meets your needs.",
    },
    {
      q: "What are your agency hours?",
      a: "My agency hours are:<br>• Monday: 9:00 AM - 6:00 PM<br>• Tuesday: 9:00 AM - 6:00 PM<br>• Wednesday: 9:00 AM - 6:00 PM<br>• Thursday: 9:00 AM - 6:00 PM<br>• Friday: 9:00 AM - 6:00 PM<br>• Saturday: 9:00 AM - 6:00 PM<br>• Sunday: 9:00 AM - 6:00 PM",
    },
  ],

  quoteLinks: {
    personal: "#",
    commercial: "#",
    life: "#",
  },

  stats: [
    { value: "35+", label: "years of experience" },
    { value: "4", label: "states licensed" },
    { value: "90+", label: "carriers represented" },
  ],

  services: {
    personal: {
      label: "Personal Insurance",
      eyebrow: "For your everyday life",
      image: "personal-insurance-service.webp",
      description:
        "Protection for the things you rely on every day — your home, your vehicles, and everything in between. Coverage that fits your life at a price that actually makes sense.",
      items: [
        "Homeowners",
        "Personal Auto",
        "Renters",
        "Condominium",
        "Dwelling Fire",
        "Mobile Homeowners",
        "Motorcycle",
        "Recreational Vehicles",
        "Watercraft",
        "Yacht",
        "Personal & Premises Liability",
      ],
    },
    commercial: {
      label: "Commercial Insurance",
      eyebrow: "For your business",
      image: "commercial-insurance-service.webp",
      description:
        "Comprehensive protection for your business — from liability and property to vehicles and workers. Coverage tailored to keep your operation running smoothly.",
      items: [
        "General Liability",
        "Business Owners (BOP)",
        "Commercial Property",
        "Business Automobile",
        "Workers' Compensation",
        "Commercial Umbrella",
        "Errors & Omissions",
        "Commercial Package",
      ],
    },
    life: {
      label: "Life Insurance",
      eyebrow: "For your family",
      image: "life-insurance-service.jpg",
      description:
        "Financial security for the people who matter most. Term, whole, and universal life solutions that protect your family's future and your legacy.",
      items: ["Term Life", "Whole Life", "Universal Life", "Life"],
    },
  },
};
