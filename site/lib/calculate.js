var moment = require('moment')
  , _ = require('underscore');

module.exports.score = function(tweets) {
   var sum = 0;
   var count = 0;
   // var positiveInfluencers = [];
   // var positiveBar = 0;
   // var negativeInfluencers = [];
   // var negativeBar = 0;

   for (var i = tweets.length - 1; i >= 0; i--) {
      var tweetScore = getTweetScore(tweets[i]);
      // if (tweetScore > 0 && (tweetScore > positiveBar || positiveInfluencers.length < 10)) {
      //    positiveInfluencers.push({ id: tweets[i].id_str, score: tweetScore, sentiment: tweets[i].sentiment });
      //    positiveBar = positiveInfluencers.length < 10 ? 0 : _.min(positiveInfluencers, function(tweet) { return tweet.calculatedScore });
      // }
      // else if (tweetScore < 0 && (tweetScore < negativeBar || negativeInfluencers.length < 10)) {
      //    negativeInfluencers.push({ id: tweets[i].id_str, score: tweetScore, sentiment: tweets[i].sentiment });
      //    negativeBar = negativeInfluencers.length < 10 ? 0 : _.min(negativeInfluencers, function(tweet) { return tweet.calculatedScore });
      // }
      sum += tweetScore;
      count++;
   };
   console.log("Sum: " + sum);
   return { 
      overallScore: sum / tweets.length
      // positiveInfluencers: positiveInfluencers,
      // negativeInfluencers: negativeInfluencers
   };
}

function getTweetScore(tweet) {
   var age = getAge(tweet);
   var ageFactor = getAgeFactor(age);
   var factorRT = Math.pow(.25, isRT(tweet));
   var factorReply = Math.pow(1.25, isReply(tweet));
   var reach = getReach(tweet);
   var sentimentScore = getSentimentScore(tweet);

   console.log("Tweet: " + tweet.text);
   console.log("   Sentiment: " + sentimentScore.toFixed(2) + " Age: " + age.toFixed(2) + " days Factor: " + ageFactor + " RT? " + factorRT + " Reply? " + factorReply + " Reach: " + reach.toFixed(2));
   var score = sentimentScore*ageFactor*factorRT*factorReply*reach;
   console.log("   Score: " + score.toFixed(6));
   return score;
}

function getAge(tweet) {
   return moment().diff(moment(tweet.created_at), 'days', true);
}

function getAgeFactor(ageInDays) {
   if (ageInDays > 365) return 1.0;

   if (ageInDays < 30) return 2.0;
   if (ageInDays < 60) return 1.75;
   if (ageInDays < 90) return 1.6;
   if (ageInDays < 180) return 1.5;

   return 1.25;
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
   if (tweet.sentiment.type === 'neutral') return 0;
   return parseFloat(tweet.sentiment.score);
}