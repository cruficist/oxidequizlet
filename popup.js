window.onload = function() {
	var main = document.getElementById("main");

	document.getElementById("btnInject").addEventListener("click", function(e) {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			try {
				if (tabs[0].url.indexOf("quizlet.com/") != -1) {
					chrome.storage.sync.get("settings", function(data) {
						if (data) {
							var script = `
								var elem = document.createElement("script");
								elem.textContent = \`window.extensionSettings = ${JSON.stringify(data.settings)};\`;
								elem.type = "text/javascript";
								(document.head || document.documentElement).appendChild(elem);
							`;
							chrome.tabs.executeScript({
								code: script.trim(),
								matchAboutBlank: !0
							});
						}
					});
					chrome.tabs.executeScript({
						file: "injectMain.js",
						matchAboutBlank: !0
					});
				}
			} catch(e) {
				console.warn(e);
			}
		});
		this.disabled = true;
		this.style.cursor = "not-allowed";
		document.getElementById("loaderInject").classList.toggle("fade");
		setTimeout(function() {
			document.getElementById("loaderInject").classList.toggle("fade");
			document.getElementById("btnInject").style.cursor = "pointer";
			document.getElementById("btnInject").disabled = false;
		}, 500);
	});

	document.getElementById("btnLive").addEventListener("click", function(e) {
		this.disabled = true;
		this.style.cursor = "not-allowed";
		document.getElementById("loaderLive").classList.toggle("fade");
		
		var html = `
		<div style="background-color: #fff; color: #455358; top: 30%; left: 50%; margin-bottom: 2.8125rem; max-width: 100%; outline: none; position: absolute; transform: translateX(-50%); box-shadow: 0 0.3125rem 1rem 0 rgba(0,0,0,0.24); width: 37.5rem;">
			<div class="UIModalHeader">
				<div class="UIModalHeader-wrapper">
					<div class="UIModalHeader-childrenWrapper">
						<h3 class="UIHeading UIHeading--three">Quizlet Extension</h3>
					</div>
				</div>
			</div>
			<div class="UIModalBody">
				<input id="inputLiveJoinCode" type="text" placeholder="Join Code" style="height: 25px; outline: none;"><button id="btnLiveSearch" style="background-color: #3ccfcf; user-select: none; cursor: pointer; outline: none; border: none; padding: 5px; color: #fff; height: 25px;">Search</button><br>
				<select id="liveDropdownContainer" style="height: 25px; outline: none;">
					<option value = "-1">Please fill out the input above.</option>
				</select><button id="btnLiveInject" style="background-color: #3ccfcf; user-select: none; cursor: pointer; outline: none; border: none; padding: 5px; color: #fff;">Go</button><br><br>
				<p><span>The Quizlet live exploit will be injected once the join code is entered.</span></p>
				<p><span>If you need any help, send us a message on <a href="https://discord.gg/2PFDEHa" target="_blank">Discord</a>!</span></p>
			</div>
		<div>`.trim();
		
		var code = "";
		var inputs = document.getElementById("joinCodeContainer").querySelectorAll("input");
		for (let i = 0; i < inputs.length; i++) code += inputs[i].value;
		
		if (code.length == 6) {
			checkLiveCode(code);
		} else {
			document.getElementById("joinCodeContainer").classList.toggle("shakingElement");
			setTimeout(function() {
				document.getElementById("joinCodeContainer").classList.toggle("shakingElement");
			}, 400);
		}
		
		setTimeout(function() {
			document.getElementById("loaderLive").classList.toggle("fade");
			document.getElementById("btnLive").style.cursor = "pointer";
			document.getElementById("btnLive").disabled = false;
		}, 500);
	});

	document.getElementById("advOptions").addEventListener("click", function() {
		this.parentElement.parentElement.classList.toggle("fly-up");
		document.getElementById("settings").classList.toggle("fade");
	});

	document.getElementById("testToggleAnswersKey").addEventListener("keydown", function(e) {
		e.preventDefault();
		this.value = e.key;
	});

	document.getElementById("liveToggleAnswersKey").addEventListener("keydown", function(e) {
		this.value = e.key;
		e.preventDefault();
	});
	
	var selectElements = document.querySelectorAll("select");
	for (let i = 0; i < selectElements.length; i++) 
		selectElements[i].addEventListener("change", updateSettings);

	var inputElements = document.querySelectorAll("input");
	for (let i = 0; i < inputElements.length; i++) 
		inputElements[i].addEventListener("keyup", updateSettings);
	
	chrome.storage.sync.get("settings", function(data) {
		var settings = data.settings;
		if (!settings.live.autoAnswer) document.getElementById("liveAutoAnswer").selectedIndex = 0;
		document.getElementById("liveAnswerDelay").value = settings.live.answerDelay;
		if (!settings.live.displayAnswer) document.getElementById("liveDisplayAnswers").selectedIndex = 0;
		document.getElementById("liveToggleAnswersKey").value = settings.live.key;
		document.getElementById("matchTime").value = settings.match.time;
		document.getElementById("gravityScore").value = settings.gravity.score;
		document.getElementById("testToggleAnswersKey").value = settings.test.key;
		document.getElementById("learnSpeed").value = settings.learn.speed;
	});
	
	var joinCodeInputs = document.getElementById("joinCodeContainer").querySelectorAll("input");
	for (let i = 0; i < joinCodeInputs.length; i++) {
		var input = joinCodeInputs[i];
		input.style.textAlign = "center";
		input.style.outline = "none";
		input.style.borde = "1px solid rgba(0 0 0 .2)";
		input.style.width = "20px";
		input.name = i;
		input.maxLength = "1";
		input.placeholder = i + 1;
		input.onkeydown = function(e) {
			if (!(e.keyCode == 86 || e.which == 86) && !e.ctrlKey && e.shiftKey && e.altKey) e.preventDefault();
			var nextInput = document.getElementById("joinCodeContainer").querySelectorAll("input[name='" + (Number(this.name) + 1) + "']")[0];
			var prevInput = document.getElementById("joinCodeContainer").querySelectorAll("input[name='" + (Number(this.name) - 1) + "']")[0];
			if (e.keyCode == 8 || e.which == 8) {
				this.value = "";
				if (prevInput) {
					prevInput.value = ""
					setTimeout(function() {
						prevInput.focus();
					}, 0);
				}
			} else if (e.key.match(/[0-9]/) != null) {
				this.value = e.key;
				if (nextInput) {
					setTimeout(function() {
						nextInput.focus();
					}, 0);
				}
			}
		}
	}
	
	document.getElementById("main").addEventListener("paste", function(e) {
		var clipboardData, pastedData;
		clipboardData = e.clipboardData || window.clipboardData;
		pastedData = clipboardData.getData("Text");
		var formattedText = pastedData.replace(/[^0-9]/g, "").slice(0, 6);
		if (formattedText.length == 6) {
			var inputs = document.getElementById("joinCodeContainer").querySelectorAll("input");
			for (let i = 0; i < inputs.length; i++) {
				inputs[i].value = formattedText[i];
			}
		}
	});
	
	function updateSettings() {
		chrome.storage.sync.set({
			"settings": {
				"live": {
					"autoAnswer": document.getElementById("liveAutoAnswer").selectedIndex,
					"answerDelay": Number(document.getElementById("liveAnswerDelay").value) || 100,
					"displayAnswer": document.getElementById("liveDisplayAnswers").selectedIndex,
					"key": document.getElementById("liveToggleAnswersKey").value || "c"
				},
				"match": {
					"time": Number(document.getElementById("matchTime").value) || 0.5
				},
				"gravity": {
					"score": Number(document.getElementById("gravityScore").value) || 4294967295
				},
				"test": {
					"key": document.getElementById("testToggleAnswersKey").value || "c"
				},
				"learn": {
					"speed": Number(document.getElementById("learnSpeed").value) || 500
				}
			}
		});
	}
	
	function checkLiveCode(code) {
		var url = 'https://quizlet.com/webapi/3.2/game-instances?filters=%7B"gameCode"%3A"' + code + '"%2C"isInProgress"%3Atrue%2C"isDeleted"%3Afalse%7D&perPage=500';
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				var data = JSON.parse(xhr.response);
				if (data.responses[0].paging.total <= 0) {
					var inputs = document.getElementById("joinCodeContainer").querySelectorAll("input");
					for (let i = 0; i < inputs.length; i++) inputs[i].value = "";
				} else {
					injectLive(data.responses[0].models.gameInstance[0].itemId)
				}
			}
		}
		xhr.send();
	}
	
	function injectLive(id) {
		if (id) {
			var answerUrl = "https://api.quizlet.com/2.0/sets/" + id + "?client_id=R3snf5zu9W&whitespace=1";
			var xhr = new XMLHttpRequest();
			xhr.open("GET", answerUrl, true);
			var response = "";
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					chrome.storage.sync.get("settings", function(data) {
						if (data) {
							response = xhr.responseText;
							alert("Loaded Quizlet live for:\n" + JSON.parse(response).title);
							var delay = data.settings.live.answerDelay || 100;
							var toggleKey = data.settings.live.key || "c";
							var autoAnswer = data.settings.live.autoAnswer;
							var inject = `
								(function() {
									var set = ${response};
									console.log(1);
									var html = '<span style="color: #fff" id="liveAnswerPhrase">Answer</span><span style="user-select: none; color: #000;"> — </span><span style="color: #ff0000; cursor: pointer; user-select: none;" id="btnToggleHack">Pause</span>'
									var elem = document.createElement("div");
									elem.id = "liveSettingsContainer";
									elem.style.transition = "all .3s";
									elem.style.position = "absolute";
									elem.style.paddingRight = "5px";
									elem.style.opacity = "1";
									elem.style.margin = "0";
									elem.style.right = "0";
									elem.style.top = "0";
									elem.innerHTML = html;
									document.body.appendChild(elem);

									var container = document.getElementById("liveSettingsContainer");
									var toggleHack = document.getElementById("btnToggleHack");
									var paused = false;

									toggleHack.addEventListener("click", function() {
										paused = !paused;
										if (paused) {
											this.style.color = "#00ff00";
											this.textContent = "Resume";
										} else {
											this.style.color = "#ff0000";
											this.textContent = "Pause";
										}
									});

									document.addEventListener("keydown", function(e) {
										var key = "${toggleKey}";
										var container = document.getElementById("liveSettingsContainer");
										if (e.key == key) {
											if (container.style.opacity != "0") {
												container.style.opacity = "0";
											} else {
												container.style.opacity = "1";
											}
										}
									});
									
									setInterval(function() {
										if (set && Object.keys(set).length > 0 && (window.location.href.indexOf("quizlet") && window.location.href.indexOf("live")) != -1) {
											if (document.getElementById("liveAnswerPhrase") && document.getElementsByClassName("StudentPrompt-inner")[0] && document.getElementsByClassName("StudentTerm is-clickable can-beClicked")) {
												var question = document.getElementsByClassName("StudentPrompt-inner")[0].innerText.trim();
												var options = document.getElementsByClassName("StudentTerm is-clickable can-beClicked");
												set.terms.filter(function(term) {
													if (term.term.toLowerCase() == question.toLowerCase()) {
														return true;
													} else if (term.definition.toLowerCase() == question.toLowerCase()) {
														return true;
													}
												}).forEach(function(word) {
													if (word.term.toLowerCase() == question.toLowerCase()) {
														document.getElementById("liveAnswerPhrase").textContent = word.definition;
													} else {
														document.getElementById("liveAnswerPhrase").textContent = word.term;
													}
													if (!paused && ${autoAnswer}) {
														for (let i = 0; i < options.length; i++) {
															if (word.definition.toLowerCase() == options[i].innerText.trim().toLowerCase()) {
																click(options[i]);
															} else if (word.term.toLowerCase() == options[i].innerText.trim().toLowerCase()) {
																click(options[i]);
															}
														}
													}
												});
											}
										}
									}, ${delay});

									function click(elem) {
										if (elem.fireEvent) {
											elem.fireEvent("onclick");
										} else {
											var evObj = document.createEvent('Events');
											evObj.initEvent("click", true, false);
											elem.dispatchEvent(evObj);
										}
									}
								})();
							`.trim();
							chrome.tabs.executeScript({
								code: inject,
								matchAboutBlank: !0
							});
						}
					});
				}
			}
			xhr.send();
		} else {
			console.warn("Error: Live ID is incorrect!");
		}
	}
}