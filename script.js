const { google } = require("googleapis");
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot("6887856184:AAFKdStAjli3liT6LSL2rO-QZZtzYJPBt2Y", {
  polling: true,
});
let videoLink, imageUrl, videoTitle;

// Create a new YouTube client
const youtube = google.youtube({
  version: "v3",
  auth: "AIzaSyA1q6O9KIrtlBsdK7l8AR5OkalMdB_phKA", // Replace with your actual API key
});

// Set the API parameters

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Hello! Welcome to Music downloader bot.
     Search any song name and click the link to download`
  );
});
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  // Define the search query
  const searchQuery = msg.text;
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
    videos.forEach((video) => {
      videoTitle = video.snippet.title;
      const videoId = video.id.videoId;
      videoLink = `https://www.ssyoutube.com/watch?v=${videoId}`;
      imageUrl = video.snippet.thumbnails.default.url;

      console.log("Title:", videoTitle);
      console.log("Video ID:", videoId);
      console.log("Video Link:", videoLink);
      console.log("Thumbnail URL:", video.snippet.thumbnails.default.url);
      console.log("----------------------------------------");
    });
  });

  bot.sendPhoto(chatId, imageUrl, {
    caption: `${videoTitle}------ Download mp3 here ${videoLink}`,
    parse_mode: "Markdown",
  });
});
