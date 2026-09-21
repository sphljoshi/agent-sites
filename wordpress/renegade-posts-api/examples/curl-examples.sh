#!/usr/bin/env bash
# Renegade Posts API - curl recipes.
# Set your credentials once, then run any block below.
#
#   export WP_USER="your-wp-username"
#   export WP_APP_PASSWORD="abcd EFGH 1234 ijkl MNOP 5678"
#
# Keep the Application Password in your shell env or a secret manager - never in git.

set -euo pipefail

BASE="https://renegadeinsurance.com/wp-json/renegade/v1"
AUTH="${WP_USER:?set WP_USER}:${WP_APP_PASSWORD:?set WP_APP_PASSWORD}"

echo "== 1. Latest 5 posts (newest -> oldest is the default) =="
curl -sS -u "$AUTH" "$BASE/posts?per_page=5" | jq '.[] | {id, title, date}'

echo "== 2. Same, but show the pagination headers =="
curl -sS -D - -o /dev/null -u "$AUTH" "$BASE/posts?per_page=5" | grep -i '^x-wp-'

echo "== 3. Only the ACF values, grouped by field group =="
curl -sS -u "$AUTH" "$BASE/posts?per_page=2&acf_format=groups" | jq '.[] | {id, acf_groups}'

echo "== 4. Page 2, one category, published after a date =="
curl -sS -u "$AUTH" "$BASE/posts?page=2&per_page=10&categories=7&after=2026-01-01" | jq 'length'

echo "== 5. Oldest first =="
curl -sS -u "$AUTH" "$BASE/posts?order=ASC&per_page=3" | jq '.[] | {id, date}'

echo "== 6. Drafts (needs edit_posts) =="
curl -sS -u "$AUTH" "$BASE/posts?status=draft" | jq '.[] | {id, title, status}'

echo "== 7. A single post =="
curl -sS -u "$AUTH" "$BASE/posts/412" | jq '{id, title, acf}'

echo "== 8. Which ACF fields can I write? =="
curl -sS -u "$AUTH" "$BASE/field-groups?post_type=post" | jq

echo "== 9. Create a draft with ACF values =="
curl -sS -X POST -u "$AUTH" \
  -H "Content-Type: application/json" \
  "$BASE/posts" \
  -d '{
    "title": "New Policy Announcement",
    "content": "<p>Body HTML goes here.</p>",
    "excerpt": "Short summary for listings.",
    "status": "draft",
    "categories": [7],
    "tags": ["commercial", "auto"],
    "acf": {
      "read_time": 4,
      "agent_name": "Russell Armine",
      "cta_link": "https://renegadeinsurance.com/contact"
    }
  }' | jq '{created, id: .post.id, acf_written}'

echo "== 10. Update only one ACF field on an existing post =="
curl -sS -X POST -u "$AUTH" \
  -H "Content-Type: application/json" \
  "$BASE/posts/412" \
  -d '{"acf": {"read_time": 7}}' | jq '{updated, acf_written}'

echo "== 11. Publish an existing draft (needs publish_posts) =="
curl -sS -X POST -u "$AUTH" \
  -H "Content-Type: application/json" \
  "$BASE/posts/412" \
  -d '{"status": "publish"}' | jq '{updated, status: .post.status}'
