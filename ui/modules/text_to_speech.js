'use strict';

var watson = require('watson-developer-cloud');
var fs = require('fs');

var text_to_speech = watson.text_to_speech({
  username: 'bf609d21-bd2e-43ed-82d3-4134575a024f',
  password: 'DX8xfaRqGNcr',
  version: 'v1',
  url: 'https://stream.watsonplatform.net/text-to-speech/api'
});

var params = {
  text: 'Hello from IBM Watson',
  voice: 'en-US_AllisonVoice', // Optional voice
  accept: 'audio/wav'
};

// Pipe the synthesized text to a file
text_to_speech.synthesize(params).pipe(fs.createWriteStream('output.wav'));