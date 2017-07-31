class CourseTableModel {
    constructor(tableText) {
        this.courseList = []

        var rows = tableText.split('\n')

        for (var i=0; i<rows.length; i++) {
            var row = rows[i]

            if (!isCourseEntry(row)) {
                continue
            }

            var cells = row.split('\t')
            if (cells.length == 5) {
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

// window.onload = function() {
//     var app = new Vue({
//         el: '#vue_test',
//         data: {
//             message: 'You loaded this page on ' + new Date(),
//             visible: true
//         }
//     })
// }

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

function calculate() {
    var input = document.getElementById('course_input').value
    courseTable = new CourseTableModel(input)

    console.log(courseTable.courseList);
}
