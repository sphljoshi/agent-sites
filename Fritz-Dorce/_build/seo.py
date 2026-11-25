"""Launch pass for the Fritz Dorce v2 site (run after bake.py, from the site folder).

- Full linked JSON-LD @graph per page (absolute @ids)
- canonical, Open Graph, Twitter, theme-color, icons, font preconnect/preload
- clean internal links (Vercel cleanUrls) — app.js re-adds .html on file://
- width/height on baked images
- 404.html, robots.txt, sitemap.xml, vercel.json, og-image.jpg, PNG icons
"""
import html, json, os, re, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

D = sys.argv[1]
os.chdir(D)
A = json.loads(subprocess.check_output(["node", "-e",
    "eval(require('fs').readFileSync('config.js','utf8').replace('const AGENT','global.AGENT'));console.log(JSON.stringify(AGENT))"]))

SITE = "https://insurancethatworksflorida.com"
TODAY = "2026-11-17"
NAME, BRAND, TEL = A["name"], A["brand"], "+19544958788"
AG, PERSON, WEBSITE = f"{SITE}/#agency", f"{SITE}/#fritz", f"{SITE}/#website"
SAME_AS = ["https://www.facebook.com/share/18YEEStvtj/", "https://www.instagram.com/fritzdorce",
           "https://agents.agencyheight.com/insurance/fritz-dorce"]
STATES = [{"@type": "State", "name": n} for n in ("Florida", "Georgia", "Texas")]
KNOWS = ["Life Insurance", "Term Life Insurance", "Whole Life Insurance", "Universal Life Insurance", "Annuities",
         "Disability Insurance", "Homeowners Insurance", "Auto Insurance", "Flood Insurance", "Condo Insurance",
         "Commercial Insurance", "General Liability Insurance", "Workers Compensation", "Business Owners Policy"]
PAGES = {  # file: (path, priority)
    "index.html": ("/", "1.0"),
    "services.html": ("/services", "0.9"),
    "about.html": ("/about", "0.8"),
    "contact.html": ("/contact", "0.8"),
}
OG_IMG = f"{SITE}/og-image.jpg?v=3"


def strip(t):
    t = re.sub(r"<br\s*/?>", " ", t)
    t = re.sub(r"<[^>]+>", "", t).replace("•", "")
    return re.sub(r"\s+", " ", t).strip()


def sub(s, pat, rep, count=1, flags=re.S):
    out, n = re.subn(pat, lambda m: rep, s, count=count, flags=flags)
    assert n, pat[:80]
    return out


# ------------------------------------------------------------------ shared nodes
address = {"@type": "PostalAddress", "addressLocality": "Cooper City", "addressRegion": "FL",
           "postalCode": "33330", "addressCountry": "US"}
logo = {"@type": "ImageObject", "@id": f"{SITE}/#logo", "url": f"{SITE}/itd-insurance-delivers-logo.png?v=3", "width": 456, "height": 96,
        "caption": BRAND}
photo = {"@type": "ImageObject", "@id": f"{SITE}/#fritz-photo", "url": f"{SITE}/{A['photo']}", "width": 820,
         "height": 1092, "caption": f"{NAME}, {A['title']}"}
catalog = {"@type": "OfferCatalog", "name": "Insurance coverage", "itemListElement": [
    {"@type": "OfferCatalog", "name": s["label"], "itemListElement": [
        {"@type": "Offer", "itemOffered": {"@type": "Service", "name": it}} for it in s["items"]]}
    for s in A["services"].values()]}
agency = {
    "@type": "InsuranceAgency", "@id": AG, "name": BRAND, "alternateName": f"ITD Insurance — {NAME}",
    "description": "Independent insurance agency in South Florida offering life, personal (home, auto, flood) and commercial insurance across Florida, Georgia and Texas.",
    "url": f"{SITE}/", "telephone": TEL, "email": A["email"], "logo": {"@id": logo["@id"]},
    "image": [OG_IMG, photo["url"]], "address": address, "areaServed": STATES,
    "openingHoursSpecification": [{"@type": "OpeningHoursSpecification",
                                   "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                                   "opens": "09:00", "closes": "18:00"}],
    "contactPoint": {"@type": "ContactPoint", "telephone": TEL, "email": A["email"], "contactType": "customer service",
                     "areaServed": ["US-FL", "US-GA", "US-TX"], "availableLanguage": "English"},
    "founder": {"@id": PERSON}, "employee": {"@id": PERSON}, "knowsAbout": KNOWS,
    "hasOfferCatalog": catalog, "sameAs": SAME_AS,
}
person = {
    "@type": "Person", "@id": PERSON, "name": NAME, "givenName": "Fritz", "familyName": "Dorce",
    "jobTitle": A["title"], "description": "Licensed independent insurance agent and founder of ITD Insurance That Delivers, helping South Florida families and businesses compare life, home, auto and business coverage.",
    "image": {"@id": photo["@id"]}, "telephone": TEL, "email": A["email"], "address": address,
    "worksFor": {"@id": AG}, "knowsAbout": KNOWS, "knowsLanguage": "English",
    "url": f"{SITE}/about", "sameAs": SAME_AS,
}
website = {"@type": "WebSite", "@id": WEBSITE, "url": f"{SITE}/", "name": BRAND, "publisher": {"@id": AG},
           "inLanguage": "en-US"}


def crumbs(path, label):
    items = [{"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"}]
    if path != "/":
        items.append({"@type": "ListItem", "position": 2, "name": label, "item": SITE + path})
    return {"@type": "BreadcrumbList", "@id": f"{SITE}{path}#breadcrumb", "itemListElement": items}


def webpage(path, typ, title, desc, label, extra=None):
    node = {"@type": typ, "@id": f"{SITE}{path}#webpage", "url": SITE + path, "name": html.unescape(title),
            "description": html.unescape(desc), "isPartOf": {"@id": WEBSITE}, "about": {"@id": AG},
            "primaryImageOfPage": {"@id": photo["@id"]}, "breadcrumb": {"@id": f"{SITE}{path}#breadcrumb"},
            "inLanguage": "en-US", "dateModified": TODAY}
    node.update(extra or {})
    return node


def graph(*nodes):
    return {"@context": "https://schema.org", "@graph": list(nodes)}


def ld(obj):
    return '<script type="application/ld+json">\n' + json.dumps(obj, indent=2, ensure_ascii=False) + "\n    </script>"


faq = {"@type": "FAQPage", "@id": f"{SITE}/#faq", "mainEntity": [
    {"@type": "Question", "name": f["q"], "acceptedAnswer": {"@type": "Answer", "text": strip(f["a"])}}
    for f in A["faqs"]]}
services_nodes = [{
    "@type": "Service", "@id": f"{SITE}/services#{k}", "name": s["label"], "serviceType": s["label"],
    "description": s["description"], "provider": {"@id": AG}, "areaServed": STATES,
    "url": f"{SITE}/services",
    "hasOfferCatalog": {"@type": "OfferCatalog", "name": s["label"], "itemListElement": [
        {"@type": "Offer", "itemOffered": {"@type": "Service", "name": it}} for it in s["items"]]},
} for k, s in A["services"].items()]


def page_schema(fname, title, desc):
    path = PAGES[fname][0]
    if fname == "index.html":
        return graph(website, agency, person, logo, photo,
                     webpage(path, "WebPage", title, desc, "Home", {"mainEntity": {"@id": faq["@id"]}}),
                     crumbs(path, "Home"), faq)
    if fname == "about.html":
        return graph(website, agency, person, logo, photo,
                     webpage(path, "AboutPage", title, desc, "About", {"mainEntity": {"@id": PERSON}}),
                     crumbs(path, "About"))
    if fname == "services.html":
        return graph(website, agency, person, logo, photo,
                     webpage(path, "CollectionPage", title, desc, "Services",
                             {"hasPart": [{"@id": n["@id"]} for n in services_nodes]}),
                     crumbs(path, "Services"), *services_nodes)
    return graph(website, agency, person, logo, photo,
                 webpage(path, "ContactPage", title, desc, "Contact", {"mainEntity": {"@id": AG}}),
                 crumbs(path, "Contact"))


# ------------------------------------------------------------------ head
def head_block(fname, title, desc):
    url = SITE + PAGES[fname][0]
    preload = (f'\n    <link rel="preload" as="image" href="{A["heroImage"]}" fetchpriority="high" />'
               if fname == "index.html" else "")
    return f'''<meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="{url}" />
    <meta name="theme-color" content="#172644" />
    <meta name="author" content="{NAME}" />
    <meta name="geo.region" content="US-FL" />
    <meta name="geo.placename" content="Cooper City, Florida" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="{BRAND}" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:url" content="{url}" />
    <meta property="og:title" content="{title}" />
    <meta property="og:description" content="{desc}" />
    <meta property="og:image" content="{OG_IMG}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="{BRAND} — {NAME}, licensed insurance agent in South Florida" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{title}" />
    <meta name="twitter:description" content="{desc}" />
    <meta name="twitter:image" content="{OG_IMG}" />

    <link rel="icon" type="image/svg+xml" href="favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png" />
    <link rel="apple-touch-icon" href="apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&amp;family=Playfair+Display:wght@600&amp;display=swap" />{preload}
    <link rel="stylesheet" href="styles.css" />'''


IMG_SIZES = {}
for f in os.listdir("."):
    if f.lower().endswith((".webp", ".png", ".jpg")):
        IMG_SIZES[f] = Image.open(f).size


def add_dims(s):
    def fix(m):
        tag = m.group(0)
        src = re.search(r'src="([^"]+)"', tag)
        if not src or "width=" in tag or src.group(1) not in IMG_SIZES:
            return tag
        w, h = IMG_SIZES[src.group(1)]
        return tag.replace("<img ", f'<img width="{w}" height="{h}" ', 1)
    return re.sub(r"<img [^>]*>", fix, s)


def clean_links(s):
    s = re.sub(r'href="index\.html(#[^"]*)?"', lambda m: f'href="./{m.group(1) or ""}"', s)
    return re.sub(r'href="(about|services|contact)\.html(#[^"]*)?"', lambda m: f'href="{m.group(1)}{m.group(2) or ""}"', s)


for fname in PAGES:
    s = open(fname, encoding="utf-8").read()
    title = re.search(r"<title>(.*?)</title>", s).group(1)
    desc = re.search(r'<meta name="description" content="([^"]*)"', s).group(1)
    # strip any previous launch block (idempotent re-runs)
    s = re.sub(r'\n    <meta name="robots".*?<link rel="stylesheet" href="styles\.css" />', "\n    " + '<link rel="stylesheet" href="styles.css" />', s, flags=re.S)
    s = sub(s, r'<link rel="icon" type="image/svg\+xml" href="favicon\.svg" />\s*<link rel="stylesheet" href="styles\.css" />',
            head_block(fname, title, desc))
    s = sub(s, r'<script type="application/ld\+json">.*?</script>', ld(page_schema(fname, title, desc)))
    s = add_dims(s)
    s = clean_links(s)
    # GSAP: don't block parsing longer than needed — keep order, mark as non-render-blocking via defer-safe placement (already at body end)
    open(fname, "w", encoding="utf-8").write(s)

# ------------------------------------------------------------------ 404
nf_title = f"Page not found | {BRAND}"
nf = f'''<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <base href="/" />
    <title>{nf_title}</title>
    <meta name="description" content="The page you were looking for has moved. Explore life, home, auto and business insurance from {NAME} of {BRAND}." />
    <meta name="robots" content="noindex, follow" />
    <meta name="theme-color" content="#172644" />
    <link rel="icon" type="image/svg+xml" href="favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png" />
    <link rel="apple-touch-icon" href="apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&amp;family=Playfair+Display:wght@600&amp;display=swap" />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <nav class="nav" id="nav">
      <div class="nav__inner wrap">
        <a href="/" class="nav__brand"><img src="itd-insurance-delivers-logo.png?v=3" width="456" height="96" alt="{BRAND}" class="brand-logo"></a>
        <div class="nav__links" id="nav-links">
          <a href="/" class="nav__link">Home</a>
          <a href="/about" class="nav__link">About</a>
          <a href="/services" class="nav__link">Services</a>
          <a href="/contact" class="nav__link">Contact</a>
        </div>
        <a href="/contact" class="nav__cta">Get a Quote</a>
      </div>
    </nav>

    <section class="about-hero">
      <div class="wrap">
        <span class="about-hero__label">Error 404</span>
        <h1 class="about-hero__title">This page has moved — but your coverage options haven't.</h1>
        <p class="about-hero__lead">The page you were looking for doesn't exist anymore. Explore Fritz's life, personal and commercial insurance options, or call <a href="{A['phoneHref']}">{A['phone']}</a> for a free quote.</p>
        <p style="margin-top:28px;display:flex;gap:12px;flex-wrap:wrap">
          <a class="btn-accent" href="/services">View insurance services</a>
          <a class="btn-outline" href="/">Back to home</a>
        </p>
      </div>
    </section>

    <footer class="footer" id="footer"></footer>

    <script src="config.js"></script>
    <script src="app.js"></script>
    <script>
      buildNav("");
      buildFooter();
    </script>
  </body>
</html>
'''
open("404.html", "w", encoding="utf-8").write(nf)

# ------------------------------------------------------------------ robots + sitemap
bots = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot",
        "Perplexity-User", "Google-Extended", "Applebot-Extended", "Bingbot"]
open("robots.txt", "w", encoding="utf-8", newline="\n").write(
    "User-agent: *\nAllow: /\n\n# AI answer engines — explicitly permitted (being cited in AI answers is a lead source).\n"
    + "".join(f"User-agent: {b}\nAllow: /\n\n" for b in bots) + f"Sitemap: {SITE}/sitemap.xml\n")
urls = "".join(f'''  <url>
    <loc>{SITE}{p}</loc>
    <lastmod>{TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>{pr}</priority>
  </url>
''' for p, pr in PAGES.values())
open("sitemap.xml", "w", encoding="utf-8", newline="\n").write(
    f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')

# ------------------------------------------------------------------ vercel.json (clean URLs + old-site redirects)
OLD_TO_SERVICES = ["/life-insurance", "/annuities", "/built-to-last-choosing-permanent-life-insurance-in-broward-county",
                   "/life-insurance-in-fort-lauderdale-a-decision-framework-not-a-sales-pitch",
                   "/ten-years-one-policy-how-to-pick-the-carrier-behind-it"]
OLD_TO_HOME = ["/home", "/blog", "/health-insurance", "/aca-insurance-plans-florida", "/medicare-advantage",
               "/supplemental-insurance",
               "/aca-insurance-plans-in-fort-lauderdale-what-individuals-need-to-know-for-2026-and-2027",
               "/how-to-qualify-for-an-aca-subsidy-in-florida-in-2026",
               "/medicare-supplement-insurance-in-fort-lauderdale-choosing-the-right-coverage-plan",
               "/plugging-the-gaps-a-2027-guide-to-supplemental-coverage-and-the-agent-behind-it",
               "/premiums-are-rising-again-a-practical-2027-guide-for-floridas-aca-shoppers"]
redirects = ([{"source": s, "destination": "/services", "permanent": True} for s in OLD_TO_SERVICES]
             + [{"source": s, "destination": "/", "permanent": True} for s in OLD_TO_HOME]
             + [{"source": "/index", "destination": "/", "permanent": True}])
vercel = {
    "$schema": "https://openapi.vercel.sh/vercel.json",
    "cleanUrls": True,
    "trailingSlash": False,
    "redirects": redirects,
    "headers": [
        {"source": "/(.*)", "headers": [
            {"key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains"},
            {"key": "X-Content-Type-Options", "value": "nosniff"},
            {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"},
            {"key": "X-Frame-Options", "value": "SAMEORIGIN"},
            {"key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()"}]},
        {"source": "/(.*)\\.(webp|png|jpg|svg)", "headers": [
            {"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}]},
    ],
}
open("vercel.json", "w", encoding="utf-8", newline="\n").write(json.dumps(vercel, indent=2) + "\n")

# ------------------------------------------------------------------ og-image + PNG icons
NAVY, GOLD = (23, 38, 68), (214, 167, 71)
font_b = "C:/Windows/Fonts/arialbd.ttf"
font_r = "C:/Windows/Fonts/arial.ttf"
og = Image.new("RGB", (1200, 630), NAVY)
ph = Image.open(A["photo"]).convert("RGB")
ph = ph.resize((round(ph.width * 630 / ph.height), 630), Image.LANCZOS)
og.paste(ph, (1200 - ph.width, 0))
d = ImageDraw.Draw(og)
lg = Image.open("itd-insurance-delivers-logo.png").convert("RGBA")
lg = lg.resize((380, round(lg.height * 380 / lg.width)), Image.LANCZOS)
card = Image.new("RGBA", (lg.width + 48, lg.height + 36), (255, 255, 255, 255))
og.paste(card, (64, 70), card)
og.paste(lg, (88, 88), lg)
d.text((64, 230), "Insurance that delivers", font=ImageFont.truetype(font_b, 56), fill="white")
d.text((64, 298), "for South Florida.", font=ImageFont.truetype(font_b, 56), fill="white")
d.rectangle((64, 388, 160, 392), fill=GOLD)
d.text((64, 418), "Life · Home · Auto · Business", font=ImageFont.truetype(font_r, 30), fill=GOLD)
d.text((64, 470), f"{NAME}  ·  {A['phone']}", font=ImageFont.truetype(font_r, 28), fill="white")
og.save("og-image.jpg", quality=86, optimize=True, progressive=True)


def icon(size, path):
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    dd = ImageDraw.Draw(im)
    dd.rounded_rectangle((0, 0, size - 1, size - 1), radius=round(size * 0.25), fill=NAVY)
    f = ImageFont.truetype(font_b, round(size * 0.44))
    bb = dd.textbbox((0, 0), "FD", font=f)
    dd.text(((size - (bb[2] - bb[0])) / 2 - bb[0], (size - (bb[3] - bb[1])) / 2 - bb[1]), "FD", font=f, fill="white")
    im.save(path)


icon(32, "favicon-32.png")
icon(180, "apple-touch-icon.png")
print("seo pass done")
