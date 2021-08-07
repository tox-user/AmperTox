const sqlite3 = require("sqlite3").verbose();
let db;

module.exports =
{
	/**
	 * Opens the database asynchronously
	 * @param {string} databasePath path to database file
	 * @returns {Promise}
	 */
	open: async (databasePath) =>
	{
		return new Promise((resolve, reject) =>
		{
			db = new sqlite3.Database(databasePath, (err) =>
			{
				if (err)
				{
					console.error(err.message);
					reject(err);
				}

				console.log("Database Loaded");
				resolve();
			});
		});
	},

	/**
	 * Closes the database asynchronously
	 * @returns {Promise}
	 */
	close: async () =>
	{
		return new Promise((resolve, reject) =>
		{
			db.close(err =>
			{
				if (err)
				{
					console.error(err.message);
					reject(err);
				}

				console.log("Database Closed");
				resolve();
			});
		});
	},

	/**
	 * Sets up the database for a new profile
	 * @returns {Promise}
	 */
	createTables: async () =>
	{
		return new Promise((resolve, reject) =>
		{
			const query = "CREATE TABLE IF NOT EXISTS Messages (\
				id INTEGER PRIMARY KEY AUTOINCREMENT,\
				contact_pk VARCHAR(64) NOT NULL,\
				message VARCHAR(1372) NOT NULL,\
				owner_pk VARCHAR(64) NOT NULL,\
				timestamp REAL NOT NULL,\
				is_pending BOOLEAN DEFAULT 0 NOT NULL\
			);";

			db.run(query, [], (err) =>
			{
				if (err)
				{
					console.error(err.message);
					reject(err);
				}

				resolve();
			});
		});
	},

	/**
	 * Saves a message to the database
	 * @param {string} contactPk contact's public key
	 * @param {string} message
	 * @param {string} ownerPk sender's public key
	 * @param {number} timestamp date of when the message was sent
	 * @returns {Promise} promise that returns message id
	 */
	addMessage: async (contactPk, message, ownerPk, timestamp) =>
	{
		return new Promise((resolve, reject) =>
		{
			const query = "INSERT INTO Messages (contact_pk, message, owner_pk, timestamp) VALUES (?, ?, ?, ?);";

			db.run(query, [contactPk, message, ownerPk, timestamp], (err) =>
			{
				if (err)
				{
					console.error(err.message);
					reject(err);
				}

				resolve(this.lastID);
			});
		});
	},

	/**
	 * Asynchronously loads messages for a specified contact
	 * @param {string} contactPk contact's public key
	 * @param {number} amount amount of messages to load
	 * @returns {Promise} promise that returns loaded messages
	 */
	getMessages: async (contactPk, amount=20) =>
	{
		return new Promise((resolve, reject) =>
		{
			const query = "SELECT * FROM (\
				SELECT * FROM Messages WHERE contact_pk = ? ORDER BY id DESC LIMIT ?\
			) ORDER BY id ASC;";

			db.all(query, [contactPk, amount], (err, rows) =>
			{
				if (err)
				{
					console.error(err.message);
					reject(err);
				}

				resolve(rows);
			});
		});
	}
};