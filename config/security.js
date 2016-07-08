
'use strict';

// security.js
var secure     = require('express-secure-only'),
  rateLimit    = require('express-rate-limit'),
  helmet       = require('helmet');

module.exports = function (app) {
  app.enable('trust proxy');

  // 1. redirects http to https
  app.use(secure());

  // 2. helmet with defaults
  app.use(helmet());

  // 3. rate limiting
  var limiter = rateLimit({
    windowMs: 30 * 1000, // seconds
    delayMs: 0,
    max: 20,
    message: JSON.stringify({
      error:'Too many requests, please try again in 30 seconds.',
      code: 429
    }),
  });

  app.use('/api/', limiter);
};
