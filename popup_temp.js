
// Write to the status element
function renderStatus(statusText) {
	document.getElementById('status').textContent = statusText;
}

function coursePagesToStats(html_list) {
	var table_results = {
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
		table_results.total += stats.total;
		table_results.adv += stats.adv;
		table_results.tech += stats.tech;
		table_results.adv_tech += stats.adv_tech;
		table_results.cs += stats.cs;
	}

	console.log(table_results);
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
				renderStatus(html_list[0]);
				console.log(html_list);
				coursePagesToStats(html_list);
			}
		});
	}
}

// Notify the content script when the page action is clicked
document.addEventListener('DOMContentLoaded', function() {
	renderStatus('Retrieving table...');
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {clicked: true}, function(response) {
			renderStatus('Response: ' + response.course_list[3]);
			console.log('Response: ' + response.course_list[3]);
			loopCourses(response.course_list);
		});
	});
})