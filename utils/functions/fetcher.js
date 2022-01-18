/**
 * It takes a route and options, and returns a promise that resolves to the JSON of the response.
 * @param route - the URL to fetch
 * @param options - {
 * @returns The JSON object.
 */
export const fetcher = async (route = '', options = {}) => {
	return new Promise(async (resolve, reject) => {
		try {
			const res = await fetch(route, options);
			return resolve(await res.json());
		}
		catch (e) {
			return reject(e);
		}
	});
};
