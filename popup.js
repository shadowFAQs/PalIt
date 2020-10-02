var btnCapture = null;
var btnManage = null;
var imgURL = null;

window.onload = function () {

	console.log('Window loaded')
	btnCapture = document.getElementById('capture');
	btnManage = document.getElementById('manage');

	btnCapture.onclick = function () {

		chrome.tabs.captureVisibleTab(null, {format: 'png'}, function (screenshotURL) {

			var viewTabURL = chrome.extension.getURL('screenshot.html')

			chrome.tabs.create({url: viewTabURL, active: false}, function (tab) {

				var tabID = tab.id;
				chrome.tabs.onUpdated.addListener(function (tabID, info) {

					if (info.status === 'complete') {
						chrome.tabs.sendMessage(tabID, {url: screenshotURL}, function (response) {});
						chrome.tabs.update(tabID, {highlighted: true});
					}
				});
			});
		});
	}
}