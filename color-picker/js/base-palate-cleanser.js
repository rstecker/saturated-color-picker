/*globals Main, R, zot, console */
(function() {

// ----------
var component = Main.BasePalateCleanser = function() {
  console.error('Only create subclasses');
};

// ----------
component.prototype = {
  // ----------
  _init: function() {
    //do nothing
  },
  makePeopleSource: function(templateName, $parent) {
    var self = this;
    this.entries = [];
    var data = {}
    this.$el = Main.template('person-and-palate-cleanser', data)
      .appendTo($parent)
  },
  // ----------
  // Returns a random integer between low and high, including low but not high
  random: function(low, high) {
    return low + Math.floor(Math.random() * (high - low));
  },
  addAlbum: function(album) {
    var data = {
      entryType: 'album',
      iconText: '',
      iconSrc: album.icon,
      primary: album.name,
      secondary: album.artist
    };
    this.addDivider();
    var itemEl = Main.template('entry', data).appendTo(this.$el.find('.entries'));
    this.entries.push(itemEl);
  },
  generatePlayText: function() {
    var num = this.random(2,6)
    switch (this.random(0, 12)) {
      case 0:
        return 'Listening now';
      case 1:
        return 'Played this week';  
      case 2:
        return 'Played ' + num + ' days ago';  
      case 3:
        return 'Played ' + num + ' hrs ago';     
      case 4:
        return 'Subscribed';        
      case 5:
        return 'Played this';       
      case 6:
        return 'Played last week';  
      case 7:
        return 'Synced to mobile';    
      case 8:
        return 'In collection';    
      case 9:
        return (num * 7) + ' plays today';  
      case 10:
        return (num * 13) + ' plays this week';     
      case 11:
        return 'Played ' + num + ' mins ago';  
    }
    return ''
  },
  addDivider: function() {
    if (this.entries.length > 0 && this.entries.length < 3) {
      this.$el.find('.entries').append('<div class="divider"></div>');
    }
  },
  addPerson: function(person, secondText) {
    var secondaryTxt = '';
    if (secondText == 'play') {
      secondaryTxt = this.generatePlayText();
    }
    var data = {
      entryType: 'person',
      iconText: '',
      iconSrc: person.icon,
      primary: person.firstName + ' ' + person.lastName,
      secondary: secondaryTxt
    };
    this.addDivider();
    var itemEl = Main.template('entry', data).appendTo(this.$el.find('.entries'));
    this.entries.push(itemEl);
  },
  addStat: function() {
    var num = '';
    var numType = '';
    switch (this.random(0, 3)) {
      case 0:
      case 2:
        num = this.random(100,900) + 'K'
        numType = 'Total plays'
        break;
      case 1:
        num = this.random(100,400)
        numType = 'Total playlists'
        break;
    }
    var data = {
      entryType: 'stat',
      iconText: num,
      iconSrc: '',
      primary: numType,
      secondary: 'on Rdio'
    };
    this.addDivider();
    var itemEl = Main.template('entry', data).appendTo(this.$el.find('.entries'));
    this.entries.push(itemEl);
  }  
};
// ----------
_.extend(component, {
  dialog: null,

  // ----------
  closeDialog: function() {
    if (!this.dialog) {
      return;
    }

    this.dialog.$item.removeClass('has-popup');
    this.dialog.$el.remove();
    this.dialog = null;
  }
});

})();
