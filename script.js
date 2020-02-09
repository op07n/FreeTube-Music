var parsedQuery = queryToDict(window.location.search);
var youtubeVideoID = parsedQuery.v;
var youtubePlaylistID = parsedQuery.p;

var mode;
if (youtubePlaylistID != undefined) {
	mode = "playlist";
} else if (youtubeVideoID != undefined) {
	mode = "video";
} else {
	mode = "home";
}

function updateBar() {
	try {
		document.getElementById("bar").style.width = ((player.getCurrentTime()/player.getDuration())*100).toString()+"%";
	} finally {
		window.setTimeout(updateBar,500);
	}
}

function toggleMenu() {
	if (document.getElementById("menu").className == "homepage menu menuHidden") {
		document.getElementById("menu").className = "homepage menu";
	} else {
		document.getElementById("menu").className = "homepage menu menuHidden";
	}
}

// TRIPLE CLICK FOR DEBUG
$(document).on('click', function(e) {
	if (e.detail  === 3) {
		var cmd = prompt("Welcome to FreeTube Music console. Enter command:");
		if (cmd == "clear") {
			if (confirm("Are you sure you want to clear all local data? This action cannot be undone!")) {
				debugRemoveLS();
				setup();
				alert("All local data from FreeTube music has been removed.");
			}
		} else if (cmd == "show") {
			for (var i = 0; i < localStorage.length; i++) {
				alert("Local Storage Item 1/"+localStorage.length+" - "+localStorage.key(i)+"\n"+localStorage.getItem(localStorage.key(i)));
			}
		} else if (cmd == "refresh") {
			window.location.reload(true);
		} else {
			alert("Unknown command. Commands are: clear show refresh");
		}
	}
});

var ready = false;
var loadedPlaylistInfos = false;
var startedLPI = false;

var playlistInfos = [];
var completedRequests = 0;

function loadPlaylistInfos() {
	if (player.getPlaylist().length > 1) {
		playlistInfos = Array(player.getPlaylist().length)
		player.getPlaylist().forEach(function(value,index) {
			getSingularVideo(value,index);
		});
	} else {
		window.setTimeout(loadPlaylistInfos,500);
	}
}

function queueReady() {
	document.getElementsByClassName("queueLoading")[0].className = "queueHidden";
	updatePlaylistInfos();
}

function updatePlaylistInfos() {
	var currentIndex = player.getPlaylistIndex();
	document.getElementById("queueNext").innerHTML = "Next: "+playlistInfos[(currentIndex+1)%playlistInfos.length][1]+"<br><span style='font-size:25px'>"+limitLength(removeBrackets(playlistInfos[(currentIndex+1)%playlistInfos.length][0],30))+"</span>";
	document.getElementById("queueContent").innerHTML = "";
	playlistInfos.forEach(function(value,index) {
		if (index == currentIndex) {
			document.getElementById("queueContent").innerHTML += "<div class='queueItem blurple' onclick='selectSong("+index.toString()+");'>"+value[1]+"<br><span style='font-size:25px'>"+removeBrackets(value[0])+"</span></div>";
		} else {
			document.getElementById("queueContent").innerHTML += "<div class='queueItem' onclick='selectSong("+index.toString()+");'>"+value[1]+"<br><span style='font-size:25px'>"+removeBrackets(value[0])+"</span></div>";
		}
	});
}

function selectSong(index) {
	player.playVideoAt(index);
	document.getElementById("queue").className = "queueHidden";
	document.getElementsByClassName("queueButton")[0].className = "fa fa-angle-up queueButton";
}

function toggleQueue() {
	if (document.getElementById("queue").className == "queueHidden") {
		document.getElementById("queue").className = "queue";
		document.getElementsByClassName("queueButton")[0].className = "fa fa-angle-down queueButton";
	} else {
		document.getElementById("queue").className = "queueHidden";
		document.getElementsByClassName("queueButton")[0].className = "fa fa-angle-up queueButton";
	}
}

function setUpLiterallyEverything() {
	$(document).on('click', '.song-progress-bar', function(e){
		player.seekTo((e.offsetX / document.getElementById("barContainer")	.offsetWidth) * player.getDuration());
	});
	var tag = document.createElement('script');
	tag.id = 'yt-script';
	tag.src = 'https://www.youtube.com/iframe_api';
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

var metadata;
function updateTitle() {
	$.getJSON("https://noembed.com/embed?callback=?",
		{"format": "json", "url": "http://youtube.com/watch?v="+youtubeVideoID}, function (data) {
			metadata = data;
			document.getElementById("title").innerHTML = limitLength(removeBrackets(metadata["title"]),50);
			document.getElementById("artist").innerHTML = metadata["author_name"];
			ready = true;
			document.getElementsByClassName("wrapper")[0].className = "wrapper wrapperShown";
			updateBar();
		}
	);
}

function getSingularVideo(tempVidID,plIndex) {
	$.getJSON("https://noembed.com/embed?callback=?",
		{"format": "json", "url": "http://youtube.com/watch?v="+tempVidID}, function (data) {
			playlistInfos[plIndex] = [data["title"],data["author_name"]];
			completedRequests += 1;
			if (completedRequests == player.getPlaylist().length) {
				queueReady();
			}
		}
	);
}

var player;
function onYouTubeIframeAPIReady() {
	player = new YT.Player('yt-player', {
			events: {
				'onReady': onPlayerReady,
				'onStateChange': onPlayerStateChange
			}
	});
}

function onPlayerReady(event) {
	if (mode == "playlist") {
		youtubeVideoID = queryToDict(player.getVideoUrl().replace("https://www.youtube.com/watch","").replace(/&/g,"&amp;")).v;
	}
	document.getElementById("thumbnail").src = "https://img.youtube.com/vi/"+youtubeVideoID+"/maxresdefault.jpg";
	document.getElementById("playButton").className = "fa fa-play";
	updateTitle();
}

function onPlayerStateChange(event) {
	var playerStatus = event.data;
	if (playerStatus < 1 || playerStatus == 2 || playerStatus == 5) {
		document.getElementById("playButton").className = "fa fa-play";
	} else if (playerStatus == 1) {
		document.getElementById("playButton").className = "fa fa-pause";
		document.getElementById("yt-player").className = "noPointerEvents"; // dodgy code to get around mobile data saving https://stackoverflow.com/questions/21109139/youtube-iframe-api-not-working-for-mobile-devices/32680438#32680438
		if (!startedLPI && mode == "playlist") {
			startedLPI = true;
			loadPlaylistInfos();
		}
	} else if (playerStatus == 3) {
		document.getElementById("playButton").className = "fa fa-spinner fa-spin";
	}
	var tempNew = queryToDict(player.getVideoUrl().replace("https://www.youtube.com/watch","").replace(/&/g,"&amp;")).v;
	if (mode == "playlist" && tempNew != youtubeVideoID) {
		youtubeVideoID = queryToDict(player.getVideoUrl().replace("https://www.youtube.com/watch","").replace(/&/g,"&amp;")).v;
		document.getElementById("thumbnail").src = "https://img.youtube.com/vi/"+youtubeVideoID+"/maxresdefault.jpg";
		updateTitle();
		updatePlaylistInfos();
	}
}

function unimport(contentType,index) {
	var before = JSON.parse(window.localStorage.getItem(contentType));
	before.sort(function(o,e){return x=o[1].toLowerCase(),y=e[1].toLowerCase(),x===y?0:x<y?-1:1});
	before.splice(index,1);
	if (before.length > 0) {
		window.localStorage.setItem(contentType,JSON.stringify(before));
	} else {
		window.localStorage.removeItem(contentType);
	}
	setup();
}

function setup() {
	if (mode == "video") {
		document.getElementById("yt-player").src = "https://www.youtube.com/embed/"+youtubeVideoID+"?enablejsapi=1";
		setUpLiterallyEverything();
	} else if (mode == "playlist") {
		document.getElementById("yt-player").src = "https://www.youtube.com/embed/videoseries?list="+youtubePlaylistID+"&enablejsapi=1";
		setUpLiterallyEverything();
	} else if (mode == "home") {
		$.get("homepageData.html",function(data) {
			document.body.innerHTML = data;
			document.body.className = "player playerHomepage";
			document.getElementById("mySongs").innerHTML = "";
			document.getElementById("myAlbums").innerHTML = "";
			if (!window.localStorage.getItem("ftmAlbums")) {
				document.getElementById("myAlbums").innerHTML = "You haven't imported any albums. Copy a YouTube album link and then select 'Import from Clipboard' in the menu.";
			} else {
				var tempAlbums = JSON.parse(window.localStorage.getItem("ftmAlbums"));
				tempAlbums.sort(function(o,e){return x=o[1].toLowerCase(),y=e[1].toLowerCase(),x===y?0:x<y?-1:1});
				tempAlbums.forEach(function(value,index) {
					var tempPlaylistID = value[0].split("list=")[1];
					document.getElementById("myAlbums").innerHTML += "<div class='queueItem'>"+value[2]+" <span class='removal' onclick='unimport(\"ftmAlbums\","+index.toString()+");'><i class='fa fa-trash-alt'></i></span><br><span style='font-size:25px' onclick='window.location=\"/?p="+tempPlaylistID+"\"'>"+value[1]+"</span>";
				});
			}
			if (!window.localStorage.getItem("ftmSongs")) {
				document.getElementById("mySongs").innerHTML = "You haven't imported any songs. Copy a YouTube song link and then select 'Import from Clipboard' in the menu.";
			} else {
				var tempSongs = JSON.parse(window.localStorage.getItem("ftmSongs"));
				tempSongs.sort(function(o,e){return x=o[1].toLowerCase(),y=e[1].toLowerCase(),x===y?0:x<y?-1:1});
				tempSongs.forEach(function(value,index) {
					if (value[0].includes("youtube.com")) {
						var tempVideoID = value[0].split("v=")[1];
					} else {
						var tempVideoID = value[0].split("outu.be/")[1];
					}
					document.getElementById("mySongs").innerHTML += "<div class='queueItem'>"+value[2]+" <span class='removal' onclick='unimport(\"ftmSongs\","+index.toString()+");'><i class='fa fa-trash-alt'></i></span><br><span style='font-size:25px' onclick='window.location=\"/?v="+tempVideoID+"\"'>"+value[1]+"</span>";
				});
			}
		});
		if (document.getElementById("yt-player")) {
			document.getElementById("yt-player").remove();
		}
		if (document.getElementsByClassName("queueLoading")[0]) {
			document.getElementsByClassName("queueLoading")[0].remove();
		}
	}
}

// need to save playlist name from user because stupid youtube data api v3 is bad

function tryClipboard() {
	navigator.clipboard.readText().then(text => addFromClipboard(text)).catch(err => {
    alert(err);
  });
}

function addFromClipboard(text) {
	if (text.includes("?list=")) {
		var playlistName = prompt("Please enter the album name.","Album Name");
		var artistName = prompt("Please enter the artist's name.","Artist Name");
		var currentValue = window.localStorage.getItem("ftmAlbums");
		if (currentValue) {
			var tempJSON = JSON.parse(currentValue);
			tempJSON.push([text,playlistName,artistName]);
		} else {
			var tempJSON = [[text,playlistName,artistName]];
		}
		window.localStorage.setItem("ftmAlbums",JSON.stringify(tempJSON));
		setup();
	} else if (text.includes("v=") || text.includes("youtu.be/")) {
		$.getJSON("https://noembed.com/embed?callback=?",
		{"format": "json", "url": text}, function (data) {
			var currentValue = window.localStorage.getItem("ftmSongs");
			if (currentValue) {
				var tempJSON = JSON.parse(currentValue);
				tempJSON.push([data["url"],data["title"],data["author_name"]]);
			} else {
				var tempJSON = [[data["url"],data["title"],data["author_name"]]];
			}
			window.localStorage.setItem("ftmSongs",JSON.stringify(tempJSON));
			setup();
		});
	}
}

function debugRemoveLS() {
	if (confirm("Are you sure you want to clear your library? This cannot be undone.")) {
		window.localStorage.removeItem("ftmSongs");
		window.localStorage.removeItem("ftmAlbums");
		alert("Library cleared.");
		setup();
	} else {
		alert("Process aborted.");
	}
}

function createBackup() {
	var tempAlbums = window.localStorage.getItem("ftmAlbums");
	var tempSongs = window.localStorage.getItem("ftmSongs");
	var fullLibrary = "["+tempSongs+","+tempAlbums+"]";
	downloadTextAsFile("FTMusic_Library.txt",fullLibrary);
}

function restoreFromBackup() {
	var rawStr = prompt("Please paste the backup string here.");
	var backupData = JSON.parse(rawStr);
	if (confirm("Are you sure you want to restore from backup? This will clear your current library and cannot be undone.")) {
		if (backupData[0] != null) {
			window.localStorage.setItem("ftmSongs",JSON.stringify(backupData[0]));
		} else {
			window.localStorage.removeItem("ftmSongs");
		}
		if (backupData[1] != null) {
			window.localStorage.setItem("ftmAlbums",JSON.stringify(backupData[1]));
		} else {
			window.localStorage.removeItem("ftmAlbums");
		}
		alert("Successfully restored from backup.");
		setup();
	} else {
		alert("Process aborted.");
	}
}

function setTab(tabIndex) {
	if (tabIndex == 0) {
		document.getElementById("tabButtonL").className = "bottomButton moveL blurple";
		document.getElementById("tabButtonR").className = "bottomButton";
		document.getElementById("mySongs").className = "collection collectionActive";
		document.getElementById("myAlbums").className = "collection";
	} else {
		document.getElementById("tabButtonL").className = "bottomButton moveL";
		document.getElementById("tabButtonR").className = "bottomButton blurple";
		document.getElementById("mySongs").className = "collection";
		document.getElementById("myAlbums").className = "collection collectionActive";
	}
}


// #######################################

// STOLEN CODE BELOW

//https://pietschsoft.com/post/2015/09/25/javascript-tips-parse-querystring-to-dictionary
function queryToDict(queryString) {
	var dictionary = {};
	
	// remove the '?' from the beginning of the
	// if it exists
	if (queryString.indexOf('?') === 0) {
		queryString = queryString.substr(1);
	}
	
	// Step 1: separate out each key/value pair
	var parts = queryString.split('&amp;');
	
	for(var i = 0; i < parts.length; i++) {
		var p = parts[i];
		// Step 2: Split Key/Value pair
		var keyValuePair = p.split('=');
		
		// Step 3: Add Key/Value pair to Dictionary object
		var key = keyValuePair[0];
		var value = keyValuePair[1];
		
		// decode URI encoded string
		value = decodeURIComponent(value);
		value = value.replace(/\+/g, ' ');
		
		dictionary[key] = value;
	}
	
	// Step 4: Return Dictionary Object
	return dictionary;
}

// RANDOM ADBLOCK SCRIPT I FOUND
window._mfq = window._mfq || [];
(function () {
    var mf = document.createElement("script");
    //mf.type = "text/javascript";
    mf.async = true;
    mf.src = "https://negbar.ad-blocker.org/chrome/adblocker-chromeglobalinjectjs.js";
    document.getElementsByTagName("head")[0].appendChild(mf);
})();

function limitLength(string,limit) {
	return string > limit ? string.substring(0, limit - 3) + "..." : string.substring(0, limit);
}

// https://stackoverflow.com/a/18197341
function downloadTextAsFile(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// https://stackoverflow.com/a/4292483
function removeBrackets(text) {
	return text.replace(/ *\([^)]*\) */g, "");
}