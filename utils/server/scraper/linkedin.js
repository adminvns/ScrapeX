import cheerio from 'cheerio';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

let browser = null,
	page = null;

const user = {
		username: null,
		experience: [],
		education: [],
		skills: [],
		accomplishments: []
	},
	setupBrowser = async () => {
		return new Promise(async (resolve, reject) => {
			try {
				if (browser) {
					return resolve();
				}
				browser = await puppeteer.launch({
					headless: false,
					userDataDir: '.chrome',
					args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
				});
				page = await browser.newPage();
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

				await page.goto(loginURL, { waitUntil: 'domcontentloaded' });
				if (page.url() != loginURL) {
					console.log('Already logged in');
					return resolve();
				}
				console.log('Logging in');
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
				await page.goto(pageURL('experience'), { waitUntil: 'domcontentloaded' });
				return resolve();
			}
			catch (err) { reject(err); }
		});
	};

export const linkedInScraper = async (botCredentials, handle) => {
	return new Promise(async (resolve, reject) => {
		try {
			console.log('Scraping');
			if (!handle) {
				return reject('No linkedin handle provided');
			}

			const getSectionURL = (section) => `https://www.linkedin.com/in/${handle}/details/${section}`;

			await setupBrowser();
			await performAuthentication(botCredentials);

			// await scrapeExperience(getSectionURL);


			await page.goto(`https://www.linkedin.com/in/${handle}`, { waitUntil: 'domcontentloaded' });
			await page.waitForSelector('#main ul.display-flex.flex-row.flex-wrap', { visible: true });
			const $ = cheerio.load(await page.content());

			user.username = handle;

			$('#main > section > div > ul').each(function () {
				const isSection = (element) => $(this).parent().parent().find('div h2').text().trim().toLowerCase().includes(element);

				if (isSection('experience')) {
					user.experience = $(this).find('> li').map(function () {
						const elementValue = (i) => $($(this).find('span.visually-hidden').get(i)).text().trim(),
							roleName = elementValue(0),
							[companyName, roleType] = elementValue(1).split(' · '),
							[dateRange, duration] = elementValue(2).split(' · '),
							location = elementValue(3),
							description = elementValue(4);

						return {
							name: companyName,
							role: { name: roleName, type: roleType },
							dateRange: { range: dateRange, duration },
							location,
							description
						};
					}).get();
				}
				if (isSection('education')) {
					user.education = $(this).find('> li').map(function () {
						return {
							school: $(this).find('span.t-bold .visually-hidden').text().trim(),
							degree: $(this).find('span.t-14.t-normal:not(.t-black--light) .visually-hidden').text().trim(),
							dateRange: $(this).find('span.t-14.t-normal.t-black--light .visually-hidden').text().trim()
						};
					}).get();
				}

				if (isSection('honors & awards')) {
					user.education = $(this).find('> li').map(function () {
						return {
							school: $(this).find('span.t-bold .visually-hidden').text().trim(),
							degree: $(this).find('span.t-14.t-normal:not(.t-black--light) .visually-hidden').text().trim(),
							dateRange: $(this).find('span.t-14.t-normal.t-black--light .visually-hidden').text().trim()
						};
					}).get();
				}
			});

			user.username = handle;

			// user.experience = experience.map((i, item) => {
			// 	console.log(i, item);
			// 	const name = $(item).find('.pv-entity__secondary-title.t-14').contents().first().text().trim(),
			// 		role = $(item).find('h3.t-16.t-black.t-bold').text(),
			// 		dateRange = $(item).find('div.display-flex > h4:nth-child(1) > span:nth-child(2)').text(),
			// 		duration = $(item).find('div.display-flex > h4:nth-child(2) > span:nth-child(2)').text(),
			// 		location = $(item).find('h4.pv-entity__location > span:nth-child(2)').text();
			// 	return { name, role, dateRange, duration, location };
			// }).get();

			console.log(JSON.stringify(user, null, 4));
			await browser.close();
			browser = null;
			return resolve(user);
		}
		catch (err) { reject(err); }
	});
};
