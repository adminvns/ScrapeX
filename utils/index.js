let modules = {
	...require('./functions/fetcher')
};

// Inject these modules on server side only
if (typeof window === 'undefined') {
	const glob = require('glob');

	glob.sync('utils/server/**/*.js').forEach((modulePath) => {
		modules = { ...modules, ...require(`.${modulePath.replaceAll('utils', '')}`) };
	});
}

module.exports = modules;
