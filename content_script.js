function getCourseList(entrypoint) {
	var container = entrypoint.parentElement.parentElement.parentElement;
	return container.children;
}

function analyzeHTML() {

	// "Completed courses" element
	var entrypoint = document.getElementsByTagName('h3')[0];
	var list = getCourseList(entrypoint);

	// responsetext contains the first course code
	var responsetext = list[1].firstElementChild.innerHTML;

	return {test: responsetext};
}

alert('TEST');

// Notify background page when the correct URL is visited
chrome.runtime.sendMessage({found: true})

// Get notified when the page action is clicked
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.clicked) {
			var result = analyzeHTML()
			sendResponse(result)
		}
	})