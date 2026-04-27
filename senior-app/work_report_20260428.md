# 작업 보고서: 손주 AI 검색 기능 연동 (2026.04.28)

---

## 1. 개요
- 커뮤니티 전역에서 사용 가능한 AI 기반 게시글 탐색 에이전트(손주 AI) 추가 및 편의성 개선

## 2. 주요 작업 내역

### 2.1 데이터 연동 및 검색 로직
- Firestore `posts` 및 `notice` 컬렉션 데이터를 통합하여 전체 게시글 검색 지원
- Gemini API(`gemini-2.5-flash`) 프롬프트 업데이트 (검색된 게시글의 마크다운 링크 포맷 출력 유도)
- 정규식 파싱을 통해 응답 내 링크를 React Router 기반 탐색 컴포넌트로 렌더링

### 2.2 다이렉트 링크 기능 (`BoardPage.jsx`)
- `useLocation` 훅을 사용하여 URL 파라미터(`?postId=`) 파싱 로직 추가
- 링크를 통해 게시판으로 이동 시 해당 `postId`의 상세 게시글이 자동으로 열리도록 연동

### 2.3 음성 인식(STT) 검색
- `GrandsonSearch.jsx` 전용 `window.SpeechRecognition` API 기반 STT 로직 추가
- 기존 `VoiceWriter` 컴포넌트와 분리하여 텍스트 입력창 상태(`inputText`)와 직접 매핑

### 2.4 UI/UX 및 반응형 개선
- 우측 하단 플로팅 챗봇 모달 UI 구현 및 애니메이션 적용
- 화면 크기 축소 시 입력 화살표가 잘리는 문제 해결 (CSS `box-sizing: border-box` 추가 및 반응형 미디어 쿼리 `calc(100vw - 40px)` 적용)

## 3. 수정된 주요 파일
- `src/components/GrandsonSearch.jsx` : 손주 AI 메인 로직, STT, 프롬프트 파싱 추가
- `src/components/GrandsonSearch.css` : 채팅창 스타일링 및 반응형 CSS 보완
- `src/components/BoardPage.jsx` : URL 쿼리 감지 및 자동 상세 보기 로직 추가
- `src/components/VoiceWriter.jsx` : 미사용 변수 제거 등 기존 린트(Lint) 에러 정리

## 4. 특이사항 및 향후 과제
- 게시글 전체를 불러와 프롬프트로 전달하고 있으므로, 추후 게시글 데이터량 증가 시 속도 및 토큰 비용 최적화(예: 별도 검색 DB 도입 등)가 필요함.
