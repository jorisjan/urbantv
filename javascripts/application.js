
var megaplaya = false;
var search_visible = true;
var keyboard_disabled = false;


$(document).ready(function(){
  load_player();
});

// Helpers
function debug(string){
  try {
    if(arguments.length > 1) {
      console.log(arguments);
    }
    else {
      console.log(string);
    }
  } catch(e) { console.log('uh oh'); }
}

function shuffle(v){
  for(var j, x, i = v.length; i; j = parseInt(Math.random() * i, 0), x = v[--i], v[i] = v[j], v[j] = x);
  return v;
}


// VHX Megaplaya scaffolding
function load_player(){
  $('#player').flash({
    swf: 'http://vhx.tv/embed/megaplaya',
    width: '100%;',
    height: '100%',
    allowFullScreen: true,
    allowScriptAccess: "always"
  });
}

function megaplaya_loaded(){
  debug(">> megaplaya_loaded()");
  megaplaya = $('#player').children()[0];
  megaplaya_addListeners();
  load_urban_videos();
}

function megaplaya_call(method){
  // "pause" => megaplaya.api_pause();
  (megaplaya["api_" + method])();
}

function megaplaya_addListeners(){
  var events = ['onVideoFinish', 'onVideoLoad', 'onError', 'onPause', 'onPlay', 'onFullscreen', 'onPlaybarShow', 'onPlaybarHide', 'onKeyboardDown'];

  $.each(events, function(index, value) {
    megaplaya.api_addListener(value, "function() { megaplaya_callback('" + value + "', arguments); }")
  });
}

function megaplaya_callback(event_name, args) {

  // TODO just look for and call functions like "#{event_name}_callback" if defined
  // all megaplaya apps could work like this, and the above scaffolding be builtin

  switch (event_name) {
    case 'onVideoLoad':
      var video = megaplaya.api_getCurrentVideo();
      megaplaya.api_growl(video.word+': '+video.definition);
      debug(video);
    default:
      debug("Unhandled megaplaya event: ", event_name, args);
      break;
  }
}


// Urban Dictionary data loaders
function load_urban_videos(){
  var url = 'http://www.urbandictionary.com/iphone/search/videos?callback=load_urban_videos_callback&random=1';
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', url);
  document.documentElement.firstChild.appendChild(script);
}

function load_urban_videos_callback(resp){
  debug(">> load_urban_videos_callback() - adding listeners", resp);

  var urls = $.map(resp.videos, function (entry, i) {
    entry.url = "http://youtube.com/watch?v=" + entry.youtube_id;
    return entry;
  });
  debug(">> callback(): loading "+urls.length+" videos...");

  // 1st: show word, hide other controls
  $('#overlay').show();
  $('#sidebar').hide();

  // 2nd: show definition slideout
  $('#overlay').fadeOut('slow');
  // TODO...

  // 3rd: hide controls
  var hide_controls_timer = setTimeout(function(){

    // TODO slide sidebar left

    $('#player').show();
    $('#player').css('z-index', 10);
  }, 3000);

  urls = shuffle(urls);
  return megaplaya.api_playQueue(urls);
}
