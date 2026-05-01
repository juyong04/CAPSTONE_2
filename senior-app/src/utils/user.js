/**
 * 로컬 스토리지에 저장된 사용자 고유 식별자를 가져오거나 새로 생성합니다.
 */
function getOrCreateFallbackId() {
  let fallbackId = localStorage.getItem('senior_app_uid');
  if (!fallbackId) {
    fallbackId = Math.random().toString(36).substring(2, 6).toLowerCase();
    localStorage.setItem('senior_app_uid', fallbackId);
  }
  return fallbackId;
}

/**
 * 사용자의 IP 앞자리를 가져오거나, 실패 시 로컬 스토리지 기반 랜덤 식별자를 반환합니다.
 */
export async function getUserIdentifier() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    if (!response.ok) throw new Error('IP API Error');
    const data = await response.json();
    const ipParts = data.ip.split('.');
    if (ipParts.length === 4) return `${ipParts[0]}.${ipParts[1]}`;
    throw new Error('Invalid IP format');
  } catch (error) {
    console.warn('IP 식별자 획득 실패, 로컬 랜덤 식별자 사용:', error);
    return getOrCreateFallbackId();
  }
}

/** 이전에 사용했던 닉네임을 로컬 스토리지에서 가져옵니다. */
export function getSavedNickname() {
  return localStorage.getItem('senior_app_nickname') || '';
}

/** 닉네임을 로컬 스토리지에 저장합니다. */
export function saveNickname(nickname) {
  if (nickname) localStorage.setItem('senior_app_nickname', nickname);
}

/** 내가 작성한 글의 postId를 로컬 스토리지에 저장합니다. */
export function saveMyPostId(postId) {
  if (!postId) return;
  const ids = getMyPostIds();
  if (!ids.includes(postId)) {
    ids.push(postId);
    localStorage.setItem('senior_app_my_posts', JSON.stringify(ids));
  }
}

/** 내가 작성한 글의 postId 목록을 가져옵니다. */
export function getMyPostIds() {
  try {
    return JSON.parse(localStorage.getItem('senior_app_my_posts') || '[]');
  } catch {
    return [];
  }
}
