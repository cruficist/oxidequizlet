/*

  ____       _     _      
 / __ \     (_)   | |     
| |  | |_  ___  __| | ___ 
| |  | \ \/ / |/ _` |/ _ \
| |__| |>  <| | (_| |  __/
 \____//_/\_\_|\__,_|\___|       
  


	Please do not steal, copy, or release any of this code.


*/


chrome.contextMenus.removeAll(function() {
	console.log("Removed all context menus.");
});

console.log("Added reset options context menu.");
chrome.contextMenus.create({
	"id": "main-custom-context",
	"title": "Reset Settings",
	"type": "normal",
	"contexts": ["browser_action"],
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
	if (info.menuItemId == "main-custom-context") resetSettings();
});

chrome.runtime.onInstalled.addListener(checkSettings);
chrome.runtime.onStartup.addListener(checkSettings);

function resetSettings() {
	chrome.storage.sync.set({
		"settings": {
			"live": {
				"autoAnswer": true,
				"answerDelay": 100,
				"displayAnswer": true,
				"key": "c"
			},
			"match": {
				"time": 0.1
			},
			"gravity": {
				"score": 100000000
			},
			"test": {
				"key": "c"
			},
			"learn": {
				"speed": 700
			}
		}
	});
	alert("Settings have been reset!");
}

function checkSettings() {
	chrome.storage.sync.get("settings", function(data) {
		if (!data) {
			resetSettings();
		}
	});
}






