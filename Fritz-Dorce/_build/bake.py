"""Bake config.js agent data into the v2 template HTML (crawler-visible defaults)."""
import json, re, subprocess, html, sys, os

D = sys.argv[1]
os.chdir(D)
A = json.loads(subprocess.check_output(["node", "-e",
    "eval(require('fs').readFileSync('config.js','utf8').replace('const AGENT','global.AGENT'));console.log(JSON.stringify(AGENT))"]))

ARROW = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M17 7H9M17 7V15"/></svg>'
LOC, NAME, BRAND = A["location"], A["name"], A["brand"]
STATES_FULL = ["Florida", "Georgia", "Texas"]
TEL = "+19544958788"
KNOWS = ["Life Insurance", "Term Life Insurance", "Whole Life Insurance", "Annuities", "Disability Insurance",
         "Homeowners Insurance", "Auto Insurance", "Flood Insurance", "Commercial Insurance", "Workers Compensation"]
HOURS = [{"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00", "closes": "18:00"}]


def strip(t):
    t = re.sub(r"<br\s*/?>", " ", t)
    t = re.sub(r"<[^>]+>", "", t).replace("•", "")
    return re.sub(r"\s+", " ", t).strip()


def addr():
    return {"@type": "PostalAddress", "addressLocality": "Cooper City", "addressRegion": "FL",
            "postalCode": "33330", "addressCountry": "US"}


def ld(obj):
    return '<script type="application/ld+json">\n' + json.dumps(obj, indent=2, ensure_ascii=False) + "\n    </script>"


def sub(s, pat, rep, count=1):
    out, n = re.subn(pat, lambda m: rep, s, count=count, flags=re.S)
    assert n, pat[:80]
    return out


faq_node = {"@type": "FAQPage", "mainEntity": [
    {"@type": "Question", "name": f["q"], "acceptedAnswer": {"@type": "Answer", "text": strip(f["a"])}} for f in A["faqs"]]}
agency = {"@type": "InsuranceAgency", "@id": "#agency", "name": f"{BRAND} — {NAME}",
          "description": "Independent insurance agency offering life, personal and commercial insurance across Florida, Georgia and Texas.",
          "telephone": TEL, "email": A["email"], "logo": "itd-insurance-delivers-logo.png?v=3", "image": A["photo"], "address": addr(),
          "areaServed": STATES_FULL, "openingHoursSpecification": HOURS,
          "sameAs": ["https://agents.agencyheight.com/insurance/fritz-dorce", "https://insurancethatworksflorida.com/", "https://www.facebook.com/share/18YEEStvtj/", "https://www.instagram.com/fritzdorce"],
          "employee": {"@type": "Person", "name": NAME, "jobTitle": A["title"], "knowsAbout": KNOWS}}
home_agency = dict(agency,
                   aggregateRating={"@type": "AggregateRating", "ratingValue": "5", "reviewCount": str(len(A["reviews"]))},
                   review=[{"@type": "Review", "author": {"@type": "Person", "name": r["name"]},
                            "reviewRating": {"@type": "Rating", "ratingValue": "5"}, "reviewBody": r["quote"]} for r in A["reviews"]])
TITLE_SPEC = "Life, Home &amp; Business Insurance"
alt_photo = f'{NAME}, {A["title"]} with {BRAND} in {LOC}'
cta_img = f'<img src="cta-image.webp" alt="{NAME} shaking hands with clients after reviewing their coverage in {LOC}" loading="lazy" />'
keys = list(A["services"])


def head(s, title, desc, schema):
    s = sub(s, r"<title>.*?</title>", f"<title>{title}</title>")
    s = sub(s, r'<meta\s+name="description"\s+content="[^"]*"\s*/>', f'<meta name="description" content="{desc}" />')
    # JSON-LD is replaced by seo.py with the full linked @graph
    return sub(s, r'<script type="application/ld\+json">.*?</script>', ld(schema))


def bottom_cta(s, title_html, desc):
    s = sub(s, r'<h2 class="bottom-cta__title">.*?</h2>', f'<h2 class="bottom-cta__title">{title_html}</h2>')
    s = sub(s, r'<p class="bottom-cta__desc">.*?</p>', f'<p class="bottom-cta__desc">{desc}</p>')
    return sub(s, r'<img src="cta-image-s\.jpg"[^>]*/>', cta_img)


def steps(s):
    return sub(s, r'<div class="steps__grid" id="steps-grid">.*?</div>\n        <div class="how-it-works__cta">',
               '<div class="steps__grid" id="steps-grid">\n'
               '          <div class="step-card"><h3 class="step-card__title">Choose your insurance type</h3><p class="step-card__desc">We help you navigate your life, personal and commercial insurance options with ease.</p></div>\n'
               '          <div class="step-card"><h3 class="step-card__title">Connect with an expert</h3><p class="step-card__desc">Fritz learns your needs, answers your questions, and helps you decide with confidence.</p></div>\n'
               '          <div class="step-card"><h3 class="step-card__title">Choose your perfect plan</h3><p class="step-card__desc">Select coverage from an expert-curated list of policies built for your needs.</p></div>\n'
               '        </div>\n        <div class="how-it-works__cta">')


def short(k):
    return A["services"][k]["label"].replace(" Insurance", "")


# ---------------- index ----------------
s = open("index.html", encoding="utf-8").read()
s = head(s, f"{NAME} | {TITLE_SPEC} in {LOC}",
         f"{NAME} of {BRAND}: licensed independent agent in {LOC} for life, home, auto and business insurance in FL, GA &amp; TX. Free quotes.",
         {"@context": "https://schema.org", "@graph": [home_agency, faq_node]})
s = sub(s, r'<a href="index.html" class="nav__brand">.*?</a>',
        f'<a href="index.html" class="nav__brand"><img src="itd-insurance-delivers-logo.png?v=3" alt="{BRAND}" class="brand-logo"></a>')
s = sub(s, r'<span class="hero__badge">.*?</span>', f'<span class="hero__badge">{BRAND} · Licensed in FL, GA &amp; TX</span>')
s = sub(s, r'<h1 class="hero__title" id="hero-title">.*?</h1>', '<h1 class="hero__title" id="hero-title">Insurance that delivers for South Florida.</h1>')
s = sub(s, r'<p class="hero__subtitle" id="hero-subtitle">.*?</p>',
        f'<p class="hero__subtitle" id="hero-subtitle">\n            {A["tagline"]}\n          </p>')
pills = "\n".join(f'          <a class="hero__quote-btn" href="{A["quoteLinks"][k]}" target="_blank" rel="noopener">{short(k)}</a>' for k in keys)
s = sub(s, r'<div class="hero__quote-btns" id="hero-quote-btns">.*?</div>', f'<div class="hero__quote-btns" id="hero-quote-btns">\n{pills}\n        </div>')
s = sub(s, r"<p>From protecting your family.*?</p>",
        "<p>From your family's future to your home, car and business, Fritz compares trusted carriers to find the right policy for you.</p>")
variants = ["accent", "light", "light", "primary"]
cards = "\n".join(f'''          <a class="coverage__card coverage__card--{variants[i % 4]}" href="services.html">
            <div class="coverage__card-content">
              <h3 class="coverage__card-name">{html.escape(A["services"][k]["label"])}</h3>
              <p class="coverage__card-desc">{html.escape(A["services"][k]["description"])}</p>
            </div>
            <span class="coverage__card-link">Explore coverage {ARROW}</span>
          </a>''' for i, k in enumerate(keys))
s = sub(s, r'<div class="coverage__grid coverage__grid--2" id="coverage-grid">.*?</a>\n        </div>',
        f'<div class="coverage__grid coverage__grid--{len(keys)}" id="coverage-grid">\n{cards}\n        </div>')
s = sub(s, r'<span class="stats-band__label">.*?</span>', '<span class="stats-band__label">Why Fritz</span>')
s = sub(s, r'<h2 class="stats-band__title">.*?</h2>',
        '<h2 class="stats-band__title">A <em>local</em> agent, a <span class="stats-band__hl">personal promise</span>.</h2>')
s = sub(s, r'<p class="stats-band__subtitle">.*?</p>',
        "<p class=\"stats-band__subtitle\">\n              Fritz built ITD Insurance That Delivers on a simple principle: insurance shouldn't feel like a maze. "
        "Every quote, every enrollment, every claim is handled personally — by the same licensed agent, year after year.\n            </p>")
stats = "\n".join(f'              <div class="stats-band__stat"><span class="stats-band__stat-value">{x["value"]}</span><span class="stats-band__stat-label">{x["label"]}</span></div>' for x in A["stats"])
s = sub(s, r'<div class="stats-band__stats" id="stats-row">.*?</div>\n          </div>',
        f'<div class="stats-band__stats" id="stats-row">\n{stats}\n            </div>\n          </div>')
s = sub(s, r'<img src="doran-grohs\.png"[^>]*/>', f'<img src="{A["photo"]}" alt="{alt_photo}" loading="lazy" />')
s = steps(s)
s = sub(s, r'(?<=real stories\.</h2>\n          <p>).*?(?=</p>)', "What Broward County clients say about working with Fritz.")
QI = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 6h6v6.5c0 3.2-1.6 5.3-4.7 6l-.8-1.7c1.6-.5 2.4-1.6 2.5-3.3H4zm10 0h6v6.5c0 3.2-1.6 5.3-4.7 6l-.8-1.7c1.6-.5 2.4-1.6 2.5-3.3H14z"/></svg>'
N = len(A["reviews"])
slides = "\n".join(f'''            <figure class="testi__slide{" testi__slide--active" if i == 0 else ""}" role="group" aria-roledescription="slide" aria-label="{i + 1} of {N}"{"" if i == 0 else ' aria-hidden="true"'}>
              <span class="testi__icon">{QI}</span>
              <div class="testi__body">
                <blockquote class="testi__quote">“{html.escape(r["quote"], quote=False)}”</blockquote>
                <figcaption class="testi__author"><span class="testi__name">{html.escape(r["name"])}</span><span class="testi__role">{r["role"]}</span></figcaption>
              </div>
            </figure>''' for i, r in enumerate(A["reviews"]))
dots = "".join(f'<button class="testi__dot{" testi__dot--active" if i == 0 else ""}" type="button" aria-label="Show testimonial {i + 1}: {html.escape(r["name"])}"{" aria-current=\"true\"" if i == 0 else ""}></button>' for i, r in enumerate(A["reviews"]))
s = sub(s, r'<div class="reviews__grid" id="reviews-grid">.*?</blockquote>\n        </div>',
        f'<div class="testi" id="reviews-slider" aria-roledescription="carousel" aria-label="Client testimonials">\n'
        f'          <div class="testi__track">\n{slides}\n          </div>\n'
        f'          <div class="testi__dots">{dots}</div>\n        </div>')
s = sub(s, r"<p>Everything you need to know about working with Doran\.</p>", "<p>Everything you need to know about working with Fritz.</p>")
faqs = "\n".join(f'''          <div class="faq__item{" faq__item--open" if i == 0 else ""}">
            <button class="faq__btn" aria-expanded="{"true" if i == 0 else "false"}"><span class="faq__question">{f["q"]}</span><span class="faq__toggle">+</span></button>
            <div class="faq__body"><div class="faq__body-inner">{f["a"]}</div></div>
          </div>''' for i, f in enumerate(A["faqs"]))
s = sub(s, r'<div class="faq__list" id="faq-list">.*?</div>\n        </div>\n      </div>\n    </section>',
        f'<div class="faq__list" id="faq-list">\n{faqs}\n        </div>\n      </div>\n    </section>')
s = bottom_cta(s, 'Finished scrolling?<br />Start <span class="emphasis">protecting</span>.',
               "Get a free, no-obligation quote on life, home, auto or business coverage. Fritz responds promptly with options built around your needs.")
open("index.html", "w", encoding="utf-8").write(s)

# ---------------- about ----------------
s = open("about.html", encoding="utf-8").read()
person = {"@context": "https://schema.org", "@type": "Person", "name": NAME, "jobTitle": A["title"],
          "description": "Licensed independent insurance agent and founder of ITD Insurance That Delivers, offering life, personal and commercial insurance across Florida, Georgia and Texas.",
          "telephone": TEL, "email": A["email"], "image": A["photo"], "address": addr(), "knowsAbout": KNOWS,
          "knowsLanguage": ["English"], "worksFor": {"@type": "InsuranceAgency", "name": BRAND},
          "sameAs": ["https://agents.agencyheight.com/insurance/fritz-dorce", "https://www.facebook.com/share/18YEEStvtj/", "https://www.instagram.com/fritzdorce"]}
s = head(s, f"About {NAME} | {BRAND}, {LOC}",
         f"Meet {NAME}, founder of {BRAND} — a licensed independent agent in {LOC} helping local families and businesses compare coverage.",
         person)
s = sub(s, r'<h1 class="about-hero__title">.*?</h1>',
        '<h1 class="about-hero__title">A <em>licensed local agent</em> who treats coverage like a <em>promise</em>, not a policy.</h1>')
s = sub(s, r'<h2 class="about-hero__name">.*?</h2>', f'<h2 class="about-hero__name">{NAME}</h2>')
s = sub(s, r'<p class="about-hero__role">.*?</p>', f'<p class="about-hero__role">Founder, {BRAND}</p>')
bio = "".join(f"<p>{p}</p>" for p in A["bio"].split("\n\n"))
s = sub(s, r'<div class="about-hero__bio">.*?</div>', f'<div class="about-hero__bio" id="about-bio">\n              {bio}\n            </div>')
s = sub(s, r'<img src="doran-grohs\.png"[^>]*/>', f'<img src="{A["photo"]}" alt="{alt_photo}" />')
s = steps(s)
s = bottom_cta(s, 'Let\'s find your <span class="emphasis">coverage</span>.',
               "Reach out for a free, no-obligation conversation about life, home, auto or business insurance.")
open("about.html", "w", encoding="utf-8").write(s)

# ---------------- services ----------------
s = open("services.html", encoding="utf-8").read()
svc = {"@context": "https://schema.org", "@type": "Service", "serviceType": "Life, Personal & Commercial Insurance",
       "provider": {"@type": "InsuranceAgency", "name": f"{BRAND} — {NAME}", "telephone": TEL, "address": addr(), "areaServed": STATES_FULL},
       "areaServed": STATES_FULL,
       "hasOfferCatalog": {"@type": "OfferCatalog", "name": "Insurance Coverage", "itemListElement": [
           {"@type": "OfferCatalog", "name": A["services"][k]["label"],
            "itemListElement": [{"@type": "Offer", "itemOffered": {"@type": "Service", "name": it}} for it in A["services"][k]["items"]]}
           for k in keys]}}
s = head(s, f"Insurance Services | {NAME} — {LOC}",
         f"Life, home, auto, flood and business insurance from {NAME} of {BRAND} — term life, annuities, homeowners, workers comp and more in FL, GA &amp; TX.",
         svc)
s = sub(s, r'<h1 class="about-hero__title">.*?</h1>',
        '<h1 class="about-hero__title">Life, home &amp; business coverage, <em>tailored</em> <br>to what matters most.</h1>')
s = sub(s, r'<p class="about-hero__lead">.*?</p>',
        "<p class=\"about-hero__lead\">From your family's future to your home and your business, Fritz matches you with the right policies through trusted carriers — clearly explained, with no pressure.</p>")
nos = "\n".join(f'''            <section class="service-section">
              <h2 class="service-section__title">{html.escape(A["services"][k]["label"])}</h2>
              <p class="service-section__desc">{html.escape(A["services"][k]["description"])}</p>
              <ul>{"".join("<li>" + html.escape(it) + "</li>" for it in A["services"][k]["items"])}</ul>
            </section>''' for k in keys)
s = sub(s, r"<noscript>.*?</noscript>", f"<noscript>\n{nos}\n          </noscript>")
s = bottom_cta(s, 'Not sure where to <span class="emphasis">start</span>?',
               "Tell Fritz what you're protecting and he'll guide you to the right coverage — free and with no obligation.")
open("services.html", "w", encoding="utf-8").write(s)

# ---------------- contact ----------------
s = open("contact.html", encoding="utf-8").read()
contact_ld = {"@context": "https://schema.org"}
contact_ld.update({k: v for k, v in agency.items() if k not in ("@id", "employee")})
s = head(s, f"Get a Free Insurance Quote | {NAME} — {LOC}",
         f"Contact {NAME} of {BRAND} for a free, no-obligation life, home, auto or business insurance quote. Call {A['phone']} — serving FL, GA &amp; TX.",
         contact_ld)
s = sub(s, r'<p class="about-hero__lead">.*?</p>',
        "<p class=\"about-hero__lead\">Tell Fritz what you're protecting and he'll respond promptly with tailored options — no cost, no obligation, just clear guidance.</p>")
s = sub(s, r'<div class="contact-info-row" id="contact-info"></div>', '<h2 class="sr-only">Contact details</h2>\n        <div class="contact-info-row" id="contact-info"></div>')
open("contact.html", "w", encoding="utf-8").write(s)
print("baked")
