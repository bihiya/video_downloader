const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const { logUserLinkAndResponse } = require('./activity_logger.js');

// Replace 'YOUR_BOT_TOKEN' with your Telegram Bot API token
const BOT_TOKEN = '6651992775:AAG2vjVMexLc1rab9j6QB67iI18HkAx2ZtU';

// Create a new Telegram bot instance
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Handle the /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome to the Instagram Reels Downloader bot! Send me a link to an Instagram reel, and I will download it for you.');
});
// Function to extract the video URL from an Instagram page
function createLog(msg,input,response="") {
    logUserLinkAndResponse( msg.from.id,input,response,msg.from.first_name,msg.from.last_name,msg.from.username,msg.from.language_code);
}

// Function to handle Instagram links
async function handleInstagramLink(chatId, messageText, msg) {
    try {
      // Extract the video URL from the Instagram page
      bot.sendMessage(chatId, 'Processing video download ....');
      const { videoUrl } = await getInstagramVideoUrl(messageText);
  
      if (videoUrl) {
        bot.sendMessage(chatId, 'URL seems to be valid. Please wait...');
        // Download the video and send it to the user
        downloadVideo(chatId, videoUrl);
        createLog(msg, messageText, 'Video sent successfully');
      } else {
        bot.sendMessage(chatId, 'Failed to extract the video URL.');
        createLog(msg, messageText, 'Failed to extract the video URL');
      }
    } catch (e) {
      bot.sendMessage(chatId, `Unable to find video. Account may be private or video unavailable`);
      createLog(msg, messageText, 'Unable to find video. Account may be private or video unavailable');
    }
  }
// Function to handle YouTube links
async function handleYouTubeLink(chatId, messageText, msg) {
    try {
      // Check if the messageText starts with "http://" or "https://"
      if (!messageText.startsWith("http://") && !messageText.startsWith("https://")) {
        // If not, assume it's an incomplete URL and add "http://" to it
        messageText = "http://" + messageText;
      }
  
      // Extract the video URL from the YouTube page
      bot.sendMessage(chatId, 'Processing video download ....');
      const videoUrl = await getYouTubeVideoUrl(messageText);
  
      if (videoUrl) {
        bot.sendMessage(chatId, 'URL seems to be valid. Please wait...');
        // Download the video and send it to the user
        downloadVideo(chatId, videoUrl);
        createLog(msg, messageText, 'Video sent successfully');
      } else {
        bot.sendMessage(chatId, 'Failed to extract the video URL.');
        createLog(msg, messageText, 'Failed to extract the video URL');
      }
    } catch (e) {
      bot.sendMessage(chatId, `Unable to find video on YouTube. ${e}`);
      createLog(msg, messageText, 'Unable to find video on YouTube');
    }
  }
  
// Handle incoming messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  console.log(messageText)

  // Check if the message contains an videolink
  if (messageText.includes('instagram.com/')) {
    handleInstagramLink(chatId, messageText, msg);
  } else if (messageText.includes('youtube.com/') || messageText.includes('youtu.be/')) {
    handleYouTubeLink(chatId, messageText, msg);
  } else {
    bot.sendMessage(chatId, 'Please send a valid Instagram or YouTube link.');
    createLog(msg, messageText, 'Invalid URL');
  }
});


// Function to extract the video URL from an Instagram page
async function getInstagramVideoUrl(url) {
  try {
    // Launch a headless browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the Instagram page
    await page.goto(url);

    // Wait for the video element to become available (adjust the selector if needed)
    await page.waitForSelector('video', { timeout: 6000 }); 

    // Extract the video URL
    const videoUrl = await page.$eval('video', (element) => element.getAttribute('src'));
    console.log(videoUrl)

    // Extract the video filename from the URL
    const fileName = videoUrl.split('/').pop();

    // Close the browser
    await browser.close();

    return { videoUrl, fileName };
  } catch (error) {
    console.log(error)
  }
}


// Function to extract the video URL from a YouTube page
async function getYouTubeVideoUrl(url) {
    try {
      // Use axios to fetch the YouTube page HTML
      const response = await axios.get(url);
  console.log('guptaaa')
  console.log(response)
      // Check if the response status code is OK (200)
      if (response.status !== 200) {
        throw new Error('Failed to fetch YouTube page');
      }
  
      // Parse the HTML using cheerio
      const $ = cheerio.load(response.data);
  
      // Find the video element and extract the video URL
      const videoElement = $('meta[property="og:video:url"]');
      const videoUrl = videoElement.attr('content');
  
      if (videoUrl) {
        return videoUrl;
      } else {
        throw new Error('Failed to extract YouTube video URL');
      }
    } catch (error) {
      console.error('Error extracting YouTube video URL:', error);
      throw error;
    }
  }
  

// Function to download the video and send it to the user
function downloadVideo(chatId, videoUrl) {
  console.log('came for download')
  bot.sendVideo(chatId, videoUrl)
  .then((message) => {
    console.log('Video sent successfully:', message);
  })
  .catch((error) => {
       bot.sendMessage(chatId,videoUrl)
    console.error('Error sending video:', error);
  });
}

// Start the bot
bot.on('polling_error', (error) => {
  console.error(error);
});

console.log('Bot is running...');
