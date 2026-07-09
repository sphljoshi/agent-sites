/* =============================================================
   config.js — SINGLE SOURCE OF TRUTH
   Edit this file (and swap the photo) to retarget the site.
   ============================================================= */
const AGENT = {
  name: "Doran Lee Grohs",
  firstName: "Doran",
  title: "Licensed Life & Commercial Insurance Producer",
  tagline:
    "Tailored life and commercial insurance from a producer who's guided clients across seven states for over 15 years.",
  bio:
    "Doran Lee Grohs is a licensed Life and Commercial Insurance producer with over 15 years of experience in the insurance industry. Licensed since April 2011, Doran has guided clients across seven states, including Colorado, Michigan, Montana, North Dakota, Oregon, South Dakota, and Texas. His expertise spans life insurance, financial services, and commercial insurance, allowing him to serve a diverse clientele effectively.\n\nThroughout his career, Doran has placed a strong emphasis on building solid partnerships with key carriers, including Modern Woodmen of America, Avera Health Plans, and Jackson National Life Insurance, among others. His multi-role professional background as a non-resident producer and life agent enables him to navigate the complexities of insurance, ensuring that clients receive tailored solutions that meet their unique needs.",
  experience: "15",
  photo: "doran-grohs.png",
  heroImage: "doran-hero-image.jpg", // full-width hero background
  phone: "(605) 939-5229",
  phoneHref: "tel:+16059395229",
  email: "doran.l.grohs@mwarep.org",
  location: "Bakersfield, CA",
  address: "216 Montalvo Dr., Bakersfield, CA 93309",
  social: { linkedin: null, facebook: null, twitter: null },
  logo: null, // null → text brand fallback

  hours: [
    { days: "Monday – Friday", time: "9:00 AM – 6:00 PM" },
    { days: "Saturday – Sunday", time: "Closed" },
  ],

  states: ["CO", "MI", "MT", "ND", "OR", "SD", "TX"],

  carriers: [
    "Modern Woodmen of America",
    "Jackson National Life",
    "Illinois Mutual Life",
    "Wellmark of SD",
    "Sanford Health Plan",
    "Medica Insurance",
    "Medica Health Plans",
    "Avera Health Plans",
  ],

  reviews: [], // none on profile → section auto-hides

  faqs: [
    {
      q: "How do I get a quote for insurance?",
      a: "You can request a quote by contacting me directly or using the Request Quote button on my profile. I'll respond promptly with personalized insurance options based on your needs. <strong>Consultations and quote requests are completely free — there's no cost or obligation.</strong>",
    },
    {
      q: "What types of insurance do you offer?",
      a: "I offer a comprehensive range of commercial, life insurance solutions. Whether you need protection for your family, or your business, I can help you find the right policies through trusted providers.",
    },
    {
      q: "What are your agency hours?",
      a: "My agency hours are:<br>• Monday: 9:00 AM - 6:00 PM<br>• Tuesday: 9:00 AM - 6:00 PM<br>• Wednesday: 9:00 AM - 6:00 PM<br>• Thursday: 9:00 AM - 6:00 PM<br>• Friday: 9:00 AM - 6:00 PM",
    },
  ],

  quoteLinks: {
    commercial: "https://aght.us/a84779c0",
    life: "https://aght.us/b88e0af4",
  },

  stats: [
    { value: "15+", label: "years of experience" },
    { value: "7", label: "states licensed" },
    { value: "8", label: "carrier partners" },
  ],

  services: {
    commercial: {
      label: "Commercial Insurance",
      eyebrow: "For your business",
      image: "commercial-overlay.jpg",
      description:
        "Comprehensive protection for your business — from liability and property to vehicles, workers, and the unexpected. Coverage built around how your business actually operates.",
      items: [
        "Commercial Auto",
        "General Liability",
        "Business Owners Policy (BOP)",
        "Commercial Property",
        "Workers Compensation",
        "Commercial Umbrella",
        "Professional Liability",
        "Cyber & Privacy Liability",
        "Commercial Package",
        "Farm Owners",
        "Commercial Fire",
        "Business Interruption",
      ],
    },
    life: {
      label: "Life Insurance",
      eyebrow: "For your family",
      image: "life-overlay.jpg",
      description:
        "Financial security for the people who matter most. Term, whole, and specialized life solutions that protect your family's future and your legacy.",
      items: [
        "Term Life",
        "Whole Life",
        "Universal Life",
        "Variable Life",
        "Burial & Funeral",
        "Survivorship",
        "Mortgage",
        "Credit",
        "Supplemental",
      ],
    },
  },
};
