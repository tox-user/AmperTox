import fs from "fs";
import path from "path";
// @ts-ignore
import merge from "lodash.merge";
import "./defaultConfig.json";

const DEFAULT_CONFIG_PATH = path.resolve(__dirname, "defaultConfig.json");
const USER_CONFIG_PATH = path.resolve(__dirname, "../../config.json");
const ENCODING = "utf8";
const INDENT_LEVEL = 4;

export interface ConfigData
{
	lastUsedProfile: string;
    network: {
        udp: boolean;
        ipv6: boolean;
		proxy: {
			enabled: boolean;
			type: "socks5" | "http";
			address: string;
			port: number;
		};
    };
	fileTransfers: {
		rejectFiles: boolean;
		rejectAvatars: boolean;
	};
}

export class Config
{
	/**
	 * Loads client config synchronously
	 */
	static load(): ConfigData
	{
		// we use sync because we load config only on client start and we need it before everything else
		if (!fs.existsSync(USER_CONFIG_PATH))
		{
			console.log("No config file found, creating a default config file");
			fs.copyFileSync(DEFAULT_CONFIG_PATH, USER_CONFIG_PATH);
		}

		const defaultConfigJson = fs.readFileSync(DEFAULT_CONFIG_PATH, ENCODING);
		const userConfigJson = fs.readFileSync(USER_CONFIG_PATH, ENCODING);
		const defaultConfig: ConfigData = JSON.parse(defaultConfigJson);

		// parse user config
		let config: ConfigData;
		try
		{
			const userConfig: ConfigData = JSON.parse(userConfigJson);
			config = merge(defaultConfig, userConfig);

		} catch(err)
		{
			console.error("Error in config file");
			throw err;
		}

		console.log("Loaded config");
		return config;
	}

	/**
	 * Saves client config asynchronously
	 */
	static save (data: Config): Promise<void>
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