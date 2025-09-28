import { logEvent } from "firebase/analytics";
import { getAnalyticsInstance } from "./firebase";
import React, { useState, useEffect } from "react";
import Flashcard from "./Flashcard";
import AboutModal from "./AboutModal";
import StreakProgressBar from "./StreakProgressBar";
import StatsModal from "./StatsModal";
import { doc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "./firebase";
import logAnalyticsEvent from "./logAnalyticsEvent";
import "./style.css";
import CustomConsent from "./CustomConsent";
import SupportButton from "./SupportButton";

// ZZZ_FINAL_TEST_123 - If you see this string in your dist/assets/index-*.js file, you know build is working!

export default function App() {
  // ZZZ_FINAL_TEST_123 - State declaration test
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [triggerCelebration, setTriggerCelebration] = useState(false);
  const SHOW_STATS = true;

  const imageQuestionNumbers = new Set([
    21, 55, 70, 130, 176, 181, 187, 209, 216, 226, 235, 301, 308,
  ]);

  useEffect(() => {
    const waitForAnalytics = setInterval(() => {
      if (window.gtag || window.firebase?.analytics) {
        logAnalyticsEvent("session_start");
        clearInterval(waitForAnalytics);
      }
    }, 100);

    fetch("/data/questions.json")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item) => {
          const qNum = item.question_number;
          return {
            id: qNum ?? "N/A",
            question: item.question ?? "No question provided",
            answers: item.options ?? [],
            correct: item.options?.indexOf(item.correct_answer) ?? -1,
            imageId: imageQuestionNumbers.has(qNum) ? qNum : null,
          };
        });

        setQuestions(formatted);
        const randomIndex = Math.floor(Math.random() * formatted.length);
        setCurrentQuestion(randomIndex);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to load questions:", err);
        setLoading(false);
      });

    return () => clearInterval(waitForAnalytics);
  }, []);

  const handleSelectAnswer = async (index) => {
    const isCorrect = index === questions[currentQuestion]?.correct;
    setSelectedAnswer(index);

    const newStreak = isCorrect ? correctStreak + 1 : 0;
    setCorrectStreak(newStreak);

    if (newStreak === 17) {
      logAnalyticsEvent("completed_streak_17");
      setTriggerCelebration(true);
      setTimeout(() => setTriggerCelebration(false), 3000);
    }

    const questionId = String(questions[currentQuestion]?.id);
    logAnalyticsEvent("question_answered", { question_id: questionId, correct: isCorrect });

    let count = Number(sessionStorage.getItem("answered_count") || 0) + 1;
    sessionStorage.setItem("answered_count", count);

    if (count === 3) {
      logAnalyticsEvent("answered_3_in_session");
      console.log("🎯 Logged: answered_3_in_session");
    }

    try {
      const ref = doc(db, "questionStats", questionId);
      await updateDoc(ref, {
        total: increment(1),
        correct: isCorrect ? increment(1) : increment(0),
        wrong: !isCorrect ? increment(1) : increment(0),
      });
    } catch (err) {
      if (err.code === "not-found") {
        await setDoc(doc(db, "questionStats", questionId), {
          total: 1,
          correct: isCorrect ? 1 : 0,
          wrong: isCorrect ? 0 : 1,
        });
      } else {
        console.error("❌ Firestore update failed:", err);
      }
    }

    try {
      const globalRef = doc(db, "metrics", "totals");
      await updateDoc(globalRef, {
        total: increment(1),
        correct: isCorrect ? increment(1) : increment(0),
        wrong: !isCorrect ? increment(1) : increment(0),
      });
    } catch (err) {
      if (err.code === "not-found") {
        await setDoc(doc(db, "metrics", "totals"), {
          total: 1,
          correct: isCorrect ? 1 : 0,
          wrong: isCorrect ? 0 : 1,
        });
      } else {
        console.error("❌ Failed to update global totals:", err);
      }
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
    logAnalyticsEvent("random_question_clicked");
  };

  const openAboutModal = () => {
    setShowStats(false);
    setShowAbout(true);
    logAnalyticsEvent("about_modal_opened");
  };

  const openStatsModal = () => {
    setShowAbout(false);
    setShowStats(true);
    logAnalyticsEvent("stats_modal_opened");
  };

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-inner">
          <h1 className="app-title">Fragen Katalog</h1>
          <div className="header-links">
            {SHOW_STATS && (
              <a href="#" className="about-link" onClick={(e) => { e.preventDefault(); openStatsModal(); }}>
                Statistiken
              </a>
            )}
            <a href="#" className="about-link" onClick={(e) => { e.preventDefault(); openAboutModal(); }}>
              Über
            </a>
          </div>
        </div>
      </header>

      <main className="main-content">
        {loading ? (
          <p className="loading-text">Loading questions...</p>
        ) : (
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
              <button
                className="controls-button"
                onClick={() => {
                  logAnalyticsEvent("next_question_clicked");
                  randomQuestion();
                }}
              >
                Nächste Frage
              </button>
            </div>

            <div style={{ height: "10px" }} />
          </>
        )}
      </main>

      {showAbout && !showStats && <AboutModal onClose={() => setShowAbout(false)} />}
      {showStats && !showAbout && (
        <StatsModal
          onClose={(jumpToIndex) => {
            setShowStats(false);
            if (typeof jumpToIndex === "number") {
              setCurrentQuestion(jumpToIndex);
            }
          }}
          questions={questions}
        />
      )}

      <CustomConsent />

      {!showAbout && !showStats && (
        <div
          style={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: 1000,
            width: "100%",
            maxWidth: "200px",
          }}
        >
          <SupportButton />
        </div>
      )}
    </div>
  );
}