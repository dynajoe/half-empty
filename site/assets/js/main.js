var showUserNotFound = function () {

};

var setUser = function (user) {
   $('#data .bio').html(user.description);
   $('#data .location').html(user.location);
   $('#data .name').html(user.name);
   $('img').attr('src', user.profile_image_url.replace(/_normal/, ''));         
};

var setTweets = function (selector, data) {
   var $container = $(selector);

   for (var i = 0; i < data.length; i++) {
      var tweet = data[i];
      var s = tweet.sentiment;
      var score = s.score || 'neutral';

      $container.append('<li class="' + s.type +'">' + tweet.text +'</li>');
   }
};

var populateData = function (data) {
   if (!data) {
      showUserNotFound();
      return;
   }  

   $('#gather').fadeOut('slow');
   $('#data').fadeIn('slow');
   $('#data .score').html(data.scored.overallScore);

   setUser(data.user);
   setTweets('.positive ul', data.scored.positiveInfluencers);
   setTweets('.negative ul', data.scored.negativeInfluencers);
};

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

  $('input[name=twitter_handle]').val('joeandaverde');
  $('#gather form').submit();
});