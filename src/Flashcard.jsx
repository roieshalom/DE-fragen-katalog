import React, { useState, useEffect } from "react";

export default function Flashcard({
  question,
  answers,
  correctIndex,
  selectedAnswer,
  onSelectAnswer,
  id,
  imageId
}) {
  const [showLightbox, setShowLightbox] = useState(false);

  // AI overlay state
  const [showAiOverlay, setShowAiOverlay] = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowLightbox(false);
        setShowAiOverlay(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!question || !answers || answers.length === 0) {
    return <p className="text-base">Loading question...</p>;
  }

  const imageUrl = imageId ? `/images/${imageId}.png` : null;

  const handleAskAI = async () => {
    setAiError("");
    setAiAnswer("");
    setShowAiOverlay(true);
    setAiLoading(true);

    try {
      const messages = [
          {
    role: "system",
    content:
      "You are a friendly tutor for the German Einbürgerungstest. " +
      "Explain clearly in short in English " +
      "Translate the question, then give a brief explanation of the topic and the key ideas. " +
      "Do NOT say directly which answer option is correct. " +
      "Instead, give hints that help the learner think and recognise the right answer on their own."
  },
  {
    role: "user",
    content: `Here is a multiple-choice question from the German Einbürgerungstest.\n` +
             `Question: "${question}"\n` +
             `Options: ${answers.join(" | ")}\n\n` +
             "Explain what the question is about, translate it, and describe the important background in a neutral way. " +
             "Give subtle hints but do not name the correct option explicitly."
  }
];

      const res = await fetch("https://einbuergerung-ai-api.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setAiAnswer(data?.reply?.content || "Sorry, no answer was returned.");
    } catch (err) {
      console.error("AI request failed:", err);
      setAiError("Sorry, the AI explanation is not available right now. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      <div className="flashcard">
        <div className="question-section">
          {/* Optional image */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt={`Bild zur Frage ${id}`}
              className="question-image"
              onClick={() => setShowLightbox(true)}
            />
          )}

          <p className="question-text text-base font-medium mb-4 mt-2">
            {question}
          </p>

          <div className="answer-list">
            {answers.map((answer, index) => {
              const isSelected = selectedAnswer !== null;
              const isCorrect = index === correctIndex;
              const isChosen = index === selectedAnswer;

              let buttonClass = "answer-button text-base";
              if (isSelected) {
                if (isCorrect) {
                  buttonClass += " correct";
                } else if (isChosen) {
                  buttonClass += " wrong";
                }
              }

              return (
                <button
                  key={index}
                  className={buttonClass}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectAnswer(index);
                  }}
                  disabled={isSelected}
                >
                  {answer}
                </button>
              );
            })}
          </div>

          {/* Ask AI button */}
          <div style={{ marginTop: "1rem" }}>
            <button
              type="button"
              className="ai-explain-button"
              onClick={handleAskAI}
            >
              ✨ AI explains
            </button>
          </div>
        </div>

        <div className="question-meta text-sm text-muted-light">
          Frage #{id}
        </div>
      </div>

      {/* Image Lightbox Overlay */}
      {showLightbox && imageUrl && (
        <div
          className="lightbox-overlay"
          onClick={() => setShowLightbox(false)}
        >
          <img
            src={imageUrl}
            alt={`Frage ${id} groß`}
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* AI Explanation Overlay */}
      {showAiOverlay && (
        <div
          className="lightbox-overlay"
          onClick={() => setShowAiOverlay(false)}
        >
          <div
            className="lightbox-image"
            style={{
              maxWidth: "600px",
              width: "90%",
              padding: "16px",
              background: "white",
              color: "#111",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              overflowY: "auto",
              maxHeight: "80vh"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                marginBottom: "0.75rem"
              }}
            >
              Explaining question #{id}
            </h2>

            {aiLoading && (
              <div className="ai-loading-row" style={{ fontSize: "0.95rem" }}>
                <span className="ai-spinner" aria-hidden="true" />
                <span>Thinking …</span>
              </div>
            )}

            {!aiLoading && aiError && (
              <p style={{ fontSize: "0.95rem", color: "#b00020" }}>{aiError}</p>
            )}

            {!aiLoading && !aiError && aiAnswer && (
              <p style={{ fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>
                {aiAnswer}
              </p>
            )}

            <div style={{ marginTop: "1rem", textAlign: "right" }}>
              <button
                type="button"
                className="answer-button text-base"
                onClick={() => setShowAiOverlay(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
