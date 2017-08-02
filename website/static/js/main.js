const PATTERNS = {
    COURSE_CODE: '\\d{1}[A-Z]{2}\\d{3}',
    CREDITS: '\\d+(?:.\\d)?\\s(?:c|hp)',
    GRADE: '[G345]',
    DONT_CARE: '[^\\t\\n]+'
}

class CourseTableModel {
    constructor(tableText) {
        this.courseList = []

        var rows = tableText.split('\n')

        for (var i=0; i<rows.length; i++) {
            var row = rows[i]

            if (!isCourseEntry(row)) {
                console.log("Not an entry");
                continue
            }

            console.log("An entry");

            var cells = row.split('\t')
            if (cells.length == 6) {
                var isCompleted = true
    			var code = cells[0]
    			var name = cells[1]
    			var credits = cells[2]
    			var date = cells[3]
    			var grade = cells[4]
            } else if (cells.length == 3 && i <= rows.length-1) {
                var nextRow = rows[i+1]
                if (!isResultFromIncomplete(nextRow)) {
                    continue
                }
                var nextRowCells = nextRow.split('\t')
                var isCompleted = false
    			var code = cells[0]
    			var name = cells[1]
    			var credits = nextRowCells[2]
    			var date = nextRowCells[3]
    			var grade = nextRowCells[4]
            } else {
                continue
            }

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

function isCourseEntry(row) {

    var cells = row.split('\t')

    var courseCodeRegex = /\d{1}[A-Z]{2}\d{3}/
    return(courseCodeRegex.test(cells[0]))
}

function isResultFromIncomplete(row) {
    var cells = row.split('\t')
    if (cells.length == 7) {
        return(true)
    } else {
        return(false)
    }
}

function showTable(courseTable) {
    setLoaderSize();
    generateTable(courseTable.courseList)
}

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

function getLoader() {
	var loader = document.getElementById('loader_container')
	return(loader)
}

function hideLoader() {
	var loader = getLoader()
	loader.style.display = 'none';
}

function showLoader() {
    var loader = getLoader()
	loader.style.display = 'table';
}

function setLoaderSize() {
	var loader = getLoader()
	var table = getPopupTable()
	var size = {
		width: table.offsetWidth,
		height: table.offsetHeight
	}
	hidePopupTable()

	loader.style.width = String(size.width) + 'px';
	loader.style.height = String(size.height) + 'px';

}

function populateTable(courseSummary) {
	var table = getPopupTable()

	table.rows[1].cells[1].innerHTML = courseSummary.total;
	table.rows[2].cells[1].innerHTML = courseSummary.tech;
	table.rows[3].cells[1].innerHTML = courseSummary.cs;
	table.rows[4].cells[1].innerHTML = courseSummary.adv;
	table.rows[5].cells[1].innerHTML = courseSummary.advTech;

	hideLoader()
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
	var baseUrl = 'http://localhost:8080/api'
	var code = courseEntry.code
	var url = baseUrl + '?code=' + code
	var courseHTMLObservable = Rx.Observable
		.ajax({url: url, method: 'GET', responseType: 'text', crossDomain: false})
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

function analyze() {

    showLoader()
    var input = document.getElementById('course_input').value
    checkForCompleteCourses(input)
    checkForIncompleteCourses(input)

    // courseTable = new CourseTableModel(input)
    // showTable(courseTable)
    // console.log(courseTable.courseList);
}

function onTextAreaChange() {
    console.log("CHANGE");
}

function checkForCompleteCourses(text) {
    var pattern = [
        PATTERNS.COURSE_CODE,
        PATTERNS.DONT_CARE,
        PATTERNS.CREDITS,
        PATTERNS.DONT_CARE,
        PATTERNS.GRADE
    ].join('\\t')
    var completeCourseRegex = new RegExp(pattern, 'g')
    var resultArray
    var counter = 0
    while((resultArray = completeCourseRegex.exec(text)) != null) {
        console.log(resultArray[0]);
        counter++
    }
    console.log(counter);
}

function checkForIncompleteCourses(text) {
    var firstSubPattern = [
        PATTERNS.COURSE_CODE,
        PATTERNS.DONT_CARE,
        PATTERNS.DONT_CARE
    ].join('\\t')
    var secondSubPattern = [
        PATTERNS.DONT_CARE,
        PATTERNS.DONT_CARE,
        PATTERNS.CREDITS,
        PATTERNS.DONT_CARE,
        PATTERNS.GRADE,
        PATTERNS.DONT_CARE,
        PATTERNS.DONT_CARE,
    ].join('\\t')
    var pattern = [firstSubPattern, secondSubPattern].join('\\n')
    var completeCourseRegex = new RegExp(pattern, 'g')
    var resultArray
    var counter = 0
    while((resultArray = completeCourseRegex.exec(text)) != null) {
        console.log(resultArray[0]);
        counter++
    }
    console.log(counter);
}

// window.onload = function() {
//     var app = new Vue({
//         el: '#vue_test',
//         data: {
//             message: 'You loaded this page on ' + new Date(),
//             visible: true
//         }
//     })
// }
