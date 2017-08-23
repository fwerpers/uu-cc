const PATTERNS = {
    COURSE_CODE: '(\\d{1}[A-Z]{2}\\d{3})',
    CREDITS: '(\\d+(?:.\\d)?\\s(?:c|hp))',
    GRADE: '([G345])',
    DONT_CARE: '[^\\t\\n]+'
}

const COMPLETE_COURSE_PATTERN = [
    PATTERNS.COURSE_CODE,
    PATTERNS.DONT_CARE,
    PATTERNS.CREDITS,
    PATTERNS.DONT_CARE,
    PATTERNS.GRADE
].join('\\t')

const INCOMPLETE_COURSE_PATTERN = [
    [
        PATTERNS.COURSE_CODE,
        PATTERNS.DONT_CARE,
        PATTERNS.DONT_CARE
    ].join('\\t'),
    [
        PATTERNS.DONT_CARE,
        PATTERNS.DONT_CARE,
        PATTERNS.CREDITS,
        PATTERNS.DONT_CARE,
        PATTERNS.GRADE
    ].join('\\t')
].join('\\n')

function parseCourseResults(inputText) {
    courseList = []

    courseList = courseList.concat(parseCompletedCourseResults(inputText))
    courseList = courseList.concat(parseNonCompletedCourseResults(inputText))
    return(courseList)
}

function parseCompletedCourseResults(inputText) {
    var pattern = COMPLETE_COURSE_PATTERN
    var courseResults = []
    var regex = new RegExp(pattern, 'g')
    var resultArray
    while((resultArray = regex.exec(inputText)) != null) {
        var code = resultArray[1]
        var name = "PLACEHOLDER_NAME"
        var credits = parseCredits(resultArray[2])
        var date = "PLACEHOLDER_DATE"
        var grade = resultArray[3]
        courseResults.push(new CourseResult(code, name, credits, date, grade, true, null))
    }

    return(courseResults)
}

function parseNonCompletedCourseResults(inputText) {
    var pattern = INCOMPLETE_COURSE_PATTERN
    var courseResults = []
    var regex = new RegExp(pattern, 'g')
    var resultArray
    while((resultArray = regex.exec(inputText)) != null) {
        var code = resultArray[1]
        var name = "PLACEHOLDER_NAME"
        var credits = parseCredits(resultArray[2])
        var date = "PLACEHOLDER_DATE"
        var grade = resultArray[3]
        courseResults.push(new CourseResult(code, name, credits, null, null, false, null))
    }

    return(courseResults)
}

function parseCredits(creditsString) {
    var credits = Number(creditsString.split(' ')[0])
    return(credits)
}

class Course {
    constructor() {
        this.points = 0
        this.adv = false
        this.tech = false
        this.advTech = false
        this.cs = false
    }
}

class CourseResult {
	constructor(code, name, credits, date, grade, isCompleted, course) {
		this.code = code
		this.name = name
		this.credits = credits
		this.date = date
		this.grade = grade
		this.isCompleted = isCompleted
        this.course = course
	}
}

function showTable(courseList) {
    setLoaderSize();
    generateTable(courseList)
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

function parseCourse(html) {
    course = new Course()

    var el = document.createElement('html');
	el.innerHTML = html;
	var fact_list = el.getElementsByClassName('syllabusFacts introductory-note is-unstyled')[0].children;

    // Retrieve credits
    var point_item = fact_list[0];
    var point_str = point_item.firstElementChild.innerHTML.trim();
    course.points = Number(point_str.split(' ')[0].replace(',','.'));

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
		course.adv = true;
	}
	if (is_tech) {
		course.tech = true;
	}
	if (level == 'A' && is_tech) {
		course.advTech = true;
	}
	if (is_cs) {
		course.cs = true;
	}

	return(course);
}

function getCourseStats(html, courseResult) {
    course = parseCourse(html)

	if (!courseResult.isCompleted) {
		course.points = courseResult.credits
	}

	return(course);
}

function getCourseHTMLObservable(courseCode) {
    var baseUrl = 'http://localhost:8080/api'
	var url = baseUrl + '?code=' + courseCode
    var courseHTMLObservable = Rx.Observable
		.ajax({url: url, method: 'GET', responseType: 'text', crossDomain: false})
        .map(data => data.response)
    return(courseHTMLObservable)
}

function getCourseStatsObservable(courseResult) {
	var courseStatsObservable = getCourseHTMLObservable(courseResult.code)
		.map(html => getCourseStats(html, courseResult))
	return(courseStatsObservable)
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
		this.advTech += courseStats.advTech*points;
		this.cs += courseStats.cs*points;
	}
}

function generateTable(courseList) {

	var creditsSummary = new CreditsSummary()

	Rx.Observable
		.from(courseList)
		.flatMap(courseResult => getCourseStatsObservable(courseResult))
		.subscribe({
			next: courseStats => creditsSummary.addCoursePoints(courseStats),
			complete: () => populateTable(creditsSummary)
		})
}

function analyze() {

    showLoader()
    var input = document.getElementById('course_input').value

    console.log(JSON.stringify(input));

    courseList = parseCourseResults(input)
    showTable(courseList)
}

function onTextAreaChange() {
    console.log("CHANGE");
}

// Exports for testing
exports.Course = Course
exports.parseCourseResults = parseCourseResults
exports.parseNonCompletedCourseResults = parseNonCompletedCourseResults
exports.parseCompletedCourseResults = parseCompletedCourseResults
exports.parseCourse = parseCourse
exports.parseCredits = parseCredits

// window.onload = function() {
//     var app = new Vue({
//         el: '#vue_test',
//         data: {
//             message: 'You loaded this page on ' + new Date(),
//             visible: true
//         }
//     })
// }
