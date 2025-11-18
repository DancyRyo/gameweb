'use client';

import { useState, useEffect, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const SENTENCES = [
  "The quick brown fox jumps over the lazy dog",
  "Pack my box with five dozen liquor jugs",
  "How vexingly quick daft zebras jump",
  "The five boxing wizards jump quickly",
  "Sphinx of black quartz judge my vow",
  "Two driven jocks help fax my big quiz",
  "Five quacking zephyrs jolt my wax bed",
  "Programming is the art of telling another human what one wants the computer to do",
  "Code is like humor. When you have to explain it, it's bad",
  "First, solve the problem. Then, write the code"
];

const GAME_TIME = 60;

export default function TypingSpeedGame() {
  const { t } = useLanguage();
  const [currentSentence, setCurrentSentence] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [isPlaying, setIsPlaying] = useState(false);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('typingspeedHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const getRandomSentence = () => {
    return SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
  };

  const startGame = () => {
    setCurrentSentence(getRandomSentence());
    setUserInput('');
    setScore(0);
    setWpm(0);
    setAccuracy(100);
    setTimeLeft(GAME_TIME);
    setCorrectChars(0);
    setTotalChars(0);
    setIsPlaying(true);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const endGame = () => {
    setIsPlaying(false);
    clearInterval(timerRef.current);

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('typingspeedHighScore', score.toString());
    }
  };

  const handleInputChange = (e) => {
    if (!isPlaying) return;

    const input = e.target.value;
    setUserInput(input);

    // Calculate accuracy
    let correct = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === currentSentence[i]) {
        correct++;
      }
    }
    setCorrectChars(correct);
    setTotalChars(input.length);

    if (input.length > 0) {
      const acc = Math.round((correct / input.length) * 100);
      setAccuracy(acc);
    }

    // Calculate WPM
    const timeElapsed = (Date.now() - startTimeRef.current) / 1000 / 60;
    const wordsTyped = input.trim().split(' ').length;
    const currentWpm = Math.round(wordsTyped / timeElapsed);
    setWpm(currentWpm);

    // Check if sentence is completed correctly
    if (input === currentSentence) {
      const points = Math.round(currentSentence.length * (accuracy / 100));
      setScore(prev => prev + points);
      setCurrentSentence(getRandomSentence());
      setUserInput('');
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  const getCharColor = (index) => {
    if (index >= userInput.length) return 'text-gray-400';
    if (userInput[index] === currentSentence[index]) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <GameLayout gameId="typingspeed">
      <div className="flex flex-col items-center gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">WPM</div>
              <div className="text-2xl font-bold text-blue-600">{wpm}</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">Accuracy</div>
              <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600">{t.score}</div>
              <div className="text-2xl font-bold text-purple-600">{score}</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-sm text-gray-600">{t.time}</div>
              <div className="text-2xl font-bold text-orange-600">{timeLeft}s</div>
            </div>
          </div>

          <div className="mb-6 p-6 bg-gray-50 rounded-lg min-h-[120px] flex items-center justify-center">
            <div className="text-2xl font-mono leading-relaxed">
              {currentSentence.split('').map((char, index) => (
                <span key={index} className={getCharColor(index)}>
                  {char}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              disabled={!isPlaying}
              placeholder={isPlaying ? "Start typing..." : "Click Start to begin"}
              className="w-full px-4 py-3 text-lg font-mono border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{userInput.length} / {currentSentence.length} characters</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${(userInput.length / currentSentence.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex justify-center mb-6">
            {!isPlaying ? (
              <button
                onClick={startGame}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-lg"
              >
                {timeLeft === 0 ? t.restart : t.start}
              </button>
            ) : (
              <div className="text-xl font-bold text-blue-600">
                Type the sentence above!
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">{t.controls}</h3>
              <p className="text-gray-600">{t.games.typingspeed.controls}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">{t.highScore}</h3>
              <p className="text-2xl font-bold text-purple-600">{highScore}</p>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
