const { Log } = require("../../../module-types");

/* Magic Mirror
 * Module: NewsFeed
 *
 * By Michael Teeuw https://michaelteeuw.nl
 * MIT Licensed.
 */
Module.register("newsfeed", {
	// Default module config.
	defaults: {
		feeds: [
			{
				title: "New York Times",
				url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
				encoding: "UTF-8" //ISO-8859-1
			}
		],
		showAsList: false,
		showSourceTitle: true,
		showPublishDate: false,
		broadcastNewsFeeds: false,
		broadcastNewsUpdates: true,
		showDescription: false,
		wrapTitle: true,
		wrapDescription: true,
		truncDescription: true,
		lengthDescription: 400,
		hideLoading: false,
		reloadInterval: 5 * 60 * 100000, // every 5 minutes
		updateInterval: 1000 * 1000,
		animationSpeed: 2.5 * 1000,
		maxFuelResults: 50, // 0 for unlimited
		ignoreOldItems: false,
		ignoreOlderThan: 24 * 60 * 60 * 1000, // 1 day
		scrollLength: 500,
		logFeedWarnings: false,
		dangerouslyDisableAutoEscaping: false
	},

	// Define required scripts.
	getScripts: function () {
		return ["moment.js"];
	},

	//Define required styles.
	getStyles: function () {
		return ["newsfeed.css"];
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
		this.activeItem = 0;
		this.scrollPosition = 0;

		this.registerFeeds();

		this.isShowingDescription = this.config.showDescription;
	},

	// Override socket notification handler.
	socketNotificationReceived: function (notification, payload) {
		if (notification === "NEWS_ITEMS") {
			this.generateFeed(payload);

			if (!this.loaded) {
				if (this.config.hideLoading) {
					this.show();
				}
				this.scheduleUpdateInterval();
			}

			this.loaded = true;
			this.error = null;
		} else if (notification === "NEWSFEED_ERROR") {
			this.error = this.translate(payload.error_type);
			this.scheduleUpdateInterval();
		}
	},

	//Override fetching of template name
	getTemplate: function () {
		return "newsfeed.njk";
	},

	//Override template data and return whats used for the current template
	getTemplateData: function () {
		// this.config.showFullArticle is a run-time configuration, triggered by optional notifications
		if (this.config.showFullArticle) {
			return {
				url: this.getActiveItemURL()
			};
		}
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
			item.publishDate = moment(new Date(item.pubdate)).fromNow();
			return item;
		});

		return {
			loaded: true,
			config: this.config,
			sourceTitle: item.sourceTitle,
			// publishDate: moment(new Date(item.pubdate)).fromNow(),
			// title: item.title,
			// description: item.description,
			brand: item.brand,
			price: item.price,
			pumpDate: item.pumpDate,
			// location: item.location,
			// address: item.address,
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
		let newsItemsx = [];
		let newsItemsy = [];

		for (let feed in feeds) {
			const feedItems = feeds[feed];
				for (let item of feedItems) {
					if (feed.indexOf('today') > -1 ){
					newsItemsx.push(item );
					
		}}}
// rename yesterday keys
		for (let feed in feeds) {
			const feedItems = feeds[feed];
				for (let item of feedItems) {
					if (feed.indexOf('yesterday') > -1 ){
					delete Object.assign(item, {["brandy"]: item["brand"] })["brand"];
					delete Object.assign(item, {["pricey"]: item["price"] })["price"];
					delete Object.assign(item, {["pumpDatey"]: item["pumpDate"] })["pumpDate"];
					delete Object.assign(item, {["trading_namey"]: item["trading_name"] })["trading_name"];
					newsItemsy.push(item );

		}}}
		

		// let arr3 = arr1.map((item, i) => Object.assign({}, item, arr2[i]));

	// 	const mergeById = (a1, a2) =>
	// 		a1.map(itm => ({
	// 		...a2.find((item) => (item.id === itm.id) && item),
	// 		...itm
    // }));
	
	let newsItems = (newsItemsx, newsItemsy) =>
			newsItemsx.map(itm => ({
			...newsItemsy.find((item) => (item.trading_namey === itm.trading_name) && item),
			...itm
    }));




		if (this.config.maxFuelResults > 0) {
			newsItems = newsItems.slice(0, this.config.maxFuelResults);
		}

		// Sort by price, then address
		
		newsItems.sort((a,b) => a.price - b.price || a.trading_name.localeCompare(b.trading_name) || a.pumpDate < b.pumpDate );
		


		this.newsItems = newsItems;
		Log.log(newsItemsx);
		Log.log(newsItemsy);
		Log.log(newsItems);
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