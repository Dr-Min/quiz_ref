/**
 * DataLoader - JSON 데이터 로더
 *
 * 사용법:
 * const loader = new DataLoader();
 * const questions = await loader.load('/data/quiz.json');
 */
export class DataLoader {
  constructor(basePath = '/data') {
    this.basePath = basePath;
    this.cache = new Map();
  }

  /**
   * JSON 파일 로드
   * @param {string} filename - 파일명 또는 전체 경로
   */
  async load(filename) {
    const path = filename.startsWith('/') ? filename : `${this.basePath}/${filename}`;

    // 캐시 확인
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }

    try {
      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(`Failed to load: ${path} (${response.status})`);
      }

      const data = await response.json();
      this.cache.set(path, data);

      return data;
    } catch (error) {
      console.error('DataLoader Error:', error);
      throw error;
    }
  }

  /**
   * 퀴즈 타입에 따른 데이터 로드
   * @param {string} quizType - 퀴즈 타입 문자열
   */
  async loadQuiz(quizType) {
    const fileMap = {
      // 기본 튜토리얼
      'multiple-choice': 'multiple-choice.json',
      'ox': 'ox-quiz.json',
      // 화장품 브랜드
      'cosmetic': 'cosmetic.json',
      'cosmetic-ox': 'cosmetic-ox.json',
      // 헤어케어
      'haircare': 'haircare.json',
      'haircare-ox': 'haircare-ox.json',
      // 이벤트
      'event': 'event.json',
      'event-ox': 'event-ox.json'
    };

    const filename = fileMap[quizType];
    if (!filename) {
      throw new Error(`Unknown quiz type: ${quizType}`);
    }

    return this.load(filename);
  }

  /**
   * 캐시 초기화
   */
  clearCache() {
    this.cache.clear();
  }
}
