function htmlToCourseList() {

	var entrypoint = document.getElementsByTagName('h3')[0]; // "Completed courses" element
	var endpoint = document.getElementsByTagName('h3')[1]; // "Incomplete courses" element

	var container = entrypoint.parentElement.parentElement.parentElement;
	var entries = container.children;

	// Create and return a list of course codes
	var course_list = [];
	var i = 1; // skip header
	do {
		course_list.push(entries[i].firstElementChild.innerHTML);
		i++;
	} while (!entries[i].contains(endpoint))

	return {course_list: course_list};
}

// Notify background page when the correct URL is visited
chrome.runtime.sendMessage({found: true})

// Get notified when the page action is clicked
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.clicked) {
			var course_list = htmlToCourseList()
			sendResponse(course_list)
		}
	})
