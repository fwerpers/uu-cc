import test from 'ava';
const main = require("../static/js/main.js")

test('parse non-completed course input', t => {
    var fs = require('fs')
    var input = fs.readFileSync('test/input/noncompleted_course.txt', 'utf8')
    console.log(JSON.stringify(input));
    var courseList = main.parseNonCompletedCourseResults(input)
    t.true(courseList.length > 0)
    t.is(courseList[0].credits, 4)
})

test('parse completed course input', t => {
    var fs = require('fs')
    var input = fs.readFileSync('test/input/completed_course.txt', 'utf8')
    var courseList = main.parseCompletedCourseResults(input)
    t.is(courseList[0].credits, 5)
})

test('parse credits string', t => {
    var creditsString = '3 hp'
    var credits = main.parseCredits(creditsString)
    t.is(credits, 3)
})

// Needs browser support
test.skip('parse course html', t => {
    var fs = require('fs')
    var html = fs.readFileSync('test/input/course.html', 'utf8')
    console.log(html);
    var course = new main.Course()
    course.points = 5
    course.adv = true
    course.tech = true
    course.advTech = true
    course.cs = true

    var parsedCourse = main.parseCourse(html)

    t.is(parsedCourse, course)
})

test.skip('request course data', t => {
    //http://www.uu.se/utbildning/utbildningar/selma/kursplan/?kKod=1TD184
    var code = '1TD184'
    t.pass();
})
