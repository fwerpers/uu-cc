
function setLoaderSize() {
	var container = document.getElementById('loader_container');
	var placeholder = document.getElementById('placeholder');
	var loader = document.getElementById('loader');
	var table = document.getElementById('hp_table');
	var size = { 
		width: table.offsetWidth,
		height: table.offsetHeight
	}
	table.style.display = 'none';

	placeholder.style.width = String(size.width) + 'px';
	placeholder.style.height = String(size.height) + 'px';

	console.log(String(size.width) + 'px');
}

// Write to the status element
function renderStatus(statusText) {
	document.getElementById('status').textContent = statusText;
}

function hideStatus() {
	document.getElementById('status').style.display = 'none';
}

function populateTable(table_data) {
	var table = document.getElementById('hp_table');
	var placeholder = document.getElementById('placeholder');

	table.rows[1].cells[1].innerHTML = table_data.total;
	table.rows[2].cells[1].innerHTML = table_data.tech;
	table.rows[3].cells[1].innerHTML = table_data.cs;
	table.rows[4].cells[1].innerHTML = table_data.adv;
	table.rows[5].cells[1].innerHTML = table_data.adv_tech;

	placeholder.style.display = 'none';
	table.style.display = 'inline';

	hideStatus();
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

	console.log(table_data);
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

	console.log(points);

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

function getCoursePage(url, callback) {
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
function loopCourses(course_list) {
	console.log(course_list);
	var base_url = 'http://www.uu.se/utbildning/utbildningar/selma/kursplan/'
	var html_list = [];
	var calls_remaining = course_list.length;
	var i;
	for (i=0; i<course_list.length; i++) {
		var url = base_url + '?kKod=' + course_list[i];
		getCoursePage(url, function(response) {
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
	//renderStatus('Retrieving table...');
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {clicked: true}, function(response) {
			loopCourses(response.course_list);
		});
	});
})