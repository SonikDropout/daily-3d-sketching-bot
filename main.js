const Discord = require('discord.js');

const SEND_TIME = '20:00';
const NOTIFICATION_TIME = '12:00';
const MODELLING_TIMEOUT = '21:00';
const UTC_OFFSET = 3;
const CHANNEL_ID = '894523688106463235';

const notificationMessage = `@everyone Сегодня в ${SEND_TIME} по MCK будет проходить СПИДмоделлинг. Собираемся в дискорд канале Кайно.

За час вам нужно будет создать модель по высланному рефу.

Учавствуйте сами или смотрите за процессом других учатников.`;

// const callToActionMessage = `@everyone через ${CALL_TO_ACTION_TIMEOUT} минут спидмоделинг)`;

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
  scheduleTasks(await fetchMainChannel());
});

function fetchMainChannel() {
  return client.channels.fetch(CHANNEL_ID);
}

function scheduleTasks(channel) {
  schedule(SEND_TIME, sendImage, channel);
  schedule(NOTIFICATION_TIME, notifyUsers, channel);
  schedule(MODELLING_TIMEOUT, timeoutCall, channel);
}

client.login(process.env.DISCORD_TOKEN);

async function notifyUsers(channel) {
  channel.send(notificationMessage);
}

async function sendImage(channel) {
  channel.send(await getImageMessage());
}

async function timeoutCall(channel) {
  channel.send(timeoutMessage);
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

function schedule(time, task, ...args) {
  let done;
  time = time.split(':').map(Number);
  function executeInTime() {
    const currentTime = getCurrentTime();
    if (currentTime[0] == time[0] && currentTime[1] == time[1]) {
      if (!done) {
        task(...args)
          .catch(console.error)
          .then(() => (done = true));
      }
    } else if (done) done = false;
  }
  const interval = setInterval(executeInTime, 1000);
  executeInTime();
  return function unschedule() {
    clearInterval(interval);
  };
}

function getCurrentTime() {
  let currentTime = new Date();
  let currentHours = currentTime.getUTCHours() + UTC_OFFSET;
  let currentMinuts = currentTime.getUTCMinutes();
  return [currentHours, currentMinuts];
}
