import React from 'react';

function ResultScreen({ successCount, failCount, totalTaps, onRestart }) {
  const successRate = totalTaps > 0 ? ((successCount / totalTaps) * 100).toFixed(1) : 0;
  const failRate = totalTaps > 0 ? ((failCount / totalTaps) * 100).toFixed(1) : 0;

  return (
    <div className="app-container result-screen">
      <h1>🎉本日の練習終了🎉</h1>
      <p>
        <span className="nobr">全 {totalTaps} 回</span>
        <span className="nobr">の</span>
        <span className="nobr">練習が</span>
        <span className="nobr">終わり</span>
        <span className="nobr">ました。</span>
        <span className="nobr">よく</span>
        <span className="nobr">頑張り</span>
        <span className="nobr">ました！</span>
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