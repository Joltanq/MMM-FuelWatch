/* Magic Mirror
 * Node Helper:   fuelWatchFetcher
 *
 * By Michael Teeuw https://michaelteeuw.nl
 * MIT Licensed.
 */
const Log = require("logger");
const FeedMe = require("feedme");
const NodeHelper = require("node_helper");
const fetch = require("node-fetch");
const iconv = require("iconv-lite");

/**
 * Responsible for requesting an update on the set interval and broadcasting the data.
 *
 * @param {string} url URL of the feed.
 * @param {number} reloadInterval Reload interval in milliseconds.
 * @param {string} encoding Encoding of the feed.
 * @param {boolean} logFeedWarnings If true log warnings when there is an error parsing a article.
 * @class
 */
const fuelWatchFetcher = function (url, reloadInterval, encoding, logFeedWarnings) {
	let reloadTimer = null;
	let items = [];

	let fetchFailedCallback = function () {};
	let itemsReceivedCallback = function () {};

	if (reloadInterval < 1000) {
		reloadInterval = 1000;
	}

	/* private methods */

	/**
	 * Request the new items.
	 */
	const fetchNews = () => {
		clearTimeout(reloadTimer);
		reloadTimer = null;
		items = [];

		const parser = new FeedMe();
		parser.on("item", (item) => {
			let brand = item.brand;
			let price = item.price;
			let trading_name = item['trading-name'];

			items.push({
					brand:brand, 
					price: price,
					trading_name: trading_name,
					});

		});



		parser.on("end", () => {
			this.broadcastItems();
			scheduleTimer();
		});

		parser.on("error", (error) => {
			fetchFailedCallback(this, error);
			scheduleTimer();
		});

		const nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
		const headers = {
			"User-Agent": "Mozilla/5.0 (Node.js " + nodeVersion + ") MagicMirror/" + global.version,
			"Cache-Control": "max-age=0, no-cache, no-store, must-revalidate",
			Pragma: "no-cache"
		};

		fetch(url, { headers: headers })
			.then(NodeHelper.checkFetchStatus)
			.then((response) => {
				response.body.pipe(iconv.decodeStream(encoding)).pipe(parser);
			})
			.catch((error) => {
				fetchFailedCallback(this, error);
				scheduleTimer();
			});
	};

	/**
	 * Schedule the timer for the next update.
	 */
	const scheduleTimer = function () {
		clearTimeout(reloadTimer);
		reloadTimer = setTimeout(function () {
			fetchNews();
		}, reloadInterval);
	};

	/* public methods */

	/**
	 * Update the reload interval, but only if we need to increase the speed.
	 *
	 * @param {number} interval Interval for the update in milliseconds.
	 */
	this.setReloadInterval = function (interval) {
		if (interval > 1000 && interval < reloadInterval) {
			reloadInterval = interval;
		}
	};

	/**
	 * Initiate fetchNews();
	 */
	this.startFetch = function () {
		fetchNews();
	};

	/**
	 * Broadcast the existing items.
	 */
	this.broadcastItems = function () {
		if (items.length <= 0) {
			Log.info("Fuel-Fetcher: No items to broadcast yet.");
			return;
		}
		Log.info("Fuel-Fetcher: Broadcasting " + items.length + " items.");
		itemsReceivedCallback(this);
	};

	this.onReceive = function (callback) {
		itemsReceivedCallback = callback;
	};

	this.onError = function (callback) {
		fetchFailedCallback = callback;
	};

	this.url = function () {
		return url;
	};

	this.items = function () {
		return items;
	};
};

module.exports = fuelWatchFetcher;