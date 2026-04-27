/**
 * 문자열을 SHA-256으로 해시화하는 함수
 * @param {string} text - 평문 비밀번호
 * @returns {Promise<string>} 해시화된 16진수 문자열
 */
export async function hashPassword(text) {
  if (!text) return '';
  const salt = 'senior_board_salt_2026'; // 고정된 Salt
  const encoder = new TextEncoder();
  const data = encoder.encode(text + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
