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
    question: "What does frictional loss in a pipe primarily depend on?",  ///// Write the question inside double quotes
    answers: {
      a: "Type of fluid only",                  ///// Write the option 1 inside double quotes
      b: "Length and roughness of the pipe",    ///// Write the option 2 inside double quotes
      c: "Color of the pipe",                   ///// Write the option 3 inside double quotes
      d: "Direction of sunlight"                ///// Write the option 4 inside double quotes
    },
    correctAnswer: "b"                          ///// Write the correct option inside double quotes
  },
  {
    question: " Which of the following flow regimes is most associated with significant friction losses?",  ///// Write the question inside double quotes
    answers: {
      a: "Static fluid",                        ///// Write the option 1 inside double quotes
      b: "Laminar flow",                        ///// Write the option 2 inside double quotes
      c: "Turbulent flow",                      ///// Write the option 3 inside double quotes
      d: "Supersonic flow"                      ///// Write the option 4 inside double quotes
    },
    correctAnswer: "c"                          ///// Write the correct option inside double quotes
  },
  {
    question: " What does the Reynolds number indicate in pipe flow?",  ///// Write the question inside double quotes
    answers: {
      a: "The chemical composition of the fluid",   ///// Write the option 1 inside double quotes
      b: "The speed of sound in the fluid",         ///// Write the option 2 inside double quotes
      c: "Whether the flow is laminar or turbulent",///// Write the option 3 inside double quotes
      d: "The temperature gradient in the pipe"     ///// Write the option 4 inside double quotes
    },
    correctAnswer: "c"                              ///// Write the correct option inside double quotes
  },
  {
    question: "If the flow rate increases in a pipe, what generally happens to the friction loss?",  ///// Write the question inside double quotes
    answers: {
      a: "It decreases",                            ///// Write the option 1 inside double quotes
      b: "It remains constant",                     ///// Write the option 2 inside double quotes
      c: "It increases",                            ///// Write the option 3 inside double quotes
      d: "It becomes zero"                          ///// Write the option 4 inside double quotes
    },
    correctAnswer: "c"                              ///// Write the correct option inside double quotes
  },
  {
    question: " Which of the following best describes the head loss in a straight pipe due to friction?",  ///// Write the question inside double quotes
    answers: {
      a: "A gain in mechanical energy",             ///// Write the option 1 inside double quotes
      b: "A pressure drop along the length of the pipe", ///// Write the option 2 inside double quotes
      c: "A thermal reaction inside the fluid",      ///// Write the option 3 inside double quotes
      d: "An increase in pipe diameter"             ///// Write the option 4 inside double quotes
    },
    correctAnswer: "b"                              ///// Write the correct option inside double quotes
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
