/* This script monitors Salesforces' webservice availability */
var jsforce = require('jsforce');
var fs = require('fs');
var moment = require('moment');
var config = JSON.parse(fs.readFileSync('./config.json'));

class OrgMonitor {
	constructor(url, username, password) {
		this.url = url;
		this.username = username;
		this.password = password;
		this.cycle = 0;
		setInterval(this.check.bind(this), 2000);
	}
	check() {
		var localCycle = this.cycle;
		this.cycle++;
		var conn = new jsforce.Connection({
			loginUrl: this.url
		});
		var start = +new Date(), end;
		this.log(localCycle, 'Cycle started');
		try {
			conn.login(this.username, this.password, (err, res) => {
				if (err) {
					end = +new Date();
					this.log(localCycle, 'Error logging in: ' + err.message + ' trace: ' + JSON.stringify(err.stack) + ' took ' + (end - start) + 'ms');
					return console.error(err);
				}
				conn.apex.get("/services/apexrest/LongTxn", (err, res) => {
					end = +new Date();
					if (err) {
						this.log(localCycle, 'Error performing apex: ' + err.message + ' trace: ' + JSON.stringify(err.stack) + ' took ' + (end - start) + 'ms');
						return console.error(err);
					}
					this.log(localCycle, 'ALL OK - took ' + (end - start) + ' ms');
					return;
				});
			});
		} catch (e) {
			end = +new Date();
			this.log(localCycle, 'Exception',  + err.message + ' trace: ' + JSON.stringify(err.stack) + ' took ' + (end - start) + 'ms');
		}
	}
	log(currentCycle, data) {
		console.log('[' + moment().format() + ']', currentCycle, JSON.stringify(data));
	}
}

var monitor = new OrgMonitor(config.url, config.username, config.password)
