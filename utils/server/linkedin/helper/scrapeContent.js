import cheerio from 'cheerio';

const scrapeExperience = async (page, pageURL, content) => {
		return new Promise(async (resolve, reject) => {
			try {
				await page.goto(`${pageURL}/experience`, { waitUntil: 'domcontentloaded' });
				await page.waitForSelector('#main li[id^=profilePagedListComponent]', { visible: true });
				const $ = cheerio.load(await page.content());

				content.experience = $('#main li[id^=profilePagedListComponent]').map(function () {
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
				}).get();

				return resolve();
			}
			catch (err) { reject(err); }
		});
	},
	scrapeEducation = async (page, pageURL, content) => {
		return new Promise(async (resolve, reject) => {
			try {
				await page.goto(`${pageURL}/education`, { waitUntil: 'domcontentloaded' });
				await page.waitForSelector('#main li[id^=profilePagedListComponent]', { visible: true });
				const $ = cheerio.load(await page.content());

				content.education = $('#main li[id^=profilePagedListComponent]').map(function () {
					return {
						school: $(this).find('span.t-bold .visually-hidden').text().trim(),
						degree: $(this).find('span.t-14.t-normal:not(.t-black--light) .visually-hidden').text().trim(),
						dateRange: $(this).find('span.t-14.t-normal.t-black--light .visually-hidden').text().trim()
					};
				}).get();

				return resolve();
			}
			catch (err) { reject(err); }
		});
	},
	scrapeAwards = async (page, pageURL, content) => {
		return new Promise(async (resolve, reject) => {
			try {
				await page.goto(`${pageURL}/honors`, { waitUntil: 'domcontentloaded' });
				await page.waitForSelector('#main li[id^=profilePagedListComponent]', { visible: true });
				const $ = cheerio.load(await page.content());

				content.awards = $('#main li[id^=profilePagedListComponent]').map(function () {
					const [issuer, date] = $(this).find('span.t-14.t-normal .visually-hidden').text().trim().split(' · ');
					return {
						title: $(this).find('span.t-bold .visually-hidden').text().trim(),
						description: $(this).find('ul > li div.t-14.t-normal.t-black .visually-hidden').text().trim(),
						issuer,
						date
					};
				}).get();

				return resolve();
			}
			catch (err) { reject(err); }
		});
	},
	scrapeLanguages = async (page, pageURL, content) => {
		return new Promise(async (resolve, reject) => {
			try {
				await page.goto(`${pageURL}/languages`, { waitUntil: 'domcontentloaded' });
				await page.waitForSelector('#main li[id^=profilePagedListComponent]', { visible: true });
				const $ = cheerio.load(await page.content());

				content.languages = $('#main li[id^=profilePagedListComponent]').map(function () {
					return {
						name: $(this).find('span.t-bold .visually-hidden').text().trim(),
						fluency: $(this).find('span.t-14.t-normal.t-black--light .visually-hidden').text().trim()
					};
				}).get();

				return resolve();
			}
			catch (err) { reject(err); }
		});
	};


export const scrapeContent = async (page, handle) => {
	return new Promise(async (resolve, reject) => {
		const sectionURL = `https://www.linkedin.com/in/${handle}/details`,
			content = { handle };
		try {
			const scrapeList = [scrapeExperience, scrapeEducation, scrapeAwards, scrapeLanguages];
			scrapeList.sort(() => Math.random() - 0.5);

			for (let i = 0; i < scrapeList.length; i++) {
				await scrapeList[i](page, sectionURL, content);
				await page.waitForTimeout((Math.floor(Math.random() * 12) + 5) * 1000);
			}

			return resolve(content);
		}
		catch (err) { reject(err); }
	});
};


