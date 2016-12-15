/*
My general approach to this challenge was the following:
1. Data Cleaning
  loadData()

2. Dividing Students
  findCohorts()

3. Calculate Item Discrimination
  computeScores()
*/


var fs = require('fs');


function DiscriminationScores() {
  this.questionScores = {}
  this.userScores = {}
  this.topCohort = []
  this.bottomCohort = []
}

DiscriminationScores.prototype.main = function(inputFile) {
  this.loadData(inputFile)
  this.findCohorts()
  return this.computeScores()
}

/*
- Check the data for edge case
    a)less than 3 students 
- Build two data structures
  a) questionScores, an object consisting of a question whose value is another object whose value is a student id whose value is either true or false. This will tell me for a given question if a particular student got the question right or not
  b) userScores, an object with a key of user id and value of the student's score. 
*/

DiscriminationScores.prototype.loadData = function(inputFile){
  var userId = null
  var data = JSON.parse(fs.readFileSync('answers.json'))

  if(data.length < 3){
    return 'Not enough students'
  }

  for(var i = 0; i<data.length; i++){
    this.questionScores[data[i].question] = this.questionScores[data[i].question] || {};
    this.questionScores[data[i].question][data[i].user_id] = data[i].correct;

    this.userScores[data[i].user_id] = this.userScores[data[i].user_id] || {num_correct: 0, num_answered: 0};
    this.userScores[data[i].user_id].num_answered++;
    if (data[i].correct === true) {
      this.userScores[data[i].user_id].num_correct++;
    }
  }

  for(userId in this.userScores) {
    this.userScores[userId] = this.userScores[userId].num_correct / this.userScores[userId].num_answered
  }
}

/* 
  - Partition students into groups
   Here I divide the students into cohorts. Initially I sort the students based on their 
   score, then find a bottom and top index by dividing the array into thirds. I check if 
   there are ties for the elements just outside of the top or bottom and return an error 
   message if the bottom index passes the top index or gets bigger than half the size of 
   the list.
*/


DiscriminationScores.prototype.findCohorts = function() {
  var userIds = Object.keys(this.userScores)
  var that = this

  userIds.sort(function(user1, user2) {    
    return that.userScores[user1] - that.userScores[user2]
  })

  var bottomIdx = userIds.length/3;
  var topIdx = (2*userIds.length/3)
  
  while (this.userScores[userIds[bottomIdx]] == this.userScores[userIds[bottomIdx+1]]) {
    bottomIdx++

    if (bottomIdx >= topIdx || bottomIdx >= userIds.length/2){
      return 'Too many similar scores'
    }
  }

  while (this.userScores[userIds[topIdx]] == this.userScores[userIds[topIdx-1]]) {
    topIdx--
  }
  

  this.bottomCohort = userIds.slice(0, bottomIdx)
  this.topCohort = userIds.slice(topIdx, userIds.length)
}


/*
  To compute the scores I just iterate through the questions in questionScores and the 
  corresponding question takers in the top and bottom cohort, keeping track of the students 
  who answered correctly and dividing by the cohort size before subtracting for the final 
  answer
*/

DiscriminationScores.prototype.computeScores = function() {
  var discriminationScores = {}
  var questionId, qScores, topScore, bottomScore
  var totals = 0

  for (questionId in this.questionScores) {
    qScores = this.questionScores[questionId]

    topScore = this.topCohort.reduce(function(accum, userId) {
      if (userId in qScores && qScores[userId]) {
         return accum+1
      } else {
        return accum
      }
    }, 0) / this.topCohort.length 

    bottomScore = this.bottomCohort.reduce(function(accum, userId) {
      if (userId in qScores && qScores[userId]) {
        return accum+1
      } else {
        return accum
      }
    }, 0) / this.bottomCohort.length

    discriminationScores[questionId] = topScore - bottomScore
  }
  return discriminationScores
}

var d = new DiscriminationScores()
console.log(d.main('answers.json'))

/*
Reflections:

I think one big area that is left for futher interpretation is how a student's score is 
calculated. By allowing students to not answer questions, it presents a problem as to how 
to determine if a student did well, poorly, or something inbetween. Without knowing the 
context of the test situation, my best estimate would be that not answering a question is 
the same as answering incorrectly and should therefore factor in negatively in the 
student's score. But the best answer to this would likely take into account the context in 
which students are taking the test.


*/




