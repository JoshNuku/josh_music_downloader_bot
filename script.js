const { google } = require("googleapis");
const { chat } = require("googleapis/build/src/apis/chat");
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true,
});

// Create a new YouTube client
const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY, // Replace with your actual API key
});

// Set the API parameters

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Hello! Welcome to Josh's music downloader bot.
Search any song by name and artiste and click the link to download`
  );
});
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const searchQuery = msg.text;
  console.log(msg);
  if (searchQuery[0] !== "/") {
    // Define the search query
    const params = {
      part: "snippet",
      q: searchQuery,
      type: "video",
    };

    // Make the API request
    youtube.search.list(params, async (err, response) => {
      if (err) {
        console.error("Error making API request:", err);
        return;
      }

      // Process the response
      const videos = await response.data.items;
      videos.forEach(async (video) => {
        const videoTitle = await video.snippet.title;
        const videoId = await video.id.videoId;
        const videoLink = `https://www.azyoutube.com/watch?v=${videoId}`;
        const imageUrl = await video.snippet.thumbnails.default.url;

        console.log("Title:", videoTitle);
        console.log("Video ID:", videoId);
        console.log("Video Link:", videoLink);
        console.log("Thumbnail URL:", video.snippet.thumbnails.default.url);
        console.log("----------------------------------------");
        bot.sendPhoto(chatId, imageUrl, {
          caption: `${videoTitle} ------ Download here ${videoLink}`,
          parse_mode: "Markdown",
        });
      });
    });
  }
});
