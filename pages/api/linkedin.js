import { linkedInScraper } from "../../utils"

export default async function handler (req, res) {
	if (req.method === 'POST') {
		const { username, password } = req.body;
		return res.status(200).json(req.body);
	}
	return res.status(404);
}
