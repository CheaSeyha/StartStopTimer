import { useState, useEffect } from "react";

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState("timer"); // 'timer' | 'history'

  // Load state from LocalStorage on mount
  useEffect(() => {
    const savedStartTime = localStorage.getItem("timerStartTime");
    const savedIsRunning = localStorage.getItem("timerIsRunning") === "true";
    const savedHistory = JSON.parse(
      localStorage.getItem("timerHistory") || "[]",
    );

    setHistory(savedHistory);

    if (savedIsRunning && savedStartTime) {
      const start = parseInt(savedStartTime, 10);
      setStartTime(start);
      setIsRunning(true);
      // Calculate initial elapsed immediately
      setElapsed(Date.now() - start);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isRunning && startTime) {
      // Update immediately to avoid delay
      setElapsed(Date.now() - startTime);

      interval = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  // Persist functionality
  const toggleTimer = () => {
    if (!isRunning) {
      // Start
      const now = Date.now();
      // If we had a previous elapsed time and we are resuming (feature not requested but good practice),
      // strictly per request "click start... click end... result", we reset on start.
      // But adhering to "still detect start time", we treat a new start as a fresh session.
      setStartTime(now);
      setIsRunning(true);
      setElapsed(0);

      // Save to LS
      localStorage.setItem("timerStartTime", now.toString());
      localStorage.setItem("timerIsRunning", "true");
    } else {
      // Stop
      setIsRunning(false);
      const currentElapsed = Date.now() - startTime;
      setElapsed(currentElapsed); // Final update

      // Clear Timer LS
      localStorage.removeItem("timerStartTime");
      localStorage.setItem("timerIsRunning", "false");

      // Save to History
      const { display, hoursDecimal } = formatTime(currentElapsed);
      const newHistoryItem = {
        id: Date.now(),
        startTime: startTime,
        endTime: Date.now(),
        durationDisplay: display,
        durationHours: hoursDecimal,
      };

      const updatedHistory = [newHistoryItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem("timerHistory", JSON.stringify(updatedHistory));
    }
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hoursDecimal = (ms / (1000 * 60 * 60)).toFixed(2);

    return {
      display: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      hoursDecimal,
    };
  };

  const { display, hoursDecimal } = formatTime(elapsed);

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans selection:bg-pink-500/30 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex-grow flex items-center justify-center p-6 pb-24 overflow-y-auto">
        {view === "timer" ? (
          // Timer View
          <div className="relative z-10 w-full max-w-sm backdrop-blur-3xl bg-white/5 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-[3rem] p-10 flex flex-col items-center">
            <h1 className="text-white/80 text-lg tracking-widest uppercase font-medium mb-12">
              Timer Tracker
            </h1>

            <div className="mb-16 text-center">
              <span className="block text-7xl font-thin tracking-tighter text-white tabular-nums drop-shadow-lg">
                {display}
              </span>
              <span className="text-white/40 text-sm mt-2 block">
                {hoursDecimal} Total Hours
              </span>
            </div>

            <div className="relative group">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${isRunning ? "from-red-500 to-orange-500" : "from-cyan-400 to-blue-600"} rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse`}
              ></div>
              <button
                onClick={toggleTimer}
                className={`
                                relative w-32 h-32 rounded-full flex flex-col items-center justify-center
                                backdrop-blur-md border border-white/20 shadow-xl
                                transition-all duration-500 ease-out transform active:scale-95
                                ${
                                  isRunning
                                    ? "bg-red-500/20 text-red-100 hover:bg-red-500/30 border-red-500/30"
                                    : "bg-green-500/10 text-green-100 hover:bg-green-500/20 border-green-500/30"
                                }
                            `}
              >
                {isRunning ? (
                  <>
                    <div className="w-8 h-8 bg-current rounded-sm shadow-[0_0_15px_currentColor] mb-2" />
                    <span className="text-sm font-bold tracking-widest uppercase">
                      Finish
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-current border-b-[12px] border-b-transparent ml-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] mb-2" />
                    <span className="text-sm font-bold tracking-widest uppercase pl-1">
                      Start
                    </span>
                  </>
                )}
              </button>
            </div>

            <p
              className={`mt-12 text-sm font-medium tracking-wide transition-colors duration-500 ${isRunning ? "text-green-400/80" : "text-white/30"}`}
            >
              {isRunning ? "Session Active" : "Ready to Start"}
            </p>
          </div>
        ) : (
          // History View
          <div className="relative z-10 w-full max-w-sm h-[600px] backdrop-blur-3xl bg-white/5 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-[3rem] p-6 flex flex-col">
            <h1 className="text-white/80 text-lg tracking-widest uppercase font-medium mb-6 text-center">
              History
            </h1>

            <div className="flex-grow overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/30">
                  <p>No sessions yet</p>
                </div>
              ) : (
                history.map((session) => (
                  <HistoryItem
                    key={session.id}
                    session={session}
                    onDelete={() => {
                      const newHistory = history.filter(
                        (h) => h.id !== session.id,
                      );
                      setHistory(newHistory);
                      localStorage.setItem(
                        "timerHistory",
                        JSON.stringify(newHistory),
                      );
                    }}
                  />
                ))
              )}
            </div>

            {history.length > 0 && (
              <button
                onClick={() => {
                  setHistory([]);
                  localStorage.setItem("timerHistory", "[]");
                }}
                className="mt-4 py-2 w-full text-red-400/60 hover:text-red-400 text-sm transition"
              >
                Clear All History
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex p-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl">
          <button
            onClick={() => setView("timer")}
            className={`
                        px-6 py-2 rounded-full text-sm font-medium transition-all duration-300
                        ${view === "timer" ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"}
                    `}
          >
            Timer
          </button>
          <button
            onClick={() => setView("history")}
            className={`
                        px-6 py-2 rounded-full text-sm font-medium transition-all duration-300
                        ${view === "history" ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"}
                    `}
          >
            History
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryItem({ session, onDelete }) {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX - offsetX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const newOffset = currentX - startX;
    // Limit swipe: max 0 (cant swipe right), min -80 (delete button width)
    if (newOffset <= 0 && newOffset >= -80) {
      setOffsetX(newOffset);
    } else if (newOffset < -80) {
      setOffsetX(-80); // Max open
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // Snap logic
    if (offsetX < -40) {
      setOffsetX(-80); // Snap open
    } else {
      setOffsetX(0); // Snap closed
    }
  };

  // Mouse handlers for desktop testing
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX - offsetX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const newOffset = currentX - startX;
    if (newOffset <= 0 && newOffset >= -80) {
      setOffsetX(newOffset);
    } else if (newOffset < -80) {
      setOffsetX(-80);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (offsetX < -40) {
      setOffsetX(-80);
    } else {
      setOffsetX(0);
    }
  };

  return (
    <div className="relative h-20 overflow-hidden rounded-xl">
      {/* Delete Button Background */}
      <div
        className="absolute inset-y-0 right-0 w-20 bg-red-500/80 flex items-center justify-center rounded-r-xl transition-opacity duration-200"
        style={{ opacity: Math.min(1, Math.abs(offsetX) / 40) }}
      >
        <button
          onClick={onDelete}
          className="w-full h-full flex items-center justify-center text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Swipeable Content */}
      <div
        className="relative bg-white/5 h-full p-4 border border-white/5 hover:bg-white/10 transition-colors flex flex-col justify-center cursor-grab active:cursor-grabbing rounded-xl"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="flex justify-between items-center mb-1 pointer-events-none select-none">
          <span className="text-white/90 font-mono text-lg">
            {session.durationDisplay}
          </span>
          <span className="text-cyan-400 text-sm font-medium">
            {session.durationHours} hrs
          </span>
        </div>
        <div className="text-white/40 text-xs flex justify-between pointer-events-none select-none">
          <span>
            {new Date(session.startTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span>{new Date(session.endTime).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
