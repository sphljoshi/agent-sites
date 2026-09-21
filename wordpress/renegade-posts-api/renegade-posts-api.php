<?php
/**
 * Plugin Name:       Renegade Posts API
 * Plugin URI:        https://renegadeinsurance.com/
 * Description:       Custom REST API (GET + POST) for posts including ACF fields and ACF field groups. Returns newest posts first and authenticates with a WordPress username + Application Password.
 * Version:           1.0.0
 * Requires at least: 5.6
 * Requires PHP:      7.4
 * Author:            Renegade Insurance
 * License:           GPL-2.0-or-later
 * Text Domain:       renegade-posts-api
 *
 * ---------------------------------------------------------------------------
 * ROUTES
 *   GET  /wp-json/renegade/v1/posts        -> list posts, newest -> oldest
 *   GET  /wp-json/renegade/v1/posts/{id}   -> one post
 *   POST /wp-json/renegade/v1/posts        -> create a post (+ ACF values)
 *   POST /wp-json/renegade/v1/posts/{id}   -> update a post (+ ACF values)
 *   GET  /wp-json/renegade/v1/field-groups -> describe ACF groups/fields (schema)
 *
 * AUTH: HTTP Basic with a WP username and an Application Password.
 *       curl -u "user:xxxx xxxx xxxx xxxx xxxx xxxx" ...
 * ---------------------------------------------------------------------------
 */

// Block direct file access. Every WP file starts with this.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'RPA_VERSION', '1.0.0' );
define( 'RPA_NAMESPACE', 'renegade/v1' );

/* =============================================================================
 * STEP 1 — Make sure the Authorization header survives the web server.
 *
 * WordPress Application Passwords are sent as HTTP Basic auth. Core reads them
 * from $_SERVER['PHP_AUTH_USER'] / ['PHP_AUTH_PW']. On Apache+CGI/FastCGI and
 * some Nginx setups PHP never gets those, only HTTP_AUTHORIZATION (or
 * REDIRECT_HTTP_AUTHORIZATION). We decode it back into the vars core expects.
 * Runs at file load = earlier than any auth check.
 * ---------------------------------------------------------------------------*/
if ( ! function_exists( 'rpa_bootstrap_basic_auth_header' ) ) {
	function rpa_bootstrap_basic_auth_header() {
		if ( ! empty( $_SERVER['PHP_AUTH_USER'] ) ) {
			return; // Server already gave us the credentials.
		}

		$header = '';
		foreach ( array( 'HTTP_AUTHORIZATION', 'REDIRECT_HTTP_AUTHORIZATION' ) as $key ) {
			if ( ! empty( $_SERVER[ $key ] ) ) {
				$header = $_SERVER[ $key ];
				break;
			}
		}

		if ( '' === $header && function_exists( 'apache_request_headers' ) ) {
			$headers = array_change_key_case( (array) apache_request_headers(), CASE_LOWER );
			if ( ! empty( $headers['authorization'] ) ) {
				$header = $headers['authorization'];
			}
		}

		if ( 0 !== stripos( $header, 'basic ' ) ) {
			return; // Not Basic auth (could be Bearer/JWT) - nothing to do.
		}

		$decoded = base64_decode( substr( $header, 6 ), true );
		if ( false === $decoded || false === strpos( $decoded, ':' ) ) {
			return;
		}

		list( $user, $pass )      = explode( ':', $decoded, 2 );
		$_SERVER['PHP_AUTH_USER'] = $user;
		$_SERVER['PHP_AUTH_PW']   = $pass;
	}
}
rpa_bootstrap_basic_auth_header();

/* =============================================================================
 * STEP 2 — Register the routes.
 *
 * register_rest_route( namespace, route, args ). Passing a list of arrays
 * registers several HTTP methods on the same URL. Each entry needs:
 *   methods             - which verb(s) it answers
 *   callback            - what runs on success
 *   permission_callback - the auth gate; REQUIRED, never leave it __return_true
 *   args                - declared params: sanitized + validated before callback
 * ---------------------------------------------------------------------------*/
add_action( 'rest_api_init', 'rpa_register_routes' );
function rpa_register_routes() {

	// Collection: GET (list) + POST (create).
	register_rest_route(
		RPA_NAMESPACE,
		'/posts',
		array(
			array(
				'methods'             => WP_REST_Server::READABLE,  // GET
				'callback'            => 'rpa_handle_get_posts',
				'permission_callback' => 'rpa_permission_read',
				'args'                => rpa_collection_args(),
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE, // POST
				'callback'            => 'rpa_handle_create_post',
				'permission_callback' => 'rpa_permission_create',
				'args'                => rpa_write_args(),
			),
		)
	);

	// Single item: GET (read one) + POST/PUT/PATCH (update).
	register_rest_route(
		RPA_NAMESPACE,
		'/posts/(?P<id>\d+)',
		array(
			'args' => array(
				'id' => array(
					'description' => __( 'Post ID.', 'renegade-posts-api' ),
					'type'        => 'integer',
					'required'    => true,
				),
			),
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'rpa_handle_get_single_post',
				'permission_callback' => 'rpa_permission_read',
				'args'                => array(
					'acf_format' => rpa_collection_args()['acf_format'],
				),
			),
			array(
				'methods'             => WP_REST_Server::EDITABLE, // POST, PUT, PATCH
				'callback'            => 'rpa_handle_update_post',
				'permission_callback' => 'rpa_permission_edit',
				'args'                => rpa_write_args( false ),
			),
		)
	);

	// Helper endpoint: what ACF groups/fields exist for a post type.
	register_rest_route(
		RPA_NAMESPACE,
		'/field-groups',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'rpa_handle_get_field_groups',
			'permission_callback' => 'rpa_permission_read',
			'args'                => array(
				'post_type' => array(
					'type'              => 'string',
					'default'           => 'post',
					'sanitize_callback' => 'sanitize_key',
				),
			),
		)
	);
}

/* =============================================================================
 * STEP 3 — Argument schemas.
 *
 * Anything declared here is sanitized/validated by WP BEFORE your callback runs.
 * 'enum' + 'type' are enforced automatically, so bad input returns 400 for free.
 * ---------------------------------------------------------------------------*/
function rpa_collection_args() {
	return array(
		'page'       => array(
			'description'       => __( 'Page of results (1-based).', 'renegade-posts-api' ),
			'type'              => 'integer',
			'default'           => 1,
			'minimum'           => 1,
			'sanitize_callback' => 'absint',
		),
		'per_page'   => array(
			'description'       => __( 'Items per page (1-100).', 'renegade-posts-api' ),
			'type'              => 'integer',
			'default'           => 10,
			'minimum'           => 1,
			'maximum'           => 100,
			'sanitize_callback' => 'absint',
		),
		'search'     => array(
			'type'              => 'string',
			'sanitize_callback' => 'sanitize_text_field',
		),
		'post_type'  => array(
			'type'              => 'string',
			'default'           => 'post',
			'sanitize_callback' => 'sanitize_key',
		),
		'status'     => array(
			'description' => __( 'Post status. Anything other than publish requires edit_posts.', 'renegade-posts-api' ),
			'type'        => 'string',
			'default'     => 'publish',
			'enum'        => array( 'publish', 'draft', 'pending', 'future', 'private', 'any' ),
		),
		// Newest -> oldest is the DEFAULT, exactly as requested.
		'orderby'    => array(
			'type'    => 'string',
			'default' => 'date',
			'enum'    => array( 'date', 'modified', 'title', 'menu_order', 'ID', 'rand' ),
		),
		'order'      => array(
			'type'    => 'string',
			'default' => 'DESC', // DESC on date = latest first.
			'enum'    => array( 'ASC', 'DESC' ),
		),
		'categories' => array(
			'description'       => __( 'Comma separated category IDs.', 'renegade-posts-api' ),
			'type'              => 'string',
			'sanitize_callback' => 'sanitize_text_field',
		),
		'tags'       => array(
			'type'              => 'string',
			'sanitize_callback' => 'sanitize_text_field',
		),
		'after'      => array(
			'description' => __( 'Only posts published after this date (Y-m-d or ISO 8601).', 'renegade-posts-api' ),
			'type'        => 'string',
		),
		'before'     => array(
			'type' => 'string',
		),
		'acf_format' => array(
			'description' => __( 'flat = name:value map, groups = grouped by field group, both = both, none = skip ACF.', 'renegade-posts-api' ),
			'type'        => 'string',
			'default'     => 'both',
			'enum'        => array( 'flat', 'groups', 'both', 'none' ),
		),
	);
}

function rpa_write_args( $is_create = true ) {
	return array(
		'title'          => array(
			'type'              => 'string',
			'required'          => $is_create, // Required to create, optional to update.
			'sanitize_callback' => 'sanitize_text_field',
		),
		'content'        => array(
			'type'              => 'string',
			'sanitize_callback' => 'wp_kses_post', // Allows post HTML, strips scripts.
		),
		'excerpt'        => array(
			'type'              => 'string',
			'sanitize_callback' => 'wp_kses_post',
		),
		'slug'           => array(
			'type'              => 'string',
			'sanitize_callback' => 'sanitize_title',
		),
		'status'         => array(
			'type'    => 'string',
			'default' => $is_create ? 'draft' : null, // Safe default: nothing goes live by accident.
			'enum'    => array( 'publish', 'draft', 'pending', 'private', 'future' ),
		),
		'date'           => array(
			'description' => __( 'Publish date in site time, e.g. 2026-09-21 09:30:00.', 'renegade-posts-api' ),
			'type'        => 'string',
		),
		'post_type'      => array(
			'type'              => 'string',
			'default'           => 'post',
			'sanitize_callback' => 'sanitize_key',
		),
		'author'         => array(
			'type'              => 'integer',
			'sanitize_callback' => 'absint',
		),
		'categories'     => array(
			'description' => __( 'Array of category IDs.', 'renegade-posts-api' ),
			'type'        => 'array',
			'items'       => array( 'type' => 'integer' ),
		),
		'tags'           => array(
			'description' => __( 'Array of tag names or IDs.', 'renegade-posts-api' ),
			'type'        => 'array',
		),
		'featured_media' => array(
			'description' => __( 'Attachment ID to use as featured image.', 'renegade-posts-api' ),
			'type'        => 'integer',
			'sanitize_callback' => 'absint',
		),
		'acf'            => array(
			'description' => __( 'Object of ACF values keyed by field name or field key.', 'renegade-posts-api' ),
			'type'        => 'object',
		),
	);
}

/* =============================================================================
 * STEP 4 — Permission callbacks (this is where Application Passwords land).
 *
 * By the time these run, WP has already validated the Basic auth credentials
 * against the user's Application Passwords and set the current user. So all we
 * do here is: (a) is anybody logged in? (b) do they have the capability?
 * ---------------------------------------------------------------------------*/
function rpa_require_login() {
	if ( is_user_logged_in() ) {
		return true;
	}

	return new WP_Error(
		'rpa_not_authenticated',
		__( 'Authentication required. Send a WordPress username and Application Password using HTTP Basic auth over HTTPS.', 'renegade-posts-api' ),
		array( 'status' => 401 )
	);
}

function rpa_permission_read( WP_REST_Request $request ) {
	$logged_in = rpa_require_login();
	if ( is_wp_error( $logged_in ) ) {
		return $logged_in;
	}

	// Reading anything that is not published requires edit rights.
	$status = $request->get_param( 'status' );
	if ( $status && 'publish' !== $status && ! current_user_can( 'edit_posts' ) ) {
		return new WP_Error(
			'rpa_forbidden_status',
			__( 'You are not allowed to read posts with that status.', 'renegade-posts-api' ),
			array( 'status' => 403 )
		);
	}

	return true;
}

function rpa_permission_create( WP_REST_Request $request ) {
	$logged_in = rpa_require_login();
	if ( is_wp_error( $logged_in ) ) {
		return $logged_in;
	}

	$post_type = $request->get_param( 'post_type' ) ? $request->get_param( 'post_type' ) : 'post';
	$type_obj  = get_post_type_object( $post_type );

	if ( ! $type_obj ) {
		return new WP_Error( 'rpa_invalid_post_type', __( 'Unknown post type.', 'renegade-posts-api' ), array( 'status' => 400 ) );
	}

	if ( ! current_user_can( $type_obj->cap->create_posts ) ) {
		return new WP_Error( 'rpa_cannot_create', __( 'You are not allowed to create posts.', 'renegade-posts-api' ), array( 'status' => 403 ) );
	}

	// Publishing is a separate capability from creating a draft.
	if ( 'publish' === $request->get_param( 'status' ) && ! current_user_can( $type_obj->cap->publish_posts ) ) {
		return new WP_Error( 'rpa_cannot_publish', __( 'You are not allowed to publish posts.', 'renegade-posts-api' ), array( 'status' => 403 ) );
	}

	return true;
}

function rpa_permission_edit( WP_REST_Request $request ) {
	$logged_in = rpa_require_login();
	if ( is_wp_error( $logged_in ) ) {
		return $logged_in;
	}

	$post = get_post( (int) $request['id'] );
	if ( ! $post ) {
		return new WP_Error( 'rpa_not_found', __( 'Post not found.', 'renegade-posts-api' ), array( 'status' => 404 ) );
	}

	// 'edit_post' is a meta capability: it checks ownership and post status too.
	if ( ! current_user_can( 'edit_post', $post->ID ) ) {
		return new WP_Error( 'rpa_cannot_edit', __( 'You are not allowed to edit this post.', 'renegade-posts-api' ), array( 'status' => 403 ) );
	}

	return true;
}

/* =============================================================================
 * STEP 5 — GET handlers.
 * ---------------------------------------------------------------------------*/
function rpa_handle_get_posts( WP_REST_Request $request ) {
	$post_type = $request->get_param( 'post_type' );
	if ( ! post_type_exists( $post_type ) ) {
		return new WP_Error( 'rpa_invalid_post_type', __( 'Unknown post type.', 'renegade-posts-api' ), array( 'status' => 400 ) );
	}

	$query_args = array(
		'post_type'           => $post_type,
		'post_status'         => $request->get_param( 'status' ),
		'posts_per_page'      => (int) $request->get_param( 'per_page' ),
		'paged'               => (int) $request->get_param( 'page' ),
		'orderby'             => $request->get_param( 'orderby' ),  // date by default
		'order'               => $request->get_param( 'order' ),    // DESC by default => latest first
		'ignore_sticky_posts' => true, // Otherwise sticky posts jump to the top and break the ordering.
		'no_found_rows'       => false, // We need found_posts for pagination headers.
	);

	if ( $request->get_param( 'search' ) ) {
		$query_args['s'] = $request->get_param( 'search' );
	}

	if ( $request->get_param( 'categories' ) ) {
		$query_args['category__in'] = wp_parse_id_list( $request->get_param( 'categories' ) );
	}

	if ( $request->get_param( 'tags' ) ) {
		$query_args['tag__in'] = wp_parse_id_list( $request->get_param( 'tags' ) );
	}

	$date_query = array();
	if ( $request->get_param( 'after' ) ) {
		$date_query['after'] = $request->get_param( 'after' );
	}
	if ( $request->get_param( 'before' ) ) {
		$date_query['before'] = $request->get_param( 'before' );
	}
	if ( $date_query ) {
		$date_query['inclusive'] = true;
		$query_args['date_query'] = array( $date_query );
	}

	/**
	 * Filter the WP_Query args before the list query runs.
	 *
	 * @param array           $query_args
	 * @param WP_REST_Request $request
	 */
	$query_args = apply_filters( 'rpa_posts_query_args', $query_args, $request );

	$query = new WP_Query( $query_args );

	$items = array();
	foreach ( $query->posts as $post ) {
		$items[] = rpa_prepare_post( $post, $request->get_param( 'acf_format' ) );
	}

	$response = rest_ensure_response( $items );

	// Same pagination headers core uses, so existing REST clients understand them.
	$response->header( 'X-WP-Total', (int) $query->found_posts );
	$response->header( 'X-WP-TotalPages', (int) $query->max_num_pages );

	return $response;
}

function rpa_handle_get_single_post( WP_REST_Request $request ) {
	$post = get_post( (int) $request['id'] );

	if ( ! $post ) {
		return new WP_Error( 'rpa_not_found', __( 'Post not found.', 'renegade-posts-api' ), array( 'status' => 404 ) );
	}

	if ( 'publish' !== $post->post_status && ! current_user_can( 'edit_post', $post->ID ) ) {
		return new WP_Error( 'rpa_forbidden', __( 'You are not allowed to read this post.', 'renegade-posts-api' ), array( 'status' => 403 ) );
	}

	$acf_format = $request->get_param( 'acf_format' ) ? $request->get_param( 'acf_format' ) : 'both';

	return rest_ensure_response( rpa_prepare_post( $post, $acf_format ) );
}

function rpa_handle_get_field_groups( WP_REST_Request $request ) {
	if ( ! rpa_acf_active() ) {
		return new WP_Error( 'rpa_acf_missing', __( 'Advanced Custom Fields is not active.', 'renegade-posts-api' ), array( 'status' => 501 ) );
	}

	$post_type = $request->get_param( 'post_type' );
	$groups    = acf_get_field_groups( array( 'post_type' => $post_type ) );
	$out       = array();

	foreach ( (array) $groups as $group ) {
		$fields = acf_get_fields( $group['key'] );
		$out[]  = array(
			'key'    => $group['key'],
			'title'  => $group['title'],
			'fields' => rpa_describe_fields( (array) $fields ),
		);
	}

	return rest_ensure_response( $out );
}

// Recursively describe fields (so repeaters/groups show their sub fields too).
function rpa_describe_fields( array $fields ) {
	$out = array();

	foreach ( $fields as $field ) {
		$described = array(
			'key'      => $field['key'],
			'name'     => $field['name'],
			'label'    => $field['label'],
			'type'     => $field['type'],
			'required' => ! empty( $field['required'] ),
		);

		if ( ! empty( $field['choices'] ) ) {
			$described['choices'] = $field['choices'];
		}

		if ( ! empty( $field['sub_fields'] ) ) {
			$described['sub_fields'] = rpa_describe_fields( (array) $field['sub_fields'] );
		}

		$out[] = $described;
	}

	return $out;
}

/* =============================================================================
 * STEP 6 — Shape one post into the JSON payload (core fields + ACF).
 * ---------------------------------------------------------------------------*/
function rpa_prepare_post( WP_Post $post, $acf_format = 'both' ) {
	// setup_postdata() populates the global $post so that shortcodes and blocks
	// inside the_content resolve against THIS post rather than whatever was
	// global before. wp_reset_postdata() puts it back afterwards.
	$original_post = isset( $GLOBALS['post'] ) ? $GLOBALS['post'] : null;
	$GLOBALS['post'] = $post;
	setup_postdata( $post );

	$data = array(
		'id'             => (int) $post->ID,
		'title'          => get_the_title( $post ),
		'slug'           => $post->post_name,
		'status'         => $post->post_status,
		'type'           => $post->post_type,
		'link'           => get_permalink( $post ),
		// GMT dates are the safe ones to compare/sort on the client.
		'date'           => mysql_to_rfc3339( $post->post_date ),
		'date_gmt'       => mysql_to_rfc3339( $post->post_date_gmt ),
		'modified'       => mysql_to_rfc3339( $post->post_modified ),
		'modified_gmt'   => mysql_to_rfc3339( $post->post_modified_gmt ),
		'excerpt'        => get_the_excerpt( $post ),
		// apply_filters('the_content') runs shortcodes/blocks like the theme does.
		'content'        => apply_filters( 'the_content', $post->post_content ),
		'content_raw'    => $post->post_content,
		'author'         => array(
			'id'   => (int) $post->post_author,
			'name' => get_the_author_meta( 'display_name', $post->post_author ),
		),
		'featured_media' => (int) get_post_thumbnail_id( $post ),
		'featured_image' => get_post_thumbnail_id( $post ) ? wp_get_attachment_image_url( get_post_thumbnail_id( $post ), 'full' ) : null,
		'categories'     => rpa_terms( $post, 'category' ),
		'tags'           => rpa_terms( $post, 'post_tag' ),
	);

	if ( 'none' !== $acf_format ) {
		$acf = rpa_get_acf_payload( $post->ID );

		if ( in_array( $acf_format, array( 'flat', 'both' ), true ) ) {
			$data['acf'] = $acf['flat'];         // { field_name: value, ... }
		}
		if ( in_array( $acf_format, array( 'groups', 'both' ), true ) ) {
			$data['acf_groups'] = $acf['groups']; // [ { key, title, fields: [...] } ]
		}
	}

	// Restore whatever the global $post was before we touched it.
	wp_reset_postdata();
	if ( null === $original_post ) {
		unset( $GLOBALS['post'] );
	} else {
		$GLOBALS['post'] = $original_post;
	}

	/**
	 * Filter the prepared post payload (add your own keys here).
	 *
	 * @param array   $data
	 * @param WP_Post $post
	 */
	return apply_filters( 'rpa_prepare_post', $data, $post );
}

function rpa_terms( WP_Post $post, $taxonomy ) {
	$terms = get_the_terms( $post, $taxonomy );

	if ( is_wp_error( $terms ) || empty( $terms ) ) {
		return array();
	}

	return array_map(
		function ( $term ) {
			return array(
				'id'   => (int) $term->term_id,
				'name' => $term->name,
				'slug' => $term->slug,
			);
		},
		$terms
	);
}

/* =============================================================================
 * STEP 7 — Read ACF values, grouped by field group.
 *
 * acf_get_field_groups(['post_id' => X]) returns only the groups whose LOCATION
 * RULES match that post, which is exactly what the editor screen shows.
 * get_field($key, $post_id, true) returns the FORMATTED value (image arrays,
 * resolved post objects, etc.) rather than the raw meta value.
 * ---------------------------------------------------------------------------*/
function rpa_acf_active() {
	return function_exists( 'acf_get_field_groups' ) && function_exists( 'get_field' );
}

function rpa_get_acf_payload( $post_id ) {
	$payload = array(
		'flat'   => array(),
		'groups' => array(),
	);

	if ( ! rpa_acf_active() ) {
		return $payload;
	}

	$groups = acf_get_field_groups( array( 'post_id' => $post_id ) );

	foreach ( (array) $groups as $group ) {
		$fields = acf_get_fields( $group['key'] );

		if ( empty( $fields ) ) {
			continue;
		}

		$group_fields = array();

		foreach ( (array) $fields as $field ) {
			$value = get_field( $field['key'], $post_id, true );

			$payload['flat'][ $field['name'] ] = $value;

			$group_fields[] = array(
				'key'   => $field['key'],
				'name'  => $field['name'],
				'label' => $field['label'],
				'type'  => $field['type'],
				'value' => $value,
			);
		}

		$payload['groups'][] = array(
			'key'    => $group['key'],
			'title'  => $group['title'],
			'fields' => $group_fields,
		);
	}

	return $payload;
}

/* =============================================================================
 * STEP 8 — POST handlers: create and update.
 * ---------------------------------------------------------------------------*/
function rpa_handle_create_post( WP_REST_Request $request ) {
	$post_type = $request->get_param( 'post_type' );

	if ( ! post_type_exists( $post_type ) ) {
		return new WP_Error( 'rpa_invalid_post_type', __( 'Unknown post type.', 'renegade-posts-api' ), array( 'status' => 400 ) );
	}

	$postarr = array(
		'post_type'    => $post_type,
		'post_title'   => $request->get_param( 'title' ),
		'post_status'  => $request->get_param( 'status' ) ? $request->get_param( 'status' ) : 'draft',
		'post_content' => (string) $request->get_param( 'content' ),
		'post_excerpt' => (string) $request->get_param( 'excerpt' ),
		'post_author'  => $request->get_param( 'author' ) ? (int) $request->get_param( 'author' ) : get_current_user_id(),
	);

	if ( $request->get_param( 'slug' ) ) {
		$postarr['post_name'] = $request->get_param( 'slug' );
	}

	if ( $request->get_param( 'date' ) ) {
		$postarr['post_date'] = $request->get_param( 'date' );
		// Let WP derive the GMT date from the site timezone.
		$postarr['post_date_gmt'] = get_gmt_from_date( $request->get_param( 'date' ) );
	}

	// Someone else's authorship needs the edit_others_posts capability.
	if ( $request->get_param( 'author' ) && (int) $request->get_param( 'author' ) !== get_current_user_id() ) {
		$type_obj = get_post_type_object( $post_type );
		if ( ! current_user_can( $type_obj->cap->edit_others_posts ) ) {
			return new WP_Error( 'rpa_cannot_set_author', __( 'You are not allowed to set another author.', 'renegade-posts-api' ), array( 'status' => 403 ) );
		}
	}

	// wp_slash() because wp_insert_post() unslashes internally.
	$post_id = wp_insert_post( wp_slash( $postarr ), true );

	if ( is_wp_error( $post_id ) ) {
		$post_id->add_data( array( 'status' => 500 ) );
		return $post_id;
	}

	$applied = rpa_apply_taxonomies_and_media( $post_id, $request );
	if ( is_wp_error( $applied ) ) {
		return $applied;
	}

	$acf_result = rpa_save_acf_values( $post_id, (array) $request->get_param( 'acf' ) );
	if ( is_wp_error( $acf_result ) ) {
		return $acf_result;
	}

	do_action( 'rpa_post_created', $post_id, $request );

	$response = rest_ensure_response(
		array(
			'created'        => true,
			'acf_written'    => $acf_result,
			'post'           => rpa_prepare_post( get_post( $post_id ), 'both' ),
		)
	);
	$response->set_status( 201 ); // 201 Created is the correct status for a new resource.
	$response->header( 'Location', rest_url( RPA_NAMESPACE . '/posts/' . $post_id ) );

	return $response;
}

function rpa_handle_update_post( WP_REST_Request $request ) {
	$post_id = (int) $request['id'];
	$post    = get_post( $post_id );

	if ( ! $post ) {
		return new WP_Error( 'rpa_not_found', __( 'Post not found.', 'renegade-posts-api' ), array( 'status' => 404 ) );
	}

	$postarr = array( 'ID' => $post_id );

	// Only touch fields that were actually sent - a partial update must not blank things out.
	if ( null !== $request->get_param( 'title' ) ) {
		$postarr['post_title'] = $request->get_param( 'title' );
	}
	if ( null !== $request->get_param( 'content' ) ) {
		$postarr['post_content'] = $request->get_param( 'content' );
	}
	if ( null !== $request->get_param( 'excerpt' ) ) {
		$postarr['post_excerpt'] = $request->get_param( 'excerpt' );
	}
	if ( null !== $request->get_param( 'slug' ) ) {
		$postarr['post_name'] = $request->get_param( 'slug' );
	}
	if ( null !== $request->get_param( 'date' ) ) {
		$postarr['post_date']     = $request->get_param( 'date' );
		$postarr['post_date_gmt'] = get_gmt_from_date( $request->get_param( 'date' ) );
	}
	if ( null !== $request->get_param( 'status' ) ) {
		$type_obj = get_post_type_object( $post->post_type );
		if ( 'publish' === $request->get_param( 'status' ) && ! current_user_can( $type_obj->cap->publish_posts ) ) {
			return new WP_Error( 'rpa_cannot_publish', __( 'You are not allowed to publish posts.', 'renegade-posts-api' ), array( 'status' => 403 ) );
		}
		$postarr['post_status'] = $request->get_param( 'status' );
	}

	if ( count( $postarr ) > 1 ) {
		$updated = wp_update_post( wp_slash( $postarr ), true );
		if ( is_wp_error( $updated ) ) {
			$updated->add_data( array( 'status' => 500 ) );
			return $updated;
		}
	}

	$applied = rpa_apply_taxonomies_and_media( $post_id, $request );
	if ( is_wp_error( $applied ) ) {
		return $applied;
	}

	$acf_result = rpa_save_acf_values( $post_id, (array) $request->get_param( 'acf' ) );
	if ( is_wp_error( $acf_result ) ) {
		return $acf_result;
	}

	do_action( 'rpa_post_updated', $post_id, $request );

	return rest_ensure_response(
		array(
			'updated'     => true,
			'acf_written' => $acf_result,
			'post'        => rpa_prepare_post( get_post( $post_id ), 'both' ),
		)
	);
}

function rpa_apply_taxonomies_and_media( $post_id, WP_REST_Request $request ) {
	if ( null !== $request->get_param( 'categories' ) ) {
		wp_set_post_terms( $post_id, wp_parse_id_list( (array) $request->get_param( 'categories' ) ), 'category', false );
	}

	if ( null !== $request->get_param( 'tags' ) ) {
		// Tags accept names or IDs; array_map keeps strings intact.
		$tags = array_map( 'sanitize_text_field', (array) $request->get_param( 'tags' ) );
		wp_set_post_terms( $post_id, $tags, 'post_tag', false );
	}

	if ( $request->get_param( 'featured_media' ) ) {
		$attachment_id = (int) $request->get_param( 'featured_media' );
		if ( 'attachment' !== get_post_type( $attachment_id ) ) {
			return new WP_Error( 'rpa_invalid_media', __( 'featured_media must be an attachment ID.', 'renegade-posts-api' ), array( 'status' => 400 ) );
		}
		set_post_thumbnail( $post_id, $attachment_id );
	}

	return true;
}

/* =============================================================================
 * STEP 9 — Write ACF values safely.
 *
 * Rules enforced here:
 *  1. Only fields that belong to a field group whose location rules match this
 *     post can be written. Anything else is rejected (no arbitrary meta writes).
 *  2. Values are sanitized per field type before update_field().
 *  3. update_field() is called with the FIELD KEY (field_abc123), which is what
 *     makes ACF store the hidden _fieldname reference meta correctly.
 * ---------------------------------------------------------------------------*/
function rpa_save_acf_values( $post_id, array $values ) {
	if ( empty( $values ) ) {
		return array();
	}

	if ( ! rpa_acf_active() || ! function_exists( 'update_field' ) ) {
		return new WP_Error( 'rpa_acf_missing', __( 'Advanced Custom Fields is not active, cannot write ACF values.', 'renegade-posts-api' ), array( 'status' => 501 ) );
	}

	$allowed = rpa_build_acf_field_map( $post_id );

	// Pass 1: validate every field name BEFORE writing anything, so a single
	// typo cannot leave the post half updated.
	$unknown = array();
	foreach ( array_keys( $values ) as $identifier ) {
		if ( ! isset( $allowed[ (string) $identifier ] ) ) {
			$unknown[] = (string) $identifier;
		}
	}

	if ( $unknown ) {
		return new WP_Error(
			'rpa_unknown_acf_fields',
			sprintf(
				/* translators: %s: comma separated field names */
				__( 'These ACF fields do not exist for this post: %s', 'renegade-posts-api' ),
				implode( ', ', $unknown )
			),
			array(
				'status'         => 400,
				'unknown_fields' => $unknown,
				'allowed_fields' => array_values( array_unique( wp_list_pluck( $allowed, 'name' ) ) ),
			)
		);
	}

	// Pass 2: sanitize and write.
	$written = array();
	foreach ( $values as $identifier => $value ) {
		$field = $allowed[ (string) $identifier ];
		$clean = rpa_sanitize_acf_value( $value, $field );

		update_field( $field['key'], $clean, $post_id );

		$written[ $field['name'] ] = $clean;
	}

	return $written;
}

// Map every writable field by BOTH its name and its key, so callers can use either.
function rpa_build_acf_field_map( $post_id ) {
	$map    = array();
	$groups = acf_get_field_groups( array( 'post_id' => $post_id ) );

	foreach ( (array) $groups as $group ) {
		foreach ( (array) acf_get_fields( $group['key'] ) as $field ) {
			$map[ $field['name'] ] = $field;
			$map[ $field['key'] ]  = $field;
		}
	}

	return $map;
}

function rpa_sanitize_acf_value( $value, array $field ) {
	switch ( $field['type'] ) {
		case 'text':
		case 'password':
		case 'select':
		case 'radio':
		case 'button_group':
			return is_array( $value ) ? array_map( 'sanitize_text_field', $value ) : sanitize_text_field( $value );

		case 'textarea':
			return sanitize_textarea_field( $value );

		case 'wysiwyg':
			return wp_kses_post( $value );

		case 'email':
			return sanitize_email( $value );

		case 'url':
		case 'link':
			return is_array( $value ) ? array_map( 'esc_url_raw', $value ) : esc_url_raw( $value );

		case 'number':
		case 'range':
			return is_numeric( $value ) ? $value + 0 : 0;

		case 'true_false':
			return rest_sanitize_boolean( $value );

		case 'image':
		case 'file':
			// Accept an attachment ID, or {"ID": 123} / {"id": 123}.
			if ( is_array( $value ) ) {
				$value = isset( $value['ID'] ) ? $value['ID'] : ( isset( $value['id'] ) ? $value['id'] : 0 );
			}
			return absint( $value );

		case 'gallery':
		case 'relationship':
		case 'post_object':
		case 'page_link':
		case 'taxonomy':
		case 'user':
			return is_array( $value ) ? wp_parse_id_list( $value ) : absint( $value );

		case 'checkbox':
			return array_map( 'sanitize_text_field', (array) $value );

		case 'date_picker':
		case 'date_time_picker':
		case 'time_picker':
		case 'color_picker':
			return sanitize_text_field( $value );

		case 'repeater':
		case 'group':
		case 'flexible_content':
			// Nested structures: recurse into declared sub fields where we can.
			return rpa_sanitize_nested_acf_value( $value, $field );

		default:
			return is_array( $value ) ? map_deep( $value, 'sanitize_text_field' ) : sanitize_text_field( $value );
	}
}

function rpa_sanitize_nested_acf_value( $value, array $field ) {
	if ( empty( $field['sub_fields'] ) || ! is_array( $value ) ) {
		return map_deep( (array) $value, 'sanitize_text_field' );
	}

	$sub_map = array();
	foreach ( (array) $field['sub_fields'] as $sub ) {
		$sub_map[ $sub['name'] ] = $sub;
		$sub_map[ $sub['key'] ]  = $sub;
	}

	// 'group' is one associative row; 'repeater' is a list of rows.
	$is_row_list = isset( $value[0] ) && is_array( $value[0] );
	$rows        = $is_row_list ? $value : array( $value );
	$clean_rows  = array();

	foreach ( $rows as $row ) {
		$clean_row = array();
		foreach ( (array) $row as $sub_name => $sub_value ) {
			if ( isset( $sub_map[ $sub_name ] ) ) {
				$clean_row[ $sub_name ] = rpa_sanitize_acf_value( $sub_value, $sub_map[ $sub_name ] );
			}
		}
		$clean_rows[] = $clean_row;
	}

	return $is_row_list ? $clean_rows : $clean_rows[0];
}

/* =============================================================================
 * STEP 10 — Small guard rails.
 * ---------------------------------------------------------------------------*/

// Refuse to authenticate our namespace over plain HTTP (credentials in the clear).
add_filter( 'rest_pre_dispatch', 'rpa_require_https', 10, 3 );
function rpa_require_https( $result, $server, WP_REST_Request $request ) {
	if ( 0 !== strpos( ltrim( $request->get_route(), '/' ), RPA_NAMESPACE ) ) {
		return $result;
	}

	// Allow local dev over http.
	if ( ! is_ssl() && ! in_array( wp_get_environment_type(), array( 'local', 'development' ), true ) ) {
		return new WP_Error(
			'rpa_https_required',
			__( 'This endpoint requires HTTPS.', 'renegade-posts-api' ),
			array( 'status' => 403 )
		);
	}

	return $result;
}

/**
 * OPTIONAL escape hatch.
 *
 * Some security plugins (Wordfence, iThemes, "disable REST API" snippets) return
 * a blanket WP_Error from rest_authentication_errors, which kills our endpoints
 * even for a correctly authenticated user. This re-allows OUR namespace only,
 * and only for an already authenticated user - but because it weakens another
 * plugin's rule, it is OFF unless you opt in from wp-config.php:
 *
 *     define( 'RPA_BYPASS_REST_BLOCKERS', true );
 */
if ( defined( 'RPA_BYPASS_REST_BLOCKERS' ) && RPA_BYPASS_REST_BLOCKERS ) {
	add_filter( 'rest_authentication_errors', 'rpa_allow_namespace_auth', 99 );
}
function rpa_allow_namespace_auth( $errors ) {
	if ( ! is_wp_error( $errors ) ) {
		return $errors;
	}

	$route = isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '';
	if ( false !== strpos( $route, RPA_NAMESPACE ) && is_user_logged_in() ) {
		return true;
	}

	return $errors;
}
