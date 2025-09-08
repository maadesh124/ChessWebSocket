const crypto = require("crypto");

function generatePassword(length = 12) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.randomBytes(length);

  const password = Array.from(bytes)
    .map(b => chars[b % chars.length])
    .join("");

  return password;
}

module.exports = { generatePassword };
