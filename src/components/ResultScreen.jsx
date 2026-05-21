import React, { useEffect } from 'react';
import confetti from 'canvas-confetti'; // 紙吹雪ライブラリ

function ResultScreen({ successCount, failCount, totalTaps, onRestart, isPerfect }) {
  const successRate = totalTaps > 0 ? ((successCount / totalTaps) * 100).toFixed(1) : 0;
  const failRate = totalTaps > 0 ? ((failCount / totalTaps) * 100).toFixed(1) : 0;

  // 全問成功のときだけ紙吹雪を降らせる副作用
  useEffect(() => {
    if (isPerfect) {
      // 3秒間、左右の下から中央に向けて交互に紙吹雪を打ち上げる演出
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 28, spread: 360, ticks: 60, zIndex: 1000 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 40 * (timeLeft / duration);
        
        // 左側からファサッ
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        // 右側からファサッ
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isPerfect]);

  return (
    <div className="app-container result-screen">
      <h1>{isPerfect ? '🏆 パーフェクト！ 🏆' : '🎉 本日の練習終了 🎉'}</h1>
      <p>
        <span className="nobr">全 {totalTaps} 回</span>
        <span className="nobr">の</span>
        <span className="nobr">練習が</span>
        <span className="nobr">終わり</span>
        <span className="nobr">ました。</span>
        {isPerfect ? (
          <strong style={{ color: '#ff4757', fontSize: '1.2em' }}>
            <span className="nobr">全部</span>
            <span className="nobr">大成功です！</span>
          </strong>
        ) : (
          <>
            <span className="nobr">よく</span>
            <span className="nobr">頑張り</span>
            <span className="nobr">ました！</span>
          </>
        )}
      </p>

      <div className="stats-box">
        <h3>練習結果</h3>
        <table>
          <tbody>
            <tr>
              <td className="stats-label nobr">✅タップ成功:</td>
              <td className="stats-value">{successCount} 回</td>
              <td className="stats-rate">({successRate}%)</td>
            </tr>
            <tr>
              <td className="stats-label nobr">❌タップ失敗:</td>
              <td className="stats-value">{failCount} 回</td>
              <td className="stats-rate">({failRate}%)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button onClick={onRestart} className="restart-button" aria-label="もう一度練習する（最初から練習をやり直します）">
        <span className="nobr">もう</span>
        <span className="nobr">一度</span>
        <span className="nobr">練習</span>
        <span className="nobr">する</span>
      </button>
      <p className="note">
        <span className="nobr">これで</span>
        <span className="nobr">練習を</span>
        <span className="nobr">終了</span>
        <span className="nobr">できます。</span>
        <span className="nobr">また</span>
        <span className="nobr">明日</span>
        <span className="nobr">チャレンジ</span>
        <span className="nobr">しましょう！</span>
      </p>
    </div>
  );
}

export default ResultScreen;