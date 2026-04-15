import { useState, useRef, useCallback } from 'react';
import './VoiceWriter.css';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function VoiceWriter({ onPostCreate }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('idle');

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해주세요.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setStep('listening');
      setError(null);
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interim = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      finalTranscriptRef.current = finalText;
      setTranscript(finalText);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('마이크 접근이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
      } else if (event.error === 'no-speech') {
        setError('음성이 감지되지 않았습니다. 다시 시도해주세요.');
      } else if (event.error === 'network') {
        setError('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
      } else {
        setError(`음성 인식 오류: ${event.error}`);
      }
      setIsListening(false);
      if (!finalTranscriptRef.current) {
        setStep('idle');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      if (finalTranscriptRef.current.trim()) {
        setStep('transcript-ready');
      } else {
        setStep('idle');
      }
    };

    recognitionRef.current = recognition;
    finalTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setAiResult(null);
    setError(null);
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const processWithGemini = async () => {
    const text = transcript.trim();
    if (!text) {
      setError('변환할 텍스트가 없습니다.');
      return;
    }

    if (!GEMINI_API_KEY || GEMINI_API_KEY === '여기에_API키_입력') {
      setError('Gemini API 키가 설정되지 않았습니다. .env 파일에 VITE_GEMINI_API_KEY를 추가해주세요.');
      return;
    }

    setIsProcessing(true);
    setStep('processing');
    setError(null);

    const prompt = `당신은 시니어 커뮤니티 게시판의 글쓰기 도우미입니다.
아래는 어르신이 음성으로 말씀하신 내용을 텍스트로 변환한 것입니다.
이 내용을 바탕으로 게시판에 올릴 수 있는 글로 정리해주세요.

규칙:
1. 원래 의미와 말투를 최대한 살려주세요
2. 반말이면 반말 유지, 존댓말이면 존댓말 유지
3. 불필요한 반복, "어", "음", "그" 등 간투사는 제거
4. 적절한 제목을 만들어주세요 (20자 이내)
5. 내용은 문단을 나눠서 읽기 쉽게 정리
6. 마지막에 3줄 이내로 요약을 추가

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이 JSON만):
{"title": "제목", "content": "정리된 내용", "summary": "3줄 요약"}

음성 변환 텍스트:
"${text}"`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.error?.message || `API 오류 (${response.status})`;
        throw new Error(msg);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) throw new Error('Gemini 응답이 비어있습니다.');

      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('응답에서 JSON을 파싱할 수 없습니다.');

      const result = JSON.parse(jsonMatch[0]);

      if (!result.title || !result.content) {
        throw new Error('AI 응답에 제목 또는 내용이 없습니다.');
      }

      setAiResult(result);
      setStep('result');
    } catch (err) {
      console.error('Gemini API error:', err);
      setError(`AI 처리 오류: ${err.message}`);
      setStep('transcript-ready');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublish = () => {
    if (aiResult && onPostCreate) {
      onPostCreate({
        id: Date.now(),
        title: aiResult.title,
        content: aiResult.content,
        author: '음성작성자 🎤',
        date: new Date().toISOString().split('T')[0],
        views: 0,
        comments: 0,
      });
      reset();
    }
  };

  const reset = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { }
    }
    finalTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setAiResult(null);
    setError(null);
    setStep('idle');
    setIsProcessing(false);
  };

  return (
    <div className="voice-writer">
      <div className="vw-header">
        <h3>🎤 AI 음성 글쓰기</h3>
        <p className="vw-subtitle">말씀하신 내용을 AI가 게시글로 정리해드려요</p>
      </div>

      {error && (
        <div className="vw-error">
          <span>⚠️ {error}</span>
          <button className="vw-error-close" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Step: Idle */}
      {step === 'idle' && (
        <button className="vw-mic-btn" onClick={startListening}>
          <span className="vw-mic-icon">🎙️</span>
          <span className="vw-mic-label">눌러서 말하기 시작</span>
        </button>
      )}

      {/* Step: Listening */}
      {step === 'listening' && (
        <div className="vw-listening">
          <div className="vw-pulse-wrap">
            <div className="vw-pulse-ring"></div>
            <div className="vw-pulse-ring vw-pulse-ring-2"></div>
            <span className="vw-pulse-icon">🎤</span>
          </div>
          <p className="vw-listening-label">듣고 있어요... 편하게 말씀해주세요</p>

          <div className="vw-live-transcript">
            {transcript && <span className="vw-final-text">{transcript}</span>}
            {interimTranscript && <span className="vw-interim-text">{interimTranscript}</span>}
            {!transcript && !interimTranscript && (
              <span className="vw-placeholder-text">음성을 기다리는 중...</span>
            )}
          </div>

          <button className="vw-stop-btn" onClick={stopListening}>⏹️ 말하기 완료</button>
        </div>
      )}

      {/* Step: Transcript Ready */}
      {step === 'transcript-ready' && (
        <div className="vw-transcript-ready">
          <h4>📝 인식된 음성 텍스트</h4>
          <div className="vw-transcript-box">{transcript}</div>
          <div className="vw-btn-group">
            <button className="vw-btn vw-btn-secondary" onClick={() => { reset(); startListening(); }}>
              🔄 다시 녹음
            </button>
            <button className="vw-btn vw-btn-primary" onClick={processWithGemini}>
              ✨ AI로 글 정리하기
            </button>
          </div>
        </div>
      )}

      {/* Step: Processing */}
      {step === 'processing' && (
        <div className="vw-processing">
          <div className="vw-spinner"></div>
          <p className="vw-processing-label">AI가 글을 정리하고 있어요...</p>
        </div>
      )}

      {/* Step: Result */}
      {step === 'result' && aiResult && (
        <div className="vw-result">
          <div className="vw-result-block">
            <label className="vw-result-label">📌 제목</label>
            <div className="vw-result-title">{aiResult.title}</div>
          </div>
          <div className="vw-result-block">
            <label className="vw-result-label">📄 정리된 내용</label>
            <div className="vw-result-content">{aiResult.content}</div>
          </div>
          <div className="vw-result-block">
            <label className="vw-result-label">📋 요약</label>
            <div className="vw-result-summary">{aiResult.summary}</div>
          </div>

          <details className="vw-compare">
            <summary>🔍 원본 음성 텍스트 비교하기</summary>
            <div className="vw-original-text">{transcript}</div>
          </details>

          <div className="vw-btn-group">
            <button className="vw-btn vw-btn-secondary" onClick={reset}>🔄 처음부터</button>
            <button className="vw-btn vw-btn-publish" onClick={handlePublish}>📮 게시하기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoiceWriter;
