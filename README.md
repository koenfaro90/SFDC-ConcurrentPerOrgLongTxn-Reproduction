SFDC-ConcurrentPerOrgLongTxn-Reproduction
=========
This project contains code to reproduce the seemingly newly introduced "ConcurrentPerOrgLongTxn" exception using a custom APEX REST-service.

Usage
------
1. Clone repository
2. Determine what SF org you want to use for testing
3. Deploy the apex/LongTxn.cls class to your testing-org
4. Enter your user credentials (with API access and access to the LongTxn class) in nodejs/config.json
5. Run 'npm install' in the nodejs/ directory to fetch all dependencies
6. Run nodejs/monitor.js in a terminal which you keep visible
7. Run nodejs/stress.js in a secondary terminal
8. After a few seconds the monitor.js script will spew a number of "ConcurrentPerOrgLongTxn" errors

Background
------
- It seems that Salesforce has introduced a new exception type "ConcurrentPerOrgLongTxn" which is more or less equal to "ConcurrentPerOrgLongApex" - not documented anywhere but confirmed by first-line support that it should be treated as being equal
- We have run across this exception using a mobile application with ~400 concurrent users talking to a number of custom REST-services - this has been running beautifully for years - the number of users nor the salesforce org nor the devices used nor the connectivity has changed significantly recently

Problem
------
- It seems that the new exception takes into account the time since the start of a HTTP request for determining the execution time of a synchronous request, rather than the actual start of processing (ie. when the body has been fully received)
- Potentially sending the body of the HTTP request to the SFDC platform can take more than a few seconds - causing these kind of jobs to count towards the concurrent apex limit (10 synchronous processes running longer than 5 seconds) - this will cause other processes to fail - in this case monitor.js will fail
- The included stress.js script attempts to simulate this behaviour by instantly sending the request headers in 20 concurrent requests, but having a delay between sending the actual HTTP request body (20 seconds) and finally the HTTP request end (40 seconds) zero-byte

Notes
------
- The included stress.js script uses 'Transfer-Encoding: chunked' header in order to have some control over when a request ends - the same behaviour will occur if a content-length is specified and the amount of bytes specified is not reached
