export function notFoundResponse() {
	return new Response('', {
		status: 404,
		statusText: 'Not found'
	})
}
