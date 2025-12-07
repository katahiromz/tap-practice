import React, { useState, useRef, useEffect } from 'react';

// アプリケーションのベースパスを取得
const BASE_URL = import.meta.env.BASE_URL;

const MAX_TOUCH_TIME = 500; // タップと見なす最大時間（ミリ秒）
const MAX_MOVE_DISTANCE = 10; // タップと見なす最大のぶれ距離（ピクセル）



// 失敗原因のメッセージリスト
const ERROR_MESSAGE_00 = (
  <span>
    <span className="nobr">ボタン</span>
    <span className="nobr">以外の</span>
    <span className="nobr">画面を</span>
    <span className="nobr">タップ</span>
    <span className="nobr">して</span>
    <span className="nobr">しまい</span>
    <span className="nobr">ました。</span>
    <span className="nobr">ボタンを</span>
    <span className="nobr">タップ</span>
    <span className="nobr">して</span>
    <span className="nobr">ください。</span>
  </span>
);
const ERROR_MESSAGE_01 = (
  <span>
    <span className="nobr">それは</span>
    <span className="nobr">タップ</span>
    <span className="nobr">では</span>
    <span className="nobr">あり</span>
    <span className="nobr">ません。</span>
    <span className="nobr">1本指</span>
    <span className="nobr">で</span>
    <span className="nobr">操作</span>
    <span className="nobr">して</span>
    <span className="nobr">ください。</span>
  </span>
);
const ERROR_MESSAGE_02 = (
  <span>
    <span className="nobr">それは</span>
    <span className="nobr">タップ</span>
    <span className="nobr">では</span>
    <span className="nobr">あり</span>
    <span className="nobr">ません。</span>
    <span className="nobr">指が</span>
    <span className="nobr">上下</span>
    <span className="nobr">左右</span>
    <span className="nobr">に</span>
    <span className="nobr">ぶれない</span>
    <span className="nobr">ように</span>
    <span className="nobr">軽く</span>
    <span className="nobr">触れて</span>
    <span className="nobr">ください。</span>
  </span>
);
const ERROR_MESSAGE_03 = (
  <span>
    <span className="nobr">それは</span>
    <span className="nobr">タップ</span>
    <span className="nobr">では</span>
    <span className="nobr">あり</span>
    <span className="nobr">ません。</span>
    <span className="nobr">指で</span>
    <span className="nobr">押さえる</span>
    <span className="nobr">時間</span>
    <span className="nobr">は</span>
    <span className="nobr">0.5秒</span>
    <span className="nobr">より</span>
    <span className="nobr">短く</span>
    <span className="nobr">軽く</span>
    <span className="nobr">触る</span>
    <span className="nobr">ように</span>
    <span className="nobr">して</span>
    <span className="nobr">ください。</span>
  </span>
);

function TapPractice({ onTapResult, currentTapNumber, maxTaps, onEnd }) {
  const [feedback, setFeedback] = useState({
    message: null,
    isSuccess: null, // null: 初期状態, true: 成功, false: 失敗
  });
  const timeoutRef = useRef(null);

  // === 判定に必要な状態を保持するRef ===
  // ReactのStateではなく、再レンダリングを伴わないRefでタッチ情報を保持します。
  const touchRef = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    touchCount: 0,
  });
  // === ドラッグ/スワイプ判定に必要な状態を保持するRef ===
  const dragRef = useRef({
    isDragging: false,
  });

  // === Audioインスタンスを保持するRef ===
  const successSoundRef = useRef(null);
  const outsideSoundRef = useRef(null);
  const shakingSoundRef = useRef(null);
  const tooLongSoundRef = useRef(null);

  // === Audioインスタンスを初回のみ生成 ===
  useEffect(() => {
    successSoundRef.current = new Audio(`${BASE_URL}success.mp3`);
    outsideSoundRef.current = new Audio(`${BASE_URL}outside.mp3`);
    shakingSoundRef.current = new Audio(`${BASE_URL}shaking.mp3`);
    tooLongSoundRef.current = new Audio(`${BASE_URL}too-long.mp3`);
  }, []);

  // タッチサポートの検出（SSRセーフ）
  const isTouchSupported = typeof window !== 'undefined' && 'ontouchstart' in window;

  /**
   * タップの判定ロジック
   * @param {object} event - タッチイベントオブジェクト
   * @param {string} eventName - イベント名 ('onTouchStart', 'onTouchEnd', 'onMouseDown', 'onMouseUp')
   * @param {Array | null} changedTouches - マウスイベントの場合にclientX/Yを格納したモック配列
   * @returns {[boolean, React.ReactNode]} - [成功/失敗, メッセージ]
   */
  const tapCheck = (event, eventName, changedTouches) => {
    let touches;
    const isStartEvent = eventName === 'onTouchStart' || eventName === 'onMouseDown';
    const isEndEvent = eventName === 'onTouchEnd' || eventName === 'onMouseUp';

    if (eventName === 'onTouchEnd') {
        // onTouchEnd では、指が離れた情報 (changedTouches) を使用します。
        touches = event.changedTouches; 
    } else {
        // onTouchStart では、画面に触れている情報 (touches) を使用します。
        // onMouseDown/Up では、モックされた情報 (changedTouches) を使用します。
        touches = event.touches || changedTouches;
    }

    if (!touches || touches.length === 0) return [null, null]; // タッチ情報がない場合はここで終了

    // 1. 指の数のチェック
    if (isStartEvent) {
      if (eventName === 'onMouseDown') {
        touchRef.current.touchCount = 1; 
      } else {
        touchRef.current.touchCount = event.touches.length;
        // 複数指チェック
        if (touchRef.current.touchCount > 1) {
          // 既に複数指で始まった場合は、即座に失敗判定を出す
          return [false, '指の数', ERROR_MESSAGE_01];
        }
      }
    }

    if (isStartEvent) {
      // 座標と時間を記録
      const touch = touches[0];
      touchRef.current.startX = touch.clientX;
      touchRef.current.startY = touch.clientY;
      touchRef.current.startTime = Date.now();
      return [null, null]; // 判定はせず、情報のみ記録
    } else if (isEndEvent) {
      const touch = touches[0];

      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();

      // 距離と時間の計算
      const dx = endX - touchRef.current.startX;
      const dy = endY - touchRef.current.startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const duration = endTime - touchRef.current.startTime;

      // 2. 接触時間のチェック
      if (duration > MAX_TOUCH_TIME) {
        return [false, '長すぎ', ERROR_MESSAGE_03]; 
      }
      
      // 3. 移動距離（ぶれ）のチェック
      if (distance > MAX_MOVE_DISTANCE) {
        return [false, 'ぶれ', ERROR_MESSAGE_02]; 
      }

      // 4. 全てOK -> 成功
      return [true, '成功',
        <span>
          <span className="nobr">タップ</span>
          <span className="nobr">成功！</span>
        </span>
      ];
    }
    
    // touchmoveやその他のイベントはここで無視
    return [null, null]; 
  };

  // フィードバック画面をリセット
  const resetFeedback = () => {
    clearTimeout(timeoutRef.current);
    setFeedback({ message: null, isSuccess: null });
  };

  // タップ処理ハンドラ
  const handleTapEvent = (event, isButtonArea, eventName) => {
    if (eventName == 'onMouseMove' && isTouchSupported)
      return;

    // 常に既存のタイムアウトをクリアしてから新しいタイムアウトを設定するようにします
    clearTimeout(timeoutRef.current);

    // フィードバック表示中は無視
    if (isFeedbacking) return;

    // 1. ボタン外のタップをチェック
    if (!isButtonArea) {
      outsideSoundRef.current?.play().catch(e => console.error("音声再生エラー:", e));
      // 外側タップは即座に失敗確定
      setFeedback({ message: ERROR_MESSAGE_00, isSuccess: false });
      timeoutRef.current = setTimeout(() => {
        onTapResult(false);
        resetFeedback();
      }, 3000);
      return;
    }

    // 2. タッチ情報を記録/判定
    // マウスイベントの場合、イベントオブジェクトからclientX/Yを取得し、
    // touchCheckが期待する形式（changedTouchesを持つ）をエミュレートする
    let changedTouches = null;
    if (!event.touches) {
      changedTouches = [{
        clientX: event.clientX,
        clientY: event.clientY
      }];
    }

    const [isSuccess, type, message] = tapCheck(event, eventName, changedTouches);

    if (eventName === 'onMouseDown') {
      dragRef.current.isDragging = true;
    }

    if (eventName === 'onMouseUp') {
      dragRef.current.isDragging = false;
    }

    // 判定が不要なイベント（例：touchstart, touchmove）はここで終了
    if (isSuccess === null) return;

    // 3. 判定結果の表示と次のステップへの移行
    setFeedback({ message, isSuccess });

    const delay = isSuccess ? 2000 : 3000;

    switch (type) {
    case '成功':
      successSoundRef.current?.play().catch(e => console.error("音声再生エラー:", e));
      break;
    case '長すぎ':
      tooLongSoundRef.current?.play().catch(e => console.error("音声再生エラー:", e));
      break;
    case 'ぶれ':
      shakingSoundRef.current?.play().catch(e => console.error("音声再生エラー:", e));
      break;
    }

    timeoutRef.current = setTimeout(() => {
      onTapResult(isSuccess);
      resetFeedback(); 
    }, delay);
  };

  // フィードバック表示中は練習ボタンのタップを受け付けない
  const isFeedbacking = feedback.isSuccess !== null;

  // === UI表示部分（フィードバック画面）は省略 ===
  if (isFeedbacking) {
    const className = feedback.isSuccess ? 'success-screen' : 'fail-screen';
    return (
      <div className={`practice-container ${className}`}>
        <h2 className="feedback-message">{feedback.message}</h2>
        <p>
          <span className="nobr">少し</span>
          <span className="nobr">お待ち</span>
          <span className="nobr">ください...</span>
        </p>
      </div>
    );
  }

  // === UI表示部分（通常の練習画面） ===
  return (
    // onClickは、onTouchEndの後にブラウザが発行するため、今回は無視するか、
    // touchイベントがない環境での代替としてのみ機能させるのが望ましい。
    // 今回はタッチイベントを重視するため、onClickはボタン外タップの検出のみに利用します。
    <div 
      className="practice-container normal-screen" 
      onClick={(event) => {
        if (event.target.className === 'reset-button') {
          onEnd();
          return;
        }
        if (event.target.closest('.tap-button')) {
          return;
        }
        if (dragRef.current.isDragging) {
          handleTapEvent(event, true, isTouchSupported ? 'onTouchEnd' : 'onMouseUp');
        } else {
          handleTapEvent(event, false, 'onClick');
        }
      }}
      style={{ userSelect: 'none', touchAction: 'none' }}
    >
      <h2 className="center">
        <span className="nobr">タップ</span>
        <span className="nobr">練習</span>
        <span className="nobr">({currentTapNumber} / {maxTaps} 回目)</span>
      </h2>

      <p className="instruction center">
        <span className="nobr">画面の</span>
        <span className="nobr">大きな</span>
        <span className="nobr">ボタン</span>
        <span className="nobr">を、</span>
        <span className="nobr">指1本</span>
        <span className="nobr">で</span>
        <span className="nobr">軽く、</span>
        <span className="nobr">素早く</span>
        <span className="nobr">タップ</span>
        <span className="nobr">して</span>
        <span className="nobr">ください。</span>
      </p>
      
      <button 
        onTouchStart={(event) => handleTapEvent(event, true, 'onTouchStart')}
        onTouchEnd={(event) => handleTapEvent(event, true, 'onTouchEnd')}
        onMouseDown={(event) => handleTapEvent(event, true, 'onMouseDown')}
        onMouseMove={(event) => handleTapEvent(event, true, 'onMouseMove')}
        onMouseUp={(event) => handleTapEvent(event, true, 'onMouseUp')}
        // マウスの 'click' イベントが親の div に伝わるのを防ぎます。
        onClick={(event) => {
          event.stopPropagation();
        }}
        disabled={isFeedbacking}
        className="tap-button"
      >
        <span className="nobr">ここを</span>
        <span className="nobr">タップ！</span>
      </button>

      <div className="controls">
        <button className="reset-button">
          最初に戻る/終了
        </button>
      </div>
    </div>
  );
}

export default TapPractice;