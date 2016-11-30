/* This script attempts to create a large number of concurrent requests through VF remorting - we have not seen this break... */
var fs = require('fs');
var jsforce = require('jsforce');
var config = JSON.parse(fs.readFileSync('config.json').toString());
var https = require('https');

var writeDelay1 = 0;
var writeDelay2 = 30000;
var endDelay = 50000;

// Fill these variables based on a VF remorting request to the LongTxn controller - ie. captured request to /apexremote from the page included in the /apex folder
var csrf = '';
var vid = '';
var cookie = '';


class Instance {
	constructor(csrf, vid, tid, cookie, url) {
		this.csrf = csrf;
		this.vid = vid;
		this.cookie = cookie;
		this.url = url;
		this.tid = tid;
		this.payload1 = '{"action":"LongTxn","method":"remoteGet","data":null,"type":"rpc","tid":'+this.tid+',"ctx":{"csrf":"'+this.csrf+'"';
		this.payload2 = ',"vid":"'+this.vid+'","ns":"","ver":38}}';
		this.start();
		setTimeout(this.write.bind(this, this.payload1), writeDelay1);
		setTimeout(this.write.bind(this, this.payload2), writeDelay2);
		setTimeout(this.end.bind(this), endDelay);
	}
	start() {
		var options = {
			port: 443,
			hostname: 'c.cs87.visual.force.com',
			path: '/apexremote',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Transfer-Encoding': 'chunked',
				'Host': 'c.cs87.visual.force.com',
				'Origin': 'https://c.cs87.visual.force.com',
				'Referer': 'https://c.cs87.visual.force.com/apex/Test',
				'X-Requested-With': 'XMLHttpRequest',
				'X-User-Agent': 'X-User-Agent',
				'Cookie': this.cookie
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

for (var i = 0; i < config.numberOfInstances; i++) {
	instances.push(new Instance(csrf, vid, i + 2, cookie, conn.instanceUrl));
}
