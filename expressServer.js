const express = require('express')
const app = express()
const puppeteer = require('puppeteer');

const port = 3000
// coding more 
app.get('/p/:id', (req, res) => {
	scrapePoints(req.params.id)
	.then((result) => res.send('gotthem ' + result))
	.catch((err) => res.send('gotthem ' + err))
})

// this is comment

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

const scrapePoints = async (username) => {
    const browser = await puppeteer.launch( { headless: true });
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
	return JSON.stringify(obj);
    await browser.close();
}