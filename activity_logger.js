const fs = require('fs');
const path = require('path');

// Function to log user link and bot response
function logUserLinkAndResponse(userId, userLink, botResponse, userFirstName, userLastName, userUsername, userLanguageCode) {
  const logFilePath = path.join(__dirname, 'user_link_log.json');

  // Load existing log data or create an empty object
  let logData = {};
  try {
    const data = fs.readFileSync(logFilePath, 'utf8');
    logData = JSON.parse(data);
  } catch (error) {
    // Handle file read error, or if the file doesn't exist yet
  }

  // Initialize or update the log entry for the user
  if (!logData[userId]) {
    logData[userId] = {
      user_info: {
        id: userId,
        is_bot: false,
        first_name: userFirstName || '', // Add user's first name
        last_name: userLastName || '', // Add user's last name
        username: userUsername || '', // Add user's username
        language_code: userLanguageCode || '', // Add user's language code
      },
      messages: [],
    };
  }

  const timestamp = new Date().toLocaleString();

  // Add the new log entry
  logData[userId].messages.push({
    user_link: userLink,
    bot_response: botResponse,
    timestamp: timestamp,
  });

  // Write the updated log data back to the file
  fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2));

  console.log('Link and response logged.');
}

module.exports = {
  logUserLinkAndResponse,
};
