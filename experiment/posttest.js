/////////////////////////////////////////////////////////////////////////////

/////////////////////// Do not modify the below code ////////////////////////

/////////////////////////////////////////////////////////////////////////////

(function() {
  function buildQuiz() {
    // we'll need a place to store the HTML output
    const output = [];

    // for each question...
    myQuestions.forEach((currentQuestion, questionNumber) => {
      // we'll want to store the list of answer choices
      const answers = [];

      // and for each available answer...
      for (letter in currentQuestion.answers) {
        // ...add an HTML radio button
        answers.push(
          `<label>
            <input type="radio" name="question${questionNumber}" value="${letter}">
            ${letter} :
            ${currentQuestion.answers[letter]}
          </label>`
        );
      }

      // add this question and its answers to the output
      output.push(
        `<div class="question"> ${currentQuestion.question} </div>
        <div class="answers"> ${answers.join("")} </div>`
      );
    });

    // finally combine our output list into one string of HTML and put it on the page
    quizContainer.innerHTML = output.join("");
  }

  function showResults() {
    // gather answer containers from our quiz
    const answerContainers = quizContainer.querySelectorAll(".answers");

    // keep track of user's answers
    let numCorrect = 0;

    // for each question...
    myQuestions.forEach((currentQuestion, questionNumber) => {
      // find selected answer
      const answerContainer = answerContainers[questionNumber];
      const selector = `input[name=question${questionNumber}]:checked`;
      const userAnswer = (answerContainer.querySelector(selector) || {}).value;

      // if answer is correct
      if (userAnswer === currentQuestion.correctAnswer) {
        // add to the number of correct answers
        numCorrect++;

        // color the answers green
        //answerContainers[questionNumber].style.color = "lightgreen";
      } else {
        // if answer is wrong or blank
        // color the answers red
        answerContainers[questionNumber].style.color = "red";
      }
    });

    // show number of correct answers out of total
    resultsContainer.innerHTML = `${numCorrect} out of ${myQuestions.length}`;
  }

  const quizContainer = document.getElementById("quiz");
  const resultsContainer = document.getElementById("results");
  const submitButton = document.getElementById("submit");
 

/////////////////////////////////////////////////////////////////////////////

/////////////////////// Do not modify the above code ////////////////////////

/////////////////////////////////////////////////////////////////////////////






/////////////// Write the MCQ below in the exactly same described format ///////////////

const myQuestions = [
  {
    question: "On increasing the radius of the steel ball to double its value, the terminal velocity of the ball becomes:",
    answers: {
      a: "double",
      b: "four times",
      c: "eight times",
      d: "sixteen times"
    },
    correctAnswer : "b"
  },

  {
    question : "On increasing the density of material of the falling ball, its terminal velocity:",
    answers: {
      a: "Increases",
      b: "Decreases",
      c: "Remains constant",
      d: "NOT"
    },
    correctAnswer : "a"
  },

  {
    question : "What is the primary cause of friction loss in a straight pipe?",
    answers: {
      a: "Change in pipe direction",
      b: "Pipe expansion",
      c: "Resistance due to viscosity of fluid and pipe wall roughness",
      d: "Fluid evaporation"
    },
    correctAnswer : "c"
  },

  {
    question : "Which equation is used to calculate head loss due to friction in a straight pipe?",
    answers: {
      a: "Bernoulli's Equation",
      b: "Darcy-Weisbach Equation",
      c: "Reynolds Number Equation",
      d: "Pascal’s Law"
    },
    correctAnswer : "b"
  },

  {
    question : "As the flow rate of fluid increases in a pipe, the friction loss generally:",
    answers: {
      a: "Decreases linearly",
      b: "Stays constant",
      c: "Increases",
      d: "Becomes zero"
    },
    correctAnswer : "c"
  }
];

  
/////////////////////////////////////////////////////////////////////////////

/////////////////////// Do not modify the below code ////////////////////////

/////////////////////////////////////////////////////////////////////////////


  // display quiz right away
  buildQuiz();

  // on submit, show results
  submitButton.addEventListener("click", showResults);
})();


/////////////////////////////////////////////////////////////////////////////

/////////////////////// Do not modify the above code ////////////////////////

/////////////////////////////////////////////////////////////////////////////
