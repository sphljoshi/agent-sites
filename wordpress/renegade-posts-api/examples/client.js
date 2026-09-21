/**
 * Renegade Posts API - Node.js client (Node 18+, uses built-in fetch).
 *
 * SERVER SIDE ONLY. Never ship an Application Password to the browser:
 * anyone who views source would get write access to the site.
 *
 *   export WP_USER="your-wp-username"
 *   export WP_APP_PASSWORD="abcd EFGH 1234 ijkl MNOP 5678"
 *   node client.js
 */

const BASE = 'https://renegadeinsurance.com/wp-json/renegade/v1';

const { WP_USER, WP_APP_PASSWORD } = process.env;
if (!WP_USER || !WP_APP_PASSWORD) {
  throw new Error('Set WP_USER and WP_APP_PASSWORD in the environment.');
}

// HTTP Basic auth = base64("username:password") in the Authorization header.
// This is exactly what `curl -u` does for you.
const AUTH_HEADER =
  'Basic ' + Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64');

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: AUTH_HEADER,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    // WP_Error is serialized as { code, message, data: { status, ... } }
    const message = body?.message || res.statusText;
    const error = new Error(`${res.status} ${body?.code || ''} ${message}`.trim());
    error.status = res.status;
    error.body = body;
    throw error;
  }

  return { body, headers: res.headers };
}

/** Latest posts, newest first (the API's default order). */
async function getLatestPosts({ page = 1, perPage = 10, acfFormat = 'both' } = {}) {
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    acf_format: acfFormat,
  });

  const { body, headers } = await request(`/posts?${query}`);

  return {
    posts: body,
    total: Number(headers.get('x-wp-total') || 0),
    totalPages: Number(headers.get('x-wp-totalpages') || 0),
  };
}

/** Walk every page so callers get the whole archive without managing paging. */
async function getAllPosts(perPage = 100) {
  const all = [];
  let page = 1;
  let totalPages = 1;

  do {
    const { posts, totalPages: tp } = await getLatestPosts({ page, perPage });
    all.push(...posts);
    totalPages = tp;
    page += 1;
  } while (page <= totalPages);

  return all;
}

async function createPost(data) {
  const { body } = await request('/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return body;
}

async function updatePost(id, data) {
  const { body } = await request(`/posts/${id}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return body;
}

async function main() {
  const { posts, total, totalPages } = await getLatestPosts({ perPage: 5 });
  console.log(`${total} posts across ${totalPages} pages. Latest 5:`);
  for (const post of posts) {
    console.log(` - [${post.date}] #${post.id} ${post.title}`);
    console.log('   acf:', post.acf);
  }

  const created = await createPost({
    title: 'Created from Node',
    content: '<p>Hello from the API.</p>',
    status: 'draft',
    acf: { read_time: 3 },
  });
  console.log('Created post', created.post.id, 'acf written:', created.acf_written);

  const updated = await updatePost(created.post.id, { acf: { read_time: 5 } });
  console.log('Updated acf:', updated.acf_written);
}

main().catch((err) => {
  console.error(err.message, err.body ?? '');
  process.exit(1);
});
