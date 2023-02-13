/* Magic Mirror Config Sample
 *
 * By Michael Teeuw https://michaelteeuw.nl
 * MIT Licensed.
 *
 * For more information on how you can configure this file
 * see https://docs.magicmirror.builders/getting-started/configuration.html#general
 * and https://docs.magicmirror.builders/modules/configuration.html
 */
let config = {
	address: "localhost", 	// Address to listen on, can be:
							// - "localhost", "127.0.0.1", "::1" to listen on loopback interface
							// - another specific IPv4/6 to listen on a specific interface
							// - "0.0.0.0", "::" to listen on any interface
							// Default, when address config is left out or empty, is "localhost"
	port: 8080,
	basePath: "/", 	// The URL path where MagicMirror is hosted. If you are using a Reverse proxy
					// you must set the sub path here. basePath must end with a /
	ipWhitelist: ["127.0.0.1", "::ffff:127.0.0.1", "::1"], 	// Set [] to allow all IP addresses
															// or add a specific IPv4 of 192.168.1.5 :
															// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
															// or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
															// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

	useHttps: false, 		// Support HTTPS or not, default "false" will use HTTP
	httpsPrivateKey: "", 	// HTTPS private key path, only require when useHttps is true
	httpsCertificate: "", 	// HTTPS Certificate path, only require when useHttps is true

	language: "en",
	locale: "en-US",
	logLevel: ["INFO", "LOG", "WARN", "ERROR"], // Add "DEBUG" for even more logging
	timeFormat: 24,
	units: "metric",
	// serverOnly:  true/false/"local" ,
	// local for armv6l processors, default
	//   starts serveronly and then starts chrome browser
	// false, default for all NON-armv6l devices
	// true, force serveronly mode, because you want to.. no UI on this device

	modules: [
		{
			module: "clock",
			position: "top_right"
		},
		{
			module: "MMM-Fuelwatch",
			position: "bottom_bar",
			config: {
				feeds:[ 
					// {
					// 	title: "New York Times",
					// 	url: "https://www.nytimes.com/services/xml/rss/nyt/HomePage.xml"
					// }
					{
						title: "Today91",
						url: "https://www.fuelwatch.wa.gov.au/fuelwatch/fuelWatchRSS?Product=1&Suburb=Harrisdale&Surrounding=Yes&Day=today&Brand=20",
					},
					{
						title: "Today91",
						url: "https://www.fuelwatch.wa.gov.au/fuelwatch/fuelWatchRSS?Product=1&Suburb=Harrisdale&Surrounding=Yes&Day=today&Brand=29",
					},
					{
						title: "Today91",
						url: "https://www.fuelwatch.wa.gov.au/fuelwatch/fuelWatchRSS?Product=1&Suburb=Harrisdale&Surrounding=Yes&Day=today&Brand=35",
					},
					{
						title: "Today95",
						url: "https://www.fuelwatch.wa.gov.au/fuelwatch/fuelWatchRSS?Product=2&Suburb=Harrisdale&Surrounding=Yes&Day=today&Brand=20",
					},
					{
						title: "Today95",
						url: "https://www.fuelwatch.wa.gov.au/fuelwatch/fuelWatchRSS?Product=2&Suburb=Harrisdale&Surrounding=Yes&Day=today&Brand=29",
					},
					{
						title: "Today95",
						url: "https://www.fuelwatch.wa.gov.au/fuelwatch/fuelWatchRSS?Product=2&Suburb=Harrisdale&Surrounding=Yes&Day=today&Brand=35",
					},
					 {
					 	title: "Tomorrow91",
						url: "https://www.fuelwatch.wa.gov.au/fuelwatch/fuelWatchRSS?Product=1&Suburb=Harrisdale&Surrounding=Yes&Day=tomorrow&Brand=20",
					},
					{
						title: "Tomorrow91",
						url: "https://www.fuelwatch.wa.gov.au/fuelwatch/fuelWatchRSS?Product=1&Suburb=Harrisdale&Surrounding=Yes&Day=tomorrow&Brand=29",
					},
					{
						title: "Tomorrow91",
						url: "https://www.fuelwatch.wa.gov.au/fuelwatch/fuelWatchRSS?Product=1&Suburb=Harrisdale&Surrounding=Yes&Day=tomorrow&Brand=35",
					},
					{
						title: "Tomorrow95",
					   url: "https://www.fuelwatch.wa.gov.au/fuelwatch/fuelWatchRSS?Product=2&Suburb=Harrisdale&Surrounding=Yes&Day=tomorrow&Brand=20",
				   },
				   {
					   title: "Tomorrow95",
					   url: "https://www.fuelwatch.wa.gov.au/fuelwatch/fuelWatchRSS?Product=2&Suburb=Harrisdale&Surrounding=Yes&Day=tomorrow&Brand=29",
				   },
				   {
					   title: "Tomorrow95",
					   url: "https://www.fuelwatch.wa.gov.au/fuelwatch/fuelWatchRSS?Product=2&Suburb=Harrisdale&Surrounding=Yes&Day=tomorrow&Brand=35",
				   }
				],
				showAsList : false,
				showSourceTitle: false,
				showDescription: false,
				logFeedWarnings:true,
				reloadInterval: 6000000,
				maxFuelResults: 50,
			}
		}
	// }
	]
};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {module.exports = config;}
