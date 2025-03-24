import { analytics } from "./firebase";
import { logEvent } from "firebase/analytics";
import { useState, useEffect } from "react";

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [triggerCelebration, setTriggerCelebration] = useState(false);

  const imageQuestionNumbers = new Set([
    21, 55, 70, 130, 176, 181, 187, 209, 216, 226, 235, 301, 308
  ]);

  useEffect(() => {
    const jsonPath = '/data/questions.json';

    if (analytics) {
      logEvent(analytics, "test_event_fired");
      console.log("📤 test_event_fired sent");
    }

    fetch(jsonPath)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching questions:", error));
  }, []);
}

export default function App() {
  return (
    <div>✅ All good</div>
  );
}


  const handleSelectAnswer = (index) => {
    const isCorrect = index === questions[currentQuestion]?.correct;

    setSelectedAnswer(index);

    if (isCorrect) {
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      if (newStreak === 17) {
        setTriggerCelebration(true);
        setTimeout(() => {
          setTriggerCelebration(false);
        }, 3000);
      }
    } else {
      setCorrectStreak(0);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setCurrentQuestion((prev) => (prev + 1) % questions.length);
  };

  const prevQuestion = () => {
    setSelectedAnswer(null);
    setCurrentQuestion((prev) => (prev - 1 + questions.length) % questions.length);
  };

  const randomQuestion = () => {
    setSelectedAnswer(null);
    setCurrentQuestion(Math.floor(Math.random() * questions.length));
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("about-modal-overlay")) {
      setShowAbout(false);
    }
  };

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-titles">
            <h1 className="app-title">Fragen-Katalog</h1>
            <p className="subtitle">Under Construction</p>
          </div>
          <a href="#" className="about-link" onClick={(e) => { e.preventDefault(); setShowAbout(true); }}>About</a>
        </div>
      </header>

      <main className="main-content">
        {loading ? (
          <p className="loading-text">Loading questions...</p>
        ) : questions.length > 0 ? (
          <>
            <StreakProgressBar
              streak={correctStreak}
              triggerCelebration={triggerCelebration}
              onResetStreak={() => setCorrectStreak(0)}
            />

            <Flashcard
              id={questions[currentQuestion]?.id}
              question={questions[currentQuestion]?.question}
              answers={questions[currentQuestion]?.answers}
              correctIndex={questions[currentQuestion]?.correct}
              selectedAnswer={selectedAnswer}
              onSelectAnswer={handleSelectAnswer}
              imageId={questions[currentQuestion]?.imageId}
            />

            <div className="controls">
              <button onClick={prevQuestion}>◀︎ Zurück</button>
              <button onClick={randomQuestion}>Zufällig</button>
              <button onClick={nextQuestion}>Weiter ▶︎</button>
            </div>

            <div className="info-footer">
              <p className="total-questions">Insgesamt: {questions.length} Fragen</p>
            </div>
          </>
        ) : (
          <p className="error-text">❌ Keine Fragen verfügbar. Bitte die JSON-Datei prüfen.</p>
        )}
      </main>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

    </div>
  );

