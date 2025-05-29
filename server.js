// server.js
const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(bodyParser.json());

function generateStars(score) {
  const filled = '★'.repeat(score);
  const empty = '☆'.repeat(5 - score);
  return filled + empty;
}

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
}

app.post('/generate-pdf', async (req, res) => {
  const record = req.body;

  const templatePath = path.join(__dirname, 'template.html');
  const template = fs.readFileSync(templatePath, 'utf-8');

  const html = template
    .replace('{{reportTitle}}', '組織診断報告レポート')
    .replace('{{company_no}}', record.company_no || '')
    .replace('{{company}}', record.company || '')
    .replace('{{createdDate}}', formatDate(new Date()))
    .replace('{{leadership_stars}}', generateStars(Number(record.leadership)))
    .replace('{{staff_initiative_stars}}', generateStars(Number(record.staff_initiative)))
    .replace('{{work_motivation_stars}}', generateStars(Number(record.work_motivation)));

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();

  res.setHeader('Content-Type', 'application/pdf');
  res.send(pdfBuffer);
});

app.listen(3000, () => {
  console.log('🚀 Server listening on http://localhost:3000');
});
