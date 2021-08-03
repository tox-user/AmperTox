const path = require("path");
const MiniCssExtract = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports =
{
	mode: "development",
	entry: "./src/ui/main.js",
	output:
	{
		path: path.resolve(__dirname, "dist"),
		filename: "main.js"
	},
	devtool: "inline-source-map",
	module:
	{
		rules:
		[
			{
				test: /\.css$/,
				use:
				[
					{
						loader: MiniCssExtract.loader
					},
					"css-loader"
				]
			},
			{
				test: /\.html$/,
				loader: "html-loader"
			},
			{
				test: /\.(svg|ttf|eot|woff|woff2)$/,
				use:
				{
					loader: "file-loader",
					options:
					{
						outputPath: "webfonts"
					}
				}
			},
		]
	},
	plugins:
	[
		new MiniCssExtract({
			filename: "[name].css"
		}),
		new HtmlWebpackPlugin({
			filename: "index.html",
			template: "./src/ui/index.html"
		}),
	]
};