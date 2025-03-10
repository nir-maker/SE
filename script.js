let questionsData = [];       // מאגר השאלות
let currentQuestionIndex = 0; // שאלה נוכחית
let score = 0;                // ניקוד
let totalQuestions = 0;       // סך כל השאלות

// פונקציה לשיבוש מערך (Shuffle)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// טעינת שאלות מ־JSON
async function fetchQuestions() {
  try {
    const response = await fetch('questions.json');
    const data = await response.json();
    questionsData = data.questions;
    // שיבוש השאלות לצורך סדר אקראי
    questionsData = shuffle(questionsData);
    totalQuestions = questionsData.length;
    updateProgress();
    showQuestion();
  } catch (error) {
    console.error('שגיאה בטעינת שאלות:', error);
  }
}

// עדכון תצוגת ניקוד והתקדמות
function updateProgress() {
  document.getElementById('score').textContent = "ניקוד: " + score;
  document.getElementById('progress').textContent = "התקדמות: " + currentQuestionIndex + "/" + totalQuestions;
}

// מציג את השאלה הנוכחית בהתאם לסוגה
function showQuestion() {
  clearFeedback();
  // איפוס אזורי הבחירה
  document.getElementById('options').innerHTML = "";
  document.getElementById('fillin-container').classList.add('hidden');
  document.getElementById('submit-answer-btn').classList.add('hidden');
  document.getElementById('next-question-btn').classList.add('hidden');
  
  // בדיקה אם סיימנו את כל השאלות
  if (currentQuestionIndex >= totalQuestions) {
    document.getElementById('question').textContent = "סיימת את כל השאלות! ניקוד סופי: " + score;
    return;
  }
  
  // אנימציה קלה למעבר לשאלה חדשה
  const quizContainer = document.getElementById('quiz-container');
  quizContainer.classList.remove('animate');
  void quizContainer.offsetWidth; // טריק לאתחול האנימציה
  quizContainer.classList.add('animate');

  const q = questionsData[currentQuestionIndex];
  // הצגת השאלה יחד עם רמת הקושי והנושא
  document.getElementById('question').textContent = q.question + " (" + q.difficulty + " - " + q.topic + ")";
  
  // טיפול בהתאם לסוג השאלה
  if (q.type === "multiple") {
    let choices = [];
    if (q.choices && q.choices.length > 0) {
      choices = q.choices.slice();
      // ודא שהתשובה הנכונה כלולה במערך האפשרויות
      if (!choices.includes(q.answer)) {
        choices.push(q.answer);
      }
    } else {
      choices = [q.answer];
    }
    choices = shuffle(choices);
    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.textContent = choice;
      btn.className = "option btn";
      btn.addEventListener('click', () => checkAnswer(choice));
      document.getElementById('options').appendChild(btn);
    });
  } else if (q.type === "truefalse") {
    const trueBtn = document.createElement('button');
    trueBtn.textContent = "נכון";
    trueBtn.className = "option btn";
    trueBtn.addEventListener('click', () => checkAnswer("נכון"));
    const falseBtn = document.createElement('button');
    falseBtn.textContent = "לא נכון";
    falseBtn.className = "option btn";
    falseBtn.addEventListener('click', () => checkAnswer("לא נכון"));
    document.getElementById('options').appendChild(trueBtn);
    document.getElementById('options').appendChild(falseBtn);
  } else if (q.type === "fillin") {
    // הצגת תיבת קלט לתשובה
    document.getElementById('fillin-container').classList.remove('hidden');
    document.getElementById('submit-fillin').onclick = handleFillinSubmit;
  }
  
  // במידה והשאלה היא מסוג בחירה (רב-ברירה או נכון/לא נכון)
  if (q.type === "multiple" || q.type === "truefalse") {
    document.getElementById('submit-answer-btn').classList.remove('hidden');
  }
  
  updateProgress();
}

// טיפול בהגשת תשובה בשאלות השלמת משפט
function handleFillinSubmit() {
  const userAnswer = document.getElementById('fillin-answer').value.trim();
  checkAnswer(userAnswer);
}

// בודק את התשובה ומספק פידבק מיידי עם אנימציה קלה
function checkAnswer(selectedAnswer) {
  const q = questionsData[currentQuestionIndex];
  let isCorrect = false;
  
  if (selectedAnswer.toLowerCase() === q.answer.toLowerCase()) {
    isCorrect = true;
  }
  
  if (isCorrect) {
    score += 10; // הוספת ניקוד לתשובה נכונה
    showFeedback("נכון! כל הכבוד!", true);
  } else {
    showFeedback("שגיאה! התשובה הנכונה היא: " + q.answer, false);
  }
  updateProgress();
  document.getElementById('next-question-btn').classList.remove('hidden');
  document.getElementById('submit-answer-btn').classList.add('hidden');
  disableOptions();
}

// מציג את הפידבק עם צבע ואפקט אנימציה
function showFeedback(message, isCorrect) {
  const feedbackEl = document.getElementById('feedback');
  feedbackEl.textContent = message;
  feedbackEl.style.color = isCorrect ? 'green' : 'red';
  feedbackEl.classList.add('animate');
  setTimeout(() => {
    feedbackEl.classList.remove('animate');
  }, 500);
}

// מנקה את הפידבק
function clearFeedback() {
  document.getElementById('feedback').textContent = "";
}

// מנטרל את לחצני הבחירה לאחר התשובה
function disableOptions() {
  const options = document.querySelectorAll('.option');
  options.forEach(option => {
    option.disabled = true;
  });
}

// מעבר לשאלה הבאה – בוחרים שאלה אקראית מתוך השאר
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < totalQuestions) {
    const randomIndex = Math.floor(Math.random() * (totalQuestions - currentQuestionIndex)) + currentQuestionIndex;
    [questionsData[currentQuestionIndex], questionsData[randomIndex]] = [questionsData[randomIndex], questionsData[currentQuestionIndex]];
  }
  showQuestion();
}

// מאזין לכפתור "שאלה הבאה"
document.getElementById('next-question-btn').addEventListener('click', nextQuestion);

// מאזין לכפתור "בדוק תשובה" – ניתן להרחיב לוגיקה במידת הצורך
document.getElementById('submit-answer-btn').addEventListener('click', () => {
  // עבור סוגי שאלות בהם נדרשת אישור נוסף (אם נבחר לאפשר בחירה כפולה)
});

// הוספת שאלה חדשה דרך הטופס (עדכון המאגר המקומי)
// (ניתן לשלב שמירה בשרת במידה וקיימת מערכת backend)
document.getElementById('add-question-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const type = document.getElementById('question-type').value;
  const difficulty = document.getElementById('question-difficulty').value;
  const topic = document.getElementById('question-topic').value || "כללי";
  const questionText = document.getElementById('new-question').value;
  const answerText = document.getElementById('new-answer').value;
  let newQuestion = {
    type: type,
    difficulty: difficulty,
    topic: topic,
    question: questionText,
    answer: answerText
  };
  
  if (type === "multiple") {
    const choicesStr = document.getElementById('new-choices').value;
    if (choicesStr.trim() !== "") {
      newQuestion.choices = choicesStr.split(',').map(item => item.trim());
    } else {
      newQuestion.choices = [];
    }
  }
  
  // הוספת השאלה למאגר והרחבת הסך הכללי
  questionsData.push(newQuestion);
  totalQuestions = questionsData.length;
  updateProgress();
  e.target.reset();
  alert("השאלה נוספה בהצלחה!");
});

// טעינת השאלות עם טעינת הדף
window.addEventListener('load', fetchQuestions);
