<?php
/**
 * Renegade Posts API - PHP client using wp_remote_* (works inside another
 * WordPress install) with a plain cURL fallback for standalone PHP.
 *
 * Credentials belong in the environment, never in the file.
 */

$base     = 'https://renegadeinsurance.com/wp-json/renegade/v1';
$user     = getenv( 'WP_USER' );
$app_pass = getenv( 'WP_APP_PASSWORD' );

if ( ! $user || ! $app_pass ) {
	fwrite( STDERR, "Set WP_USER and WP_APP_PASSWORD.\n" );
	exit( 1 );
}

$auth_header = 'Basic ' . base64_encode( $user . ':' . $app_pass );

/**
 * Minimal request helper. Returns [ status, body(array), headers(array) ].
 */
function rpa_request( $url, $auth_header, $method = 'GET', array $payload = null ) {
	$ch = curl_init( $url );

	curl_setopt_array(
		$ch,
		array(
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_CUSTOMREQUEST  => $method,
			CURLOPT_HEADER         => true,
			CURLOPT_HTTPHEADER     => array(
				'Authorization: ' . $auth_header,
				'Content-Type: application/json',
			),
		)
	);

	if ( null !== $payload ) {
		curl_setopt( $ch, CURLOPT_POSTFIELDS, wp_json_encode_fallback( $payload ) );
	}

	$raw         = curl_exec( $ch );
	$status      = curl_getinfo( $ch, CURLINFO_RESPONSE_CODE );
	$header_size = curl_getinfo( $ch, CURLINFO_HEADER_SIZE );
	curl_close( $ch );

	$head = substr( $raw, 0, $header_size );
	$body = substr( $raw, $header_size );

	$headers = array();
	foreach ( explode( "\r\n", trim( $head ) ) as $line ) {
		if ( false !== strpos( $line, ':' ) ) {
			list( $k, $v )                 = explode( ':', $line, 2 );
			$headers[ strtolower( $k ) ] = trim( $v );
		}
	}

	return array( $status, json_decode( $body, true ), $headers );
}

function wp_json_encode_fallback( $data ) {
	return function_exists( 'wp_json_encode' ) ? wp_json_encode( $data ) : json_encode( $data );
}

// ---------------------------------------------------------------------------
// 1. GET the latest posts (newest first is the default ordering).
// ---------------------------------------------------------------------------
list( $status, $posts, $headers ) = rpa_request( $base . '/posts?per_page=5', $auth_header );

if ( 200 !== $status ) {
	fwrite( STDERR, "GET failed ({$status}): " . ( $posts['message'] ?? '' ) . "\n" );
	exit( 1 );
}

printf( "Total posts: %s across %s pages\n", $headers['x-wp-total'] ?? '?', $headers['x-wp-totalpages'] ?? '?' );

foreach ( $posts as $post ) {
	printf( " - [%s] #%d %s\n", $post['date'], $post['id'], $post['title'] );

	foreach ( (array) ( $post['acf_groups'] ?? array() ) as $group ) {
		printf( "     group: %s\n", $group['title'] );
		foreach ( $group['fields'] as $field ) {
			printf( "       %s (%s) = %s\n", $field['label'], $field['type'], var_export( $field['value'], true ) );
		}
	}
}

// ---------------------------------------------------------------------------
// 2. POST a new draft with ACF values.
// ---------------------------------------------------------------------------
list( $status, $created ) = rpa_request(
	$base . '/posts',
	$auth_header,
	'POST',
	array(
		'title'   => 'Created from PHP',
		'content' => '<p>Hello from the API.</p>',
		'status'  => 'draft',
		'acf'     => array(
			'read_time'  => 4,
			'agent_name' => 'Russell Armine',
		),
	)
);

if ( 201 !== $status ) {
	fwrite( STDERR, "POST failed ({$status}): " . ( $created['message'] ?? '' ) . "\n" );
	// 400 rpa_unknown_acf_fields includes data.allowed_fields telling you what IS writable.
	if ( ! empty( $created['data']['allowed_fields'] ) ) {
		fwrite( STDERR, 'Allowed: ' . implode( ', ', $created['data']['allowed_fields'] ) . "\n" );
	}
	exit( 1 );
}

printf( "Created post #%d, ACF written: %s\n", $created['post']['id'], json_encode( $created['acf_written'] ) );
