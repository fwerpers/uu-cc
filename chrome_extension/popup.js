
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

function populateTable(courseSummary) {
	var table = getPopupTable()

	table.rows[1].cells[1].innerHTML = courseSummary.total;
	table.rows[2].cells[1].innerHTML = courseSummary.tech;
	table.rows[3].cells[1].innerHTML = courseSummary.cs;
	table.rows[4].cells[1].innerHTML = courseSummary.adv;
	table.rows[5].cells[1].innerHTML = courseSummary.advTech;

	hidePlaceholder()
	showPopupTable()
}

function getCourseStats(html, courseEntry) {
	var stats = {
		points: 0,
		adv: false,
		tech: false,
		adv_tech: false,
		cs: false
	}

	var el = document.createElement('html');
	el.innerHTML = html;
	var fact_list = el.getElementsByClassName('syllabusFacts introductory-note is-unstyled')[0].children;

	// Retrieve credits
	if (!courseEntry.isCompleted) {
		stats.points = Number(courseEntry.credits.split(' ')[0])
	} else {
		var point_item = fact_list[0];
		var point_str = point_item.firstElementChild.innerHTML.trim();
		stats.points = Number(point_str.split(' ')[0].replace(',','.'));
	}

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

function getCourseStatsObservable(courseEntry) {
	var baseUrl = 'http://www.uu.se/utbildning/utbildningar/selma/kursplan/'
	var code = courseEntry.code
	var url = baseUrl + '?kKod=' + code
	var courseHTMLObservable = Rx.Observable
		.ajax({url: url, method: 'GET', responseType: 'text'})
		.map(data => getCourseStats(data.response, courseEntry))
	return(courseHTMLObservable)
}

class CreditsSummary {
	constructor() {
		this.total = 0
		this.adv = 0
		this.tech = 0
		this.advTech = 0
		this.cs = 0
	}

	addCoursePoints(courseStats) {
		var points = courseStats.points
		this.total += points;
		this.adv += courseStats.adv*points;
		this.tech += courseStats.tech*points;
		this.advTech += courseStats.adv_tech*points;
		this.cs += courseStats.cs*points;
	}
}

function generateTable(courseList) {

	var creditsSummary = new CreditsSummary()

	Rx.Observable
		.from(courseList)
		.flatMap(courseEntry => getCourseStatsObservable(courseEntry))
		.subscribe({
			next: courseStats => creditsSummary.addCoursePoints(courseStats),
			complete: () => populateTable(creditsSummary)
		})
}

// Notify the content script when the page action is clicked
document.addEventListener('DOMContentLoaded', function() {
	setPlaceholderSize();
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {clicked: true}, function(response) {
			generateTable(response.courseList)
		});
	});
})
