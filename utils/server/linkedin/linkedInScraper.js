import cheerio from 'cheerio';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const user = {
	username: null,
	experience: [], education: [], skills: [], accomplishments: [],
	updated: null
};

export const linkedInScraper = async (username) => {
	console.log('Scraping');
	return new Promise(async (resolve, reject) => {
		try {
			if (!username) {
				return reject('No username provided');
			}

			const USER_URL = `https://www.linkedin.com/in/${username}/`,
				LOGIN_URL = 'https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin',
				browser = await puppeteer.launch({ headless: true }),
				page = await browser.newPage();

			await page.setViewport({ width: 1366, height: 768 });
			await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
			await page.click('#username');
			await page.keyboard.type(process.env.BOT_EMAIL);
			await page.click('#password');
			await page.keyboard.type(process.env.BOT_PASSWORD);
			await page.click('#organic-div > form > div.login__form_action_container > button');
			await page.waitForNavigation();
			await page.goto(USER_URL, { waitUntil: 'domcontentloaded' });
			await page.waitForSelector('#experience-section > ul', { visible: true });
			const $ = cheerio.load(await page.content()),
				experience = $('#experience-section > ul > li .pv-entity__summary-info');

			user.username = username;
			user.experience = experience.map((i, item) => {
				console.log(i, item);
				const name = $(item).find('.pv-entity__secondary-title.t-14').contents().first().text().trim(),
					role = $(item).find('h3.t-16.t-black.t-bold').text(),
					dateRange = $(item).find('div.display-flex > h4:nth-child(1) > span:nth-child(2)').text(),
					duration = $(item).find('div.display-flex > h4:nth-child(2) > span:nth-child(2)').text(),
					location = $(item).find('h4.pv-entity__location > span:nth-child(2)').text();
				return { name, role, dateRange, duration, location };
			}).get();

			console.log('UserData New', user);
			return resolve(user);
		}
		catch (err) { reject(err); }
	});
};
