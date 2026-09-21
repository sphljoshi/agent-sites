# Renegade Posts API

A single-file WordPress plugin that exposes a custom REST API for posts **including their ACF fields and ACF field groups**, sorted **latest → oldest**, authenticated with a **WordPress username + Application Password**.

Base URL: `https://renegadeinsurance.com/wp-json/renegade/v1`

| Method | Route | What it does |
|---|---|---|
| `GET`  | `/posts` | List posts, newest first, with ACF values |
| `GET`  | `/posts/{id}` | One post with ACF values |
| `POST` | `/posts` | Create a post and set ACF values |
| `POST` | `/posts/{id}` | Update a post / its ACF values |
| `GET`  | `/field-groups?post_type=post` | List the ACF groups + fields (so you know what to send) |

---

## 1. Install

1. Copy the folder `renegade-posts-api/` into `wp-content/plugins/` on renegadeinsurance.com.
   (Or zip the folder and upload it via **Plugins → Add New → Upload Plugin**.)
2. **Plugins → Installed Plugins → Renegade Posts API → Activate.**
3. Go to **Settings → Permalinks** and click **Save Changes** once. This flushes rewrite rules so `/wp-json/` routes resolve.

Requirements: WordPress 5.6+ (Application Passwords shipped in 5.6), PHP 7.4+, HTTPS, and ACF (free or Pro) if you want the ACF parts.

## 2. Create an Application Password

1. **Users → Profile** (or Users → your user) → scroll to **Application Passwords**.
2. Type a name, e.g. `Mobile App`, click **Add New Application Password**.
3. Copy the generated password, e.g. `abcd EFGH 1234 ijkl MNOP 5678`. **It is shown once.**
   - The spaces are cosmetic; you can send it with or without them.
   - This is *not* the user's login password. Revoking it does not lock the human out.
4. Every request then sends HTTP Basic auth: `username:application password`.

If the **Application Passwords** section is missing, the site is not being served over HTTPS as far as WordPress can tell, or a plugin/filter disabled the feature. Fix HTTPS first (see Troubleshooting).

## 3. Test a GET

```bash
curl -sS -u "YOUR_WP_USERNAME:abcd EFGH 1234 ijkl MNOP 5678" \
  "https://renegadeinsurance.com/wp-json/renegade/v1/posts?per_page=5"
```

Response is an array, newest post first:

```json
[
  {
    "id": 412,
    "title": "Why Commercial Auto Rates Are Rising",
    "slug": "commercial-auto-rates",
    "status": "publish",
    "type": "post",
    "link": "https://renegadeinsurance.com/commercial-auto-rates/",
    "date": "2026-09-20T09:30:00",
    "date_gmt": "2026-09-20T13:30:00",
    "excerpt": "...",
    "content": "<p>...</p>",
    "author": { "id": 3, "name": "Renegade Team" },
    "featured_media": 501,
    "featured_image": "https://renegadeinsurance.com/wp-content/uploads/hero.jpg",
    "categories": [ { "id": 7, "name": "Commercial", "slug": "commercial" } ],
    "tags": [],
    "acf": {
      "read_time": 6,
      "agent_name": "Russell Armine",
      "cta_link": { "title": "Get a quote", "url": "/contact", "target": "" }
    },
    "acf_groups": [
      {
        "key": "group_651f0a1",
        "title": "Article Meta",
        "fields": [
          { "key": "field_a1", "name": "read_time", "label": "Read time", "type": "number", "value": 6 },
          { "key": "field_a2", "name": "agent_name", "label": "Agent", "type": "text", "value": "Russell Armine" }
        ]
      }
    ]
  }
]
```

Pagination comes back as response headers: `X-WP-Total` and `X-WP-TotalPages`.

### GET query parameters

| Param | Default | Notes |
|---|---|---|
| `page` | `1` | 1-based |
| `per_page` | `10` | 1–100 |
| `orderby` | `date` | `date`, `modified`, `title`, `menu_order`, `ID`, `rand` |
| `order` | `DESC` | `DESC` + `date` = **latest → oldest** |
| `status` | `publish` | anything else needs `edit_posts` |
| `post_type` | `post` | any registered public post type |
| `search` | – | keyword search |
| `categories` | – | comma separated IDs: `7,12` |
| `tags` | – | comma separated IDs |
| `after` / `before` | – | `2026-01-01` or ISO 8601 |
| `acf_format` | `both` | `flat`, `groups`, `both`, `none` |

Oldest → newest is just `?order=ASC`.

## 4. Test a POST

```bash
curl -sS -X POST \
  -u "YOUR_WP_USERNAME:abcd EFGH 1234 ijkl MNOP 5678" \
  -H "Content-Type: application/json" \
  "https://renegadeinsurance.com/wp-json/renegade/v1/posts" \
  -d '{
    "title": "New Policy Announcement",
    "content": "<p>Full body HTML.</p>",
    "excerpt": "Short summary.",
    "status": "draft",
    "categories": [7],
    "tags": ["commercial", "auto"],
    "featured_media": 501,
    "acf": {
      "read_time": 4,
      "agent_name": "Russell Armine",
      "cta_link": "https://renegadeinsurance.com/contact"
    }
  }'
```

Returns `201 Created`, a `Location` header pointing at the new item, and the full saved post so you can confirm what ACF actually stored.

`status` defaults to `draft` on purpose — nothing goes live by accident. Send `"status": "publish"` when you mean it (the user needs the `publish_posts` capability).

Update with the same shape, only the keys you want changed:

```bash
curl -sS -X POST -u "USER:APP PASSWORD" -H "Content-Type: application/json" \
  "https://renegadeinsurance.com/wp-json/renegade/v1/posts/412" \
  -d '{"acf": {"read_time": 7}}'
```

## 5. How the code works, step by step

The plugin file is commented with the same step numbers.

**Step 1 — Rescue the Authorization header.**
Application Passwords arrive as HTTP Basic auth. WordPress reads them from `$_SERVER['PHP_AUTH_USER']` / `['PHP_AUTH_PW']`, but on Apache CGI/FastCGI and some Nginx setups PHP only receives `HTTP_AUTHORIZATION`. The plugin decodes that base64 header back into the two variables core expects, before anything else runs. This is the single most common cause of "why do I keep getting 401".

**Step 2 — Register the routes.**
`register_rest_route( 'renegade/v1', '/posts', [...] )` creates `/wp-json/renegade/v1/posts`. Passing a *list* of handler arrays registers several verbs on one URL: `WP_REST_Server::READABLE` (GET) and `CREATABLE` (POST) on the collection, `READABLE` and `EDITABLE` (POST/PUT/PATCH) on `/posts/{id}`. `(?P<id>\d+)` is a named regex capture — digits only, so a bad URL 404s before any code runs. Every handler declares a `permission_callback`; leaving it as `__return_true` is what makes public, writable endpoints by mistake.

**Step 3 — Declare the arguments.**
The `args` array is a schema. WordPress runs `sanitize_callback`, type coercion and `enum` checks *before* your callback is entered, so invalid input returns a `400` with a useful message and your handler only ever sees clean values. `order` defaults to `DESC` and `orderby` to `date` — that is the "latest to oldest" requirement, implemented as a default rather than something the caller has to remember.

**Step 4 — Permission callbacks.**
By the time these run, WordPress has already matched the Basic credentials against the user's Application Passwords and called `wp_set_current_user()`. So the callbacks only ask two questions: is anyone logged in (`401` if not), and do they have the right capability (`403` if not). Capabilities are checked per action — `create_posts` to create, the separate `publish_posts` to publish, and the meta capability `edit_post` (which understands ownership) to edit a specific post. That means an Author's Application Password can only touch that Author's own posts, exactly like in wp-admin.

**Step 5 — GET handlers.**
A plain `WP_Query` with `orderby`/`order` from the request. `ignore_sticky_posts => true` matters: without it, sticky posts get hoisted to the top and silently break the date ordering. `found_posts` and `max_num_pages` become the `X-WP-Total` / `X-WP-TotalPages` headers so existing REST clients can paginate normally.

**Step 6 — Shaping a post.**
`rpa_prepare_post()` builds the JSON. Dates are returned in both site time and GMT (`mysql_to_rfc3339`) because GMT is the safe one to sort or compare on the client. `content` is passed through `apply_filters('the_content')` so shortcodes and blocks render as they do on the site, and `content_raw` keeps the unrendered source. The whole array runs through the `rpa_prepare_post` filter, so you can add your own keys without editing the plugin.

**Step 7 — Reading ACF, grouped.**
`acf_get_field_groups( ['post_id' => $id] )` returns only the groups whose **location rules** match that post — the same groups the editor screen shows. For each group, `acf_get_fields( $group['key'] )` lists its fields, and `get_field( $key, $post_id, true )` returns the **formatted** value (image arrays, resolved post objects, link arrays) rather than raw meta. The result is emitted two ways: `acf` as a flat `name: value` map for easy consumption, and `acf_groups` carrying group key/title plus each field's key, label and type — the structure you need if you are rendering a form from the API.

**Step 8 — POST handlers.**
`wp_insert_post()` creates the post; note the `wp_slash()` wrapper, because `wp_insert_post()` unslashes internally and without it every apostrophe in your content loses its backslash handling. The update handler only touches keys that were actually present in the request, so a partial update cannot blank out your content. Setting a different `author` is gated behind `edit_others_posts`. Success returns `201` plus a `Location` header.

**Step 9 — Writing ACF safely.**
This is the part that is easy to get wrong. The plugin builds a map of every field belonging to a group that matches this post, indexed by **both** field name and field key. Then:
1. It validates all submitted field names first, in one pass, and rejects the whole request with a `400` listing the unknown names *and* the allowed ones — a typo can never leave the post half-written.
2. It sanitizes per field type (`wp_kses_post` for wysiwyg, `esc_url_raw` for url/link, `absint` for image/file, `wp_parse_id_list` for relationship/gallery, recursion into repeater and group sub-fields).
3. It calls `update_field()` with the **field key** (`field_abc123`), not the name. Using the key is what makes ACF write its hidden `_fieldname` reference meta; if you write the name only, `get_field()` will return the raw value and lose all formatting.

Because only fields from matching groups are writable, this endpoint cannot be used to write arbitrary post meta.

**Step 10 — Guard rails.**
`rest_pre_dispatch` refuses the namespace over plain HTTP (Basic auth over HTTP means credentials in cleartext), with an exception for `local`/`development` environments. And there is an opt-in `RPA_BYPASS_REST_BLOCKERS` constant for sites where a security plugin blanket-blocks the REST API; it is off by default because it weakens another plugin's rule.

## 6. Troubleshooting

**401 `rpa_not_authenticated` even with correct credentials** — the Authorization header is being stripped. Step 1 handles most cases; if not, add to `.htaccess` above the WordPress block:

```apache
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule .* - [e=HTTP_AUTHORIZATION:%1]
</IfModule>
```

On Nginx + php-fpm, add to the PHP location block: `fastcgi_param HTTP_AUTHORIZATION $http_authorization;`

**The Application Passwords panel is missing** — WordPress hides it when `is_ssl()` is false. Confirm Site Address and WordPress Address both start with `https://` under Settings → General, and that any proxy/CDN forwards `X-Forwarded-Proto`.

**403 `rpa_https_required`** — the request reached WordPress as HTTP. Same root cause as above.

**400 `rpa_unknown_acf_fields`** — the error body lists `allowed_fields`. Either the name is misspelled, or the field group's location rules do not apply to that post type. `GET /field-groups?post_type=post` shows exactly what is writable.

**ACF values come back `null`** — the field group's location rules don't match the post, or the value was written by name instead of key. Write through this endpoint and it is handled.

**`rest_no_route`** — the plugin isn't active, or permalinks need re-saving (Settings → Permalinks → Save).

## 7. Security notes

- Application Passwords are per-application and individually revocable at **Users → Profile**. Issue one per integration, never share them.
- Never put an Application Password in front-end JavaScript — anyone viewing source gets write access to the site. Browser code should call your own server, which holds the credential. (For logged-in browser requests from the same site, use a nonce instead: `wp_create_nonce('wp_rest')` sent as the `X-WP-Nonce` header.)
- Store the credential in an environment variable or secret manager, not in the repo.
- If a password leaks: **Users → Profile → Application Passwords → Revoke**.
