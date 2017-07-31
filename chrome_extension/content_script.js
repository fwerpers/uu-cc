class CourseTableModel {
	constructor() {
		var tables = document.getElementsByTagName('table')
		var tableElement = tables[tables.length-1]
		var tableRows = tableElement.getElementsByTagName('tr')

		this.courseList = []

		// Get completed courses
		var i = 1
		do {
			var isCompleted = true
			var code = tableRows[i].children[0].innerText
			var name = tableRows[i].children[1].innerText
			var credits = tableRows[i].children[2].innerText
			var date = tableRows[i].children[3].innerText
			var grade = tableRows[i].children[4].innerText
			this.courseList.push(new CourseEntry(code, name, credits, date, grade, isCompleted))
			i++
		} while (tableRows[i].getElementsByTagName('h3').length == 0)

		// Get incomplete courses
		for (i+=1; i<tableRows.length; i+=2) {
			var isCompleted = false
			var code = tableRows[i].children[0].innerText
			var name = tableRows[i].children[1].innerText
			var credits = tableRows[i+1].children[2].innerText
			var date = tableRows[i+1].children[3].innerText
			var grade = tableRows[i+1].children[4].innerText
			this.courseList.push(new CourseEntry(code, name, credits, date, grade, isCompleted))
		}
	}
}

class CourseEntry {
	constructor(code, name, credits, date, grade, isCompleted) {
		this.code = code
		this.name = name
		this.credits = credits
		this.date = date
		this.grade = grade
		this.isCompleted = isCompleted
	}
}

function createResponse() {
	courseTableModel = new CourseTableModel()
	courseList = courseTableModel.courseList
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
			//tableModel = new CourseTableModel()
			//console.log(tableModel)
			sendResponse(response)
		}
	})
