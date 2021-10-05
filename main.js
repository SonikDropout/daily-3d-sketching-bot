const Discord = require('discord.js');
const getImageURL = require('imageLookup.js');

const sendTime = '17:21';
const notificationTime = '17:19';
const callBeforeStartTimeout = 1;
const modellingTimeout = 1;

const notificationMessage = `@everyone ХАЙ!) Сегодня в ${sendTime} по МСК будет проводить ("НЕЗАЩИЩЕННЫЙ") СПИДМОДЕЛИНГ. Собираемся в дискорд канале Кайно. Правила те же)

За один час вам нужно будет создать модель, по высланному рефу перед стартом.

Вы можете так же и участвовать и смотреть за процессом участников)`;

const callToActionMessage = `@everyone через ${callBeforeStartTimeout} минут спидмоделинг)`;

const timeoutMessage = `@everyone время вышло, сдаем работы!`;

const topics = ['environment', 'hardsurf', 'sculpt'];
let currentTopicIndex = 0;

const client = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILD_MESSAGES],
});

client.once('ready', async () => {
  console.log('Ready!');
  const channels = client.channels.cache;
  const channel = channels.get(process.env.CHANNEL_ID);
  do {
    await mainloop(channel);
  } while (1);
});

async function mainloop(channel) {
  await notifyUsers(channel);
  await callUsers(channel);
  await sendImage(channel);
  await timeoutCall(channel);
  currentTopicIndex = (currentTopicIndex + 1) % topics.length;
}

client.login(process.env.DISCORD_TOKEN_P1 + process.env.DISCORD_TOKEN_P2);

async function notifyUsers(channel) {
  await timer(getMillisecondsTimeout(notificationTime));
  channel.send(notificationMessage);
}

async function callUsers(channel) {
  await timer(
    getMillisecondsTimeout(sendTime) - callBeforeStartTimeout * 60 * 1000
  );
  channel.send(callToActionMessage);
}

async function sendImage(channel) {
  await timer(callBeforeStartTimeout * 60 * 1000);
  channel.send(await getImageMessage());
}

async function timeoutCall(channel) {
  await timer(modellingTimeout * 60 * 1000);
  channel.send(timeoutMessage);
}

function timer(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function getMillisecondsTimeout(desiredTime) {
  const currentDate = new Date();

  desiredTime = desiredTime.split(':');
  const desiredDate = new Date();
  desiredDate.setHours(desiredTime[0]);
  desiredDate.setMinutes(desiredTime[1]);
  if (
    desiredTime[0] < currentDate.getHours() ||
    (desiredTime[0] == currentDate.getHours() &&
      desiredTime[1] < currentDate.getMinutes())
  )
    desiredDate.setDate(desiredDate.getDate() + 1);

  return desiredDate - currentDate;
}

async function getImageMessage() {
  return {
    content: '@everyone',
    files: [
      new Discord.MessageAttachment(
        await getImageURL(topics[currentTopicIndex])
      ),
    ],
  };
}
