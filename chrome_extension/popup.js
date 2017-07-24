
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

function setLoaderSize() {
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

function populateTable(table_data) {
	var table = getPopupTable()

	table.rows[1].cells[1].innerHTML = table_data.total;
	table.rows[2].cells[1].innerHTML = table_data.tech;
	table.rows[3].cells[1].innerHTML = table_data.cs;
	table.rows[4].cells[1].innerHTML = table_data.adv;
	table.rows[5].cells[1].innerHTML = table_data.adv_tech;

	hidePlaceholder()
	showPopupTable()

}

function coursePagesToStats(html_list) {
	var table_data = {
		total: 0,
		adv: 0,
		tech: 0,
		adv_tech: 0,
		cs: 0
	}

	var i;
	var stats;
	for (i=0; i<html_list.length; i++) {
		stats = htmlToStats(html_list[i]);
		table_data.total += stats.total;
		table_data.adv += stats.adv;
		table_data.tech += stats.tech;
		table_data.adv_tech += stats.adv_tech;
		table_data.cs += stats.cs;
	}

	populateTable(table_data);
}

function htmlToStats(html_text) {
	var stats = {
		total: 0,
		adv: 0,
		tech: 0,
		adv_tech: 0,
		cs: 0
	}

	var el = document.createElement('html');
	el.innerHTML = html_text;
	var fact_list = el.getElementsByClassName('syllabusFacts introductory-note is-unstyled')[0].children;

	// Retrieve credits
	var point_item = fact_list[0];
	var point_str = point_item.firstElementChild.innerHTML.trim();
	var points = Number(point_str.split(' ')[0].replace(',','.'));

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
	stats.total += points;
	if (level == 'A') {
		stats.adv += points;
	}
	if (is_tech) {
		stats.tech += points;
	}
	if (level == 'A' && is_tech) {
		stats.adv_tech += points;
	}
	if (is_cs) {
		stats.cs += points;
	}

	return stats;
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

// Populate table
function loopCourses(courseList) {
	var html_list = [];
	var calls_remaining = courseList.length;
	for (var i=0; i<courseList.length; i++) {
		var code = courseList[i].code
		getCatalogHTML(code, function(response) {
			html_list.push(response);
			calls_remaining--;
			if (calls_remaining <= 0) {
				coursePagesToStats(html_list);
			}
		});
	}
}

// Notify the content script when the page action is clicked
document.addEventListener('DOMContentLoaded', function() {
	setLoaderSize();
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {clicked: true}, function(response) {
			console.log(response.newCourseList)
			loopCourses(response.courseList)
		});
	});
})
