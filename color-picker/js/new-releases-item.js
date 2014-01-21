/*globals Main, R, zot */
(function() {

var superClass = Main.NormalItem.prototype;

// ----------
var component = Main.NewReleasesItem = function(data, $parent) {
  superClass._init.call(this, 'new-releases', data, $parent);
};

// ----------
component.prototype = _.extend(superClass, {

});

})();

(function() {

var superClass = Main.BaseCard.prototype;

// ----------
var component = Main.RebSimilarArtist = function(data, $parent) {
  superClass._init.call(this, 'new-releases', data, $parent);
};

// ----------
component.prototype = _.extend(superClass, {

});

})();



(function() {

var superClass = Main.BaseCard.prototype;

// ----------
var component = Main.PalateCleanser = function(header, type, $base) {
    var self = this;
    this.entries = [];
    var data = { header: header, type: type }
    this.$el = Main.template('palate-cleanser', data);
    $base.before(this.$el);
};

// ----------
component.prototype = _.extend(superClass, {
  // _init: function(header, $base) {
  //   var self = this;
  //   this.entries = [];
  //   var data = { header: header }
  //   this.$el = Main.template('palate-cleanser', data);
  //   $base.before(this.$el);
  // }

});

})();





(function() {

var superClass = Main.BaseCard.prototype;

// ----------
var component = Main.MusicPlusActivity = function(v, artwork, primary, secondary, prettyPeople, $parent) {
  var desc = ''
  switch (this.random(0, 3)) {
    case 0:
      desc = 'On the rise';
      break;
    case 1: 
      desc = 'Popular in your network';
      break;
    case 2: 
      desc = 'Popular on Rdio';
      break;
  }
  var data = {
    artworkSrc: artwork,
    stampType: 'playlist-music-plus-activity',
    primaryText: primary,
    secondaryText: secondary,
    description: desc
  }
  superClass._init.call(this, 'new-releases', data, $parent);
  var options = _.shuffle(prettyPeople);
  switch (this.random(0, 10)) {
    case 0:
    case 1:
    case 2:
    case 3:
      this.addPeopleGroup([options[1],options[2],options[3]], 'have played this');
      break;
    case 4:
    case 5:
    case 6:
      this.addPeopleGroup([options[1],options[2]], 'have played this');
      //this.addStat();
      break;
    case 7:
    case 8:
      this.addPerson(options[1], 'play');
      this.addStat();
      this.addStat();
      break;   
    case 9:
      this.addStat();
      this.addStat();
      break;      
  }
};

// ----------
component.prototype = _.extend(superClass, {

});

})();
