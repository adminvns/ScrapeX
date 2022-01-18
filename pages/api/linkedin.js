import { linkedInScraper } from '../../utils';

export default async function handler (req, res) {
	if (req.method === 'POST') {
		const { handle } = req.body,
			bot = JSON.parse(req.headers.bot);

		try {
			const data = await linkedInScraper(bot, handle);
			return res.status(200).json(data);
		}
		catch (err) {
			return res.status(err?.code || 500).json(err?.message);
		}
	}
	return res.status(404);
}
