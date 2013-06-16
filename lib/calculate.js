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
   var scoreData = scoreFromDate(moment(), tweets);
   scoreData.overallScore = Math.round(scoreData.overallScore);
   return scoreData;
}

module.exports.scoreFromDate = scoreFromDate = function(fromDate, tweets) {
   console.log('From Date: ' + fromDate.fromNow());
   var sum = 0;
   var count = 0;
   var positiveInfluencers = [];
   var negativeInfluencers = [];
   var min_index = 0;
   for (var i = tweets.length - 1; i >= 0; i--) {
      if (getAge(fromDate, tweets[i]) < 0) {
         min_index = i + 1;
         break;
      }
   };

   for (var i = tweets.length - 1; i >= min_index; i--) {
      var tweetsAgo = i - min_index;
      debug("tweets ago " + tweetsAgo);
      var tweetScore = getTweetScore(fromDate, tweets[i], tweetsAgo);
      
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

   var overallScore = (sum / count * 100);
   log("Sum: " + sum + " Count: " + count + " Overall Score: " + overallScore);
   return { 
      overallScore: overallScore,
      positiveInfluencers: positiveInfluencers,
      negativeInfluencers: negativeInfluencers
   };
}

module.exports.getBubbleData = function(tweets) {
   var data = [];
   var fromDate = moment();
   for (var i = tweets.length - 1; i >= 0; i--) {

      var tweetsAgo = i;
      var tweetScore = getTweetScore(fromDate, tweets[i], tweetsAgo);
      
      if (typeof tweetScore === 'undefined') continue;

      data.push({ 
         x: moment(tweets[i].created_at).valueOf(), 
         y: tweetScore.score, 
         z: Math.abs(tweetScore.sentimentScore),
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

function getTweetScore(fromDate, tweet, tweetsAgo) {
   var ageFactor = getAgeFactor(tweetsAgo);
   var factorRT = Math.pow(.25, isRT(tweet));
   var factorReply = Math.pow(1.1, isReply(tweet));
   var reach = getReach(tweet);
   var sentimentScore = getSentimentScore(tweet);

   debug("Tweet: " + tweet.text);
   debug("   Sentiment: " + sentimentScore.toFixed(2) + " Factor: " + ageFactor + " RT? " + factorRT + " Reply? " + factorReply + " Reach: " + reach.toFixed(2));
   var score = sentimentScore*ageFactor*factorRT*factorReply*reach;

   if (shouldIgnoreSentiment(sentimentScore)) {
      debug('Ignoring sentiment score of ' + sentimentScore)
      return;
   }

   if (sentimentScore < .1) {
      debug(tweet.text);
      debug("" + sentimentScore + "ss * "+ ageFactor + "af * " + factorRT + "frt * " + factorReply + "fr * " + reach + "r");
      debug("   Score: " + score.toFixed(6));
   }

   return { score: score, ageFactor: ageFactor, factorRT: factorRT, factorReply: factorReply, reach: reach, sentimentScore: sentimentScore };
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
function debug (text) {
   if (process.env.NODE_ENV !== 'production') {
      //console.log(text)
   }
}
