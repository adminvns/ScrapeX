import mongoose from 'mongoose';

/**
 * Initiate a MongoDB connection
 * @returns The mongoose connection client.
 */
export const initDatabase = async () => {
	const dbOptions = { useNewUrlParser: true, useUnifiedTopology: true };

	return new Promise((resolve, reject) => {
		mongoose.connect(process.env.MONGO_URL, dbOptions)
			.then(() => {
				console.log('Database connection successful');
				return resolve(mongoose.connection.client);
			},
			(err) => {
				console.log('Database connection failed', err);
				return reject(err);
			});

		mongoose.connection.on('error', (err) => {
			console.log('Mongo Error', err);
		});
	});
};
