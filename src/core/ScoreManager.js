/**
 * ScoreManager - 점수 계산 및 등급 관리
 *
 * 사용법:
 * const manager = new ScoreManager();
 * const grade = manager.getGrade(85);
 * const message = manager.getMessage(85);
 */
export class ScoreManager {
  constructor(config = {}) {
    // 등급 기준 (커스터마이징 가능)
    this.gradeThresholds = config.gradeThresholds || [
      { min: 90, grade: 'S', label: '완벽해요!', color: '#FFD700' },
      { min: 70, grade: 'A', label: '훌륭해요!', color: '#4CAF50' },
      { min: 50, grade: 'B', label: '좋아요!', color: '#2196F3' },
      { min: 30, grade: 'C', label: '조금 더 노력해요!', color: '#FF9800' },
      { min: 0, grade: 'D', label: '다시 도전해보세요!', color: '#F44336' }
    ];
  }

  /**
   * 점수로 등급 정보 가져오기
   * @param {number} score - 0~100 점수
   */
  getGrade(score) {
    for (const threshold of this.gradeThresholds) {
      if (score >= threshold.min) {
        return threshold;
      }
    }
    return this.gradeThresholds[this.gradeThresholds.length - 1];
  }

  /**
   * 결과 메시지 가져오기
   * @param {number} score
   */
  getMessage(score) {
    const grade = this.getGrade(score);
    return grade.label;
  }

  /**
   * 점수 계산
   * @param {number} correct - 맞은 개수
   * @param {number} total - 전체 문제 수
   */
  calculateScore(correct, total) {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  }

  /**
   * 결과 요약 생성
   * @param {Object} results - QuizEngine에서 반환된 결과
   */
  generateSummary(results) {
    const grade = this.getGrade(results.score);

    return {
      score: results.score,
      grade: grade.grade,
      gradeLabel: grade.label,
      gradeColor: grade.color,
      correctCount: results.correctCount,
      totalQuestions: results.totalQuestions,
      incorrectCount: results.totalQuestions - results.correctCount,
      percentage: `${results.score}%`
    };
  }
}
