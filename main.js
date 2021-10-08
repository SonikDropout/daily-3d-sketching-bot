const Discord = require('discord.js');

const SEND_TIME = '10:31';
const NOTIFICATION_TIME = '10:55';
const CALL_TO_ACTION_TIMEOUT = .1;
const MODELLING_TIMEOUT = 60;
const CHANNEL_ID = '894523688106463235';

const notificationMessage = `@everyone Сегодня в ${SEND_TIME} по GMT будет проходить ("НЕЗАЩИЩЕННЫЙ") СПИДМОДЕЛИНГ. Собираемся в дискорд канале Кайно.

За ${MODELLING_TIMEOUT} минут вам нужно будет создать модель, по высланному рефу перед стартом.

Учавствуйте сами или смотрите за процессом других учатников.`;

const callToActionMessage = `@everyone через ${CALL_TO_ACTION_TIMEOUT} минут спидмоделинг)`;

const timeoutMessage = `@everyone время вышло, сдаем работы!`;

const TOPICS = [
  { name: 'hardsurf', boardID: '895532270595751966', weight: 0.5 },
  { name: 'environment', boardID: '895532299192528907', weight: 0.25 },
  { name: 'sculpt', boardID: '895532347456356402', weight: 0.25 },
];

const client = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILD_MESSAGES],
});

client.once('ready', async () => {
  console.log('Ready!');
  mainloop(await fetchMainChannel());
});

function fetchMainChannel() {
  return client.channels.fetch(CHANNEL_ID);
}

async function mainloop(channel) {
  while (1) {
    try {
      await notifyUsers(channel);
      await callUsers(channel);
      await sendImage(channel);
      await timeoutCall(channel);
    } catch (err) {
      console.error(err);
    }
  }
}

client.login(process.env.DISCORD_TOKEN);

async function notifyUsers(channel) {
  await timer(getMillisecondsTimeout(NOTIFICATION_TIME));
  channel.send(notificationMessage);
}

async function callUsers(channel) {
  await timer(
    getMillisecondsTimeout(SEND_TIME) - CALL_TO_ACTION_TIMEOUT * 60 * 1000
  );
  channel.send(callToActionMessage);
}

async function sendImage(channel) {
  await timer(CALL_TO_ACTION_TIMEOUT * 60 * 1000);
  channel.send(await getImageMessage());
}

async function timeoutCall(channel) {
  await timer(MODELLING_TIMEOUT * 60 * 1000);
  channel.send(timeoutMessage);
}

function timer(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function getMillisecondsTimeout(desiredTime) {
  const currentDate = new Date();

  desiredTime = desiredTime.split(':');
  const desiredDate = new Date();
  desiredDate.setUTCHours(desiredTime[0]);
  desiredDate.setUTCMinutes(desiredTime[1]);
  if (
    desiredTime[0] < currentDate.getUTCHours() ||
    (desiredTime[0] == currentDate.getUTCHours() &&
      desiredTime[1] < currentDate.getUTCMinutes())
  )
    desiredDate.setUTCDate(desiredDate.getUTCDate() + 1);

  return desiredDate - currentDate;
}

async function getImageMessage() {
  const imageBoard = await client.channels.fetch(pickRandomTopic());
  const messages = await imageBoard.messages.fetch();
  const imageURL = messages.random().content;
  console.log('Sending image', imageURL);
  return {
    content: '@everyone',
    files: [new Discord.MessageAttachment(imageURL)],
  };
}

function pickRandomTopic() {
  const random = Math.random();
  let boardID;
  let threshold = 0;
  for (let topic of TOPICS) {
    threshold += topic.weight;
    boardID = topic.boardID;
    if (threshold > random) {
      break;
    }
  }
  return boardID;
}
