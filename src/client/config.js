const fs = require("fs");
const path = require("path");
const merge = require("lodash.merge");
const USER_CONFIG_PATH = path.resolve(__dirname, "../../config.json");
const DEFAULT_CONFIG_PATH = path.resolve(__dirname, "defaultConfig.json");
const ENCODING = "utf8";
const INDENT_LEVEL = 4;

module.exports =
{
	/**
	 * Loads client config synchronously
	 * @returns {any} loaded config data
	 */
	load()
	{
		// we use sync because we load config only on client start and we need it before everything else
		if (!fs.existsSync(USER_CONFIG_PATH))
		{
			console.log("No config file found, creating a default config file");
			fs.copyFileSync(DEFAULT_CONFIG_PATH, USER_CONFIG_PATH);
		}

		const defaultConfigJson = fs.readFileSync(DEFAULT_CONFIG_PATH, ENCODING);
		const userConfigJson = fs.readFileSync(USER_CONFIG_PATH, ENCODING);
		const defaultConfig = JSON.parse(defaultConfigJson);

		// parse user config
		let config;
		try
		{
			const userConfig = JSON.parse(userConfigJson);
			config = merge(defaultConfig, userConfig);

		} catch(err)
		{
			console.error("Error in config file");
			throw err;
		}

		console.log("Loaded config");
		return config;
	},

	/**
	 * Saves client config asynchronously
	 * @param {any} data config data
	 * @returns Promise
	 */
	save(data)
	{
		return new Promise((resolve) =>
		{
			let dataString;
			try
			{
				dataString = JSON.stringify(data, null, INDENT_LEVEL);

			} catch(err)
			{
				throw err;
			}

			fs.writeFile(USER_CONFIG_PATH, dataString, ENCODING, (err) =>
			{
				if (err)
					throw err;

				console.log("Config saved");
				resolve();
			});
		});
	}
};