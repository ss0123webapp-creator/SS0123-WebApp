SS0123 Web App

1. Deploy this folder as a Node.js web service.
2. Add environment variables:
   BOT_TOKEN = your regenerated Telegram bot token
   ADMIN_CHAT_ID = your Telegram numeric user ID
3. Start command: npm start
4. Use the resulting HTTPS URL in BotFather's /newapp setup.

Important:
- Never put BOT_TOKEN in index.html or frontend JavaScript.
- The app asks for browser permissions and requires user actions.
- The recorded video is sent only after the user presses Send Video.
