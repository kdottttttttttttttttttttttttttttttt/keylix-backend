const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

function createToken(displayName = "KeylixUser", accountId = uuidv4().replace(/-/g, "")) {
  const token = jwt.sign({ sub: accountId, dn: displayName }, config.jwtSecret, { expiresIn: '8h' });
  const decoded = jwt.decode(token);
  return {
    accountId,
    displayName,
    token: `eg1~${token}`,
    decoded
  };
}

function verifyToken(req) {
  const auth = req.headers.authorization || "";
  const token = auth.replace("bearer eg1~", "").replace("bearer ", "");
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    return decoded;
  } catch {
    return null;
  }
}

module.exports = { createToken, verifyToken };
