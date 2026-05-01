import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './GrandsonSearch.css';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export default function GrandsonSearch({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: '할아버지, 할머니! 찾으시는 게시글이 있나요? 저에게 물어보시면 다 찾아드릴게요!' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const chatBodyRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    return () => { if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {} };
  }, []);

  // 배경 스크롤 막기
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const toggleListening = useCallback(() => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Chrome 브라우저를 사용해주세요.'); return; }
    const r = new SR(); r.lang = 'ko-KR'; r.continuous = false; r.interimResults = true;
    r.onstart = () => { setIsListening(true); setInputText(''); };
    r.onresult = (e) => { let t = ''; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; setInputText(t); };
    r.onerror = (e) => { setIsListening(false); if (e.error === 'not-allowed') alert('마이크 권한이 필요합니다.'); };
    r.onend = () => setIsListening(false);
    recognitionRef.current = r; r.start();
  }, [isListening]);

  const fetchAllPosts = async () => {
    try {
      const snap = await getDocs(collection(db, 'posts'));
      const posts = snap.docs.map(d => ({ id: d.id, ...d.data() })).map(p => ({ id: p.id, title: p.title, content: p.content, author: p.author, board: p.board, date: p.date }));
      const nSnap = await getDocs(collection(db, 'notice'));
      const notices = nSnap.docs.map(d => ({ id: d.id, title: d.data().title, content: d.data().content || '', board: 'notice', date: d.data().date || '' }));
      return [...posts, ...notices];
    } catch { return []; }
  };

  const handleLinkClick = (e, url) => { e.preventDefault(); onClose(); navigate(url); };

  const renderMessageText = (text) => {
    const re = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = []; let last = 0; let m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push({ type: 'text', content: text.slice(last, m.index) });
      parts.push({ type: 'link', text: m[1], url: m[2] });
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push({ type: 'text', content: text.slice(last) });
    return parts.map((p, i) => {
      if (p.type === 'link') return <a key={i} href={p.url} className="ai-post-link" onClick={(e) => handleLinkClick(e, p.url)}>{p.text}</a>;
      return p.content.split('\n').map((line, j) => <span key={`${i}-${j}`}>{line}<br /></span>);
    });
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    if (isListening && recognitionRef.current) { recognitionRef.current.stop(); setIsListening(false); }
    if (!genAI) { setMessages(prev => [...prev, { role: 'user', text: inputText }, { role: 'ai', text: 'API Key 오류로 검색할 수 없어요.' }]); setInputText(''); return; }

    const userQuery = inputText;
    setMessages(prev => [...prev, { role: 'user', text: userQuery }]);
    setInputText(''); setIsLoading(true);

    try {
      const posts = await fetchAllPosts();
      const prompt = `
당신은 어르신들이 사용하는 커뮤니티 게시판의 다정하고 친절한 손주 AI입니다.
어르신이 게시판의 글을 찾기 위해 다음과 같이 질문하셨습니다: "${userQuery}"

현재 커뮤니티에 등록된 전체 게시글 목록은 다음과 같습니다 (JSON 형식):
${JSON.stringify(posts)}

요청:
1. 어르신의 질문에 매우 친절하고 다정하게 손주처럼 대답해주세요 (존댓말 사용, 이모티콘 사용).
2. 질문의 의도(제목, 내용, 작성자 등)와 일치하는 게시글을 목록에서 찾아주세요.
3. 일치하는 글이 있다면, 어느 게시판에 있는지, 제목, 내용 요약, 작성자를 알려주세요.
4. 글이 너무 많으면 관련성 높은 2~3개만 알려주세요.
5. 해당 글을 찾았다면, 마크다운 링크 형식으로 바로가기를 만들어주세요:
   - 공지사항: \`[공지사항 보러가기](/notice/\${id})\`
   - 일반 게시판: \`[해당 글로 바로가기](/board?tab=\${board}&postId=\${id})\`
6. 일치하는 글이 없다면, 아쉽지만 못 찾았다고 상냥하게 말씀드리고 글쓰기를 권유해주세요.
7. 링크 외에는 마크다운 문법 사용하지 말고, 자연스러운 줄바꿈만 사용해주세요.
`;
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      setMessages(prev => [...prev, { role: 'ai', text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: '글을 찾다가 문제가 생겼어요. 다시 말씀해주세요.' }]);
    } finally { setIsLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="gs-overlay" onClick={onClose} />
      <div className="gs-sheet">
        <div className="gs-handle" onClick={onClose}><div className="gs-handle-bar" /></div>
        <div className="gs-header">
          <span>👦 손주 AI 검색</span>
          <button className="gs-close" onClick={onClose}>✕</button>
        </div>
        <div className="gs-body" ref={chatBodyRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`gs-msg gs-msg-${msg.role}`}>{renderMessageText(msg.text)}</div>
          ))}
          {isLoading && <div className="gs-msg gs-msg-loading">손주가 열심히 찾는 중 <span className="gs-dots"><span /><span /><span /></span></div>}
        </div>
        <form className="gs-input-area" onSubmit={handleSend}>
          <button type="button" className={`gs-mic ${isListening ? 'gs-mic-on' : ''}`} onClick={toggleListening} disabled={isLoading}>🎤</button>
          <input className="gs-input" placeholder={isListening ? '듣고 있어요...' : '예: 수줍은시니어 글 찾아줘'} value={inputText} onChange={e => setInputText(e.target.value)} disabled={isLoading} />
          <button type="submit" className="gs-send" disabled={isLoading || !inputText.trim()}>↑</button>
        </form>
      </div>
    </>
  );
}
