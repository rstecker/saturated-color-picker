/*globals Main, R, zot, console */
(function() {

// ----------
var component = Main.BaseCard = function() {
  console.error('Only create subclasses');
};

// ----------
component.prototype = {
  // should match @artwork_visibility_percent_normal in base-card.less
  ARTWORK_VISIBILITY_PERCENT_NORMAL: '55%',
  ARTWORK_VISIBILITY_PERCENT_ON_HOVER: '45%',
  // ----------
  _init: function(name, data, $parent) {
    var self = this;
    this.entries = [];
    this._favorite = false;
    data.isTrack = data.isTrack || false;
    data.helperText = data.helperText || false;
    data.in_collection = false;
    data.is_synced = false;
    if (Math.random() < .2 ) {
      data.in_collection = true;
    }
    if (Math.random() < .2 ) {
      data.is_synced = true;
    }
    _.bindAll(this, 'colorArtwork');
    this.$el = Main.template('base-card', data)
      .appendTo($parent)

    this.$el.find('.shadower').click(this.colorArtwork)
    //   .mouseenter(function() {
    //     // self.$el.find('.sleeve, .stamp, .sleeve-content, .hover-controls').stop(true).animate({
    //     //   top: Main.BaseCard.prototype.ARTWORK_VISIBILITY_PERCENT_ON_HOVER
    //     // }, 100, 'easeOutQuad');
    //     // self.$el.find('.shadower').stop(true).animate({
    //     //   height: Main.BaseCard.prototype.ARTWORK_VISIBILITY_PERCENT_ON_HOVER
    //     // }, 100, 'easeOutQuad');

    //     // self.$el.find('.description').stop(true).animate({
    //     //   opacity: 1,
    //     //   top: '43%'
    //     // }, 100, 'easeOutQuad');

    //     clearTimeout(self._timeout);
    //     self._timeout = setTimeout(function() {
    //       self.$el.find('.hover-controls > .inner').stop(true).animate({
    //         opacity: 1
    //       }, 200, 'linear');

    //       self._timeout = setTimeout(function() {
    //         self.$el.find('.stamp').hide();
    //       }, 200);
    //     }, 1);
    //   })
    //   .mouseleave(function() {
    //     var slideDown = function() {
    //       self.$el.find('.sleeve, .stamp, .sleeve-content, .hover-controls').stop(true).animate({
    //         top: Main.BaseCard.prototype.ARTWORK_VISIBILITY_PERCENT_NORMAL
    //       }, 100, 'easeOutQuad');
    //       self.$el.find('.shadower').stop(true).animate({
    //         height: Main.BaseCard.prototype.ARTWORK_VISIBILITY_PERCENT_NORMAL
    //       }, 100, 'easeOutQuad');
  
    //       self.$el.find('.description').stop(true).animate({
    //         opacity: 0,
    //         top: '50%'
    //       }, 100, 'easeOutQuad');
    //     };

    //     self.$el.find('.stamp').show();

    //     self.$el.find('.hover-controls > .inner').stop(true).animate({
    //       opacity: 0
    //     }, 200, 'linear');

    //     // clearTimeout(self._timeout);
    //     // self._timeout = setTimeout(slideDown, 1);
    //   });

    // // this.$el.find('.hover-controls > .inner, .description').css({
    // this.$el.find('.hover-controls > .inner').css({  
    //   opacity: 0
    // });

    $(window)
      .click(function(event) {
        var $target = $(event.target);
        if (component.dialog && !$target.closest(component.dialog.$el).length) {
          component.closeDialog();
        }
      });
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
      secondary: album.artist,
      is_synced: Math.random() < 0.2,
      in_collection: Math.random() < 0.2
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
    } else {
      secondaryTxt = secondText;
    }
    var data = {
      entryType: 'person',
      iconText: '',
      iconSrc: person.icon,
      primary: person.firstName + ' ' + person.lastName,
      secondary: secondaryTxt,
      is_synced: Math.random() < 0.3,
      in_collection: Math.random() < 0.3
    };
    this.addDivider();
    var itemEl = Main.template('entry', data).appendTo(this.$el.find('.entries'));
    this.entries.push(itemEl);
  },
  addPeopleGroup: function(peoples, didWhat) {
    var dudeList= _.map(peoples, function(p) {
      return { 
        icon: p.icon,
        in_collection: Math.random() < .2,
        is_synced: Math.random() < .2
      }
    });
    var whoDid = peoples[0].firstName + ' ' + peoples[0].lastName + ' and ' + Math.round(Math.random() * 20+2) + ' other friends'
    if (peoples.length == 2) {
      whoDid = peoples[0].firstName + ' ' + peoples[0].lastName + ' and ' + peoples[1].firstName + ' ' + peoples[1].lastName
    }
    var data = {
      dudes: dudeList,
      who_did: whoDid,
      did_what: didWhat
    }
    var itemEl = Main.template('people-group', data).appendTo(this.$el.find('.entries'));
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
      secondary: 'on Rdio',
      is_synced: false,
      in_collection: false
    };
    this.addDivider();
    var itemEl = Main.template('entry', data).appendTo(this.$el.find('.entries'));
    this.entries.push(itemEl);
  },
  addComment: function(person) {
    var comment = "well this album will be huge..";
    if (Math.random() < .3) {
      comment = "Soundtracks for movies directed at teens is a great way to introduce them to new music / artists. The hunger games soundtracks have/will definitely done that (for my high school students - at least)."
    } else if (Math.random() < .3) {
      comment = "Also, I think many critics try to relate this album to the simplicity of the first album. Honestly, I don't think they can be compared. Each album tries to portray a different message with different origins... on purpose. This album can't be as stripped down as the first album because Catching Fire does not revolve around the Applachian culture of District 12; it revolves around the Capitol and the fiery granduer Catchin Fire tries to encompass in the book."
    } else if (Math.random() < .3) {
      comment = 'Atlantic herring, triplefin blenny garibaldi, deep sea eel. Summer flounder milkfish white marlin, Black pickerel. Rabbitfish, scissor-tail rasbora queen danio Redfin perch zebra lionfish--cherry salmon sawfish hake cowfish codling demoiselle queen danio swampfish crucian carp. Crucian carp greeneye green swordtail masu salmon sheepshead, "Red salmon, ling horn shark," pilot fish manefish flounder. Velvetfish sandbar shark. Cavefish kuhli loach requiem shark dragonet Bengal danio ide threadsail sarcastic fringehead. Hillstream loach bamboo shark lionfish silver hake. Dragon goby pupfish airbreathing catfish three spot gourami merluccid hake cusk-eel Black swallower surfperch Pacific cod pejerrey plunderfish Death Valley pupfish. Australian herring amur pike splitfin murray cod, frilled shark, shark Dolly Varden trout. Lookdown catfish coley trench sand knifefish eagle ray four-eyed fish pikeperch. Yellowtail clownfish--sabertooth, Red salmon lampfish, loosejaw tope betta loweye catfish, slimy mackerel Pacific hake.'
    }
    var data = {
      entryType: 'comment',
      iconText: '',
      iconSrc: person.icon,
      commenter: person.firstName + ' ' + person.lastName,
      comment: comment,
      timestamp: Math.round(Math.random() * 10 + 1) +" days ago",
      is_synced: Math.random() < 0.3,
      in_collection: Math.random() < 0.3
    };
    var itemEl = Main.template('comment', data).appendTo(this.$el.find('.entries'));
    this.entries.push(itemEl);
  },
  addMockStation: function(station, albums) {
    var moshString = [albums[0].artist, albums[1].artist, albums[2].artist, albums[3].artist].join(', ')
    var data = {
      entryType: 'album',
      iconText: '',
      iconSrc: station.icon,
      primary: station.name,
      secondary: moshString,
      is_synced: false,
      in_collection: false
    };
    var itemEl = Main.template('entry', data).appendTo(this.$el.find('.entries'));
    itemEl.find('.secondary').removeClass('truncated-line')
    itemEl.find('.secondary').addClass('truncated-two-lines')
    this.entries.push(itemEl);
  },
  // valid types: collection, playlist, sync
  addPrompt: function(type, options) {
    var button = '';
    var result = '';
    var after = false;

    switch (type) {
      case 'collection':
        button = 'Add to Collection';
        result = 'This album is now in <span class="link">your collection</span>.';
        after = function(cardEl) { cardEl.find('.artwork-badge').addClass('sync'); };
        break;
      case 'playlist':
        button = 'Create playlist';
        result = 'Your playlist has been created.<br><span class="link">Go add more songs.</span>';
        break;
      case 'sync':
        button = 'Sync to Mobile';
        result = 'This album is set to sync.<br>Want to <span class="link">share it</span> with some friends?';
        after = function(cardEl) { cardEl.find('.artwork-badge').addClass('sync'); };
        break;
      // case 'sync':
      //   button = '';
      //   result = '';
      //   break;
    }

    var data = {
      entryType: type,
      buttonText: button
    };
    var itemEl = Main.template('prompt', data).appendTo(this.$el.find('.entries'));
    var cardEl = this.$el;
    cardEl.find('.artwork-badge').removeClass('sync');
    cardEl.find('.artwork-badge').removeClass('collection');
    itemEl.find('.resolved-content').html(result)
    itemEl.find('.button').click(function(e) {
      itemEl.addClass('resolved');
      if (after) {
        after(cardEl);
      }
    });
    this.entries.push(itemEl);
  },
  addSharePrompt: function(people) {
    var self = this;
    _.each(people, function(p) {
      self.$el.find('.entries').addClass("people-prompt")
      self.$el.find('.entries').append("<div class='entry'><div class='icon person'><img src='"+p.icon+"'></div></div>")
    });
  },
  _reduceColors: function(x, reduced_x, min, minSat, minLight) {
    _.each(_.keys(x[0]), function(color){
      var count = x[0][color]
      if (count < min) {
        return;
      }
      var c = jQuery.Color( "#"+color );
      if (c.saturation() < minSat) {
        return;
      }
      if (c.lightness() < minLight) {
        return;
      }
      reduced_x[color] = count;
    })
  },
  _mergeColors: function(reduced_x, distance){
    var merged_x = {};
    var reduced_x_keys = _.keys(reduced_x);
    var reduce_x_length = reduced_x_keys.length;
    for (var i = 0; i < reduce_x_length; ++i) {
      var c1 = reduced_x_keys[i];
      var v1 = reduced_x[c1];
      var color1 = jQuery.Color("#"+c1);
      for (var j = i+1; j < reduce_x_length; ++j) {
        var c2 = reduced_x_keys[j];
        var v2 = reduced_x[c2];
        var color2 = jQuery.Color("#"+c2);
        if (color1.red())
        var dist = Math.sqrt(
            Math.pow(color1.red() - color2.red(),2) +
            Math.pow(color1.green() - color2.green(),2) +
            Math.pow(color1.blue() - color2.blue(),2)
        );
        // console.log("DIST : "+color1+" vs "+color2+" : "+dist);
        if (dist < distance && dist > 0) {
          var obj = merged_x[c1];
          if (obj == null && merged_x[c2] != null) {
            obj = merged_x[c2];
            merged_x[c1] = obj;
            merged_x[c2] = null;
            delete merged_x[c2];
          } else if(merged_x[c2] != null) {
            _.each(merged_x[c2], function(count, color) {
              obj[color] = count;
            })
            merged_x[c2] = null;
            delete merged_x[c2];
          }
          //console.log("\t PING #"+c1+" ["+v1+"], #"+c2 +" ["+v2+"]: ",obj)
          if (obj == null) {
            var lastKey = null;
            var set = _.find(merged_x, function(set, key) {
              lastKey = key;
              return set[c1] || set[c2];
            });
            if (set) {
              obj = set;
              merged_x[c1] = set;
              merged_x[lastKey] = null;
              delete merged_x[lastKey];
            } else {
              obj = {};
              merged_x[c1] = obj;
            }
          }
          obj[c1] = reduced_x[c1];
          obj[c2] = reduced_x[c2];
        }
      }
    }
    return merged_x;
  },
  pickFinalColor: function(final_x, minSat, maxSat, minLight, maxLight) {
    var final_color = [0,'']
    _.each(_.keys(final_x), function(color) {
      var currentSaturation = jQuery.Color('#'+color).saturation();
      if (currentSaturation < minSat || currentSaturation > maxSat) {
        return;
      }
      var light = jQuery.Color('#'+color).lightness();
      if (light < minLight || light > maxLight) {
        return;
      }
      if (currentSaturation > final_color[0]) {
        final_color = [currentSaturation, color]
      }
    });
    return final_color;
  },
  // c is a jQuery.Color object!
  setBackgroundColor: function(c) {
    cMax = c.transition('#000000',.2).alpha(1);
    cMin = c.transition('#000000',.2).alpha(0);
    c = c.alpha(0.8);

    this.$el.find('.highlight-band').css('background-color',c.toRgbaString())
    //this.$el.find('.shadower').css('background',
    //  '-webkit-gradient(linear, left top, left bottom, color-stop(0%,'+cMax.toRgbaString()+'), color-stop(50%,'+cMin.toRgbaString()+'))');
  },
  _isLeft: function(lineA, lineB, point) {
    return ((lineB[0] - lineA[0])*(point[1] - lineA[1]) - (lineB[1] - lineA[1])*(point[0] - lineA[0])) > 0
  },
  _pruneColors: function(orig_x, reduced_x) {
    var self = this;
    _.each(_.keys(orig_x[0]), function(color){
      var c = Refresh.Web.Color({hex: color})
      var x = c.s;
      var y = c.b / 255.0 * 100;
      var pass = false;
      var list = [];
      if (c.h > 230) { // blue & magenta
        pass = self._isLeft([54,98], [46,33], [x,y]);
        pass = pass && self._isLeft([46,33], [100,31], [x,y]);
      } else if (c.h > 110) { // green & cycan

        list.push([65,99])
        list.push([56,94])
        list.push([52,90])
        list.push([48,84])
        list.push([46,77])
        list.push([44,67])
        list.push([46,59])
        list.push([50,54])
        list.push([54,48])
        list.push([58,44])
        list.push([65,41])
        list.push([76,37])
        list.push([82,35])
        list.push([90,35])
        list.push([97,36])
        list.push([100,38])
        pass = true;
        for (var i = 0; (i < list.length - 1) && pass; ++i) {
          pass = pass && self._isLeft(list[i], list[i+1], [x,y])
        }

        // pass = self._isLeft([65,99], [51,87], [x,y]);
        // pass = pass && self._isLeft([51,87], [44,68], [x,y]);
        // pass = pass && self._isLeft([44,68], [52,51], [x,y]);
        // pass = pass && self._isLeft([52,51], [89,35], [x,y]);
        // pass = pass && self._isLeft([89,35], [100,39], [x,y]);

      } else { // red & yellow
        list.push([74,100])
        list.push([69,95])
        list.push([58,89])
        list.push([51,83])
        list.push([47,79])
        list.push([44,67])
        list.push([45,59])
        list.push([49,52])
        list.push([56,46])
        list.push([66,40])
        list.push([78,34])
        list.push([90,30])
        list.push([97,30])
        list.push([100,33])
        pass = true;
        for (var i = 0; (i < list.length - 1) && pass; ++i) {
          pass = pass && self._isLeft(list[i], list[i+1], [x,y])
        }
        // pass = self._isLeft([96,31], [100,35], [x,y]);
        // pass = pass && self._isLeft([45,62], [96,31], [x,y]);
        // pass = pass && self._isLeft([73,99], [45,62], [x,y]);
      }
      if (!pass) {
        return;
      }
      reduced_x[color] = orig_x[0][color];
    });
  },
  _pickMostLikelyToRock: function(finList) {
    var final_color = [0,'',0]
    _.each(_.keys(finList), function(color) {
      var c = Refresh.Web.Color({hex: color});
      var s = c.s;
      var count = finList[color];
      var cur_count = final_color[2];
      var cur_saturation = final_color[0];

      console.log(" > "+c.hex+" ["+finList[color]+"] "+s);

      if (cur_saturation < s) { // more saturated!
        if (count >= cur_count/2) { // you have to not be tiny
          final_color = [s, color, count];
          console.log(" >> nabbed based on saturation!");
        } else {
          console.log(" >> more saturated, but not big enough "+(count)+" vs "+(cur_count/2));
        }
      } else if (count > cur_count * 10) { // way bigger count!
        final_color = [s, color, count];
        console.log(" >> nabbed based on count!");
      }
    });
    return final_color;
  },
  colorArtwork: function() {
    console.log(" -- ["+new Date()+"] starting color sample ");
    x = this.$el.find('.artwork').get_colors(true);
    var reduced_x = {};
    this._pruneColors(x, reduced_x);
    console.log(" -- ["+new Date()+"] just ran PRUNE : "+_.keys(reduced_x).length);
    // this._reduceColors(x, reduced_x, 10, .2, .1);
    // console.log(" -- ["+new Date()+"] just ran REDUCED : "+_.keys(reduced_x).length + " of "+ _.keys(x[0]).length);
    // var reducedTwice = false;
    // if (_.keys(reduced_x).length < 12) {
    //   reducedTwice = true;
    //   var limit = (_.keys(reduced_x).length > 1000) ? 10 : 2;
    //   this._reduceColors(x, reduced_x, limit, 0, 0);
    //   console.log(" ---- ["+new Date()+"] just ran REDUCED again : "+_.keys(reduced_x).length);
    // }
    if (_.keys(reduced_x).length == 0) {
      console.log(" THE FUCK -- we failed to prune anything, bailing");
      return;
    }

    if (_.keys(reduced_x).length > 1000) {
      console.log(" TOO MANY COLORS, chopping shit down");
      reduced_x = _.filter(reduced_x, function(value, key) {
        return value > 2;
      });
      console.log(" --> clipped to the 2s, now we have "+_.keys(reduced_x).length)
    }

    var merged_x = null;
    for (var i = 100; i > 3; i -= i/2) {
      merged_x = this._mergeColors(reduced_x, i);
      console.log(" --- ["+new Date()+"] just ran MERGED ["+i+"]: "+_.keys(merged_x).length);
      if (_.keys(merged_x).length >= 8 || (i < 13 && _.keys(merged_x).length >= 5)) {
        break;
      }
    }

    var final_x = {};
    if (_.keys(merged_x).length == 0) {
      console.log("No merging found, going with reduced");
      merged_x = reduced_x;
      final_x = merged_x;
    } else {
      console.log(" -- ["+new Date()+"] settled MERGE on "+_.keys(merged_x).length);

      _.each(merged_x, function(colors) {
        var total_count = 0;
        var color = _.reduce(colors, function(memo, count, color) {
          //console.log(" > #"+memo[1]+ "["+memo[0]+"] vs #"+color+" ["+count+"]");
          total_count += count;
          if (count > memo[0]) {
            return [count, color];
          }
          return memo;
        }, [0, '']);
        final_x[color[1]] = total_count;
      });
    }
    console.log(" -- ["+new Date()+"] just ran FINAL : "+_.keys(final_x).length+" :: ",final_x);
    //console.log(" RESULTS: ",final_x);
    var final_color = this.pickFinalColor(final_x, 0.01, 1, 0.2, 0.85);
    if (final_color[0] == 0) {
      final_color = this.pickFinalColor(final_x, 0.01, 1, 0.01, 0.99);
    }
    final_color = this._pickMostLikelyToRock(final_x);
    if (final_color[0] == 0) {
      console.error("Color picking failed.  Bailing now so as not to set random color");
      return;
    }
    var c = jQuery.Color('#'+final_color[1]);
    this.setBackgroundColor(c);
    window.rebecca = {
      x: x[0],
      reduce: reduced_x,
      merge: merged_x,
      fin: final_x,
      color: c,
      t: this
    }
    console.log(" -- final results: ", window.rebecca);
    if ($('.cheat').length > 0) {
      printCheatSheet();
    }
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













(function($, window, document, undefined){
  var canvas = document.createElement('canvas');
  if (canvas && canvas.getContext){
    $.fn.noiseyTop = function(){
      var rv = [];
      this.each(function(){
        var tagname = this.tagName.toLowerCase();
        if ((tagname === 'img') || (tagname === 'canvas') || (tagname === 'video')){
          //something bad can happend when drawing the image
          try{
            var w = $(this).width();//this.getAttribute('width');
            var h = $(this).height();//this.getAttribute('height');
            w = 50;
            h = 13;
            canvas.setAttribute('width', w);
            canvas.setAttribute('height', h);
            var ctxt = canvas.getContext('2d');
            if (ctxt){
              ctxt.drawImage(this, 0, 0, w, w);
              var imagedata = ctxt.getImageData(0, 0, w, h);
              var data = imagedata.data;
              //log('imagedata.width:'+imagedata.width+' imagedata.height:'+imagedata.height+' w:'+w+' h:'+h);
              var obj = {};
              var color = '';
              var r = 0, g = 0, b = 0, a = 0;
              var pix = data.length;
              for (pix--; pix > 2; pix-=4){
                //a = data[pix - 0];
                b = data[pix - 1];
                g = data[pix - 2];
                r = data[pix - 3];
                if (modBy == 5) {
                  r = (r % 5 < 3) ? r - (r%5) : r - (r%5) + 5;
                  g = (g % 2 < 3) ? g - (g%5) : g - (g%5) + 5;
                  b = (b % 2 < 3) ? b - (b%5) : b - (b%5) + 5;
                }
                var c = jQuery.Color(r,g,b);
                obj[(pix+1)/4 - 1] = c.saturation(0).red();
                window.becky = obj;
              }
            }
            ctxt = null;
          } catch(error){
            if (!rv.errors){
              rv.errors = [];
            }
            rv.errors.push(error);
          }
        }
      });
      return rv;
    };
  } else{
    $.fn.noiseyTop = function(){
        throw new Error('canvas element support required!');
    };
  }
})(jQuery, this, this.document);

// for (var i = 0; i < 13; ++i) {
//   var s = ''
//   for (var j = 0; j < 50; ++j) {
//     var p = i * 50 + j;
//     var c = window.becky[p];
//     if (c < 20)
//       s += '+'
//     else if (c < 100)
//       s += '-'
//     else
//       s += ' '
//   }
//   console.log(s)
// }
// var edges = [];

(function($, window, document, undefined){
  var canvas = document.createElement('canvas');
  if (canvas && canvas.getContext){
    $.fn.get_colors = function(squish){
      var rv = [];
      this.each(function(){
        var tagname = this.tagName.toLowerCase();
        if ((tagname === 'img') || (tagname === 'canvas') || (tagname === 'video')){
          //something bad can happend when drawing the image
          try{
            var w = $(this).width();//this.getAttribute('width');
            var h = $(this).height();//this.getAttribute('height');
            w = 100;
            h = 100;
            canvas.setAttribute('width', w);  
            canvas.setAttribute('height', h); 
            var ctxt = canvas.getContext('2d');
            if (ctxt){
              ctxt.drawImage(this, 0, 0, w, h);
              var imagedata = ctxt.getImageData(0, 0, w, h * 2.0 / 3.0);
              var data = imagedata.data;
              //log('imagedata.width:'+imagedata.width+' imagedata.height:'+imagedata.height+' w:'+w+' h:'+h);
              var obj = {};
              var color = '';
              var r = 0, g = 0, b = 0, a = 0;
              var pix = data.length;
              for (pix--; pix > 2; pix-=4){
                //a = data[pix - 0];
                b = data[pix - 1];
                g = data[pix - 2];
                r = data[pix - 3];
                if (modBy == 5) {
                  r = (r % 5 < 3) ? r - (r%5) : r - (r%5) + 5;
                  g = (g % 2 < 3) ? g - (g%5) : g - (g%5) + 5;
                  b = (b % 2 < 3) ? b - (b%5) : b - (b%5) + 5;
                } else if (modBy == 3) {
                  r = r - (r % 3);
                  g = g - (g % 3);
                  b = b - (b % 3);
                } else if (modBy == 2) {
                  r = r - (r % 2);
                  g = g - (g % 2);
                  b = b - (b % 2);
                }
                color = [r,g,b];
                color_key = r+"_"+g+"_"+b;
                if (squish) {
                  if (r < 16) r = '0' + r.toString(16);
                  else r = r.toString(16);
                  if (g < 16) g = '0' + g.toString(16);
                  else g = g.toString(16);
                  if (b < 16) b = '0' + b.toString(16);
                  else b = b.toString(16);
                  //if (a < 16) a = '0' + r.toString(16);
                  //else a = a.toString(16);
                  //color = r + g + b + a;
                  color = r + g + b;
                  color_key = color;
                }
                if (obj[color_key] > 0) ++obj[color_key];
                else obj[color_key] = 1;
              }
              rv.push(obj);
              imagedata = data = obj = null;
            }
            ctxt = null;
          } catch(error){
            if (!rv.errors){
              rv.errors = [];
            }
            rv.errors.push(error);
          }
        }
      });
      return rv;
    };
  } else{
    $.fn.get_colors = function(){
        throw new Error('canvas element support required!');
    };
  }
})(jQuery, this, this.document);

var modBy = 2;


var printCheatSheet = function() {
  if ($('.cheat').length == 0) {
    $('body').append('<div class="cheat"></div>');
  }
  $('.cheat').html('<div class="final"></div><div class="merge"></div><div class="reduce"></div><div class="orig"></div>')
  _.each(window.rebecca.reduce, function(count, color) {
    $('.cheat .reduce').append('<div class="sample" style="background-color: #'+color+';"></div>')
  });
  _.each(window.rebecca.merge, function(count, color) {
    var c = jQuery.Color('#'+color);
    var sat = Math.round(c.saturation() * 10);
    var lit = Math.round(c.lightness() * 10);

    var s = "Color: "+c.toHexString()+" ["+count+"], Saturation: "+sat+", Lightness: "+lit;
    $('.cheat .merge').append('<div class="sample" style="background-color: #'+color+';" title="'+s+'"></div>')
  });
  _.each(window.rebecca.fin, function(count, color) {
    var c = jQuery.Color('#'+color);
    var sat = Math.round(c.saturation() * 100);
    var lit = Math.round(c.lightness() * 100);

    var s = "Color: "+c.toHexString()+" ["+count+"], Saturation: "+sat+", Lightness: "+lit;
    $('.cheat .final').append('<div class="sample" style="background-color: #'+color+';" title="'+s+'"></div>')
  });
  _.each(window.rebecca.x, function(count, color) {
    $('.cheat .orig').append('<div class="sample" style="background-color: #'+color+';"></div>')
  });
}
















/*
Copyright (c) 2007 John Dyer (http://johndyer.name)
MIT style license
*/

if (!window.Refresh) Refresh = {};
if (!Refresh.Web) Refresh.Web = {};

Refresh.Web.Color = function(init) {  
  var color = {
    r: 0,
    g: 0,
    b: 0,
    
    h: 0,
    s: 0,
    v: 0,
    
    hex: '',
    
    setRgb: function(r, g, b) {
      this.r = r;
      this.g = g;
      this.b = b;
            
      var newHsv = Refresh.Web.ColorMethods.rgbToHsv(this);
      this.h = newHsv.h;
      this.s = newHsv.s;
      this.v = newHsv.v;
      
      this.hex = Refresh.Web.ColorMethods.rgbToHex(this);         
    },
    
    setHsv: function(h, s, v) {
      this.h = h;
      this.s = s;
      this.v = v;
      
      var newRgb = Refresh.Web.ColorMethods.hsvToRgb(this);
      this.r = newRgb.r;
      this.g = newRgb.g;
      this.b = newRgb.b;  
      
      this.hex = Refresh.Web.ColorMethods.rgbToHex(newRgb); 
    },
    
    setHex: function(hex) {
      this.hex = hex;
      
      var newRgb = Refresh.Web.ColorMethods.hexToRgb(this.hex);
      this.r = newRgb.r;
      this.g = newRgb.g;
      this.b = newRgb.b;
      
      var newHsv = Refresh.Web.ColorMethods.rgbToHsv(newRgb);
      this.h = newHsv.h;
      this.s = newHsv.s;
      this.v = newHsv.v;      
    }
  };
  
  if (init) {
    if (init.hex)
      color.setHex(init.hex);
    else if (init.r)
      color.setRgb(init.r, init.g, init.b);
    else if (init.h)
      color.setHsv(init.h, init.s, init.v);     
  }
  
  return color;
};
Refresh.Web.ColorMethods = {
  hexToRgb: function(hex) {
    hex = this.validateHex(hex);

    var r='00', g='00', b='00';
    
    /*
    if (hex.length == 3) {
      r = hex.substring(0,1);
      g = hex.substring(1,2);
      b = hex.substring(2,3);
    } else if (hex.length == 6) {
      r = hex.substring(0,2);
      g = hex.substring(2,4);
      b = hex.substring(4,6);
    */
    if (hex.length == 6) {
      r = hex.substring(0,2);
      g = hex.substring(2,4);
      b = hex.substring(4,6); 
    } else {
      if (hex.length > 4) {
        r = hex.substring(4, hex.length);
        hex = hex.substring(0,4);
      }
      if (hex.length > 2) {
        g = hex.substring(2,hex.length);
        hex = hex.substring(0,2);
      }
      if (hex.length > 0) {
        b = hex.substring(0,hex.length);
      }         
    }
    
    return { r:this.hexToInt(r), g:this.hexToInt(g), b:this.hexToInt(b) };
  },
  validateHex: function(hex) {
    hex = new String(hex).toUpperCase();
    hex = hex.replace(/[^A-F0-9]/g, '0');
    if (hex.length > 6) hex = hex.substring(0, 6);
    return hex;
  },
  webSafeDec: function (dec) {
    dec = Math.round(dec / 51);
    dec *= 51;
    return dec;
  },
  hexToWebSafe: function (hex) {
    var r, g, b;

    if (hex.length == 3) {
      r = hex.substring(0,1);
      g = hex.substring(1,1);
      b = hex.substring(2,1);
    } else {
      r = hex.substring(0,2);
      g = hex.substring(2,4);
      b = hex.substring(4,6);
    }
    return intToHex(this.webSafeDec(this.hexToInt(r))) + this.intToHex(this.webSafeDec(this.hexToInt(g))) + this.intToHex(this.webSafeDec(this.hexToInt(b)));
  },
  rgbToWebSafe: function(rgb) {
    return {r: this.webSafeDec(rgb.r), g: this.webSafeDec(rgb.g), b: this.webSafeDec(rgb.b) };
  },
  rgbToHex: function (rgb) {
    return this.intToHex(rgb.r) + this.intToHex(rgb.g) + this.intToHex(rgb.b);
  },
  intToHex: function (dec){
    var result = (parseInt(dec).toString(16));
    if (result.length == 1)
      result = ("0" + result);
    return result.toUpperCase();
  },
  hexToInt: function (hex){
    return(parseInt(hex,16));
  },
  rgbToHsv: function (rgb) {

    var r = rgb.r / 255;
    var g = rgb.g / 255;
    var b = rgb.b / 255;

    hsv = {h:0, s:0, v:0};

    var min = 0
    var max = 0;

    if (r >= g && r >= b) {
      max = r;
      min = (g > b) ? b : g;
    } else if (g >= b && g >= r) {
      max = g;
      min = (r > b) ? b : r;
    } else {
      max = b;
      min = (g > r) ? r : g;
    }

    hsv.v = max;
    hsv.s = (max) ? ((max - min) / max) : 0;

    if (!hsv.s) {
      hsv.h = 0;
    } else {
      delta = max - min;
      if (r == max) {
        hsv.h = (g - b) / delta;
      } else if (g == max) {
        hsv.h = 2 + (b - r) / delta;
      } else {
        hsv.h = 4 + (r - g) / delta;
      }

      hsv.h = parseInt(hsv.h * 60);
      if (hsv.h < 0) {
        hsv.h += 360;
      }
    }
    
    hsv.s = parseInt(hsv.s * 100);
    hsv.v = parseInt(hsv.v * 100);

    return hsv;
  },
  hsvToRgb: function (hsv) {

    rgb = {r:0, g:0, b:0};
    
    var h = hsv.h;
    var s = hsv.s;
    var v = hsv.v;

    if (s == 0) {
      if (v == 0) {
        rgb.r = rgb.g = rgb.b = 0;
      } else {
        rgb.r = rgb.g = rgb.b = parseInt(v * 255 / 100);
      }
    } else {
      if (h == 360) {
        h = 0;
      }
      h /= 60;

      // 100 scale
      s = s/100;
      v = v/100;

      var i = parseInt(h);
      var f = h - i;
      var p = v * (1 - s);
      var q = v * (1 - (s * f));
      var t = v * (1 - (s * (1 - f)));
      switch (i) {
        case 0:
          rgb.r = v;
          rgb.g = t;
          rgb.b = p;
          break;
        case 1:
          rgb.r = q;
          rgb.g = v;
          rgb.b = p;
          break;
        case 2:
          rgb.r = p;
          rgb.g = v;
          rgb.b = t;
          break;
        case 3:
          rgb.r = p;
          rgb.g = q;
          rgb.b = v;
          break;
        case 4:
          rgb.r = t;
          rgb.g = p;
          rgb.b = v;
          break;
        case 5:
          rgb.r = v;
          rgb.g = p;
          rgb.b = q;
          break;
      }

      rgb.r = parseInt(rgb.r * 255);
      rgb.g = parseInt(rgb.g * 255);
      rgb.b = parseInt(rgb.b * 255);
    }

    return rgb;
  }
};