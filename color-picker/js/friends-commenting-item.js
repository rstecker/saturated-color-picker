/*globals Main, R, zot */
(function() {

var superClass = Main.NormalItem.prototype;

// ----------
var component = Main.FriendsCommentingItem = function(data) {
  var comments = _.shuffle([
    'No phone no lights no motor car not a single luxury. Like Robinson Crusoe it\'s primitive as can be.',
    'Fish don\'t fry in the kitchen and beans don\'t burn on the grill. Took a whole lotta tryin\' just to get up that hill.',
    'Now the world don\'t move to the beat of just one drum. What might be right for you may not be right for some?',
    'They were four men living all together yet they were all alone.',
    'Flying away on a wing and a prayer. Who could it be? Believe it or not its just me.',
    'Go Speed Racer. Go Speed Racer. Go Speed Racer go!',
    'Space. The final frontier. These are the voyages of the Starship Enterprise!',
    'Straightnin\' the curves. Flatnin\' the hills Someday the mountain might get ‘em but the law never will.',
    'Doin\' it our way. There\'s nothing we wont try. Never heard the word impossible. This time there\'s no stopping us.',
    'The ship set ground on the shore of this uncharted desert isle with Gilligan the Skipper too the millionaire and his wife.',
    'It\'s time to play the music. It\'s time to light the lights. It\'s time to meet the Muppets on the Muppet Show tonight. It\'s time to put on makeup. It\'s time to dress up right. It\'s time to raise the curtain on the Muppet Show tonight.',
    'They\'re creepy and they\'re kooky mysterious and spooky. They\'re all together ooky the Addams Family.'
  ]);

  var time = Main.random(3, 50);
  _.each(data.friends, function(v, i) {
    v.comment = comments.pop();
    v.time = time;
    time = Main.random(2, time);
  });

  data.replyCount = Main.random(2, 50);

  superClass._init.call(this, 'friends-commenting', data);
};

// ----------
component.prototype = _.extend(superClass, {

});

})();
