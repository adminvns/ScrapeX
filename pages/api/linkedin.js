import { linkedInScraper } from '../../utils';

export default async function handler (req, res) {
	if (req.method === 'POST') {
		const { handle } = req.body,
			bot = JSON.parse(req.headers.bot);

		const data = linkedInScraper(bot, handle);
		return res.status(200).json(req.body, bot);
	}
	return res.status(404);
}
