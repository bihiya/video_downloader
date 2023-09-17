import os
from telegram import Update
from telegram.ext import Updater, CommandHandler, MessageHandler, CallbackContext, Filters
import instaloader

# Replace 'YOUR_BOT_TOKEN' with your Telegram Bot API token
BOT_TOKEN = '6651992775:AAG2vjVMexLc1rab9j6QB67iI18HkAx2ZtU'

# Initialize the Instagram loader
loader = instaloader.Instaloader()

# Define a function to handle the /start command
def start(update: Update, context: CallbackContext) -> None:
    update.message.reply_text("Welcome to the Instagram Reels Downloader bot! Send me a link to an Instagram reel, and I'll download it for you.")

# Define a function to handle incoming text messages
def handle_message(update: Update, context: CallbackContext) -> None:
    chat_id = update.message.chat_id
    message_text = update.message.text

    # Check if the message contains an Instagram link
    if "instagram.com/p/" in message_text:
        try:
            # Download the reel
            download_reel(message_text)
            update.message.reply_text("Reel downloaded successfully! 📽️")
        except Exception as e:
            update.message.reply_text(f"An error occurred: {str(e)}")
    else:
        update.message.reply_text("Please send a valid Instagram reel link.")

# Function to download the Instagram reel
def download_reel(link: str) -> None:
    try:
        # Download the reel
        loader.download_reels([link])
    except Exception as e:
        raise e

def main() -> None:
    updater = Updater(token=BOT_TOKEN, use_context=True)
    dispatcher = updater.dispatcher

    # Register command and message handlers
    dispatcher.add_handler(CommandHandler("start", start))
    dispatcher.add_handler(MessageHandler(Filters.text & ~Filters.command, handle_message))

    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()
