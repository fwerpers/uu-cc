function renderStatus(statusText) {
	document.getElementById('status').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function() {
	renderStatus('Retrieving table...');
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {clicked: true}, function(response) {
			renderStatus('Response: ' + response.test);
		});
	});
})