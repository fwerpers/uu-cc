function getCourseListFromHTML() {

	var entrypoint = document.getElementsByTagName('h3')[0] // "Completed courses" element
	var endpoint = document.getElementsByTagName('h3')[1] // "Incomplete courses" element

	var container = entrypoint.parentElement.parentElement.parentElement
	var entries = container.children

	// Create and return a list of course codes
	var courseList = []
	var i = 1; // skip header
	do {
		courseList.push(entries[i].firstElementChild.innerHTML)
		i++
	} while (!entries[i].contains(endpoint))

	return(courseList)
}

function createResponse() {
	courseList = getCourseListFromHTML()
	response = {courseList: courseList}
	return(response)
}

// Notify background page when the correct URL is visited
chrome.runtime.sendMessage({found: true})

// Get notified when the page action is clicked
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.clicked) {
			var response = createResponse()
			sendResponse(response)
		}
	})
