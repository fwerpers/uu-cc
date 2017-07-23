chrome.runtime.onMessage.addListener(
	function(message, sender, sendResponse) {
		if (message.found) {
			// Show page action
			chrome.pageAction.show(sender.tab.id)
		}
	})