/* =============================================================
   app.js — reads AGENT from config.js and hydrates each page.
   No frameworks. Works over file://.
   ============================================================= */

/* ---------- Icon layer 1: shared UI glyphs ---------- */
const ICONS = {
  check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  arrow: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M17 7H9M17 7V15"/></svg>',
  plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  phone: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  email: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
  location: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  clock: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>',
  star: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  shield: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  linkedin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.3 0-2.95-1.8-2.95s-2.07 1.4-2.07 2.85V21h-4z"/></svg>',
  chevron: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
};

/* Social platform icons — keyed to match AGENT.social keys */
const SOCIAL_ICONS = {
  linkedin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.3 0-2.95-1.8-2.95s-2.07 1.4-2.07 2.85V21h-4z"/></svg>',
  facebook: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg>',
  twitter: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.24 2H21.5l-7.13 8.15L22.75 22h-6.56l-5.14-6.72L5.17 22H1.9l7.62-8.72L1.25 2h6.73l4.65 6.14zm-1.15 18h1.81L7.01 3.9H5.06z"/></svg>',
  instagram: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/></svg>',
  youtube: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.87-.49-5.73a2.99 2.99 0 0 0-2.1-2.11C18.54 3.66 12 3.66 12 3.66s-6.54 0-8.41.5A2.99 2.99 0 0 0 1.49 6.27C1 8.13 1 12 1 12s0 3.87.49 5.73a2.99 2.99 0 0 0 2.1 2.11c1.87.5 8.41.5 8.41.5s6.54 0 8.41-.5a2.99 2.99 0 0 0 2.1-2.11C23 15.87 23 12 23 12zM10 15.5v-7l6 3.5z"/></svg>',
};

/* ---------- Icon layer 2: one per coverage category ---------- */
const SERVICE_ICONS = {
  personal: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
  commercial: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><line x1="9" y1="9" x2="9" y2="9.01"/><line x1="9" y1="12" x2="9" y2="12.01"/><line x1="9" y1="15" x2="9" y2="15.01"/></svg>',
  life: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>',
};

/* ---------- Icon layer 3: one per individual policy ---------- */
const P = {
  car: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3v-5l2-5h12l2 5v5h-2"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/><path d="M5 12h14"/></svg>',
  liability: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M5 7h14"/><path d="m5 7-2 5a3 3 0 0 0 6 0L7 7"/><path d="m17 7-2 5a3 3 0 0 0 6 0l-2-5"/><path d="M8 21h8"/></svg>',
  building: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 21v-4h6v4"/><line x1="8" y1="7" x2="8" y2="7.01"/><line x1="12" y1="7" x2="12" y2="7.01"/><line x1="16" y1="7" x2="16" y2="7.01"/><line x1="8" y1="11" x2="8" y2="11.01"/><line x1="12" y1="11" x2="12" y2="11.01"/><line x1="16" y1="11" x2="16" y2="11.01"/></svg>',
  workers: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18a5 5 0 0 1 10 0"/><circle cx="7" cy="6" r="3"/><path d="M12 18a5 5 0 0 1 10 0"/><circle cx="17" cy="6" r="3"/></svg>',
  umbrella: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="M12 22a2 2 0 0 1-2-2v-7"/><path d="M2 12a10 10 0 0 1 20 0Z"/></svg>',
  briefcase: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
  cyber: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  package: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
  farm: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-6h6v6"/></svg>',
  fire: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 .5-2S6 11 6 14a6 6 0 0 0 12 0c0-5-6-12-6-12z"/></svg>',
  interruption: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>',
  heart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>',
  clockP: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>',
  infinity: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18.178 8c-2.343 0-3.464 1.5-5.178 4-1.714 2.5-2.835 4-5.178 4a3 3 0 0 1 0-6c2.343 0 3.464 1.5 5.178 4 1.714 2.5 2.835 4 5.178 4a3 3 0 0 0 0-6z"/></svg>',
  chart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6"/><rect x="13" y="7" width="3" height="10"/></svg>',
  home: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-6h6v6"/></svg>',
  flower: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2a3 3 0 0 0 0 6 3 3 0 0 0 0-6zM12 16a3 3 0 0 0 0 6 3 3 0 0 0 0-6zM2 12a3 3 0 0 0 6 0 3 3 0 0 0-6 0zM16 12a3 3 0 0 0 6 0 3 3 0 0 0-6 0z"/></svg>',
  users: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  key: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="4.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>',
  motorcycle: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="17" r="3"/><circle cx="19" cy="17" r="3"/><path d="M5 17h5l3-5h5l-2-3h-3"/><path d="M9 12 7 8H4"/></svg>',
  boat: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1"/><path d="M4 18 3 9h18l-1 9"/><path d="M12 3v6"/><path d="M12 3 8 6"/><path d="m12 3 4 3"/></svg>',
};
const POLICY_ICONS = {
  // personal
  "personal auto": P.car,
  homeowners: P.home,
  renters: P.key,
  condominium: P.building,
  "dwelling fire": P.fire,
  "mobile homeowners": P.home,
  motorcycle: P.motorcycle,
  "recreational vehicles": P.car,
  watercraft: P.boat,
  yacht: P.boat,
  "personal & premises liability": P.liability,
  "personal umbrella": P.umbrella,
  landlord: P.building,
  // commercial
  "commercial auto": P.car,
  "business automobile": P.car,
  "general liability": P.liability,
  "business owners (bop)": P.briefcase,
  "business owners policy (bop)": P.briefcase,
  "commercial property": P.building,
  "workers' compensation": P.workers,
  "workers compensation": P.workers,
  "commercial umbrella": P.umbrella,
  "errors & omissions": P.liability,
  "professional liability": P.liability,
  "cyber & privacy liability": P.cyber,
  "commercial package": P.package,
  "farm owners": P.farm,
  "commercial fire": P.fire,
  "business interruption": P.interruption,
  // life
  life: P.heart,
  "term life": P.clockP,
  "whole life": P.heart,
  "universal life": P.infinity,
  "variable life": P.chart,
  "burial & funeral": P.flower,
  survivorship: P.users,
  mortgage: P.home,
  credit: P.shield,
  supplemental: P.heart,
};
function policyIcon(name) {
  return POLICY_ICONS[name.toLowerCase()] || ICONS.check;
}

/* ---------- Brand markup (nav + footer) ---------- */
function brandMarkup() {
  if (AGENT.logo) {
    return `<img src="${AGENT.logo}" alt="${AGENT.name}" class="brand-logo">`;
  }
  // "Armine Insurance" bold + "Agency" light  (Policygenius-style)
  return `<span class="brand-bold">Armine Insurance</span><span class="brand-light">Agency</span>`;
}

/* ---------- Service helpers ---------- */
function serviceKeys() {
  return Object.keys(AGENT.services);
}
function serviceLabelShort(key) {
  // "Commercial Insurance" -> "Commercial"
  return AGENT.services[key].label.replace(/\s*Insurance$/i, "");
}
function coverageJoin() {
  const labels = serviceKeys().map(serviceLabelShort);
  if (labels.length === 1) return labels[0].toLowerCase();
  return (
    labels.slice(0, -1).map((l) => l.toLowerCase()).join(", ") +
    " and " +
    labels[labels.length - 1].toLowerCase()
  );
}

/* =============================================================
   NAV
   ============================================================= */
const PAGE_TITLES = {
  index: `${AGENT.name} | Personal, Commercial & Life Insurance in ${AGENT.location}`,
  about: `About ${AGENT.name} | Personal, Commercial & Life Insurance in ${AGENT.location}`,
  services: `Insurance Services | ${AGENT.name} — ${AGENT.location}`,
  contact: `Get a Free Insurance Quote | ${AGENT.name} — ${AGENT.location}`,
};

function buildNav(activePage) {
  if (PAGE_TITLES[activePage]) document.title = PAGE_TITLES[activePage];
  const nav = document.getElementById("nav");
  if (!nav) return;
  const links = [
    ["index.html", "Home", "index"],
    ["about.html", "About", "about"],
    ["services.html", "Services", "services"],
    ["contact.html", "Contact", "contact"],
  ];
  nav.innerHTML = `
    <div class="nav__inner wrap">
      <a href="index.html" class="nav__brand">${brandMarkup()}</a>
      <div class="nav__links" id="nav-links">
        ${links
          .map(
            ([href, label, key]) =>
              `<a href="${href}" class="nav__link${
                key === activePage ? " nav__link--active" : ""
              }">${label}</a>`
          )
          .join("")}
        <a href="contact.html" class="nav__cta nav__cta--mobile">Get a Quote ${ICONS.arrow}</a>
      </div>
      <a href="contact.html" class="nav__cta">Get a Quote <span class="nav__cta-arrow">${ICONS.arrow}</span></a>
      <button class="nav__hamburger" id="nav-hamburger" aria-label="Menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>`;

  const hamburger = document.getElementById("nav-hamburger");
  const linksEl = document.getElementById("nav-links");
  hamburger.addEventListener("click", () => {
    const open = linksEl.classList.toggle("nav__links--open");
    hamburger.classList.toggle("nav__hamburger--open", open);
    hamburger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  const onScroll = () =>
    nav.classList.toggle("nav--scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* =============================================================
   FOOTER
   ============================================================= */
function buildFooter() {
  const footer = document.getElementById("footer");
  if (!footer) return;

  const products = serviceKeys()
    .map(
      (k) =>
        `<li><a class="footer__col-link" href="services.html">${AGENT.services[k].label}</a></li>`
    )
    .join("");

  const company = [
    ["about.html", "About Us"],
    ["services.html", "Services"],
    ["contact.html", "Contact"],
  ]
    .concat(AGENT.reviews && AGENT.reviews.length ? [["about.html", "Reviews"]] : [])
    .map(
      ([href, label]) =>
        `<li><a class="footer__col-link" href="${href}">${label}</a></li>`
    )
    .join("");

  const contactBits = [
    AGENT.phone &&
      `<li class="footer__contact-row">${ICONS.phone}<a class="footer__col-link" href="${AGENT.phoneHref}">${AGENT.phone}</a></li>`,
    AGENT.email &&
      `<li class="footer__contact-row">${ICONS.email}<a class="footer__col-link" href="mailto:${AGENT.email}">${AGENT.email}</a></li>`,
    (AGENT.address || AGENT.location) &&
      `<li class="footer__contact-row">${ICONS.location}<span>${AGENT.address || AGENT.location}</span></li>`,
  ]
    .filter(Boolean)
    .join("");

  const socialItems = AGENT.social
    ? Object.entries(AGENT.social)
        .filter(([key, url]) => url && SOCIAL_ICONS[key])
        .map(
          ([key, url]) =>
            `<a class="footer__social" href="${url}" target="_blank" rel="noopener" aria-label="${key}">${SOCIAL_ICONS[key]}</a>`
        )
        .join("")
    : "";
  const socialRow = socialItems
    ? `<div class="footer__socials">${socialItems}</div>`
    : "";

  const year = 2026; // Date.now() unavailable over file:// safe default

  footer.innerHTML = `
    <div class="wrap footer__grid">
      <div class="footer__brand-col">
        <a href="index.html" class="footer__brand">${brandMarkup()}</a>
        <p class="footer__tagline">${AGENT.title}</p>
        ${socialRow}
      </div>
      <div class="footer__col">
        <h4 class="footer__col-title">Products</h4>
        <ul>${products}</ul>
      </div>
      <div class="footer__col">
        <h4 class="footer__col-title">Company</h4>
        <ul>${company}</ul>
      </div>
      <div class="footer__col">
        <h4 class="footer__col-title">Contact</h4>
        <ul>${contactBits}</ul>
      </div>
    </div>
    <div class="wrap"><div class="footer__divider"></div></div>
    <div class="wrap footer__bottom">
      <span>© ${year} Armine Insurance Agency, LLC. All rights reserved.</span>
    </div>`;
}

/* =============================================================
   HOME
   ============================================================= */
function initHome() {
  /* Hero (v3): light, centered layout styled entirely in CSS — no bg image injected */
  const ht = document.getElementById("hero-title");
  if (ht)
    ht.innerHTML = `Personal, commercial &amp; life coverage, built around <span class="emphasis">your world</span>.`;
  const hs = document.getElementById("hero-subtitle");
  if (hs) hs.textContent = AGENT.tagline;

  /* Hero quote bar buttons */
  const btns = document.getElementById("hero-quote-btns");
  if (btns) {
    btns.innerHTML = serviceKeys()
      .map((k) => {
        const link = AGENT.quoteLinks[k] || "#";
        const target =
          link && link !== "#" ? ' target="_blank" rel="noopener"' : "";
        return `<a class="hero__quote-btn" href="${link}"${target}>
          <span class="hero__quote-btn-icon">${SERVICE_ICONS[k] || ICONS.shield}</span>
          ${serviceLabelShort(k)} <span class="hero__quote-btn-arrow">${ICONS.chevron}</span>
        </a>`;
      })
      .join("");
  }

  /* Coverage bento grid */
  const grid = document.getElementById("coverage-grid");
  if (grid) {
    const keys = serviceKeys();
    // Card colors cycle: default (light) → primary → secondary (accent)
    const variants = ["light", "primary", "accent"];
    grid.className = "coverage__grid coverage__grid--rows";
    grid.innerHTML = keys
      .map((k, i) => {
        const s = AGENT.services[k];
        const v = variants[i % variants.length];
        return `<div class="coverage__row">
          <a class="coverage__card coverage__card--${v}" href="services.html">
            <div class="coverage__card-top">
              <span class="coverage__card-icon">${SERVICE_ICONS[k] || ICONS.shield}</span>
              <span class="coverage__card-tag">${s.items.length} coverage types</span>
            </div>
            <div class="coverage__card-content">
              <h3 class="coverage__card-name">${s.label}</h3>
              <p class="coverage__card-desc">${s.description}</p>
            </div>
            <span class="coverage__card-link">Explore coverage ${ICONS.arrow}</span>
          </a>
          <div class="coverage__card coverage__card--image">
            <img src="${s.image}" alt="${s.label} — ${AGENT.name}, ${AGENT.location}">
          </div>
        </div>`;
      })
      .join("");
  }

  /* Stats band */
  const statsImg = document.getElementById("stats-image");
  if (statsImg && AGENT.photo) {
    statsImg.innerHTML = `<img src="${AGENT.photo}" alt="${AGENT.name}, ${AGENT.title} in ${AGENT.location}">`;
  }
  const statsRow = document.getElementById("stats-row");
  if (statsRow) {
    statsRow.innerHTML = AGENT.stats
      .map(
        (s) =>
          `<div class="stats-band__stat"><span class="stats-band__stat-value">${s.value}</span><span class="stats-band__stat-label">${s.label}</span></div>`
      )
      .join("");
  }

  /* How it works */
  buildSteps();
}

/* Reusable process / "how it works" steps (used on Home and About) */
function buildSteps() {
  const stepsGrid = document.getElementById("steps-grid");
  if (stepsGrid) {
    const cov = coverageJoin();
    const STEP_ICONS = {
      // Hand-drawn line style, one icon per step's meaning (single-weight, rounded).
      // Choose type -> pick one option tile from several (the checked tile).
      pick: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 13a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2Z"/><path d="M25 13a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2Z"/><path d="M11 27a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2Z"/><path d="M25 27a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2Z"/><path d="M28 31l2.2 2.2 4.3-4.8"/></svg>',
      // Connect with an expert -> advisor wearing a headset.
      advisor: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="18" r="5.5"/><path d="M15 19a9 9 0 0 1 18 0"/><path d="M13.6 19.2h2.2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-2.2a1.4 1.4 0 0 1-1.4-1.4v-3.2a1.4 1.4 0 0 1 1.4-1.4Z"/><path d="M34.4 19.2h-2.2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2.2a1.4 1.4 0 0 0 1.4-1.4v-3.2a1.4 1.4 0 0 0-1.4-1.4Z"/><path d="M33 25.2v1.3a3 3 0 0 1-3 3h-3"/><path d="M13.5 39v-1.5a10.5 10.5 0 0 1 21 0V39"/></svg>',
      // Choose your perfect plan -> protected/approved coverage.
      shieldCheck: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M24 9l11 4v8.5c0 7.6-4.7 12.4-11 15-6.3-2.6-11-7.4-11-15V13z"/><path d="M18.5 23.5l4 4 7.5-8.5"/></svg>',
    };
    const STEPS = [
      {
        icon: STEP_ICONS.pick,
        title: "Choose your insurance type",
        desc: `We help you navigate your ${cov} insurance options with ease.`,
      },
      {
        icon: STEP_ICONS.advisor,
        title: "Connect with an expert",
        desc: `${AGENT.firstName} learns your needs, answers your questions, and helps you decide with confidence.`,
      },
      {
        icon: STEP_ICONS.shieldCheck,
        title: "Choose your perfect plan",
        desc: "Select coverage from an expert-curated list of policies built for your needs.",
      },
    ];
    stepsGrid.innerHTML = STEPS.map(
      (s) => `<div class="step-card">
        <span class="step-card__icon">${s.icon}</span>
        <h3 class="step-card__title">${s.title}</h3>
        <p class="step-card__desc">${s.desc}</p>
      </div>`
    ).join("");
  }
}

/* =============================================================
   ABOUT
   ============================================================= */
function initAbout() {
  const bioEl = document.getElementById("about-bio");
  if (bioEl) {
    bioEl.innerHTML = AGENT.bio
      .split("\n\n")
      .map((p) => `<p>${p}</p>`)
      .join("");
  }
  const photoEl = document.getElementById("about-photo");
  if (photoEl && AGENT.photo) {
    photoEl.innerHTML = `<img src="${AGENT.photo}" alt="${AGENT.name}, ${AGENT.title} in ${AGENT.location}">`;
  }

  /* Info cards */
  const info = document.getElementById("about-info");
  if (info) {
    const policyCount = Object.values(AGENT.services).reduce(
      (n, s) => n + s.items.length,
      0
    );
    const cards = [
      { num: `${AGENT.experience}+`, label: "years experienced" },
      { num: `${AGENT.states.length}`, label: "states licensed" },
      { num: `${policyCount}`, label: "policy options" },
    ];
    info.innerHTML = cards
      .map(
        (c) => `<div class="info-card">
          <span class="info-card__value">${c.num}</span>
          <span class="info-card__label">${c.label}</span>
        </div>`
      )
      .join("");
  }

  /* Licensed states pills */
  const states = document.getElementById("about-states");
  if (states) {
    states.innerHTML = AGENT.states
      .map((s) => `<span class="state-pill">${s}</span>`)
      .join("");
  }

  /* Carrier slider (doubled for seamless loop) */
  const track = document.getElementById("carrier-track");
  if (track) {
    const items = AGENT.carriers
      .concat(AGENT.carriers)
      .map((c) => `<div class="carrier-chip">${c}</div>`)
      .join("");
    track.innerHTML = items;
  }
}

/* =============================================================
   SERVICES
   ============================================================= */
function initServices() {
  const container = document.getElementById("services-container");
  if (!container) return;
  const keys = serviceKeys();

  const renderBlock = (k) => {
    const s = AGENT.services[k];
    const link = AGENT.quoteLinks[k] || "#";
    const target = link && link !== "#" ? ' target="_blank" rel="noopener"' : "";
    const items = s.items
      .map(
        (it) => `<div class="policy-card">
            <span class="policy-card__icon">${policyIcon(it)}</span>
            <span class="policy-card__name">${it}</span>
          </div>`
      )
      .join("");
    return `<section class="service-block">
        <div class="service-block__head">
          <h2 class="service-block__title">${s.label}</h2>
          <p class="service-block__lead">${s.description}</p>
          <a class="btn-accent service-block__cta" href="${link}"${target}>Get a Quote ${ICONS.arrow}</a>
        </div>
        <div class="policy-grid">${items}</div>
      </section>`;
  };

  const tabs = keys
    .map(
      (k, i) =>
        `<button class="service-switch__tab${i === 0 ? " service-switch__tab--active" : ""}" data-key="${k}">
          <span class="service-switch__tab-icon">${SERVICE_ICONS[k] || ICONS.shield}</span>${AGENT.services[k].label}
        </button>`
    )
    .join("");

  container.innerHTML = `
    <div class="service-switch__tabs" role="tablist">${tabs}</div>
    <div class="service-switch__panel" id="service-switch-panel">${renderBlock(keys[0])}</div>`;

  const tabsEl = container.querySelector(".service-switch__tabs");
  const panel = container.querySelector("#service-switch-panel");
  tabsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".service-switch__tab");
    if (!btn) return;
    tabsEl
      .querySelectorAll(".service-switch__tab")
      .forEach((b) => b.classList.toggle("service-switch__tab--active", b === btn));
    panel.innerHTML = renderBlock(btn.dataset.key);
    // Panel height changed — remeasure the smooth-scroll content height.
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  });
}

/* =============================================================
   CONTACT
   ============================================================= */
function initContact() {
  /* Quote widget tabs */
  const tabs = document.getElementById("quote-tabs");
  const panel = document.getElementById("quote-panel");
  if (tabs && panel) {
    const keys = serviceKeys();
    tabs.innerHTML = keys
      .map(
        (k, i) =>
          `<button class="quote-tab${i === 0 ? " quote-tab--active" : ""}" data-key="${k}">
            <span>${SERVICE_ICONS[k] || ICONS.shield}</span>${serviceLabelShort(k)}
          </button>`
      )
      .join("");

    const renderPanel = (k) => {
      const s = AGENT.services[k];
      const link = AGENT.quoteLinks[k] || "#";
      const target = link && link !== "#" ? ' target="_blank" rel="noopener"' : "";
      panel.innerHTML = `
        <h3 class="quote-panel__title">${s.label}</h3>
        <p class="quote-panel__desc">${s.description}</p>
        <a class="btn-accent quote-panel__cta" href="${link}"${target}>Request a free ${serviceLabelShort(
        k
      ).toLowerCase()} quote ${ICONS.arrow}</a>
        <p class="quote-panel__note">Free, no-obligation consultation. ${AGENT.firstName} responds promptly.</p>`;
    };
    renderPanel(keys[0]);
    tabs.addEventListener("click", (e) => {
      const btn = e.target.closest(".quote-tab");
      if (!btn) return;
      tabs.querySelectorAll(".quote-tab").forEach((b) =>
        b.classList.toggle("quote-tab--active", b === btn)
      );
      renderPanel(btn.dataset.key);
    });
  }

  /* Contact info cards */
  const info = document.getElementById("contact-info");
  if (info) {
    const rows = [
      AGENT.phone && {
        icon: ICONS.phone,
        label: "Phone",
        value: AGENT.phone,
        href: AGENT.phoneHref,
      },
      AGENT.email && {
        icon: ICONS.email,
        label: "Email",
        value: AGENT.email,
        href: `mailto:${AGENT.email}`,
      },
      (AGENT.address || AGENT.location) && {
        icon: ICONS.location,
        label: "Office",
        value: AGENT.address || AGENT.location,
      },
    ].filter(Boolean);
    info.innerHTML = rows
      .map((r) => {
        const inner = r.href
          ? `<a href="${r.href}">${r.value}</a>`
          : `<span>${r.value}</span>`;
        return `<div class="contact-card">
          <span class="contact-card__icon">${r.icon}</span>
          <div><span class="contact-card__label">${r.label}</span>${inner}</div>
        </div>`;
      })
      .join("");
  }

  /* Hours table */
  const hours = document.getElementById("contact-hours");
  if (hours) {
    hours.innerHTML = AGENT.hours
      .map(
        (h) =>
          `<div class="hours-row"><span>${h.days}</span><span class="${
            /closed/i.test(h.time) ? "hours-closed" : ""
          }">${h.time}</span></div>`
      )
      .join("");
  }

  /* Licensed states pills */
  const states = document.getElementById("contact-states");
  if (states) {
    states.innerHTML = AGENT.states
      .map((s) => `<span class="state-pill">${s}</span>`)
      .join("");
  }
}

/* =============================================================
   REVIEWS — config-driven; the whole section hides when empty.
   ============================================================= */
function initReviews() {
  const section = document.getElementById("reviews-section");
  if (!section) return;
  const reviews = AGENT.reviews;
  if (!reviews || !reviews.length) {
    section.style.display = "none";
    return;
  }
  const grid = document.getElementById("reviews-grid");
  if (!grid) return;
  // Repeating layout pattern so any number of reviews keeps the varied grid.
  const layout = [
    "review-card--accent review-card--lg review-card--span2",
    "review-card--dark",
    "review-card--dark",
    "review-card--soft",
    "review-card--soft",
    "review-card--lg review-card--span2",
  ];
  grid.innerHTML = reviews
    .map(
      (r, i) => `<blockquote class="review-card ${layout[i % layout.length]}">
        <p class="review-card__quote">"${r.quote}"</p>
        <footer class="review-card__author"><span class="review-card__name">${r.name}</span>${
        r.role
          ? `<span class="review-card__role">${r.role}</span>`
          : ""
      }</footer>
      </blockquote>`
    )
    .join("");
}

/* =============================================================
   FAQ
   ============================================================= */
function initFaq(id) {
  const list = document.getElementById(id);
  const section = document.getElementById("faq-section");
  if (!list) return;
  if (!AGENT.faqs || !AGENT.faqs.length) {
    if (section) section.style.display = "none";
    return;
  }
  list.innerHTML = AGENT.faqs
    .map(
      (f, i) => `<div class="faq__item${i === 0 ? " faq__item--open" : ""}">
        <button class="faq__btn" aria-expanded="${i === 0}">
          <span class="faq__question">${f.q}</span>
          <span class="faq__toggle">${ICONS.plus}</span>
        </button>
        <div class="faq__body"><div class="faq__body-inner">${f.a}</div></div>
      </div>`
    )
    .join("");
  initAccordions();
}

function initAccordions() {
  const items = document.querySelectorAll(".faq__item");
  items.forEach((item) => {
    const btn = item.querySelector(".faq__btn");
    const body = item.querySelector(".faq__body");
    const setOpen = (open) => {
      item.classList.toggle("faq__item--open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      body.style.maxHeight = open ? body.scrollHeight + "px" : "0px";
    };
    // init
    setOpen(item.classList.contains("faq__item--open"));
    btn.addEventListener("click", () => {
      const willOpen = !item.classList.contains("faq__item--open");
      items.forEach((other) => {
        if (other !== item) {
          other.classList.remove("faq__item--open");
          other.querySelector(".faq__btn").setAttribute("aria-expanded", "false");
          other.querySelector(".faq__body").style.maxHeight = "0px";
        }
      });
      setOpen(willOpen);
      // Page height changed — let ScrollTrigger/ScrollSmoother remeasure
      // once the 0.3s max-height transition settles.
      if (typeof ScrollTrigger !== "undefined")
        setTimeout(() => ScrollTrigger.refresh(), 350);
    });
  });
}

/* =============================================================
   SECTION ALTERNATION
   Walk the visible content sections in order and alternate their
   background: default (white) → muted (soft) → default → …
   Runs after other inits so hidden sections (e.g. empty reviews)
   don't throw off the rhythm.
   ============================================================= */
function initSectionAlternation() {
  const sections = Array.from(
    document.querySelectorAll(
      "section.section, section.stats-band, section.bottom-cta"
    )
  ).filter((s) => getComputedStyle(s).display !== "none");

  // Coverage is always white; the remaining sections alternate
  // muted → default → muted → … in the order they appear. The CTA uses
  // its own modifier (it defaults to muted in CSS), so toggle that instead.
  let i = 0;
  sections.forEach((s) => {
    const isCta = s.classList.contains("bottom-cta");
    if (s.id === "coverage") {
      s.classList.remove("section--soft");
      return;
    }
    const muted = i % 2 === 0;
    if (isCta) {
      s.classList.toggle("bottom-cta--default", !muted); // white when not muted
    } else {
      s.classList.toggle("section--soft", muted);
    }
    i++;
  });
}

/* =============================================================
   SMOOTH SCROLL (GSAP ScrollSmoother)
   Site-wide inertial smooth scrolling. The fixed nav lives outside
   #smooth-wrapper so it stays put; everything else scrolls inside
   #smooth-content. Touch devices keep native scrolling (smoothTouch
   off) and reduced-motion users get the browser default.
   Progressive enhancement: without the plugin, scrolling is native.
   ============================================================= */
let SMOOTHER = null;
function initSmoothScroll() {
  if (
    typeof gsap === "undefined" ||
    typeof ScrollTrigger === "undefined" ||
    typeof ScrollSmoother === "undefined"
  )
    return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const wrapper = document.getElementById("smooth-wrapper");
  const content = document.getElementById("smooth-content");
  if (!wrapper || !content) return;

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  SMOOTHER = ScrollSmoother.create({
    wrapper,
    content,
    smooth: 1.2, // seconds to "catch up" to the native scroll position
    smoothTouch: false, // keep native feel on touch devices
    normalizeScroll: false,
  });
}

/* =============================================================
   SCROLL REVEAL (GSAP + ScrollTrigger)
   Titles & content slide up from the bottom as they enter view.
   Progressive enhancement: if GSAP is unavailable, or the user
   prefers reduced motion, content simply renders in place.
   ============================================================= */
function initReveal() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.registerPlugin(ScrollTrigger);

  const start = "top 88%";

  /* 1. Section titles & descriptions — mask reveal, rising from the bottom. */
  const revealHidden = { clipPath: "inset(100% 0% 0% 0%)", yPercent: 40, opacity: 0 };
  const revealShown = {
    clipPath: "inset(0% 0% 0% 0%)",
    yPercent: 0,
    opacity: 1,
    ease: "power3.out",
    duration: 0.8,
  };
  const revealSelectors = [
    ".sec-head h2",
    ".sec-head p",
    ".hero__title",
    ".hero__subtitle",
    ".about-hero__title",
    ".about-hero__lead",
    ".about-hero__pre",
    ".about-hero__name",
    ".about-hero__role",
    ".about-hero__bio",
    ".stats-band__title",
    ".stats-band__subtitle",
    ".service-block__title",
    ".service-block__lead",
    ".bottom-cta__title",
    ".bottom-cta__desc",
  ];
  gsap.utils.toArray(revealSelectors.join(",")).forEach((el) => {
    gsap.fromTo(el, revealHidden, {
      ...revealShown,
      scrollTrigger: { trigger: el, start, once: true },
    });
  });

  /* 2. Every other element — smooth slide up, staggered 120ms among the
        elements that scroll into view together. */
  const otherSelectors = [
    ".about-hero__label",
    ".about-hero__photo",
    ".stats-band__label",
    ".stats-band__image",
    ".service-block__eyebrow",
    ".service-block__media",
    ".bottom-cta__image",
    ".hero__quote-bar",
    ".hero__content .btn-accent",
    ".hero__content .btn-outline",
    ".policy-card",
    ".step-card",
    ".review-card",
    ".faq__item",
    ".info-card",
    ".contact-card",
    ".hours-row",
    ".state-pill",
    ".quote-widget",
    ".quote-tab",
    ".how-it-works__cta",
  ];
  const others = gsap.utils.toArray(otherSelectors.join(","));
  gsap.set(others, { y: 40, opacity: 0 });
  ScrollTrigger.batch(others, {
    start,
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.12,
      }),
  });

  // Recalculate trigger positions once images have loaded and settled layout.
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

/* =============================================================
   HERO FLOATING CIRCLES
   Scatters the /hero photos as circular, floating avatars around
   the hero's side gutters (never over the centered headline). Each
   gets a random size, position and opacity, a gentle bob animation,
   depth-based mouse parallax, a hover pop, and a staggered fade-in.
   Progressive enhancement: reduced motion drops the motion; mobile
   hides the layer via CSS.
   ============================================================= */
function initHeroFloaties() {
  const wrap = document.getElementById("hero-floaties");
  if (!wrap) return;
  const hero = wrap.closest(".hero");

  const files = [
    "floating-img-1.webp",
    "floating-img-2.webp",
    "floating-img-3.webp",
    "floating-img-4.webp",
    "floating-img-5.webp",
    "floating-image-6.webp",
    "floating-img-7.webp",
  ];
  // Placement zones (circle CENTER, as % of hero) — a ring SURROUNDING the
  // centered content: a top band (above the eyebrow), a bottom band (below
  // the features) and the two side gutters. None sit over the text column
  // (~30–70% x, ~30–79% y). More slots than images → the 7 photos cycle.
  const slots = [
    // Exact marked spots. Each carries its own size, opacity and image
    // (img = index into files) — mixed opacities, none fully opaque.
    { x: 22.3, y: 24, size: 128, op: 0.5, img: 0 }, // upper-left, big
    { x: 59, y: 17, size: 84, op: 0.2, img: 1 }, // top-right, medium
    { x: 89.3, y: 81, size: 130, op: 0.5, img: 3 }, // lower right, big (hands + heart)
    { x: 16.5, y: 98, size: 122, op: 0.5, img: 4 }, // bottom-left corner, big (partially cropped)
    // Faint ghost circles (images repeat) — subtle depth filler.
    { x: 81.5, y: 39.5, size: 44, op: 0.05, img: 6 }, // right, above the old right spot
    { x: 32.7, y: 56.5, size: 48, op: 0.05, img: 0 }, // left of the subtitle
  ];
  // Deterministic per-slot motion (no Math.random) so every page load
  // renders the floaties identically — cycled from these fixed tables.
  const MOTION = [
    { depth: 1.2, dur: "9.5s", delay: "-2.0s", fx: 6, fy: -18, rot: 2 },
    { depth: 0.7, dur: "11.0s", delay: "-5.5s", fx: -8, fy: -22, rot: -3 },
    { depth: 1.5, dur: "8.0s", delay: "-1.0s", fx: 4, fy: -14, rot: 3 },
    { depth: 0.9, dur: "12.5s", delay: "-7.0s", fx: -5, fy: -20, rot: -2 },
    { depth: 1.3, dur: "10.0s", delay: "-3.5s", fx: 9, fy: -16, rot: 4 },
    { depth: 0.6, dur: "9.0s", delay: "-6.0s", fx: -7, fy: -24, rot: -4 },
  ];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = [];

  slots.forEach((slot, i) => {
    const src = files[(slot.img != null ? slot.img : i) % files.length];
    const size = slot.size;
    const cx = slot.x; // exact marked position
    const cy = slot.y;
    const op = slot.op;
    const m = MOTION[i % MOTION.length];
    const depth = m.depth; // parallax strength

    const el = document.createElement("div");
    el.className = "floaty";
    el.style.width = el.style.height = size + "px";
    el.style.left = `calc(${cx}% - ${size / 2}px)`;
    el.style.top = `calc(${cy}% - ${size / 2}px)`;
    el.style.setProperty("--s", "0.6"); // start small, pops to 1 on entrance

    const bob = document.createElement("div");
    bob.className = "floaty__bob";
    bob.style.setProperty("--dur", m.dur);
    bob.style.animationDelay = m.delay;
    bob.style.setProperty("--fx", m.fx + "px");
    bob.style.setProperty("--fy", m.fy + "px");
    bob.style.setProperty("--rot", m.rot + "deg");
    bob.innerHTML = `<img src="hero/${src}" alt="">`;
    el.appendChild(bob);
    wrap.appendChild(el);

    // Staggered entrance
    setTimeout(() => {
      el.style.opacity = op;
      el.style.setProperty("--s", "1");
    }, 150 + i * 90);

    items.push({ el, depth, cx: 0, cy: 0 });
  });

  if (reduce || !hero) return;

  // Depth-based mouse parallax, smoothed with a lerp each frame.
  let mx = 0, my = 0;
  hero.addEventListener("mousemove", (e) => {
    const r = hero.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    my = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  hero.addEventListener("mouseleave", () => {
    mx = 0;
    my = 0;
  });

  const amp = 28;
  (function tick() {
    for (const it of items) {
      const tx = mx * amp * it.depth;
      const ty = my * amp * it.depth;
      it.cx += (tx - it.cx) * 0.08;
      it.cy += (ty - it.cy) * 0.08;
      it.el.style.setProperty("--px", it.cx.toFixed(2) + "px");
      it.el.style.setProperty("--py", it.cy.toFixed(2) + "px");
    }
    requestAnimationFrame(tick);
  })();
}

/* =============================================================
   COVERAGE STACK (GSAP + ScrollTrigger)
   Each coverage row scrolls up from the bottom, pins near the top,
   and the next row slides up and stacks over it — a sticky pile.
   As a row gets covered it recedes (scale + dim) for depth. The
   effect is scroll-linked (scrub), so it plays in reverse on
   scroll-up. Progressive enhancement: without GSAP or with reduced
   motion, rows stay in the normal stacked layout.
   ============================================================= */
function initCoverageStack() {
  const grid = document.getElementById("coverage-grid");
  if (!grid) return;
  const rows = Array.from(grid.querySelectorAll(".coverage__row"));
  if (rows.length < 2) return;
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const section = document.getElementById("coverage");
  if (!section) return;

  /* Enable only on wider screens with motion allowed. gsap.matchMedia
     auto-reverts the class, transforms, and triggers when the query
     stops matching (e.g. resized down to the mobile stacked layout). */
  const mm = gsap.matchMedia();
  mm.add(
    "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
    () => {
      grid.classList.add("coverage__grid--stack");

      const n = rows.length;
      const step = 520; // scroll distance devoted to each card landing

      // First card sits in the stage; the rest wait one viewport below.
      rows.forEach((row, i) => {
        gsap.set(row, {
          y: i === 0 ? 0 : window.innerHeight,
          scale: 1,
          opacity: 1,
          zIndex: i + 1, // later rows stack on top
        });
      });

      // Pin the whole section (heading + stage) so the title stays visible,
      // and scrub each waiting row up from the bottom onto the pile.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 80px", // pin just below the fixed nav
          end: "+=" + step * (n - 1),
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      // Each row gets an equal, contiguous scroll segment. duration:1 must
      // match the position step (i-1) — otherwise GSAP's default 0.5s tween
      // leaves a gap before each later row (dead scroll before row 3+).
      for (let i = 1; i < n; i++) {
        tl.to(
          rows[i - 1],
          { scale: 0.9, opacity: 0.5, ease: "none", duration: 1 },
          i - 1
        ).to(rows[i], { y: 0, ease: "none", duration: 1 }, i - 1);
      }

      return () => {
        grid.classList.remove("coverage__grid--stack");
        gsap.set(rows, { clearProps: "all" });
      };
    }
  );

  window.addEventListener("load", () => ScrollTrigger.refresh());
}

/* Create the smoother immediately (before the inline hydration scripts
   register any pinned ScrollTriggers) so pinning uses transform mode. */
initSmoothScroll();

/* Run after each page's inline hydration has populated the DOM. */
document.addEventListener("DOMContentLoaded", initReveal);
