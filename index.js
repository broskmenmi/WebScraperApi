const PORT = 8000

const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const buffer = require('buffer');
const fs = require('fs');

const app = new express()

const arcticles = []

let sites = []

function getArticles() {
    for (let site of sites) {
        getSiteContent(site)
      }
}

function getSiteContent(site) {
    axios.request({
        method: 'GET',
        url: site.url,
        responseType: 'arraybuffer',
        responseEncoding: 'binary'
      })
    .then((response) => {
        let html = response.data
        
        if (response.headers['content-type'] === 'text/html; charset=ISO-8859-1') {
            const latin1Buffer = buffer.transcode(Buffer.from(html), "latin1", "utf8")
            const latin1String = latin1Buffer.toString("utf8")
            html = latin1String
        }

        ParseContent();

        function ParseContent() {
            const $ = cheerio.load(html);

            $("a.thread-title").each(function () {
                const title = $(this).text();
                const url = $(this).attr('href');
                arcticles.push({
                    title,
                    url: site.baseUrl + url
                });
            });
        }
    }).catch((err) => console.log(err))
}

function loadSites() {
    var obj = JSON.parse(fs.readFileSync('sites.json', 'utf8'));
    sites = obj
}

loadSites()

getArticles()

app.get('/', (req, res) => {
    res.json('WebScraperAPI')
})

app.get('/currenttopics/', (req, res) => {
    res.json(arcticles)
})

app.listen(PORT, () => console.log('Server running on port ' +PORT))

