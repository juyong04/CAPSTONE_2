import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './GrandsonSearch.css';

// Initialize Gemini API
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export default function GrandsonSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: '할아버지, 할머니! 찾으시는 게시글이 있나요? 저에게 물어보시면 다 찾아드릴게요!' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const chatBodyRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.debug('Recognition stop on unmount failed:', error);
        }
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해주세요.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setInputText('');
    };

    recognition.onresult = (event) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setInputText(text);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert('마이크 접근 권한이 필요합니다.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening]);

  const fetchAllPosts = async () => {
    try {
      const postsRef = collection(db, 'posts');
      const snapshot = await getDocs(postsRef);
      const posts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          content: data.content,
          author: data.author,
          board: data.board, // free, monthly, counseling, education
          date: data.date
        };
      });

      // 공지사항도 함께 가져오기
      const noticeRef = collection(db, 'notice');
      const noticeSnap = await getDocs(noticeRef);
      const notices = noticeSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          content: data.content || '',
          board: 'notice',
          date: data.date || data.createdAt?.toDate?.()?.toISOString() || ''
        };
      });

      return [...posts, ...notices];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  };

  const handleLinkClick = (e, url) => {
    e.preventDefault();
    setIsOpen(false);
    navigate(url);
  };

  const renderMessageText = (text) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'link', text: match[1], url: match[2] });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return parts.map((part, idx) => {
      if (part.type === 'link') {
        return (
          <a
            key={idx}
            href={part.url}
            className="ai-post-link"
            onClick={(e) => handleLinkClick(e, part.url)}
            style={{ display: 'inline-block', marginTop: '5px', marginBottom: '5px' }}
          >
            {part.text}
          </a>
        );
      }
      return part.content.split('\n').map((line, i) => (
        <span key={`${idx}-${i}`}>
          {line}
          <br />
        </span>
      ));
    });
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    if (!genAI) {
      setMessages(prev => [...prev,
      { role: 'user', text: inputText },
      { role: 'ai', text: '죄송해요, 지금은 제 머리가 조금 아파서(API Key 오류) 찾아드릴 수가 없어요. 나중에 다시 물어봐주세요!' }
      ]);
      setInputText('');
      return;
    }

    const userQuery = inputText;
    setMessages(prev => [...prev, { role: 'user', text: userQuery }]);
    setInputText('');
    setIsLoading(true);

    try {
      // 1. Fetch posts
      const posts = await fetchAllPosts();

      // 2. Prepare prompt
      const prompt = `
당신은 어르신들이 사용하는 커뮤니티 게시판의 다정하고 친절한 손주 AI입니다.
어르신이 게시판의 글을 찾기 위해 다음과 같이 질문하셨습니다: "${userQuery}"

현재 커뮤니티에 등록된 전체 게시글 목록은 다음과 같습니다 (JSON 형식):
${JSON.stringify(posts)}

요청:
1. 어르신의 질문에 매우 친절하고 다정하게 손주처럼 대답해주세요 (존댓말 사용, 이모티콘 사용).
2. 질문의 의도(제목, 내용, 작성자 등)와 일치하는 게시글을 목록에서 찾아주세요.
3. 일치하는 글이 있다면, 어느 게시판(board)에 있는지, 제목은 무엇인지, 내용은 대략 어떤지, 작성자는 누구인지 요약해서 알려주세요.
4. 만약 일치하는 글이 너무 많다면 가장 관련성 높은 2~3개만 알려주세요.
5. 해당 글을 찾았다면, 무조건 마크다운 링크 형식인 '[링크 텍스트](URL)'을 응답에 포함해서 바로가기 버튼을 만들어주세요.
   - 공지사항(board가 'notice')인 경우: \`[공지사항 보러가기](/notice/\${id})\`
   - 일반 게시판인 경우: \`[해당 글로 바로가기](/\${board == 'free' ? 'freeboard' : board == 'monthly' ? 'monthly-topic' : board}?postId=\${id})\`
6. 일치하는 글이 없다면, 아쉽지만 못 찾았다고 상냥하게 말씀드리고 글쓰기를 권유해주세요.
7. 링크 외에는 마크다운 문법(*, **, #)은 사용하지 말고, 자연스러운 줄바꿈만 사용해주세요.
`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      setMessages(prev => [...prev, { role: 'ai', text }]);

    } catch (error) {
      console.error('Gemini AI error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: '앗, 글을 찾다가 조금 문제가 생겼어요. 다시 한 번 말씀해 주시겠어요?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grandson-ai-container">
      {isOpen && (
        <div className="grandson-chat-modal">
          <div className="grandson-chat-header">
            <span>👦 손주 AI 검색</span>
            <button className="close-chat-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="grandson-chat-body" ref={chatBodyRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                {renderMessageText(msg.text)}
              </div>
            ))}
            {isLoading && (
              <div className="chat-message loading">
                손주가 열심히 찾는 중 <div className="dot-flashing"></div>
              </div>
            )}
          </div>

          <form className="grandson-chat-input-area" onSubmit={handleSend}>
            <button
              type="button"
              className={`grandson-mic-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
              title="음성으로 말하기"
              disabled={isLoading}
            >
              🎤
            </button>
            <input
              type="text"
              className="grandson-chat-input"
              placeholder={isListening ? "듣고 있어요..." : "예: 수줍은시니어 글 찾아줘"}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="grandson-chat-send-btn" disabled={isLoading || !inputText.trim()}>
              ↑
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button
          className="grandson-fab"
          onClick={() => setIsOpen(true)}
          title="손주에게 게시글 물어보기"
        >
          👦
        </button>
      )}
    </div>
  );
}
