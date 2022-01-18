import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import authenticate from './authenticate';
import scrapeContent from './scrapeContent';

puppeteer.use(StealthPlugin());

const setupBrowser = async () => {
		return new Promise(async (resolve, reject) => {
			try {
				return resolve(await puppeteer.launch({
					headless: process.env.NODE_ENV !== 'development',
					userDataDir: '.chrome',
					args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
				}));
			}
			catch (err) { reject(err); }
		});
	},
	closeBrowser = async (browser, page) => {
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
		if (!handle) {
			return reject({
				code: 400,
				message: 'No linkedin handle provided'
			});
		}

		const browser = await setupBrowser(),
			page = await browser.newPage();

		try {
			await authenticate(page, botCredentials);

			const user = await scrapeContent(page, handle);

			console.log(JSON.stringify(user, null, 4));

			closeBrowser(browser, page);
			return resolve(user);
		}
		catch (err) {
			closeBrowser(browser, page);
			return reject(err);
		}
	});
};
