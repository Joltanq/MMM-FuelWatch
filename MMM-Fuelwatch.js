/* Magic Mirror
 * Module: NewsFeed
 *
 * By Michael Teeuw https://michaelteeuw.nl
 * MIT Licensed.
 */
Module.register("MMM-Fuelwatch", {
	// Default module config.
	defaults: {
		feeds: [
			{
				title: "New York Times",
				url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
				encoding: "UTF-8" //ISO-8859-1
			}
		],
		hideLoading: true,
		reloadInterval: 300000, // every 60 minutes 
		updateInterval: 300000,	// every 61 mins
		animationSpeed: 2.5 * 1000,
		maxFuelResults: 5, // 0 for unlimited
		dangerouslyDisableAutoEscaping: false
	},

	// Define required scripts.
	getScripts: function () {
		return ["moment.js"];
	},

	//Define required styles.
	getStyles: function () {
		return ["fuelWatch.css"];
	},

	// Define required translations.
	getTranslations: function () {
		// The translations for the default modules are defined in the core translation files.
		// Therefor we can just return false. Otherwise we should have returned a dictionary.
		// If you're trying to build your own module including translations, check out the documentation.
		return false;
	},

	// Define start sequence.
	start: function () {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);
		this.newsItems = [];
		this.loaded = false;
		this.error = null;
		this.activeItem = 20;
		this.scrollPosition = 0;
		this.registerFeeds();
	},

	// Override socket notification handler.
	socketNotificationReceived: function (notification, payload) {
		if (notification === "FUEL_ITEMS") {
			this.generateFeed(payload);

			if (!this.loaded) {
				if (this.config.hideLoading) {
					this.show();
				}
				this.scheduleUpdateInterval();
			}

			this.loaded = true;
			this.error = null;
		} else if (notification === "FUELFEED_ERROR") {
			this.error = this.translate(payload.error_type);
			this.scheduleUpdateInterval();
		}
	},

	//Override fetching of template name
	getTemplate: function () {
		return "fuelWatch.njk";
	},

	//Override template data and return whats used for the current template
	getTemplateData: function () {
		// this.config.showFullArticle is a run-time configuration, triggered by optional notifications
		// if (this.config.showFullArticle) {
		// 	return {
		// 		url: this.getActiveItemURL()
		// 	};
		// }
		if (this.error) {
			return {
				error: this.error
			};
		}
			if (this.newsItems.length === 0) {
				return {
					empty: true
				};
			}
		if (this.activeItem >= this.newsItems.length) {
			this.activeItem = 0;
		}

		const item = this.newsItems[this.activeItem];
		const items = this.newsItems.map(function (item) {
			return item;
		});

		return {
			loaded: true,
			config: this.config,
			// sourceTitle: item.sourceTitle,
			brand: item.brand,
			price: item.price,
			trading_name: item['trading-name'],
			items: items
		};
	},


	/**
	 * Registers the feeds to be used by the backend.
	 */
	registerFeeds: function () {
		for (let feed of this.config.feeds) {
			this.sendSocketNotification("ADD_FEED", {
				feed: feed,
				config: this.config
			});
		}
	},


	/**
	 * Generate an ordered list of items for this configured module.
	 *
	 * @param {object} feeds An object with feeds returned by the node helper.
	 */

	generateFeed: function (feeds) {
		let newsItemstoday91 = [];
		let newsItemstoday95 = [];
		let newsItemstomorrow91 = [];
		let newsItemstomorrow95 = [];

		for (let feed in feeds) {
			const feedItems = feeds[feed];
				for (let item of feedItems) {
					if (feed.indexOf('Product=1&Suburb=Harrisdale&Surrounding=Yes&Day=today') > -1 ){
					delete Object.assign(item, {["price91"]: item["price"] })["price"];
					newsItemstoday91.push(item );
					newsItemstoday91.sort((a,b) => a.price91 - b.price91  );
					}
					else if (feed.indexOf('Product=2&Suburb=Harrisdale&Surrounding=Yes&Day=today') > -1 ){
						delete Object.assign(item, {["price95"]: item["price"] })["price"];
						newsItemstoday95.push(item );
					}					
					else if (feed.indexOf('Product=1&Suburb=Harrisdale&Surrounding=Yes&Day=tomorrow') > -1 ){
						delete Object.assign(item, {["pricetomorrow91"]: item["price"] })["price"];
						newsItemstomorrow91.push(item );		
					}
					else if (feed.indexOf('Product=2&Suburb=Harrisdale&Surrounding=Yes&Day=tomorrow') > -1 ) {
						delete Object.assign(item, {["pricetomorrow95"]: item["price"] })["price"];
						newsItemstomorrow95.push(item );
					}
				}}


		const mergeDays = (a1, a2,a3,a4) =>
			a1.map(itm => ({
			...a2.find((item) => (item.trading_name === itm.trading_name) && item),
			...a3.find((item3) => (item3.trading_name === itm.trading_name) && item3),
			...a4.find((item4) => (item4.trading_name === itm.trading_name) && item4),
			...itm
    }));

	// merge into one array for visualisation
	let newsItems = (mergeDays(newsItemstoday91,newsItemstoday95,newsItemstomorrow91,newsItemstomorrow95));
	
	this.newsItems = newsItems;

	},

	/**
	 * Check if this module is configured to show this feed.
	 *
	 * @param {string} feedUrl Url of the feed to check.
	 * @returns {boolean} True if it is subscribed, false otherwise
	 */
	subscribedToFeed: function (feedUrl) {
		for (let feed of this.config.feeds) {
			if (feed.url === feedUrl) {
				return true;
			}
		}
		return false;
	},



	/**
	 * Schedule visual update.
	 */
	scheduleUpdateInterval: function () {
		this.updateDom(this.config.animationSpeed);

		// Broadcast NewsFeed if needed
		if (this.config.broadcastNewsFeeds) {
			this.sendNotification("NEWS_FEED", { items: this.newsItems });
		}

		// #2638 Clear timer if it already exists
		if (this.timer) clearInterval(this.timer);

		this.timer = setInterval(() => {
			this.activeItem++;
			this.updateDom(this.config.animationSpeed);

		}, this.config.updateInterval);
	},


});