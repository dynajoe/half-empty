var showUserNotFound = function () {

};

var setUser = function (user) {
   $('#data .bio').html(user.description);
   $('#data .location').html(user.location);
   $('#data .name').html(user.name);
   $('#data img.avatar').attr('src', user.profile_image_url.replace(/_normal/, ''));         
};

var createTweet = function (tweet) {
  var span = $('<span/>');
  
  span.attr('data-sentiment', JSON.stringify(tweet.sentiment));
  span.attr('data-score', JSON.stringify(tweet.score));
  span.attr('id', tweet.id);
  console.log(tweet);
  span.html(tweet.text);

  return span;
};

var setTweets = function (selector, data) {
   var $container = $(selector);

   for (var i = 0; i < data.length; i++) {
      var tweet = data[i];
      var s = tweet.sentiment;
      var score = s.score || 'neutral';
      var li = $('<li class="' + s.type +'"></li>');
      li.append(createTweet(tweet));

      $container.append(li);
   }
};

var setScore = function (score) {
   $('#data .score').html(score);
};

var populateData = function (data) {

   if (!data.user) {
      showUserNotFound();
      return;
   }  

   $('#gather').fadeOut('slow');
   $('#data').fadeIn('slow');

   setScore(data.scored.overallScore);
   setUser(data.user);
   setTweets('.positive ul', data.scored.positiveInfluencers);
   setTweets('.negative ul', data.scored.negativeInfluencers);
   createChart(data.history);
};

var createChart = function (history) {
   console.log("Start: " + history.start);
   console.log("Data: " + history.data);
   $('.last90').highcharts({
      chart: {
          type: 'spline'
      },
      credits: {
        enabled: false
      },
      legend: {
        enabled: false
      },
      title: {
          text: '90 Day History'
      },
      xAxis: {
        gridLineWidth: 1,
        gridLineDashStyle: "Dash",
        gridLineColor: "#cccccc",
        labels: {
          overflow: "justify",
          style: {
            color: "#a0a0a0",
            font: "11px DINLight, Arial, sans-serif",
            "text-transform": "uppercase"
          }
        },
        lineColor: "#aaaaaa",
        lineWidth: 1,
        minorGridLineWidth: 0,
        maxPadding: 0,
        minPadding: 0,
        tickInterval: 1555200000,
        tickLength: 0,
        tickmarkPlacement: "on",
        title: {
          text: null
        },
        type: "datetime"
      },
      // yAxis: {
      //     title: {
      //         text: 'Score'
      //     },
      //     //min: 0,
      // },
      yAxis: {
        gridLineWidth: 1,
        gridLineDashStyle: "Dash",
        gridLineColor: "#cccccc",
        labels: {
          style: {
            color: "#a0a0a0",
            font: "11px DINLight, Arial, sans-serif",
            "text-transform": "uppercase"
          }
        },
        lineColor: "#aaaaaa",
        lineWidth: 1,
        minorGridLineWidth: 0,
        tickInterval: 5,
        tickLength: 0,
        title: {
          text: null
        },
        showFirstLabel: false
      },
      plotOptions: {
          spline: {
              lineWidth: 2,
              marker: {
                enabled: false,
                fillColor: "#fff",
                lineColor: null,
                lineWidth: 2,
                radius: 3,
                states: {
                  hover: {
                    enabled: true
                  }
                },
                symbol: "circle"
              },
              pointInterval: 3600000 * 24, // one day
              pointStart: history.start,
              negativeColor: '#FF0000'
          }
      },
      series: [{
          name: 'Score',
          data: history.data
      }],
      navigation: {
          menuItemStyle: {
              fontSize: '10px'
          }
      }
  });
}

$(document).ready(function () {
   $('#gather form').submit(function (e) {
      e.preventDefault();
      
      $this = $(this);
      
      var getData = function () {
         $('.form').addClass('hide');
         
         var twitter_handle = $('input[name=twitter_handle]').val();
         
         $.get('/analyze/' + twitter_handle, function (data) {
            if (data.processing) {
               setTimeout(getData, 250);
            } else {
               populateData(data);
            }
         });
      };
      
      getData();
   });

   // $('input[name=twitter_handle]').val('joeandaverde');
   // $('#gather form').submit();
});