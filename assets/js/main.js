var showUserNotFound = function () {
   $('.form').removeClass('hide');
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

var setTopics = function (topics) {
  var $topics = $('#data .topics');
  $container = $('<p/>');

  for (var i = 0; i < topics.length; i++) {
    var $span = $('<span />');
    var text = topics[i].text;

    $span.html(text + " ");
    
    $container.append($span);
  }
  $topics.append($container);
};

var setScore = function (score) {
   $('#data .score').html(score);
};

var hideData = function () {
   $('#gather-wrapper').removeClass('hide');
   $('#data').addClass('hide');
   $('.form').removeClass('hide');
};

var showData = function () {
   $('#gather-wrapper').addClass('hide');
   $('#data').removeClass('hide');
};

var populateData = function (data) {

   if (!data.user) {
      showUserNotFound();
      return;
   }  

   showData();
   setTopics(data.topics);
   setScore(data.scored.overallScore);
   setUser(data.user);
   setTweets('.positive ul', data.scored.positiveInfluencers);
   setTweets('.negative ul', data.scored.negativeInfluencers);
   createChart(data.history);
   createBubble(data.bubble);
};

var createBubble = function(bubble) {
  $('.explore').highcharts({
    chart: {
        type: 'bubble',
        plotBorderWidth: 1,
        zoomType: 'xy'
    },

    title: {
        text: 'Score over time, wrt Sentiment Weight'
    },

    xAxis: {
        gridLineWidth: 1
    },

    yAxis: {
        startOnTick: false,
        endOnTick: false
    },

    series: [{
        data: bubble,
        displayNegative: true,
        color: '#319638',
        negativeColor: '#BD140E'
        // zThreshold: 0
    }]

  });
};

var createChart = function (history) {
   console.log("Start: " + history.start);
   console.log("Data: " + history.data);
   $('.last90').highcharts({
      chart: {
          type: 'areaspline'
      },
      credits: {
        enabled: false
      },
      legend: {
        enabled: false
      },
      title: {
          text: '90-Day Score History'
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
          areaspline: {
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
              color: '#319638',
              fillColor: "rgba(49, 150, 56, 0.1)",
              negativeColor: '#BD140E',
              negativeFillColor: "rgba(189, 20, 14, 0.1)",
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
   $('#start-over a').click(function (e) {
      e.preventDefault();
      hideData();
   });

   $('#gather-wrapper form').submit(function (e) {
      e.preventDefault();
      
      $this = $(this);

      var twitter_handle = $('input[name=twitter_handle]').val();
      $('.form').addClass('hide');
      
      var checkTask = function (id) {
         $.get('/check/' + id, function (data) {
            console.log(data.status);
            if (data.status === 'success') {
               return getData(twitter_handle);
            } else if (data.status === 'error') {
               return showUserNotFound(twitter_handle);
            } else {
               return setTimeout(function () { 
                  checkTask(id); 
               }, 250);  
            }
         });
      };

      var getData = function () {   
         $.get('/analyze/' + twitter_handle, function (data) {
            if (data.processing) {
               checkTask(data.id);
            } else {
               populateData(data);
            }
         });
      };
      
      getData();
   });

   //$('input[name=twitter_handle]').val('smerchek');
   //$('#gather form').submit();
});