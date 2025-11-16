/**
 * URL에 trailing slash를 추가하는 유틸리티 함수
 * Capacitor 환경에서 라우팅이 제대로 작동하도록 하기 위해 필요
 *
 * @param url - 원본 URL (쿼리 파라미터 포함 가능)
 * @returns trailing slash가 추가된 URL
 *
 * @example
 * ensureTrailingSlash('/dashboard/student') // '/dashboard/student/'
 * ensureTrailingSlash('/dashboard/student?id=123') // '/dashboard/student/?id=123'
 * ensureTrailingSlash('/dashboard/student/') // '/dashboard/student/' (변경 없음)
 */
export function ensureTrailingSlash(url: string): string {
  // URL을 path와 query로 분리
  const [path, query] = url.split("?");

  // path가 이미 '/'로 끝나면 그대로 유지
  const pathWithSlash = path.endsWith("/") ? path : `${path}/`;

  // query가 있으면 다시 합치기
  return query ? `${pathWithSlash}?${query}` : pathWithSlash;
}
