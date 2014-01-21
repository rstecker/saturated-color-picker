/*globals Main, R, zot */
(function() {

var superClass = Main.NormalItem.prototype;

// ----------
var component = Main.FriendsListeningItem = function(data) {
  _.each(data.friends, function(v, i) {
    switch (Main.random(0, 4)) {
      case 0:
        v.reason = 'Added to Favorites';
        break;
      
      case 1:
        v.reason = 'Synced to mobile';
        break;
      
      case 2:
        v.reason = Main.random(2, 50) + ' plays this week';
        break;
      
      case 3:
        v.reason = Main.random(2, 25) + ' plays today';
        break;
    }
  });

  superClass._init.call(this, 'friends-listening', data);
};

// ----------
component.prototype = _.extend(superClass, {

});

})();
