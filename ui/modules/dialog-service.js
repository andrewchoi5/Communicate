(function () {
    'use strict';
    angular.module('dialog.service', [])
   
    .service('dialogService', function (_, $http, $q, dialogParser) {
        var clientId;
        var conversationId;
        var welcomeMessage;
        var index = 0;
        var conversation = [];

        /**
         * Gets all entries (responses) in the conversation so far.
         *
         * @public
         * @return {object[]} All entries in the conversation.
         */
        var getConversation = function () {
            return conversation;
        };
        /**
         * A shorthand for retrieving the latest entry in the conversation.
         *
         * @return {object} The latest entry in the conversation.
         */
        var getLatestResponse = function () {
            return conversation.length > 0 ? conversation[conversation.length - 1] : undefined;
        };
        /**
         * Retrieves a clientId for the API connection.
         *
         * @public
         * @return {Object} The current client id and welcome message if it exists,
         * otherwise a new one retrieved from the API.
         */
        var initChat = function () {
           var firstTimeUser = true;
            if (clientId) {
                // Reuse existing clientId
                return $q.when({
                    'clientId': clientId,
                    'welcomeMessage': welcomeMessage,
                    'conversationId': conversationId
                });
            }
            else {
                 if (typeof (Storage) !== 'undefined') {
                     // Store session
                     if (localStorage.getItem('firstTimeUser')) {
                         firstTimeUser = false;
                     }
                 }
                 return $http.post('../api/create_conversation?first_time='+ firstTimeUser )
                  .then(function (response) {
                     if (typeof (Storage) !== 'undefined') {
                         //User session has been initialized, nest time true we want to
                         //notify the system that this is not the user's first session.
                         localStorage.setItem('firstTimeUser', 'false');
                     }
                     clientId = response.data.client_id;
                     welcomeMessage = response.data.response.join(' ');
                     conversationId = response.data.conversation_id;
                     return {
                         'clientId': clientId,
                         'welcomeMessage': welcomeMessage,
                         'conversationId': conversationId
                     };
                 }, function (errorResponse) {
                     var data = errorResponse;
                     if (errorResponse) {
                         data = data.data;
                         return {
                             'clientId': null,
                             'welcomeMessage': data.data.error,
                             'conversationId': null
                         };
                    }
                });
            }
        };

         var getResponse = function (question) {
             return $http.post('/api/conversation', {
               client_id: clientId,
               conversation_id: conversationId,
               input: question
             }).then(function (response) {
                 var watsonResponse = response.data.response.join(' ');
                 var movies = null, htmlLinks = null, transformedPayload = null;
                 var segment = null;
                 console.log("test 0 passed");
                     // if(dialog.conversation.response == "I would be thrilled to assist you. Are you here for inquiries regarding Loans or Accounts?") {
                     if(watsonResponse == "I would be thrilled to assist you. Are you here for inquiries regarding Loans or Accounts?") {
                              console.log("test 1 passed");
                                  // username: 'bf609d21-bd2e-43ed-82d3-4134575a024f',
                                  // password: 'DX8xfaRqGNcr',
                     //            function synthesizeRequest(options, audio) {
                     //                var sessionPermissions = JSON.parse(localStorage.getItem('sessionPermissions')) ? 0 : 1;
                     //                var downloadURL = '/api/synthesize' +
                     //                    '?voice=' + options.voice +
                     //                    '&text=' + encodeURIComponent(options.text) +
                     //                    '&X-WDC-PL-OPT-OUT=' +  sessionPermissions;

                     //                if (options.download) {
                     //                    downloadURL += '&download=true';
                     //                    window.location.href = downloadURL;
                     //                    return true;
                     //                }
                     //                audio.pause();
                     //                try {
                     //                    audio.currentTime = 0;
                     //                } catch(ex) {
                     //                    // ignore. Firefox just freaks out here for no apparent reason.
                     //                }
                     //                audio.src = downloadURL;
                     //                talking = true;
                     //                $('.audio').on("ended", function(){
                     //                    talking = false;
                     //                });
                     //                audio.play();
                     //                return true;
                     //            };
                     //            // var res = response[response.length - 1].responses;
                     //            var res = "hello world from IBM";
                     //            var voice = 'en-US_AllisonVoice';
                     //            var utteranceOptions = {
                     //                text: res,
                     //                voice: voice,
                     //                sessionPermissions: JSON.parse(localStorage.getItem('sessionPermissions')) ? 0 : 1
                     //            };
                     //            var audio = $('.audio').get(0);
                     //            synthesizeRequest(utteranceOptions, audio);
                     } 
                 if (watsonResponse) {
                     if (!dialogParser.isMctInPayload(watsonResponse)) {
                         //For 'mct' tags we have to maintain the formatting.
                         watsonResponse = watsonResponse.replace(/<br>/g, '');
                     }
                     //yes, seems odd, but we are compensating for some
                     //inconsistencies in the API and how it handles new lines
                     watsonResponse = watsonResponse.replace(/\n+/g, '<br/>');
                 }
                 if ($.isArray(response.data.movies)) {
                     movies = response.data.movies;
                 }
                 if (!watsonResponse) {
                     //Unlikely, but hardcoding these values in case the dialog service/account does
                     //not provide a response with the list of movies.
                     if (movies) {
                         watsonResponse = 'Here is what I found';
                     }
                     else {
                         watsonResponse = 'Oops, this is embarrassing but my system seems '+
                         'to be having trouble at the moment, please try a bit later.';
                     }
                 }
                 if (dialogParser.isMctInPayload(watsonResponse)) {
                     transformedPayload = dialogParser.parse(watsonResponse);
                     htmlLinks = transformedPayload.htmlOptions;
                     question = transformedPayload.question;
                     watsonResponse = transformedPayload.watsonResponse;
                 }
                 segment = {
                         'message': question,
                         'responses': watsonResponse,
                         'movies': movies,
                         'options': htmlLinks
                     };
                 return segment;
             }, function (error) {
                 //Error case!
                 var response = error.data.error;
                 if (!response) {
                     response = 'Failed to get valid response from the Dialog service. Please refresh your browser';
                 }
                 return {
                     'message': question,
                     'responses': response
                 };
             });
         };

        /**
         * A (public) utility method that ensures initChat is
         * called and returns before calling the getResponse API.
         *
         * @public
         * @return {object[]} An array of chat segments.
         */
        var query = function (input) {
            conversation.push({
                'message': input,
                'index': index++
            });

            return initChat().then(function () {
                var response = $q.when();
                response = response.then(function (res) {
                    if (res) {
                        conversation.push(res);
                    }
                    return getResponse(input);
                });
                return response;
            }, function () {
                var segment = {};
                segment.responses = 'Error received from backend system. Please refresh the browser to start again.';
                conversation.push(segment);
            }).then(function (lastRes) {
                if (lastRes) {
                    conversation.forEach(function (segment) {
                        if (segment.index === index - 1) {
                            segment.responses = lastRes.responses;
                            segment.movies = lastRes.movies;
                            segment.options = lastRes.options;
                        }
                    });
                }
                return conversation;
            });
        };
        /**
         * Called when the end user clicks on a movie. A REST call is initiated to the app server code which
         * acts as a proxy to WDS and themoviedb.
         *
         * @private
         */
         var getMovieInfo = function (movie_name, id, popularity) {
             return initChat().then(function (res) {
               return $http({
                 url: '../api/movies',
                 method: 'GET',
                 params: {
                   client_id: res.clientId,
                   conversation_id: res.conversationId,
                   movie_title: movie_name,
                   movie_id: id
                 }
               }).then(function (response) {
                 var segment = response.data;
                 if (segment) {
                     if (segment.movies && segment.movies.length > 0) {
                         segment = segment.movies[0];
                     }
                     segment.commentary = response.data.response[1];
                 }
                 return segment;
                 },
                 function (error) {
                     var segment = error.data;
                     if (segment) {
                         if (segment.error) {
                             segment.commentary = segment.error;
                         }
                         else {
                             segment.commentary = 'Failed to retrieve movie details. Please retry later.';
                         }
                     }
                     segment.error = true;
                     return segment;
                 });
             });
         };

        return {
            'getConversation': getConversation,
            'getLatestResponse': getLatestResponse,
            'initChat': initChat,
            'query': query,
            'getMovieInfo': getMovieInfo
        };
    });
}());
