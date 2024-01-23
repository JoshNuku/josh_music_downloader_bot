const { google } = require("googleapis");
//const { chat } = require("googleapis/build/src/apis/chat");
require("dotenv").config();
const ytdl = require("ytdl-core");
const ffmpeg = require("./ffmpeg");

function downloadAudioFromYouTube(url, title) {
  return new Promise((resolve, reject) => {
    const stream = ytdl(url, { quality: "highestaudio" });
    const outputPath = `${title
      .split(" ")
      .join("")
      .replace(/[<>:"\/\\|?*\x00-\x1F]/g, "_")}.mp3`;

    ffmpeg(stream)
      .audioBitrate(128)
      .save(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err));
  });
}
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
    `Hello! Welcome to Josh's Audio Bot.
Search any song by name and artiste.`
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
      maxResults: 1,
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
        const videoLink = `https://www.youtube.com/watch?v=${videoId}`;
        const imageUrl = await video.snippet.thumbnails.high.url;
        try {
          const audioPath = await downloadAudioFromYouTube(
            videoLink,
            videoTitle
          );
          await bot.sendAudio(chatId, audioPath);
          bot.sendPhoto(chatId, imageUrl, {
            caption: `${videoTitle} `,
            parse_mode: "Markdown",
          });
        } catch (err) {
          bot.sendMessage(
            chatId,
            "Error occurred while processing the YouTube video."
          );
          console.error(err);
        }

        console.log("Title:", videoTitle);
        console.log("Video ID:", videoId);
        console.log("Video Link:", videoLink);
        console.log("Thumbnail URL:", video.snippet.thumbnails.default.url);
        console.log("----------------------------------------");
      });
    });
  }
});
