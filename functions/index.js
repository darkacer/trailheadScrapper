const functions = require('firebase-functions');
const express = require('express')
const puppeteer = require('puppeteer');

const app = express();
app.get('/test', (req, res) => {
	res.status(200).send('test');
});

app.get('/home', (request, response) => {
	if (request.query.id === ''|| typeof request.query.id === 'undefined') {
		response.send('Please give a valid trailblazer id')
	} else {
		scrapePoints(request.query.id)
		.then((result) => response.send(result))
		.catch((err) => response.send(err))
	}
})

app.get('/testing', (request, response) => {
	justOpenBrowser()
	.then((res) => response.send(res + 'this is my response ' + request.query.id))
	.catch((err) => response.send('error is '+ err))
})

app.get('/nothome', (request, response) => {
	visitGoogle()
	.then((result) => response.send('i just visited Google' + result))
	.catch((err) => response.send(err))
})

const visitGoogle = async() => {
	const browser = await puppeteer.launch({headless: true,args:['--no-sandbox']})
	const url = 'https://google.com/';
	const page = await browser.newPage();
	await page.goto(url, {waitUntil: 'networkidle0'});
	await browser.close();
	return ' thats correct!'
}

const justOpenBrowser = async () => {
	const browser = await puppeteer.launch({headless: true,args:['--no-sandbox']})
	return 'nothing'
}

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

exports.app = functions.runWith({memory: '1GB', timeoutSeconds: 60}).https.onRequest(app);

const scrapePoints = async (username) => {
    const browser = await puppeteer.launch({headless: true, args:['--no-sandbox']});
    const page = await browser.newPage();
    const url = 'https://trailhead.salesforce.com/en/me/' + username;
    await page.goto(url);
    console.log(url);
	await page.waitForXPath('//*[@id="lightning"]/div/div/div[2]/div/div[2]/div/div/div[2]/c-trailhead-rank/c-lwc-card/article/div/slot/div[2]/c-lwc-tally[2]/span/span[1]');
	let obj = {'UserName': username}
	let namexPath = '//*[@id="lightning"]/div/div/div[2]/div/div[2]/div/div/div/div[1]/article/div/div[1]/div[2]/h1';
	
	let elHandle = await page.$x(namexPath);
	obj['Name'] = await page.evaluate(el => el.textContent, elHandle[0])
	
	let arr = ['Badges', 'Points', 'Trails'];
	let i = 1;
	for(let i = 1; i < 4; i++) {
		el = arr[i - 1]
		elHandle = await page.$x('//*[@id="lightning"]/div/div/div[2]/div/div[2]/div/div/div[2]/c-trailhead-rank/c-lwc-card/article/div/slot/div[2]/c-lwc-tally['+i+']/span/span[1]');
		obj[el] = await page.evaluate(el => el.textContent.replace(/\,/g,""), elHandle[0]);
	}
	console.log(obj)
	await browser.close();
	return JSON.stringify(obj);    
}