import React, { useState, useRef } from 'react';
import TapPractice from './components/TapPractice.jsx';
import ResultScreen from './components/ResultScreen.jsx';
import './App.css';

const IS_PRODUCTION = import.meta.env.MODE === 'production';

// アプリケーションのベースパスを取得
const BASE_URL = import.meta.env.BASE_URL;

const MAX_TAPS = 7;
const startSound = new Audio(`${BASE_URL}start.mp3`); // 「タップ練習しようね」

const rootClass = IS_PRODUCTION ? 'app-container initial-screen disable-select' : 'app-container initial-screen';

function App() {
  const [session, setSession] = useState({
    currentTaps: 0,
    successCount: 0,
    failCount: 0,
    isPracticeActive: false, // 練習中か？
  });

  const startRef = useRef(new Audio(`${BASE_URL}start.mp3`));

  const startPractice = () => {
    startSound.play().catch(e => console.error("音声再生エラー:", e));
    setSession({
      currentTaps: 0,
      successCount: 0,
      failCount: 0,
      isPracticeActive: true,
    });
  };

  const endPractice = () => {
    setSession({
      currentTaps: 0,
      successCount: 0,
      failCount: 0,
      isPracticeActive: false,
    });
  };

  const handleTapResult = (isSuccess) => {
    setSession(prev => {
      const newCurrentTaps = prev.currentTaps + 1;
      const newSuccessCount = prev.successCount + (isSuccess ? 1 : 0);
      const newFailCount = prev.failCount + (isSuccess ? 0 : 1);

      return {
        ...prev,
        currentTaps: newCurrentTaps,
        successCount: newSuccessCount,
        failCount: newFailCount,
        isPracticeActive: newCurrentTaps < MAX_TAPS,
      };
    });
  };

  if (!session.isPracticeActive && session.currentTaps > 0) {
    // {MAX_TAPS}回終了後の結果画面
    return (
      <ResultScreen 
        successCount={session.successCount}
        failCount={session.failCount}
        totalTaps={MAX_TAPS}
        onRestart={startPractice}
      />
    );
  }

  if (session.isPracticeActive) {
    // 練習中の画面
    return (
      <TapPractice 
        onTapResult={handleTapResult}
        currentTapNumber={session.currentTaps + 1}
        maxTaps={MAX_TAPS}
        onEnd={endPractice} // 「終了して最初に戻る」ボタン用
      />
    );
  }

  // 初期画面
  return (
    <div className={rootClass}
      onContextMenu={(e) => {
        // 本番環境でのみ無効化
        if (IS_PRODUCTION) {
          e.preventDefault();
        }
      }}
    >
      <h1>
        <span className="large">👵</span><br />
        <span className="nobr">おばあちゃんの</span>
        <span className="nobr">タップ練習</span>
      </h1>
      <p>
        <span className="nobr">毎日</span>
        <span className="nobr">{MAX_TAPS}回の</span>
        <span className="nobr">タップ</span>
        <span className="nobr">練習を</span>
        <span className="nobr">しましょう。</span>
      </p>
      <p>
        <span className="nobr">画面に</span>
        <span className="nobr">表示</span>
        <span className="nobr">される</span>
        <span className="nobr">ボタンを</span>
        <span className="nobr">指1本で</span>
        <span className="nobr">軽く、</span>
        <span className="nobr">素早く</span>
        <span className="nobr">タッチ</span>
        <span className="nobr">して</span>
        <span className="nobr">ください。</span>
      </p>
      <button onClick={startPractice} className="start-button">
        <span className="nobr">練習を</span>
        <span className="nobr">始める</span>
        <span className="nobr">(全 {MAX_TAPS} 回)</span>
      </button>
    </div>
  );
}

export default App;