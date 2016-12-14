/*
My general approach to this challenge was the following:
1. Data Cleaning
  collectData()

2. Dividing Students
  sortStudentScore()
  divideStudents()

3. Calculate Item Discrimination
  calcDiscrimination()
*/


// bring in json data and set to variable
var fs = require('fs');
var array = JSON.parse(fs.readFileSync('answers.json'))

var top;
var middle;
var bottom;
var questionScores = {};
var overallScores = [];



// - Check the student JSON for edge case
//     a)less than 3 students 
// - Build two data structures
//   a) questionScores, an object consisting of a question whose value is another object
//      whose value is a student id whose value is either true or false. This will tell 
//      me for a given question if a particular student got the question right or not
//   b) overallScores, a 2D array where each nested array consists of user id and that 
//      user's score. Score is based on number of correct answers divided by total 
//      questions answered

function collectData(array){

  if(array.length < 3){
    return 'Not enough students'
  }

  var currentStudent = array[0].user_id;
  var totalCorrect = 0;
  var totalAnswered = 0;

  for(var i = 0; i<array.length; i++){
    
    if(questionScores[array[i].question] === undefined){
      questionScores[array[i].question] = {}
    } else {
      questionScores[array[i].question][array[i].user_id] = array[i].correct
    }


    if(i === array.length - 1){
      if(array[i].correct === true){
        totalCorrect++
      }
      overallScores.push([currentStudent, score(totalCorrect, totalAnswered)])

    }else if(array[i].user_id !== currentStudent){   
      overallScores.push([currentStudent, score(totalCorrect, totalAnswered)])

      currentStudent = array[i].user_id
      totalCorrect = 0
      totalAnswered = 0

    } else {
      if(array[i].correct === true){
        totalCorrect++
      }
    }
    totalAnswered++
  }


}

function score(totalCorrect, totalAnswered){
  return totalCorrect/totalAnswered
}



// - Sort students by score
// - Partition students into three groups
//   Based on their score, I divide the students into three groups, top, middle and bottom. 
//   For any shared values between top and middle or bottom and middle, the students are 
//   placed in the middle group. This means that there will never be students with the same 
//   score that are in different groups

function sortStudentScore(overallScores){
  overallScores.sort(function(a, b){
    return parseFloat(a[1]) - parseFloat(b[1])
  }) 
}


function divideStudents(overallScores){
  bottomIdx = Math.floor(overallScores.length/3);
  middleIdx = Math.floor(2 * overallScores.length/3);
  bottom = overallScores.slice(0, bottomIdx);
  middle = overallScores.slice(bottomIdx, middleIdx);
  top = overallScores.slice(middleIdx, overallScores.length)
  
  while(top[0][1] === middle[middle.length-1][1]){
    middle.push(top.shift())
  }

  while(middle[0][1] === bottom[bottom.length-1][1]){
    middle.unshift(bottom.pop())
  }

}

// - I iterate the questionScores object, and for each question, look at the top and bottom 
//   students, tallying the number of correct answers respectively. Then I divide that 
//   number by the size of the respective group and subtract the top group's number from 
//   the bottom group's to find the item discrimination for a given question.

function calcDiscrimination(){
  var topCorrect = 0
  var bottomCorrect = 0
  var items = []

  for(var property in questionScores) {
    if(questionScores.hasOwnProperty(property)) {
      for(var i = 0; i < top.length; i++){
        if(questionScores[property][top[i][0]] === true){
          topCorrect++
        }
      }
      for(var i = 0; i < bottom.length; i++){
        if(questionScores[property][bottom[i][0]] === true){
          bottomCorrect++
        }
      }
    }
    var questionDiscrimination = (topCorrect/top.length) - (bottomCorrect/bottom.length);
    items.push([property, questionDiscrimination])
    topCorrect = 0
    bottomCorrect = 0
  }

  return items
}


// Run functions inside of a single function for ease of use.
// I think this reinforces the modularity of the functions' respective purposes and
// should lead to easier development in the future
function computeItemDiscrimination(array){
  collectData(array);
  sortStudentScore(overallScores);
  divideStudents(overallScores);
  return calcDiscrimination();
}


computeItemDiscrimination(array)

/*
Reflections:

I think one big area that is left for futher interpretation is how a student's score is 
calculated. By allowing students to not answer questions, it presents a problem as to how 
to determine if a student did well, poorly, or something inbetween. Without knowing the 
context of the test situation, my best estimate would be that not answering a question is 
the same as answering incorrectly and should therefore factor in negatively in the 
student's score. But the best answer to this would likely take into account the context in 
which students are taking the test.

Edge cases:

Beyond developing a more sophisticated way of calculating scores, areas that could be 
improved are related to data validation. For example, if all or most of the students have 
the same score, this calculation may not give insightful results.

Further, partitioning students into separate groups could be problematic if the lowest 
value initially in the middle is the only value in the lowest, as all members of the lowest 
would be pushed to the middle.

Solving for some of these edge cases and others would make for an algorithm that could 
respond to a greater variety of data inputs. 

*/

