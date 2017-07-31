window.onload = function() {
    var app = new Vue({
        el: '#vue_test',
        data: {
            message: 'You loaded this page on ' + new Date(),
            visible: true
        }
    })
}

function calculate() {
    var input = document.getElementById('course_input')
    var row = input.value.split('\n')[0]
    var cell = row.split('\t')[0]
    console.log(row)
    console.log(cell);
}
