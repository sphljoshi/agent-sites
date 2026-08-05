/* =============================================================
   config.js — SINGLE SOURCE OF TRUTH
   Edit this file (and swap the images) to retarget the site.
   ============================================================= */
const AGENT = {
  name: "Maritza Velez",
  firstName: "Maritza",
  agency: "Value Care Insurance Agency",
  // Text brand shown in the nav/footer while AGENT.logo is null.
  brand: { bold: "Value Care", light: "Insurance" },
  copyright: "Value Care Insurance Agency LLC",
  title: "Licensed Commercial, Personal & Life Insurance Producer",
  specialty: "Commercial, Personal & Life Insurance",
  heroTitle: "Coverage chosen for you.",
  tagline:
    "Independent coverage for Florida businesses, families, and everything you have worked to build — placed across 21 states with 13 years of experience behind it.",
  // About-page intro — keep this short (40–50 words).
  bio:
    "Value Care Insurance Agency is a Florida-based independent agency serving individuals, families, and businesses. Founder Maritza Velez brings 13 years as a licensed producer and active licenses in 21 states, shopping multiple top-rated carriers to build coverage around how you actually live and operate.",
  experience: "13",
  photo: "images/maritza-velez.webp", // stats band (home) + about-page portrait
  heroImage: "hero/hero-image.webp", // full-width hero background
  // Bottom-CTA image. Not read by app.js — mirror this path in the hardcoded
  // <img> on index.html / about.html / services.html if you change it.
  ctaImage: "images/cta-image.webp",
  phone: "(407) 494-4983",
  phoneHref: "tel:+14074944983",
  email: "info@valuecareinsurance.com",
  website: "https://www.valuecareinsurance.com",
  location: "Orlando, FL",
  address: "Orlando, Florida",
  social: {
    facebook: "https://www.facebook.com/VALUECAREINSAGENCY/",
    linkedin: "https://www.linkedin.com/in/valuecareinsurance/",
    twitter: null,
  },
  logo: null, // null → text brand fallback

  hours: [
    { days: "Monday – Friday", time: "9:00 AM – 5:00 PM" },
    { days: "Saturday – Sunday", time: "Closed" },
  ],

  states: [
    "DC", "DE", "FL", "GA", "HI", "ID", "IN", "MA", "ME", "MI", "MO",
    "NC", "OH", "OK", "OR", "PA", "RI", "TN", "TX", "WI", "WV",
  ],

  carriers: [
    "Aetna Life Insurance",
    "Nationwide",
    "Travelers",
    "Progressive",
    "Foremost",
    "Citizens Property Insurance",
    "American Integrity",
    "Heritage Property & Casualty",
    "Florida Peninsula",
    "Metropolitan Life",
    "Humana",
    "Western Surety",
  ],

  reviews: [], // none on profile → section auto-hides

  faqs: [
    {
      q: "How do I get a quote for insurance?",
      a: "You can request a quote by contacting me directly or using the Request Quote button on my profile. I'll respond promptly with personalized insurance options based on your needs. <strong>Consultations and quote requests are completely free — there's no cost or obligation.</strong>",
    },
    {
      q: "What types of insurance do you offer?",
      a: "I offer a comprehensive range of commercial, personal, and life insurance solutions. Whether you need protection for your business, or your personal assets, or your family, I can help you find the right policies through trusted providers.",
    },
    {
      q: "How long have you been an insurance agent?",
      a: "I've been helping clients with their insurance needs for 13 years. My experience in the industry has equipped me with the knowledge to guide you through the insurance process and find coverage that meets your needs.",
    },
    {
      q: "What are your agency hours?",
      a: "My agency hours are:<br>• Monday: 9:00 AM - 5:00 PM<br>• Tuesday: 9:00 AM - 5:00 PM<br>• Wednesday: 9:00 AM - 5:00 PM<br>• Thursday: 9:00 AM - 5:00 PM<br>• Friday: 9:00 AM - 5:00 PM",
    },
  ],

  quoteLinks: {
    commercial: "#",
    personal: "#",
    life: "#",
  },

  stats: [
    { value: "13+", label: "years of experience" },
    { value: "21", label: "states licensed" },
    { value: "80+", label: "carrier partners" },
  ],

  services: {
    commercial: {
      label: "Commercial Insurance",
      eyebrow: "For your business",
      image: "images/commercial-overlay.webp",
      description:
        "Our specialty. Whether you run a crew of three or a fleet of thirty, we place the general liability, workers' compensation, and property coverage your contracts and your lenders actually require — and we read the exclusions with you before you sign.",
      items: [
        "General Liability",
        "Workers Compensation",
        "Business Owners Policy (BOP)",
        "Commercial Property",
        "Commercial Auto",
        "Commercial Umbrella",
        "Professional Liability",
        "Cyber & Privacy Liability",
        "Commercial Package",
        "Employment Practices Liability",
        "Surety Bonds",
        "Builders Risk",
      ],
    },
    personal: {
      label: "Personal Insurance",
      eyebrow: "For your home & everyday life",
      image: "images/personal-overlay.webp",
      description:
        "Florida homes carry risks that generic policies handle badly — wind, water, and rising replacement costs. We compare carriers on the coverage that matters, not just the premium, and cover the cars, the RV, and the dog while we're at it.",
      items: [
        "Homeowners",
        "Personal Auto",
        "Renters",
        "Condo",
        "Flood",
        "Personal Umbrella",
        "Pet Insurance",
        "Dwelling Fire",
        "Recreational Vehicles",
      ],
    },
    life: {
      label: "Life Insurance",
      eyebrow: "For the people who depend on you",
      image: "images/life-overlay.webp",
      description:
        "Term, whole, universal, and disability coverage explained without the sales script. We show you what each option costs over time, what it pays out, and which one fits the obligation you're actually trying to cover.",
      items: [
        "Term Life",
        "Whole Life",
        "Universal Life",
        "Variable Life",
        "Annuities",
        "Long-Term Disability",
        "Short-Term Disability",
      ],
    },
  },
};
