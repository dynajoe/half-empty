var moment = require('moment')
  , _ = require('underscore');

module.exports.scoreHistory = function(numberOfDays, tweets) {
   var scoresOverTime = [];
   for (var i = numberOfDays - 1; i >= 0; i--) {
      var date = moment().subtract('days', i);
      var score = scoreFromDate(date, tweets);
      scoresOverTime.push(score.overallScore);
   };
   return { start: moment().subtract('days', numberOfDays - 1).valueOf(), data: scoresOverTime };
}

module.exports.score = function(tweets) {
   return scoreFromDate(moment(), tweets);
}

module.exports.scoreFromDate = scoreFromDate = function(fromDate, tweets) {
   var sum = 0;
   var count = 0;
   var positiveInfluencers = [];
   var negativeInfluencers = [];

   for (var i = tweets.length - 1; i >= 0; i--) {
      var age = getAge(fromDate, tweets[i]);
      if (age < 0) continue;
      
      var tweetScore = getTweetScore(fromDate, tweets[i]);
      
      if (typeof tweetScore === 'undefined') continue;

      if (tweetScore.score > 0) {
         positiveInfluencers = updateInfluencers(positiveInfluencers, tweets[i], tweetScore);
      }
      if (tweetScore.score < 0) {
         negativeInfluencers = updateInfluencers(negativeInfluencers, tweets[i], tweetScore);
      }

      sum += tweetScore.score;
      count++;
   };

   log("Sum: " + sum);
   return { 
      overallScore: Math.round((sum / count) * 100),
      positiveInfluencers: positiveInfluencers,
      negativeInfluencers: negativeInfluencers
   };
}

module.exports.getBubbleData = function(tweets) {
   var data = [];
   var fromDate = moment();
   for (var i = tweets.length - 1; i >= 0; i--) {

      var tweetScore = getTweetScore(fromDate, tweets[i]);
      
      if (typeof tweetScore === 'undefined') continue;
      var point = [];
      point.push(moment(tweets[i].created_at).valueOf());
      point.push(tweetScore.score);
      point.push(Math.abs(tweetScore.sentimentScore));
      data.push({ 
         x: point[0], 
         y: point[1], 
         z: point[2],
         color: tweetScore.sentimentScore < 0 ? "#BD140E" : "#319638",
         fillColor: tweetScore.sentimentScore < 0 ? "rgba(189, 20, 14, 0.1)" : "rgba(49, 150, 56, 0.1)"});
   };

   return data;
}

function updateInfluencers(influencers, tweet, score) {
   if (influencers.length < 10) {
      influencers.push(_.extend({ score: score }, tweet));
   }
   else if (Math.abs(score.score) > Math.abs(_.last(influencers).score.score)) {
      influencers.pop();
      influencers.push(_.extend({ score: score }, tweet));
   }

   return _.sortBy(influencers, function(t) { return Math.abs(t.score.score) * -1; });
}

function shouldIgnoreSentiment(sentimentScore) {
   return sentimentScore == 0 || Math.round(sentimentScore * 100) == 0;
}

function getTweetScore(fromDate, tweet) {
   var age = getAge(fromDate, tweet);
   var ageFactor = getAgeFactor(age);
   var factorRT = Math.pow(.25, isRT(tweet));
   var factorReply = Math.pow(1.1, isReply(tweet));
   var reach = getReach(tweet);
   var sentimentScore = getSentimentScore(tweet);

   log("Tweet: " + tweet.text);
   log("   Sentiment: " + sentimentScore.toFixed(2) + " Age: " + age.toFixed(2) + " days Factor: " + ageFactor + " RT? " + factorRT + " Reply? " + factorReply + " Reach: " + reach.toFixed(2));
   var score = sentimentScore*ageFactor*factorRT*factorReply*reach;

   if (shouldIgnoreSentiment(sentimentScore)) {
      log('Ignoring sentiment score of ' + sentimentScore)
      return;
   }

   if (sentimentScore < .1) {
      log(tweet.text);
      log("" + sentimentScore + "ss * "+ ageFactor + "af * " + factorRT + "frt * " + factorReply + "fr * " + reach + "r");
      log("   Score: " + score.toFixed(6));
   }

   return { score: score, age: age, ageFactor: ageFactor, factorRT: factorRT, factorReply: factorReply, reach: reach, sentimentScore: sentimentScore };
}

function getAge(fromDate, tweet) {
   return fromDate.diff(moment(tweet.created_at), 'days', true);
}

function getAgeFactor(x) {
   if (x > 365) x = 365;
   if (x <= 0) x = 0;
   x = (x / 365) * 5;
   var factor = Math.pow((x/2.0 + 1.0/3.0), (-1.0 * (x/2.0 + 1.0/3.0)));
   return ((Math.round(factor * 10) / 10) / 1.4) * 2.0; 
}

function isRT(tweet) {
   return tweet.retweeted_status ? 1 : 0;
}

function isReply(tweet) {
   return (tweet.in_reply_to_user_id || tweet.in_reply_to_status_id) ? 1 : 0;
}

function getReach(tweet) {
   if (isRT(tweet)) return 1;

   return 2 - (1/(1 + (tweet.retweet_count * 2 + tweet.favorite_count * 1)));
}

function getSentimentScore(tweet) {
   if (!tweet.sentiment) log(JSON.stringify(tweet, null, 2));
   if (tweet.sentiment.type === 'neutral') return 0;
   return parseFloat(tweet.sentiment.score);
}

function log (text) {
   if (process.env.NODE_ENV !== 'production') {
      //console.log(text)
   }
}
