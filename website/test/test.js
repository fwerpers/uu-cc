import test from 'ava';
const main = require("../static/js/main.js")

test('parse incomplete course input', t => {
    var input = "1TD396\tDatoriserad bildanalys I (5 hp)\t \n \tSkriftligt prov\t3 hp\t2015-12-14\t4\t  \t(33,5)\n \tInlämningsuppgifter\t2 hp\t2017-07-04\tG\t  \t "

    var courseList = main.parseCourseResults(input)

    t.is(courseList[0].credits, 3)
})

test('parse credits string', t => {
    var creditsString = '3 hp'
    var credits = main.parseCredits(creditsString)
    t.is(credits, 3)
})

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
