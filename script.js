let questionsData = [];       // כאן ישמרו השאלות מה-JSON
let currentQuestionIndex = 0; // מעקב אחר השאלה הנוכחית

// פונקציה להבאת השאלות מקובץ ה-JSON
async function fetchQuestions() {
  try {
    const response = await fetch('questions.json');
    const data = await response.json();
    questionsData = data.questions;
    showQuestion();
  } catch (error) {
    console.error('שגיאה בטעינת קובץ ה-JSON:', error);
  }
}

// מציג את השאלה הנוכחית
function showQuestion() {
  // הסתרת התשובה מהסיבוב הקודם
  document.getElementById('answer').classList.add('hidden');

  // אם הגענו לסוף הרשימה, נחזור להתחלה או נציג הודעה
  if (currentQuestionIndex >= questionsData.length) {
    currentQuestionIndex = 0;
  }

  // שליפת השאלה הנוכחית
  const currentQuestion = questionsData[currentQuestionIndex];
  
  // הצגת הטקסט של השאלה
  document.getElementById('question').textContent = currentQuestion.question;

  // הצגת התשובה (נחכה שהמשתמש ילחץ על הכפתור)
  document.getElementById('answer').textContent = currentQuestion.answer;
}

// הצגת התשובה הנוכחית
function showAnswer() {
  document.getElementById('answer').classList.remove('hidden');
}

// מעבר לשאלה הבאה
function nextQuestion() {
  currentQuestionIndex++;
  showQuestion();
}

// תחילת המשחק ברגע שהדף נטען
window.addEventListener('load', () => {
  document.getElementById('show-answer-btn').addEventListener('click', showAnswer);
  document.getElementById('next-question-btn').addEventListener('click', nextQuestion);

  fetchQuestions();
});
