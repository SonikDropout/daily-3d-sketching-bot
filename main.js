const Discord = require('discord.js');

const SEND_TIME = '17:00';
const NOTIFICATION_TIME = '9:00';
const CALL_TO_ACTION_TIMEOUT = 10;
const MODELLING_TIMEOUT = 60;
const CHANNEL_ID = '894523688106463235';

const notificationMessage = `@everyone Сегодня в ${SEND_TIME} по GMT будет проходить ("НЕЗАЩИЩЕННЫЙ") СПИДМОДЕЛИНГ. Собираемся в дискорд канале Кайно.

За ${MODELLING_TIMEOUT} минут вам нужно будет создать модель, по высланному перед стартом рефу.

Учавствуйте сами или смотрите за процессом других учатников.`;

const callToActionMessage = `@everyone через ${CALL_TO_ACTION_TIMEOUT} минут спидмоделинг)`;

const timeoutMessage = `@everyone время вышло, сдаем работы!`;

const TOPICS = [
  { name: 'hardsurf', boardID: '895532270595751966' },
  { name: 'environment', boardID: '895532299192528907' },
  { name: 'hardsurf', boardID: '895532270595751966' },
  { name: 'sculpt', boardID: '895532347456356402' },
];

let currentTopicIndex = 0;

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
      currentTopicIndex = (currentTopicIndex + 1) % TOPICS.length;
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
  const imageBoard = await client.channels.fetch(
    TOPICS[currentTopicIndex].boardID
  );
  const messages = await imageBoard.messages.fetch();
  const message = messages.random();
  console.log('Selected message content:', message.content);
  console.log('Selected message has', message.attachments.size, 'attachments');
  let attachment;
  if (
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(
      message.content
    )
  ) {
    attachment = new Discord.MessageAttachment(message.content, null, {
      url: message.content,
    });
  } else if (message.attachments.size) {
    attachment = message.attachments.first();
  } else {
    const backupImage = getBackupImage();
    attachment = new Discord.MessageAttachment(backupImage, null, {
      url: backupImage,
    });
  }
  console.log('Sending image', attachment.url);
  return {
    content: '@everyone',
    files: [attachment],
  };
}

function getBackupImage() {
  const backupImages = require('./backup-images.json');
  return backupImages[Math.floor(Math.random() * backupImages.length)];
}
