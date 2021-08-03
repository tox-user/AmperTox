const fs = require("fs");
const path = require("path");
const CONFIG_PATH = path.resolve(__dirname, "../../config.json");
const ENCODING = "utf8";
const INDENT_LEVEL = 4;

module.exports =
{
	load()
	{
		// this can be sync because we load config only on client start and we need it before everything else
		const contents = fs.readFileSync(CONFIG_PATH, ENCODING);

		let cfg;
		try
		{
			cfg = JSON.parse(contents);

		} catch(e)
		{
			throw e;
		}

		console.log("Loaded config");
		return cfg;
	},

	save(data)
	{
		return new Promise((resolve) =>
		{
			let dataString;
			try
			{
				dataString = JSON.stringify(data, null, INDENT_LEVEL);

			} catch(e)
			{
				throw e;
			}

			fs.writeFile(CONFIG_PATH, dataString, ENCODING, (err) =>
			{
				if (err)
					throw err;

				console.log("Config saved");
				resolve();
			});
		});
	}
};