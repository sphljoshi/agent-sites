/* =============================================================
   config.js — SINGLE SOURCE OF TRUTH
   Edit this file (and swap the photo) to retarget the site.
   ============================================================= */
const AGENT = {
  name: "Ceranes Lejulus",
  firstName: "Ceranes",
  title: "Founder & Licensed Insurance Advisor",
  brand: { bold: "Everbe", light: "Insurance" }, // nav/footer text brand (used when logo is null)
  copyright: "Everbe Insurance", // footer © line
  specialty: "Personal, Commercial & Life Insurance", // <title> keyword phrase
  // Hero title rule: max 40 characters of visible text, two lines.
  heroTitle:
    'Protecting Your Health,<br>Wealth &amp; <span class="emphasis">Legacy</span>.',
  // Hero content rule: subtitle must fit two lines in the hero (keep it short).
  tagline:
    "Protection for today, and beyond. Whether you're providing for your loved ones, planning your retirement, or building your wealth — we're here to help.",
  bio:
    "Everbe Insurance was established to assist modern consumers and help them protect, grow and thrive. Our team helps consumers find unbiased, customized insurance coverage at any stage of their journey. Unlike other online platforms, we are not obligated to any insurance carrier — our top priority is to help you, your family and the community thrive.\n\nCeranes Lejulus, the founder of Everbe Insurance, has worked for many years as a Licensed Insurance Advisor serving seniors, families, and businesses. With more than 15 years of industry experience, he holds active insurance licenses across multiple states, and his extensive background allows him to support a wide range of insurance needs.\n\nAs an independent agent, Ceranes represents numerous national and regional insurance carriers, ensuring his recommendations are guided by the needs of his clients — not the insurance companies. He has built strong partnerships with leading organizations such as UnitedHealthcare, Humana, Aetna, Cigna (HealthSpring), National Life Group, and Nationwide Insurance, among others. He is also a member of the National Sales Network (NSN), a nationwide alliance of professionals who collaborate to better serve clients and strengthen relationships with major insurance providers.",
  experience: "15",
  photo: "images/about-us-hero.webp",
  heroImage: "hero-image.jpg", // kept for compatibility — NOT rendered in v3
  // Hero media slider — when set, overrides the per-service images.
  heroSlides: [
    { src: "hero/slides/slide-1.jpg", alt: "Personal Insurance, Ceranes Lejulus, Orlando, FL" },
    { src: "hero/slides/slide-2.webp", alt: "Health Insurance, Ceranes Lejulus, Orlando, FL" },
    { src: "hero/slides/slide-3.jpg", alt: "Life Insurance, Ceranes Lejulus, Orlando, FL" },
    { src: "hero/slides/slide-4.jpg", alt: "Commercial Insurance, Ceranes Lejulus, Orlando, FL" },
  ],
  phone: "(855) 717-0011",
  phoneHref: "tel:+18557170011",
  email: "ceranesmedia@gmail.com",
  location: "Orlando, FL",
  address: "100 E Pine St, Suite 110, Orlando, FL 32801",
  social: {
    facebook: "https://www.facebook.com/healthugo/",
    instagram: "https://www.instagram.com/myhealthugo/",
    linkedin: "https://www.linkedin.com/in/healthugo/",
    twitter: "https://www.x.com/healthugo/",
    youtube: "https://www.youtube.com/@medicarelism",
  },
  logo: "logo/normal.webp", // null → text brand fallback
  logoInverse: "logo/inverse.webp", // used on the dark footer

  hours: [
    { days: "Monday to Saturday", time: "9:00 AM to 6:00 PM" },
    { days: "Sunday", time: "Closed" },
  ],

  states: ["AL","AZ","CA","DC","FL","GA","IL","IN","KY","MA","ME","MI","MO","MS","NJ","NY","OH","OK","SD","TX","VT","WI","WV","WY"],

  carriers: [
    "UnitedHealthcare",
    "Humana",
    "Aetna",
    "Cigna",
    "Anthem",
    "Wellcare",
    "Nationwide",
    "National Life Group",
    "Allianz",
    "Transamerica",
    "Pacific Life",
    "Oscar Health",
    "Molina Healthcare",
    "Colonial Life",
    "Ameritas",
    "Florida Blue",
  ],

  reviews: [
    {
      quote:
        "Ceranes made the sign up for Medicare very easy. He was very professional & stayed in contact with up dates on my status. Cranes explained all the coverage I had & answered all my questions, I didn't feel rushed. You have a great employee, I'm happy going forward to have him as my agent.",
      name: "Myla Elowsky",
      role: "Medicare Client",
    },
  ],

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
      a: "I've been helping clients with their insurance needs for 15 years. My experience in the industry has equipped me with the knowledge to guide you through the insurance process and find coverage that meets your needs.",
    },
    {
      q: "What are your agency hours?",
      a: "My agency hours are:<br>• Monday: 9:00 AM - 6:00 PM<br>• Tuesday: 9:00 AM - 6:00 PM<br>• Wednesday: 9:00 AM - 6:00 PM<br>• Thursday: 9:00 AM - 6:00 PM<br>• Friday: 9:00 AM - 6:00 PM<br>• Saturday: 9:00 AM - 6:00 PM",
    },
    {
      q: "What languages do you speak?",
      a: "I speak English and French and Spanish fluently.",
    },
  ],

  quoteLinks: {
    personal: "https://aght.us/670d8dc7",
    commercial: "https://aght.us/405e899b",
    life: "https://aght.us/f170ebc5",
  },

  stats: [
    { value: "15+", label: "years of experience" },
    { value: "24", label: "states licensed" },
    { value: "150+", label: "carriers represented" },
  ],

  services: {
    personal: {
      label: "Personal Insurance",
      eyebrow: "For your everyday life",
      image: "hero/slides/slide-1.jpg",
      description:
        "Protection for the things you rely on every day, from your home and vehicles to everything in between. Unbiased, customized coverage that fits your life at a price that actually makes sense.",
      cardDescription:
        "Coverage for your home, vehicles, and everything in between at a price that makes sense.",
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
        "Personal Umbrella",
        "Personal & Premises Liability",
        "Flood",
        "Home Protection",
        "Pet Insurance",
        "Roadside Assistance",
      ],
    },
    commercial: {
      label: "Commercial Insurance",
      eyebrow: "For your business",
      image: "hero/slides/slide-4.jpg",
      description:
        "Comprehensive protection for your business, from liability and property to vehicles and workers. Coverage tailored to keep your operation running smoothly.",
      cardDescription:
        "Liability, property, vehicles, and workers. Coverage that keeps your business running.",
      items: [
        "General Liability",
        "Business Owners",
        "BOP Liability",
        "BOP Property",
        "Commercial Property",
        "Business Automobile",
        "Worker's Compensation",
        "Commercial Umbrella",
        "Errors And Omissions",
        "Commercial Package",
        "Accountants Professional",
        "Agricultural Output Program",
        "Agriculture Liability",
        "Agriculture Package",
        "Agriculture Property",
        "Agriculture Scheduled & Unscheduled Personal Property",
        "Architects Professional",
        "Artisans",
        "Aviation",
        "Boiler And Machinery",
        "Commercial Cyber And Privacy Liability",
        "Commercial Fire",
        "Commercial Inland Marine",
        "Commercial Output Program",
        "Crime",
        "Directors And Officers",
        "Earthquake",
        "Employers Liability",
        "Employment Practices Liability",
        "Equine Liability",
        "Excess Liability",
        "Fiduciary",
        "Garage And Dealers",
        "Installation / Builders Risk",
        "Kidnap & Ransom",
        "Lawyers Professional",
        "Liquor Liability",
        "Livestock Mortality",
        "Media Professional",
        "Medical Professional Liability",
        "Miscellaneous Professional Liability",
        "Motor Carrier",
        "Motor Truck Cargo",
        "Ocean Marine",
        "Personal Inland Marine",
        "Physicians And Surgeons",
        "Railroad Protective Liability",
        "Small Farm/Ranch",
        "Special Event",
        "Special Multi-Peril",
        "Surety",
        "Truckers",
        "Wind Policies",
        "Workplace Violence",
      ],
    },
    life: {
      label: "Life Insurance",
      eyebrow: "For your family",
      image: "hero/slides/slide-3.jpg",
      description:
        "Financial security for the people who matter most. Whether you're providing for your loved ones, planning your retirement, or building your wealth, term, whole, universal and variable life solutions protect your family's future and your legacy.",
      cardDescription:
        "Term, whole, universal and variable life solutions that protect your family's future.",
      items: ["Term Life", "Whole Life", "Universal Life", "Variable Life", "Life"],
    },
  },
};
