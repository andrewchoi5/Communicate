'use strict';

var watson  = require('watson-developer-cloud'),
  fs        = require('fs'),
  trim      = require('trim');

var dialogFile = __dirname + '/../training/dialog_id';
var classifierFile = __dirname + '/../training/classifier_id';

// This application requires 3 ids to work properly

// 1. TMDB API key, explained in https://www.themoviedb.org/documentation/api
var TMDB_API_KEY = process.env.TMDB_API_KEY || '3554304a353e6673032d413b5f76929c';

// 2. dialog id - see training/setup.js
var DIALOG_ID = 'TYPE DIALOG ID HERE';
if (fs.existsSync(dialogFile))
  DIALOG_ID = trim(fs.readFileSync(dialogFile, 'utf8'));

// 3. classifier id - see training/setup.js
var CLASSIFIER_ID = 'TYPE CLASSIFIER ID HERE';
if (fs.existsSync(classifierFile))
  CLASSIFIER_ID = trim(fs.readFileSync(classifierFile, 'utf8'));


module.exports = {
  dialog : watson.dialog({
    username: '<username>',
    password: '<password>',
    version: 'v1',
    path: { dialog_id: DIALOG_ID }
  }),
  dialog_id : DIALOG_ID,

  // if an API key for TMDB isn't provided, use the mock module to mimic the API
  movieDB: require(TMDB_API_KEY ? './moviedb' : './moviedb-mock')(TMDB_API_KEY),

  classifier: watson.natural_language_classifier({
    username: '<username>',
    password: '<password>',
    version: 'v1',
    path: { classifier_id: CLASSIFIER_ID }
  }),
  classifier_id : CLASSIFIER_ID
};
