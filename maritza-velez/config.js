/* =============================================================
   config.js — SINGLE SOURCE OF TRUTH
   Edit this file (and swap the images) to retarget the site.
   ============================================================= */
const AGENT = {
  name: "Marisa Velez",
  firstName: "Marisa",
  agency: "Value Care Insurance Agency",
  // Text brand shown in the nav/footer while AGENT.logo is null.
  brand: { bold: "Value Care", light: "Insurance" },
  copyright: "Value Care Insurance Agency LLC",
  title: "Licensed Commercial, Personal & Life Insurance Producer",
  specialty: "Commercial, Personal & Life Insurance",
  heroTitle: "Protect Your Future Today",
  tagline:
    "Independent coverage for Florida businesses, families, and everything you have worked to build — placed across 21 states with 13 years of experience behind it.",
  // About-page intro. Blank lines (\n\n) split it into separate <p> elements.
  bio:
    "Value Care Insurance Agency is a Florida-based independent agency serving individuals, families, and businesses. Founder Marisa Velez brings 13 years as a licensed producer and active licenses in 21 states, shopping multiple top-rated carriers to build coverage around how you actually live and operate.\n\nWhat We Do At Value Care Insurance Agency, we are a leading agency providing and offering a wide range of coverage options, including health, auto, home, and commercial insurance. Our team of experienced professionals is dedicated to helping our clients find the perfect insurance plan to meet their unique needs. With a focus on value and customer satisfaction, we strive to deliver exceptional service and tailored solutions to protect what matters most.",
  experience: "13",
  photo: "images/maritza-velez.webp", // stats band (home) + about-page portrait
  heroImage: "hero/hero-image.webp", // full-width hero background
  // Bottom-CTA image. Not read by app.js — mirror this path in the hardcoded
  // <img> on index.html / about.html / services.html if you change it.
  ctaImage: "images/cta-image.webp",
  phone: "(407) 494-4983",
  phoneHref: "tel:+14074944983",
  email: "mvelez@valuecareinsurance.com",
  website: "https://www.valuecareinsurance.com",
  location: "Orlando, FL", // short form — page titles, alt text
  address: "37 N Orange Ave Ste 223, Orlando, FL 32801", // full — footer + contact card
  social: {
    facebook: "https://www.facebook.com/VALUECAREINSAGENCY/",
    linkedin: "https://www.linkedin.com/in/valuecareinsurance/",
    twitter: null,
  },
  // Circular badge on a transparent background, used in the nav.
  logo: "logo/value-care-insurance-logo.png",
  // Footer variant — drops the near-black "Insurance Agency" line, which is
  // unreadable against the --primary footer. Falls back to `logo` if null.
  logoFooter: "logo/vc-logo-footer.png",

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

  // IBLF quote links.
  quoteLinks: {
    commercial: "https://aght.us/daf5b597",
    personal: "https://aght.us/0959acde",
    life: "https://aght.us/61e80611",
  },

  stats: [
    { value: "34K+", label: "Success Stories" },
    { value: "210+", label: "Professional Team" },
    { value: "35K+", label: "Worldwide Clients" },
  ],

  services: {
    commercial: {
      label: "Commercial Insurance",
      eyebrow: "For your business",
      image: "images/commercial-overlay.webp",
      description:
        "Our specialty. Whether you run a crew of three or a fleet of thirty, we place the general liability, workers' compensation, and property coverage your contracts and your lenders actually require — and we read the exclusions with you before you sign.",
      items: [
        "Accountants Professional",
        "Agricultural Output Program",
        "Agriculture Liability",
        "Agriculture Package",
        "Agriculture Property",
        "Agriculture Scheduled & Unscheduled Personal Property",
        "Architects Professional",
        "Artisans",
        "Aviation",
        "BOP Liability",
        "BOP Property",
        "Boiler And Machinery",
        "Business Automobile",
        "Business Owners",
        "Commercial Cyber And Privacy Liability",
        "Commercial Fire",
        "Commercial Inland Marine",
        "Commercial Output Program",
        "Commercial Package",
        "Commercial Property",
        "Commercial Umbrella",
        "Crime",
        "Directors And Officers",
        "Earthquake",
        "Employers Liability",
        "Employment Practices Liability",
        "Equine Liability",
        "Errors And Omissions",
        "Excess Liability",
        "Fiduciary",
        "Garage And Dealers",
        "General Liability",
        "Installation / Builders Risk",
        "Kidnap and Ransom",
        "Lawyers Professional",
        "Liquor Liability",
        "Livestock Mortality",
        "Media Professional",
        "Medical Professional Liability",
        "Miscellaneous Professional Liability",
        "Motor Carrier",
        "Motor Truck Cargo",
        "Ocean Marine",
        "Physicians And Surgeons",
        "Railroad Protective Liability",
        "Special Event",
        "Special Multi-Peril",
        "Surety",
        "Truckers",
        "Wind Policies",
        "Worker's Compensation",
        "Workplace Violence",
      ],
    },
    personal: {
      label: "Personal Insurance",
      eyebrow: "For your home & everyday life",
      image: "images/personal-overlay.webp",
      description:
        "Florida homes carry risks that generic policies handle badly — wind, water, and rising replacement costs. We compare carriers on the coverage that matters, not just the premium, and bring the same scrutiny to the cars, boats, bikes, and everything else you insure.",
      items: [
        "Small Farm/Ranch",
        "Personal Inland Marine",
        "Personal Auto",
        "Dwelling Fire",
        "Homeowners",
        "Mobile Homeowners",
        "Recreational Vehicles",
        "Motorcycle",
        "Renters",
        "Yacht",
        "Personal Umbrella",
        "Flood",
        "Watercraft",
        "Condominium",
        "Personal & Premises Liability",
        "Pet Insurance",
        "Roadside Assistance",
        "Home Protection",
      ],
    },
    life: {
      label: "Life Insurance",
      eyebrow: "For the people who depend on you",
      image: "images/life-overlay.webp",
      description:
        "Term, whole, universal, and disability coverage explained without the sales script. We show you what each option costs over time, what it pays out, and which one fits the obligation you're actually trying to cover.",
      items: [
        "Annuity",
        "Life",
        "Long-Term Disability",
        "Short-Term Disability",
        "Term Life",
        "Universal Life",
        "Variable Life",
        "Whole Life",
      ],
    },
  },
};
