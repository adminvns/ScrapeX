export const authenticate = async (page, credentials) => {
	return new Promise(async (resolve, reject) => {
		try {
			const loginURL = 'https://www.linkedin.com/login',
				{ username, password } = credentials;

			if (!username || !password) {
				return reject({
					code: 403,
					message: 'Missing bot credentials'
				});
			}

			await page.goto(loginURL, { waitUntil: 'domcontentloaded' });
			if (page.url() != loginURL) {
				return resolve();
			}

			await page.click('#username');
			await page.keyboard.type(username);
			await page.click('#password');
			await page.keyboard.type(password);
			await page.click('#organic-div > form > div.login__form_action_container > button');
			await page.waitForNavigation();

			if (page.url().includes('checkpoint')) {
				return reject({
					code: 403,
					message: 'Provided bot account has been restricted by linkedin, Provide a different credential'
				});
			}

			return resolve();
		}
		catch (err) { reject(err); }
	});
};
