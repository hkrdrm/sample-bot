var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var cheerio = require('cheerio');
var axios = require('axios');
var _ = require('lodash');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

function scrape(){
  return new Promise((resolve, reject) => {
    var str = '';
    axios.get('https://www.fandango.com/moviesintheaters')
      .then(function (response){
        var $ = cheerio.load(response.data);
        $('.movie-list').first().contents().each(function(i,elem){
          var url = $(this).find('.visual-thumb').attr('data-src');
          if(url){
            str += ' ' + url + '\n';
          }
        })
        resolve(str);
      })
      .catch(function (error) {
        logger.error(error);
        reject(error)
      });
  })
}
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
            case 'boxoffice':
              let msg = ''
              scrape().then((res) => {
                msg = res
                bot.sendMessage({
                  to: channelID,
                  message: msg
                });
              })
            break;
            // Just add any case commands if you want to..
         }
     }
});
