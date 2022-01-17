import cheerio from 'cheerio';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

let browser = null,
	page = null;

const setupBrowser = async () => {
		return new Promise(async (resolve, reject) => {
			try {
				if (browser) {
					return resolve();
				}
				browser = await puppeteer.launch({
					headless: true,
					userDataDir: '.chrome',
					args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
				});
				return resolve();
			}
			catch (err) { reject(err); }
		});
	},

	performAuthentication = async (credentials) => {
		return new Promise(async (resolve, reject) => {
			try {
				const loginURL = 'https://www.linkedin.com/login',
					{ username, password } = credentials;

				if (!username || !password) {
					return reject('Missing bot credentials');
				}

				page = await browser.newPage();
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
				return resolve();
			}
			catch (err) { reject(err); }
		});
	},
	scrapeExperience = async (pageURL) => {
		return new Promise(async (resolve, reject) => {
			try {
				await page.goto(`${pageURL}/experience`, { waitUntil: 'domcontentloaded' });
				await page.waitForSelector('#main li[id^=profilePagedListComponent]', { visible: true });
				const $ = cheerio.load(await page.content());

				return resolve($('#main li[id^=profilePagedListComponent]').map(function () {
					const elementValue = (i) => $($(this).find('span.visually-hidden').get(i)).text().trim(),
						roleName = $(this).find('span.t-bold .visually-hidden').text().trim(),
						[companyName, roleType] = elementValue(1).split(' · '),
						[dateRange, duration] = elementValue(2).split(' · ');

					return {
						name: companyName,
						role: { name: roleName, type: roleType },
						tenure: { range: dateRange, duration },
						location: elementValue(3),
						description: elementValue(4)
					};
				}).get());
			}
			catch (err) { reject(err); }
		});
	},
	scrapeEducation = async (pageURL) => {
		return new Promise(async (resolve, reject) => {
			try {
				await page.goto(`${pageURL}/education`, { waitUntil: 'domcontentloaded' });
				await page.waitForSelector('#main li[id^=profilePagedListComponent]', { visible: true });
				const $ = cheerio.load(await page.content());

				return resolve($('#main li[id^=profilePagedListComponent]').map(function () {
					return {
						school: $(this).find('span.t-bold .visually-hidden').text().trim(),
						degree: $(this).find('span.t-14.t-normal:not(.t-black--light) .visually-hidden').text().trim(),
						dateRange: $(this).find('span.t-14.t-normal.t-black--light .visually-hidden').text().trim()
					};
				}).get());
			}
			catch (err) { reject(err); }
		});
	},
	scrapeAwards = async (pageURL) => {
		return new Promise(async (resolve, reject) => {
			try {
				await page.goto(`${pageURL}/honors`, { waitUntil: 'domcontentloaded' });
				await page.waitForSelector('#main li[id^=profilePagedListComponent]', { visible: true });
				const $ = cheerio.load(await page.content());

				return resolve($('#main li[id^=profilePagedListComponent]').map(function () {
					const [issuer, date] = $(this).find('span.t-14.t-normal .visually-hidden').text().trim().split(' · ');
					return {
						title: $(this).find('span.t-bold .visually-hidden').text().trim(),
						description: $(this).find('ul > li div.t-14.t-normal.t-black .visually-hidden').text().trim(),
						issuer,
						date
					};
				}).get());
			}
			catch (err) { reject(err); }
		});
	},
	scrapeLanguages = async (pageURL) => {
		return new Promise(async (resolve, reject) => {
			try {
				await page.goto(`${pageURL}/languages`, { waitUntil: 'domcontentloaded' });
				await page.waitForSelector('#main li[id^=profilePagedListComponent]', { visible: true });
				const $ = cheerio.load(await page.content());

				return resolve($('#main li[id^=profilePagedListComponent]').map(function () {
					return {
						name: $(this).find('span.t-bold .visually-hidden').text().trim(),
						fluency: $(this).find('span.t-14.t-normal.t-black--light .visually-hidden').text().trim()
					};
				}).get());
			}
			catch (err) { reject(err); }
		});
	},
	closeBrowser = async (pageURL) => {
		return new Promise(async (resolve, reject) => {
			try {
				await browser.close();
				browser = null;
				page = null;
				return resolve();
			}
			catch (err) { reject(err); }
		});
	};

export const linkedInScraper = async (botCredentials, handle) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!handle) {
				return reject('No linkedin handle provided');
			}

			const user = { handle },
				sectionURL = `https://www.linkedin.com/in/${handle}/details`;

			await setupBrowser();
			await performAuthentication(botCredentials);

			user.experience = await scrapeExperience(sectionURL);
			user.education = await scrapeEducation(sectionURL);
			user.awards = await scrapeAwards(sectionURL);
			user.languages = await scrapeLanguages(sectionURL);

			console.log(JSON.stringify(user, null, 4));

			resolve(user);
			return await closeBrowser();
		}
		catch (err) { reject(err); }
	});
};
