
function getPopupTable() {
	var table = document.getElementById('hp_table')
	return(table)
}

function hidePopupTable() {
	var table = getPopupTable()
	table.style.display = 'none'
}

function showPopupTable() {
	var table = getPopupTable()
	table.style.display = 'inline'
}

function getPlaceholder() {
	var placeholder = document.getElementById('placeholder')
	return(placeholder)
}

function hidePlaceholder() {
	var placeholder = getPlaceholder()
	placeholder.style.display = 'none';
}

function setPlaceholderSize() {
	var placeholder = getPlaceholder()
	var table = getPopupTable()
	var size = {
		width: table.offsetWidth,
		height: table.offsetHeight
	}
	hidePopupTable()

	placeholder.style.width = String(size.width) + 'px';
	placeholder.style.height = String(size.height) + 'px';

}

function populateTable(tableData) {
	var table = getPopupTable()

	table.rows[1].cells[1].innerHTML = tableData.total;
	table.rows[2].cells[1].innerHTML = tableData.tech;
	table.rows[3].cells[1].innerHTML = tableData.cs;
	table.rows[4].cells[1].innerHTML = tableData.adv;
	table.rows[5].cells[1].innerHTML = tableData.advTech;

	hidePlaceholder()
	showPopupTable()
}

function htmlToStats(html_text) {
	var stats = {
		points: 0,
		adv: false,
		tech: false,
		adv_tech: false,
		cs: false
	}

	var el = document.createElement('html');
	el.innerHTML = html_text;
	var fact_list = el.getElementsByClassName('syllabusFacts introductory-note is-unstyled')[0].children;

	// Retrieve credits
	var point_item = fact_list[0];
	var point_str = point_item.firstElementChild.innerHTML.trim();
	stats.points = Number(point_str.split(' ')[0].replace(',','.'));

	// Retrieve level
	var level_item = fact_list[2];
	level_item.removeChild(level_item.firstElementChild);
	var level_str = level_item.innerHTML.trim();
	var level = level_str.split('')[0];

	// Retrieve subjects
	var sub_item = fact_list[3];
	sub_item.removeChild(sub_item.firstElementChild);
	var subs_str = sub_item.innerHTML.trim();
	var subs = subs_str.split(',');

	var is_tech = false;
	var is_cs = false;
	for (i=0; i<subs.length; i++) {
		subs[i] = subs[i].trim().split(' ')[0];
		if (subs[i] == 'Teknik') {
			is_tech = true;
		} else if (subs[i] == 'Datavetenskap') {
			is_cs = true;
		}
	}

	// Distribute points according to subjects and level
	if (level == 'A') {
		stats.adv = true;
	}
	if (is_tech) {
		stats.tech = true;
	}
	if (level == 'A' && is_tech) {
		stats.adv_tech = true;
	}
	if (is_cs) {
		stats.cs = true;
	}

	return stats;
}

function getCourseInfoObservable(code) {
	var baseUrl = 'http://www.uu.se/utbildning/utbildningar/selma/kursplan/'
	var url = baseUrl + '?kKod=' + code
	var courseHTMLObservable = Rx.Observable
		.ajax({url: url, method: 'GET', responseType: 'html'})
		.map(data => data.response)
	return(courseHTMLObservable)
}

function getCatalogHTML(code, callback) {
	var baseUrl = 'http://www.uu.se/utbildning/utbildningar/selma/kursplan/'
	var url = baseUrl + '?kKod=' + code
	var catalogHTML = getUrl(url, callback)
}

function getUrl(url, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
			callback(xmlHttp.responseText);
		}
	}
	xmlHttp.open("GET", url, true);
	xmlHttp.send(null);
}

function generateTable(courseList) {

	var tableData = {
		total: 0,
		adv: 0,
		tech: 0,
		advTech: 0,
		cs: 0
	}

	var rs = Rx.Observable
		.from(courseList)
		.flatMap(courseEntry => getCourseInfoObservable(courseEntry.code))
		.subscribe(courseHTML => console.log(courseHTML))

	var courseEntriesRemaining = courseList.length;

	for (var i=0; i<courseList.length; i++) {
		var courseEntry = courseList[i]
		var code = courseEntry.code
		if (!courseEntry.isCompleted) {
			courseEntriesRemaining--
			continue
		}
		//TODO: Create ajax observables
		// Merge, flatmap, zip?
		// Make a function which takes html and create a courseInfo object
		getCatalogHTML(code, function(html) {
			var stats = htmlToStats(html);
			tableData.total += stats.points;
			tableData.adv += stats.adv*stats.points;
			tableData.tech += stats.tech*stats.points;
			tableData.advTech += stats.adv_tech*stats.points;
			tableData.cs += stats.cs*stats.points;
			courseEntriesRemaining--;
			if (courseEntriesRemaining <= 0) {
				populateTable(tableData);
			}
		});
	}

}

// Notify the content script when the page action is clicked
document.addEventListener('DOMContentLoaded', function() {
	setPlaceholderSize();
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {clicked: true}, function(response) {
			//loopCourses(response.courseList)
			generateTable(response.courseList)
		});
	});
})
