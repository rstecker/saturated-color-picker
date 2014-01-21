/*globals Main, R, zot, console */
(function() {

// ----------
var component = Main.NormalItem = function() {
  console.error('Only create subclasses');
};

// ----------
component.prototype = {
  // ----------
  _init: function(name, data, $parent) {
    var self = this;

    this._favorite = false;
    this.$el = Main.template('normal-item', data)
      .appendTo($parent)
      .mouseenter(function() {
        self.$el.find('.sleeve, .seal, .sleeve-content, .hover-controls').stop(true).animate({
          top: '40%'
        }, 100, 'easeOutQuad');

        self.$el.find('.explanation').stop(true).animate({
          opacity: 1,
          top: '40%'
        }, 100, 'easeOutQuad');          

        clearTimeout(self._timeout);
        self._timeout = setTimeout(function() {
          self.$el.find('.hover-controls > .inner').stop(true).animate({
            opacity: 1
          }, 200, 'linear');

          self._timeout = setTimeout(function() {
            self.$el.find('.seal').hide();
          }, 200);
        }, 1);


        // self.$el.find('.sleeve, .seal, .sleeve-content').stop(true).animate({
        //   top: '40%'
        // });

        // self.$el.find('.hover-controls').stop(true).animate({
        //   top: '40%', 
        //   opacity: 1
        // }, function() {
        //   self.$el.find('.seal').hide();
        // });

        // self.$el.find('.explanation').fadeIn();

      })
      .mouseleave(function() {
        var slideDown = function() {
          self.$el.find('.sleeve, .seal, .sleeve-content, .hover-controls').stop(true).animate({
            top: '50%'
          }, 100, 'easeOutQuad');          
  
          self.$el.find('.explanation').stop(true).animate({
            opacity: 0,
            top: '43%'
          }, 100, 'easeOutQuad');          
        };

        self.$el.find('.seal').show();

        self.$el.find('.hover-controls > .inner').stop(true).animate({
          opacity: 0
        }, 200, 'linear');

        clearTimeout(self._timeout);
        self._timeout = setTimeout(slideDown, 1);

        // self.$el.find('.seal').show();
        // self.$el.find('.sleeve, .seal, .sleeve-content').stop(true).animate({
        //   top: '50%'
        // });

        // self.$el.find('.hover-controls').stop(true).animate({
        //   top: '50%', 
        //   opacity: 0
        // });

        // self.$el.find('.explanation').fadeOut();
      });

    this.$el.find('.hover-controls > .inner, .explanation').css({
      opacity: 0
    });

    Main.template(name, data)
      .appendTo(this.$el.find('.more-unit'));

    this.$item = this.$el.find('.item');

    this.tooltip(this.$el.find('.score-friends'), 'Friend Rating',
      'Rated by ' + Main.random(2, 20) + ' friends');

    this.tooltip(this.$el.find('.score-critics'), 'Critic Rating',
      Main.random(20, 80) + ' reviews on Metacritic');

    this.tooltip(this.$el.find('.vote-down'), 'Didn\'t like this');
    this.tooltip(this.$el.find('.vote-up'), 'Recommend this');

    this.$voteDown = this.$el.find('.vote-down')
      .click(function(event) {
        event.stopPropagation();

        self._vote = 'down';
        self.update();
        self.votedDialog(self.$voteDown);
      });

    this.$voteUp = this.$el.find('.vote-up')
      .click(function(event) {
        event.stopPropagation();

        self._vote = 'up';
        self.update();
        self.votedDialog(self.$voteUp);
      });

    $(window)
      .click(function(event) {
        var $target = $(event.target);
        if (component.dialog && !$target.closest(component.dialog.$el).length) {
          component.closeDialog();
        }
      });
  },

  // ----------
  update: function() {
    this.$voteDown.toggleClass('selected', this._vote == 'down');
    this.$voteUp.toggleClass('selected', this._vote == 'up');

    if (component.dialog) {
      component.dialog.$favorites.find('.on').toggle(this._favorite);
      component.dialog.$favorites.find('.off').toggle(!this._favorite);
    }
  },

  // ----------
  tooltip: function($host, topline, bottomline) {
    var self = this;

    this.closeTooltip();

    $host.hover(function() {
      if (self.$item.hasClass('has-popup')) {
        return;
      }

      var config = {
        topline: topline,
        bottomline: bottomline
      };

      self.$tooltip = Main.template('tooltip', config)
        .appendTo('.main-content');

      Main.popupPosition(self.$tooltip, $host);
    }, function() {
      self.closeTooltip();
    });
  },

  // ----------
  closeTooltip: function() {
    if (this.$tooltip) {
      this.$tooltip.remove();
      this.$tooltip = null;
    }
  },

  // ----------
  votedDialog: function($host) {
    var self = this;

    this.closeTooltip();
    component.closeDialog();

    var data = {
      userIcon: R.currentUser.get('icon')
    };

    component.dialog = {
      $item: this.$item
    };

    var $el = component.dialog.$el = Main.template('voted', data)
      .appendTo('.main-content');

    if ($host == this.$voteDown) {
      $el.find('.favorites, .divider').hide();
    }

    Main.popupPosition($el, $host);

    component.dialog.$favorites = $el.find('.favorites')
      .click(function() {
        self._favorite = !self._favorite;
        self.update();
      });

    $el.find('.comment .prompt')
      .click(function() {
        var $box = $el.find('.box');
        var boxBox = zot.bounds($box);
        var w = 370;
        var h = 120;

        var elBox = zot.outerBoundsInPage($el);
        var hostX = zot.boundsInPage($host).center().x;
        var popupLeft = hostX - (w / 2);
        var widthDiff = $box.outerWidth() - boxBox.width;
        var realWidth = w + widthDiff;
        
        var windowBox = zot.bounds($(window));
        var rightSide = windowBox.width - 6;
        if (popupLeft + realWidth > rightSide) {
          popupLeft = rightSide - realWidth;
        }

        $el.animate({
          left: popupLeft, 
          top: elBox.top - (h - boxBox.height) 
        });

        $box.animate({
          width: w,
          height: h
        });

        var $arrow = $el.find('.down-arrow');
        var arrowLeft = Main.figurePopupArrowLeft({
          popupLeft: popupLeft,
          $host: $host,
          $arrow: $arrow
        });

        $arrow.animate({
          left: arrowLeft
        });

        $el.find('.comment .prompt, .divider, .favorites').not('.for-bottom')
          .fadeOut(function() {
            $el.find('textarea')
              .show()
              .focus();
          });

        $el.find('.close')
          .fadeIn()
          .click(function() {
            component.closeDialog();
          });

        $el.find('button')
          .click(function() {
            $el.fadeOut(function() {
              component.closeDialog();
            });
          });

        $el.find('.bottom')
          .fadeIn();
      });

    this.$item.addClass('has-popup');
    this.update();
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
