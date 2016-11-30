/* This script attempts to create a large number of concurrent requests */
var fs = require('fs');
var jsforce = require('jsforce');
var config = JSON.parse(fs.readFileSync('config.json').toString());
var https = require('https');

var writeDelay = 20000;
var endDelay = 40000;

class Instance {
	constructor(accessToken, url) {
		this.accessToken = accessToken;
		this.url = url;

		this.start();
		setTimeout(this.write.bind(this, '{"Name" : "Express Logistics and Transport"}'), writeDelay);
		setTimeout(this.end.bind(this), endDelay);
	}
	start() {
		var options = {
			port: 443,
			hostname: this.url.replace('https://', ''),
			path: '/services/data/v38.0/sobjects/Account/',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'OAuth ' + this.accessToken,
				'Transfer-Encoding': 'chunked'
			}
		};

		this.req = https.request(options);
		this.req.setTimeout(150000, (err) => {
			console.error('Timed out');
		});
		this.req.on('response', (response) => {
			response.on('data', function (chunk) {
				console.log('response: ' + chunk);
			});
		})
		this.req.on('error', (error) => {
			console.log('error', error)
		})
		this.req.flushHeaders();
	}
	write(data) {
		console.log('writing data', data);
		this.req.write(data, 'UTF-8', (err, result) => {
			if (err) {
				return console.error(err);
			}
		})
	}
	end() {
		console.log('ending request');
		this.req.end((err, result) => {
			if (err) {
				return console.error(err);
			}
		})
	}
}

var instances = [];

var conn = new jsforce.Connection({
	loginUrl : config.url
});
conn.login(config.username, config.password, function(err, userInfo) {
	if (err) {
		return console.error(err);
	}
	for (var i = 0; i < config.numberOfInstances; i++) {
		instances.push(new Instance(conn.accessToken, conn.instanceUrl));
	}
});
