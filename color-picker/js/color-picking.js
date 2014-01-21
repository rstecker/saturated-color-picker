
function ColorPicker() {
};
(function() {

window.ColorPicker.prototype = {
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
    // check for colors that were too unique to merge in! 
    _.each(reduced_x_keys, function(color) {
      var found = false;
      _.each(merged_x, function(colorList, key) {
        if (found)
          return;
        found = (key == color) || _.contains(_.keys(colorList), color)
      })
      if (!found) {
        merged_x[color] = {};
        merged_x[color][color] = reduced_x[color];
        console.log(" ----> found dangling color "+color);
      }
    })
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
  },
  _isLeft: function(lineA, lineB, point) {
    return ((lineB[0] - lineA[0])*(point[1] - lineA[1]) - (lineB[1] - lineA[1])*(point[0] - lineA[0])) > 0
  },
  _pruneColors: function(orig_x, reduced_x) {
    var self = this;
    _.each(_.keys(orig_x[0]), function(color){
      var c = Refresh.Web.Color({hex: color})
      var x = c.s;
      var y = c.v;
      var pass = false;
      var list = [];
      if (c.h > 230) { // blue & magenta
        pass = self._isLeft([54,98], [46,33], [x,y]);
        pass = pass && self._isLeft([46,33], [100,31], [x,y]);
        // pass = false;   // DEBUGGING
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
  colorArtwork: function(givenEl) {
    $('.final_color').html('');
    $('.final_colors').html('');
    $('.merged_colors').html('');
    $('.pruned_colors').html('');
    $('.initial_colors').html('');
    this.$el = givenEl;
    console.log(" -- ["+new Date()+"] starting color sample ");
    x = this.$el.find('.artwork').get_colors(true);
    this.printColorSet(_.keys(x[0]), $('.color_console .initial_colors'));
    var reduced_x = {};
    this._pruneColors(x, reduced_x);
    this.printColorSet(_.keys(reduced_x), $('.color_console .pruned_colors'));

    console.log(" -- ["+new Date()+"] just ran PRUNE : "+_.keys(reduced_x).length);
    if (_.keys(reduced_x).length == 0) {
      console.log(" THE FUCK -- we failed to prune anything, bailing");
      return;
    }

    if (_.keys(reduced_x).length > 1000) {
      console.log(" TOO MANY COLORS, chopping shit down");
      reduced_reduced_x = {};
      _.each(reduced_x, function(value, key) {
        if (value > 2) {
          reduced_reduced_x[key] = value;
        }
      });
      reduced_x = reduced_reduced_x;
      console.log(" --> clipped to the 2s, now we have "+_.keys(reduced_x).length)
    }

    var merged_x = null;
    for (var i = 100; i > 3; i -= i/2) {
      merged_x = this._mergeColors(reduced_x, i);
      console.log(" --- ["+new Date()+"] just ran MERGED ["+i+"]: "+_.keys(merged_x).length);
      // Needs more than 8 options
      // If we're on i < 13 (4th round), we'll accept 5 options
      if (_.keys(merged_x).length >= 8 || (i < 13 && _.keys(merged_x).length >= 5)) {
        break;
      }
    }
    this.printColorSet(_.keys(merged_x), $('.color_console .merged_colors'));

    var final_x = {};
    if (_.keys(merged_x).length == 0) {
      console.log("No merging found, going with reduced");
      merged_x = reduced_x;
      final_x = merged_x;
      this.printColorSet(_.keys(merged_x), $('.color_console .merged_colors'));
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
    this.printColorSet(_.keys(final_x), $('.color_console .final_colors'));

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
    var color = Refresh.Web.Color({ hex: final_color[1] })
    var data = {
      color_hex: '#'+final_color[1],
      color_h: color.h,
      color_s: color.s,
      color_l: color.v
    }
    Main.template('color-sample', data).find('.tiny-sample').appendTo($('.final_color'));

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
  },
  startProcessingMonitor: function() {
    $('.processing').toggleClass('go');
    var self = this;
    _.defer(function(){
      self.startProcessingMonitor();
    });
  },
  printValidColors: function() {
    var hue = parseInt($('.color-range').val());
    $('.color-range-value').text(hue);

    console.log(" -- starting print valid colors : "+new Date()+" w/ hue "+hue);
    var all_colors = {};
    var reduced_colors = [];
    $('.color_console .legal_colors').html('');

    for (var s = 0; s <= 100; ++s){
      for (var v = 0; v <= 100; ++v){
        var c = Refresh.Web.Color({ h: hue, v: v, s: s})
        var color = c.hex;
        all_colors[color] = c;
      }
    }
    console.log(" -- starting pruning of valid colors : "+new Date())
    this._pruneColors([all_colors], reduced_colors)
    console.log(" -- starting printing of valid colors : "+new Date())
    var size = 5;
    _.each(reduced_colors, function(val, key) {
      var c = val;
      var color = key;
      var data = {
        color_hex: '#'+color,
        color_h: c.h,
        color_s: c.s,
        color_l: c.v
      }
      var el = Main.template('color-sample', data).find('.tiny-sample').appendTo($('.color_console .legal_colors'));
      el.css('top', (c.s * size) + 'px');
      el.css('left', (c.v * size) + 'px');
      el.css('position', 'absolute');
      el.css('width', size+'px');
      el.css('height', size+'px');
    });
  },
  printColorSet: function(keys, destEl) {
    destEl.html('');
    _.each(keys.sort(), function(color){
      var c = Refresh.Web.Color({hex: color})
      var data = {
        color_hex: '#'+color,
        color_h: c.h,
        color_s: c.s,
        color_l: c.v
      }
      Main.template('color-sample', data).find('.tiny-sample').appendTo(destEl);
    });
  }
}
})();



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