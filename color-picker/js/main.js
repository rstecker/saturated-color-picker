/*globals rdioUtils, Main, R, zot, console */

(function() {

  // ----------
  window.Main = {
    albums: [],

    // ----------
    init: function() {
      var self = this;

      this.log('starting');

      if (!rdioUtils.startupChecks()) {
        return;
      }

      this._columns = -1;

      this.dummyText = 'If you have a problem if no one else can help and if you can find them maybe you can hire The A-Team. I have always wanted to have a neighbor just like you. I\'ve always wanted to live in a neighborhood with you. Space. The final frontier. These are the voyages of the Starship Enterprise. These Happy Days are yours and mine Happy Days. Movin\' on up to the east side. We finally got a piece of the pie. Michael Knight a young loner on a crusade to champion the cause of the innocent. The helpless. The powerless in a world of criminals who operate above the law. As long as we live its you and me baby. There ain\'t nothin\' wrong with that. And you know where you were then. Girls were girls and men were men. Mister we could use a man like Herbert Hoover again!';

      R.ready(function() {
        if (R.authenticated()) {
          self.getStarted();
        } else {
          $('.color_console').html('')
          $('.main-content').append(self.template('no-auth'));

          $('.auth').click(function() {
            R.authenticate(function(authenticated) {
              if (authenticated) {
                $('.no-auth').remove();
                self.getStarted();
              }
            });
          });
        }
      });

      $(window)
        .resize(function() {
          self.log('resize');
        });
    },
    extractPrettyPeople: function() {
      var self = this;
      self.log('extracting people');
      var allPeople = [];
      var person;
      var following = R.currentUser.get('following');
      for (var i = 0; i < following.length; i++) {
        person = following.at(i);
        allPeople.push({
          icon: person.get('icon'),
          firstName: person.get('firstName'),
          lastName: person.get('lastName')
        });
      }

      self.log('filtering people');
      var prettyPeople = _.filter(allPeople, function(person) {
        return !/no-user-image/i.test(person.icon);
      });

      self.log('adding reasons');
      _.each(prettyPeople, function(v, i) {
        v.reason1 = 'Followed by ' + allPeople[self.random(0, allPeople.length)].firstName + ',';
        v.reason2 = allPeople[self.random(0, allPeople.length)].firstName + ' & ' + self.random(2, 22) + ' others.';
      });
      return prettyPeople;
    },
    showSomeAlbums: function(prettyPeople, newReleasesRequestResult, topPlaylistsRequestResult, stationsRequestResult) {
      var self = this;
      var $row, $inner;

      self.log('creating units');
      var cleanserCountdown = -1;
      newReleasesRequestResult = _.shuffle(newReleasesRequestResult)
      topPlaylistsRequestResult = _.shuffle(topPlaylistsRequestResult)
      var body = $('body');
      this.picker = new window.ColorPicker();
      for (var i = 0; i < newReleasesRequestResult.length; ++i) {
        var r = newReleasesRequestResult[i];
        var data = { icon: this.correctIcon(r.icon), artist: r.artist, album: r.name }
        var el = Main.template('alb-sample', data).appendTo(body);
        el.click(function(e) {
          return function() { self.picker.colorArtwork(e);}
        }(el));
      }
      
      var pick = _.debounce(_.bind(this.picker.printValidColors, this.picker), 500);
      $('.color-range').change(pick);
      pick();
      var recalc = _.debounce(_.bind(this.picker.reCalcFinalColors, this.picker), 500);
      $('.calc-weight').click(recalc);
      $('.custom-url').change(function() {
        var url = $('.custom-url').val();
        $($('.artwork')[0]).attr('src',url);
        $($('.primary')[0]).text('This is now displaying a custom URL')
        $($('.secondary')[0]).text('Whatever kale chips Blue Bottle, put a bird on it beer')
        _.delay(function() {
          $($('.artwork')[0]).click();
        }, 1000);
      });
      $('.pre-merge-reduce').click(function() {
        $('.pre-merge-reduce').toggleClass('yes');
      })
      this.picker.startProcessingMonitor();
      self.log('initial layout');
      self.log('startup complete');
    },
    // ----------
    getStarted: function() {
      var self = this;

      this.log('authenticated');

      var newReleasesRequestResult;
      var topPlaylistsRequestResult;
      var stationsRequestResult;
      var followingDeferred = $.Deferred();
      var newReleasesRequestDeferred = $.Deferred();
      var topPlaylistsRequestDeferred = $.Deferred();
      var stationsRequestDeferred = $.Deferred();

      $.when(followingDeferred, newReleasesRequestDeferred)
        .done(function() {
          console.log("Loaded New Releases");
          var pp = self.extractPrettyPeople();
          self.showSomeAlbums(pp, newReleasesRequestResult, topPlaylistsRequestResult, stationsRequestResult);
          var cheatEl = $('body').append("<div class='cheat-option'><sub>click here for cheat sheet</sub></div>");
          $('body').find('.cheat-option').click(function() { printCheatSheet(); });
        })
      
      R.currentUser.trackFollowing(function() {
        self.log('got following');
        followingDeferred.resolve();
      });

      R.request({
        method: 'getTopCharts',
        content: {
          type: 'Album',
          count: 100,
          extras: ['tracks']
        },
        success: function(response) {
          self.log('got new releases');
          newReleasesRequestResult = response.result;
          newReleasesRequestDeferred.resolve();
        },
        error: function(response) {
          $(".error").text(response.message);
        }
      });

      // R.request({
      //   method: 'getTopCharts',
      //   content: {
      //     type: 'Playlist',
      //     count: 100
      //   },
      //   success: function(response) {
      //     self.log('got top charts');
      //     topPlaylistsRequestResult = response.result;
      //     topPlaylistsRequestDeferred.resolve();
      //   },
      //   error: function(response) {
      //     $(".error").text(response.message);
      //   }
      // });

      // R.request({
      //   method: 'getStations',
      //   content: {
      //     start: 5,
      //     count: 20
      //     //'[{"field":"description","extras":["*.WEB"]},{"field":"artists","extras":["*.WEB","-*","name","url"]}]'
      //     //{"field":"description","extras":["*.WEB"]},{"field":"artists","extras":["*.WEB","-*","name","url"]}
      //   },
      //   success: function(response) {
      //     self.log('got stations');
      //     stationsRequestResult = _.filter(response.result, function(s) {
      //       return !!s.icon;
      //     })
      //     stationsRequestDeferred.resolve();
      //   },
      //   error: function(response) {
      //     $(".error").text(response.message);
      //   }
      // });
    },

    // ----------
    template: function(name, config) {
      var rawTemplate = $.trim($("#" + name + "-template").text());
      var template = _.template(rawTemplate);
      var html = template(config);
      var $div = $('<div>')
        .addClass(name)
        .html(html);

      return $div;
    },

    // ----------
    log: function(message) {
      /*global console*/
      if (window.console && console.log) {
        console.log('[Music Feed] ' + message);
      }
    },

    // ----------
    // Returns a random integer between low and high, including low but not high
    random: function(low, high) {
      return low + Math.floor(Math.random() * (high - low));
    },
    correctIcon: function(iconSrc) {
      if (!iconSrc) {
        return iconSrc;
      }
      iconSrc = iconSrc.replace(/w=200&h=200/, 'w=400&h=400');
      iconSrc = iconSrc.replace(/200\.jpg/, '400.jpg');
      return iconSrc;
    }
  };

  // ----------
  $(document).ready(function() {
    Main.init();
  });

})();
