// set data set to variable
var fs = require('fs');
var array = JSON.parse(fs.readFileSync('answers.json'))

// define student groups
var top;
var middle;
var bottom;

// create object with each student's score. score is based on correct answers divided by questions answered
function score(){
  var students = []
  var studentObj = {}
  var currentStudent = array[0].user_id;
  var totalQuestions = 0;
  var totalCorrect = 0;

  for(var i = 0; i < array.length + 1; i++){
    if(array[i] === undefined){
      studentObj['user_id'] = currentStudent
      studentObj['studentScore'] = totalCorrect/totalQuestions
      students.push(studentObj)
      return students
    }
    if(array[i].user_id !== currentStudent){
      studentObj['user_id'] = currentStudent
      studentObj['studentScore'] = totalCorrect/totalQuestions      
      students.push(studentObj)
      currentStudent = array[i].user_id
      totalCorrect = 0
      totalQuestions = 0
      studentObj = {}
    } else {
      if(array[i].correct === true){
        totalCorrect ++
      }
      totalQuestions ++
    }
  }
}


// sort students object by score
function sortStudentScore(students){
  students.sort(function(a, b){
    return parseFloat(a.studentScore) - parseFloat(b.studentScore)
  }) 
}

// divide students into three cohorts based on score
function divideStudents(students){
  bottomIdx = Math.floor(students.length/3);
  middleIdx = Math.floor(2 * students.length/3)
  bottom = students.slice(0, bottomIdx);
  middle = students.slice(bottomIdx, middleIdx);
  top = students.slice(middleIdx, students.length)
}


// sort the JSON by questions
function sortQuestions(array){
  array.sort(function(a, b){
    if(a.question < b.question){
      return 1;
    } else if (a.question > b.question){
      return -1;
    } else {
      return 0;
    }
  })
}


// create item discrimination object, made up of question and corresponding item discrimination value
function itemDiscrimination(array){
  var itemDiscrimination = []
  var item = {}

  var currentQuestion = array[0].question
  var topTotal = 0
  var topCorrect = 0
  var bottomTotal = 0
  var bottomCorrect = 0

  for(var i = 0; i < array.length + 1; i++){

    if(array[i] === undefined){
      item['question'] = currentQuestion
      item['item_discrimination'] = (topCorrect/topTotal) - (bottomCorrect/bottomTotal)
      itemDiscrimination.push(item)
      return itemDiscrimination
    }

    if(currentQuestion !== array[i].question){
      item['question'] = currentQuestion
      item['item_discrimination'] = (topCorrect/topTotal) - (bottomCorrect/bottomTotal)
      itemDiscrimination.push(item)
      currentQuestion = array[i].question
      item = {}
      topTotal = 0
      topCorrect = 0
      bottomTotal = 0
      bottomCorrect = 0
    }

    if(checkTop(array[i].user_id) === true){
      if(array[i].correct === true){
        topTotal++
        topCorrect++
      }else {
        topTotal++
      }

    }

    if(checkBottom(array[i].user_id) === true){
      if(array[i].correct === true){
        bottomTotal ++
        bottomCorrect ++
      }else {
        bottomTotal ++
      }
    }

  }

}

// check if student is in top cohort
function checkTop(studentId){
  i = 0
  while(i < top.length){
    if(top[i].user_id == studentId){
      return true
    }
    i++
  }
}

// check if student is in bottom cohort
function checkBottom(studentId){
  i = 0
  while(i < bottom.length){
    if(bottom[i].user_id == studentId){
      return true
    }
    i++
  }
}

// log questions and values to console
function displayItemDiscrimination(array){
  for(var i = 0;i < array.length; i++){
    console.log('Q: ' + array[i].question + ' --- Item discrimination: ' + array[i].item_discrimination)
  }
}

// create array of student objs with score
var students = score(array)
// sort the array of objects by score
sortStudentScore(students)
// divide students into three groups
divideStudents(students)
// sort questions
sortQuestions(array)
// print item discrimination for each question
displayItemDiscrimination(itemDiscrimination(array))

