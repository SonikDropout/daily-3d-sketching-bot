const https = require('https');

const image_types = ['jpeg', 'png', 'webp'];

function pinterestGet(path) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      { headers: getAuthHeader(), host: 'api.pinterest.com', path: `/v5/${path}` },
      (res) => {
        if (res.statusCode !== 200)
          reject(`Request failed with status ${res.statusCode}`);
        res.setEncoding('utf-8');
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(JSON.parse(data)));
      }
    );
    req.on('error', reject);
  });
}

async function getRandomImageURL(topic) {
  let imageURL;
  try {
    imageURL = pickRandomImage(await getBoardPins(await getBoardID(topic)));
  } catch (err) {
    console.error(err);
    imageURL = pickFallbackImage(topic);
  }
  return imageURL;
}

async function getBoardID(topic) {
  const boards = await pinterestGet(`/boards`);
  return boards.find((b) => b.name.includes(topic)).id;
}

async function getBoardPins(boardID) {
  const board = await pinterestGet(`/boards/${boardID}/pins?page_size=100`);
  return board.items;
}

function pickRandomImage(pins) {
  let pin = pickRandomItem(pins);
  while (!image_types.includes(pin.media.media_type))
    pin = pickRandomItem(pins);
  return pin.link;
}

function pickFallbackImage(topic) {
  const images = require('./fallbackImages.json')[topic];
  return pickRandomItem(images);
}

function pickRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getAuthHeader() {
  return {Authorization: getAccessToken()};
}

function getAccessToken() {
  try {
    const {access_token} = require('./access_token.json');
  }
}

module.exports = getRandomImageURL;
