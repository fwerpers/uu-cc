import test from 'ava';

test('parse incomplete course input', t => {
    var input = "1TD396\tDatoriserad bildanalys I (5 hp)\t \n \tSkriftligt prov\t3 hp\t2015-12-14\t4\t  \t(33,5)\n \tInlämningsuppgifter\t2 hp\t2017-07-04\tG\t  \t "

    var mod = require("./static/js/main.js")
    var courseTable = new mod.CourseTableModel(input)
    console.log(courseTable);
    var courseList = courseTable.courseList
    console.log(courseList[0].credits);
    t.is(courseList[0].credits, '3 hp')
    t.pass();
})

test('request course data', t => {
    //http://www.uu.se/utbildning/utbildningar/selma/kursplan/?kKod=1TD184
    var code = '1TD184'
    
})
