var moment = require('moment')
  , _ = require('underscore');

module.exports.scoreHistory = function(numberOfDays, tweets) {
   var scoresOverTime = [];
   for (var i = numberOfDays - 1; i >= 0; i--) {
      var date = moment().subtract('days', i);
      var score = scoreFromDate(date, tweets);
      scoresOverTime.push({
         date: date,
         score: score.overallScore
      });
   };
   return scoresOverTime;
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
      tweets[i].score = tweetScore;
      if (tweetScore > 0) {
         positiveInfluencers = updateInfluencers(positiveInfluencers, tweets[i], tweetScore);
      }
      if (tweetScore < 0) {
         negativeInfluencers = updateInfluencers(negativeInfluencers, tweets[i], tweetScore);
      }

      sum += tweetScore;
      count++;
   };
   console.log("Sum: " + sum);
   return { 
      overallScore: Math.round((sum / count) * 100),
      positiveInfluencers: positiveInfluencers,
      negativeInfluencers: negativeInfluencers
   };
}

function updateInfluencers(influencers, tweet, score) {
   if (influencers.length < 10) {
      influencers.push(tweet);
   }
   else if (Math.abs(score) > Math.abs(_.last(influencers).score)) {
      influencers.pop();
      influencers.push(tweet);
   }

   return _.sortBy(influencers, function(tweet) { return Math.abs(tweet.score) * -1; });
}

function getTweetScore(fromDate, tweet) {
   var age = getAge(fromDate, tweet);
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

function getAge(fromDate, tweet) {
   return fromDate.diff(moment(tweet.created_at), 'days', true);
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
   if (!tweet.sentiment) console.log(JSON.stringify(tweet, null, 2));
   if (tweet.sentiment.type === 'neutral') return 0;
   return parseFloat(tweet.sentiment.score);
}
