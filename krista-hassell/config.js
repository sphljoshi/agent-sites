/* =============================================================
   config.js — SINGLE SOURCE OF TRUTH
   Edit this file (and swap the photo) to retarget the site.
   ============================================================= */
const AGENT = {
  name: "Krista Lynn K Hassell",
  firstName: "Krista",
  title: "Licensed Life Insurance Producer",
  brand: { bold: "Front Line Financial", light: "Group" }, // nav/footer text brand (used when logo is null)
  copyright: "Front Line Financial Group", // footer © line
  specialty: "Life Insurance & Annuities", // <title> keyword phrase
  heroTitle:
    'Life insurance that protects <span class="emphasis">your family</span>.',
  tagline:
    "Term, whole, universal and variable life insurance, annuities and disability coverage — personalized guidance for individuals and families in South Carolina.",
  bio:
    "Krista Lynn K Hassell serves as a licensed life insurance producer specializing in the life insurance sector within South Carolina. With three years of experience, Krista has developed a robust understanding of the insurance landscape and the specific needs of her clients. She structures and manages life insurance solutions that align with the financial goals of individuals and families.\n\nKrista represents a portfolio of key carrier partnerships, including American General Life Insurance Company, Banner Life Insurance Company, and Primerica Life Insurance Company, among others. Her focus remains on evaluating the unique circumstances of each client to place suitable life insurance products that provide security and peace of mind. Krista’s commitment to her clients and the industry positions her as a trusted resource in the life insurance market.",
  experience: "3",
  photo: "krista-hassell.webp",
  heroImage: "hero-image.jpg", // kept for compatibility — NOT rendered in v3
  phone: "(843) 568-8106",
  phoneHref: "tel:+18435688106",
  email: "kristah.life@gmail.com",
  location: "Riverside, CA",
  address: "647 N Main St, Ste 3-A, Riverside, CA 92501",
  social: {},
  logo: null, // null → text brand fallback

  hours: [
    { days: "Monday – Friday", time: "9:00 AM – 6:00 PM" },
    { days: "Saturday – Sunday", time: "Closed" },
  ],

  states: ["SC"],

  carriers: [
    "Fidelity & Guaranty Life",
    "Primerica Life",
    "American General Life",
    "Banner Life",
  ],

  reviews: [], // none on profile → section auto-hides

  faqs: [
    {
      q: "How do I get a quote for insurance?",
      a: "You can request a quote by contacting me directly or using the Request Quote button on my profile. I'll respond promptly with personalized insurance options based on your needs. <strong>Consultations and quote requests are completely free — there's no cost or obligation.</strong>",
    },
    {
      q: "What types of insurance do you offer?",
      a: "I offer a comprehensive range of life insurance solutions. Whether you need protection for your family, I can help you find the right policies through trusted providers.",
    },
    {
      q: "What are your agency hours?",
      a: "My agency hours are:<br>• Monday: 9:00 AM - 6:00 PM<br>• Tuesday: 9:00 AM - 6:00 PM<br>• Wednesday: 9:00 AM - 6:00 PM<br>• Thursday: 9:00 AM - 6:00 PM<br>• Friday: 9:00 AM - 6:00 PM",
    },
  ],

  quoteLinks: {
    life: "https://aght.us/c6e2e3d6",
  },

  stats: [
    { value: "3+", label: "years of experience" },
    { value: "4", label: "carriers represented" },
    { value: "7", label: "policy options" },
  ],

  services: {
    life: {
      label: "Life Insurance",
      eyebrow: "For your family",
      image: "life-insurance-service.webp",
      description:
        "Financial security for the people who matter most. Term, whole, universal and variable life, annuities and disability income protection that safeguard your family's future and your legacy.",
      items: [
        "Term Life",
        "Whole Life",
        "Universal Life",
        "Variable Life",
        "Annuity",
        "Long-Term Disability",
        "Short-Term Disability",
      ],
    },
  },
};
