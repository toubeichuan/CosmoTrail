const webpack = require('webpack');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const jsSourcePath = path.join(__dirname, './src');
const buildPath = path.join(__dirname, './dist');
const assetsDirName = 'assets';
const assetsPath = path.join(__dirname, './' + assetsDirName);
const sourcePath = path.join(__dirname, './src');

// Common plugins
const plugins = [
	new webpack.DefinePlugin({
		'process.env': {
			NODE_ENV: JSON.stringify(nodeEnv),
		},
	}),
	new HtmlWebpackPlugin({
		template: path.join(sourcePath, 'index.html'),
		path: buildPath,
		filename: 'index.html',
	}),
];

if (isProduction) {
	// Production plugins
	plugins.push(
		new CopyWebpackPlugin({
			patterns: [
				{
					from: assetsPath,
					to: buildPath + '/' + assetsDirName,
				}
			]
		})
	);
}

// Common rules
const rules = [
	{
		test: /\.js$/,
		exclude: /node_modules/,
		use: [
			'babel-loader',
		],
	},
	{
		test: /\.(ttf|eot|svg|woff|woff2|otf)(\?v=\d+\.\d+\.\d+)?/,
		type: 'asset/resource'
	},
	{
		test: /\.(svg|png|jpg|jpeg|gif|fsh|vsh|json)(\?v=\d+\.\d+\.\d+)?$/,
		include: assetsPath,
		type: 'asset/resource'
	},
];

if (isProduction) {
	// Production rules
	rules.push(
		{
			test: /\.scss$/,
			use: [
				'style-loader',
				'css-loader',
				'sass-loader',
			],
		}
	);
} else {
	// Development rules
	rules.push(
		{
			test: /\.scss$/,
			use: [
				'style-loader',
				'css-loader',
				'sass-loader',
			],
		}
	);
}

module.exports = {
	mode: isProduction ? 'production' : 'development',
	context: jsSourcePath,
	entry: {
		js: './index.js',
	},
	output: {
		path: buildPath,
		publicPath: isProduction ? '' : '/',
		filename: 'CosmoTrail.js',
		clean: true,
	},
	module: {
		rules,
	},
	resolve: {
		extensions: ['.js'],
		modules: [
			path.resolve(__dirname, 'node_modules'),
			jsSourcePath,
		],
		alias: {
		},
	},
	plugins,
	devServer: {
		static: {
			directory: isProduction ? buildPath : sourcePath,
		},
		historyApiFallback: true,
		port: 5050,
		compress: isProduction,
		hot: !isProduction,
		host: '0.0.0.0',
		//to make sure that any host will work (provided it points to 127.0.0.1 and has the correct port)
		allowedHosts: "all",
		client: {
			overlay: {
				errors: true,
				warnings: false,
			},
		},
	},
};