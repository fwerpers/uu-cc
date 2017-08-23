import test from 'ava';

test('parse incomplete course input', t => {
    var input = "1TD396\tDatoriserad bildanalys I (5 hp)\t \n \tSkriftligt prov\t3 hp\t2015-12-14\t4\t  \t(33,5)\n \tInlämningsuppgifter\t2 hp\t2017-07-04\tG\t  \t "

    var main = require("../static/js/main.js")
    var courseTable = new main.CourseTableModel(input)
    console.log(courseTable);
    var courseList = courseTable.courseList
    console.log(courseList[0].credits);
    t.is(courseList[0].credits, '3 hp')
    t.pass();
})

test.skip('parse course html', t => {
    var fs = require('fs')
    var html = fs.readFileSync('test/input/course.html', 'utf8')
    console.log(html);
    t.pass();
})

test.skip('request course data', t => {
    //http://www.uu.se/utbildning/utbildningar/selma/kursplan/?kKod=1TD184
    var code = '1TD184'
    t.pass();
})
