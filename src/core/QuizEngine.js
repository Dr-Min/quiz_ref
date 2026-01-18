/**
 * QuizEngine - 퀴즈 상태 관리 핵심 엔진
 *
 * 사용법:
 * const engine = new QuizEngine(questions);
 * engine.onQuestionChange = (question, index) => { ... };
 * engine.onComplete = (results) => { ... };
 * engine.start();
 */
export class QuizEngine {
  constructor(questions = []) {
    this.questions = questions;
    this.currentIndex = 0;
    this.answers = [];
    this.isCompleted = false;

    // 콜백 함수들
    this.onQuestionChange = null;
    this.onComplete = null;
    this.onAnswerSubmit = null;
  }

  /**
   * 퀴즈 시작
   */
  start() {
    this.currentIndex = 0;
    this.answers = [];
    this.isCompleted = false;
    this._emitQuestionChange();
  }

  /**
   * 현재 문제 가져오기
   */
  getCurrentQuestion() {
    return this.questions[this.currentIndex] || null;
  }

  /**
   * 전체 문제 수
   */
  getTotalQuestions() {
    return this.questions.length;
  }

  /**
   * 현재 진행률 (0~100)
   */
  getProgress() {
    if (this.questions.length === 0) return 0;
    return Math.round((this.currentIndex / this.questions.length) * 100);
  }

  /**
   * 답변 제출
   * @param {*} answer - 사용자가 선택한 답
   */
  submitAnswer(answer) {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion || this.isCompleted) return;

    const isCorrect = this._checkAnswer(currentQuestion, answer);

    const answerRecord = {
      questionIndex: this.currentIndex,
      question: currentQuestion,
      userAnswer: answer,
      isCorrect: isCorrect
    };

    this.answers.push(answerRecord);

    if (this.onAnswerSubmit) {
      this.onAnswerSubmit(answerRecord);
    }

    return answerRecord;
  }

  /**
   * 다음 문제로 이동
   */
  next() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this._emitQuestionChange();
      return true;
    } else {
      this._complete();
      return false;
    }
  }

  /**
   * 정답 확인
   */
  _checkAnswer(question, answer) {
    return question.correctAnswer === answer;
  }

  /**
   * 문제 변경 이벤트 발생
   */
  _emitQuestionChange() {
    if (this.onQuestionChange) {
      this.onQuestionChange(this.getCurrentQuestion(), this.currentIndex);
    }
  }

  /**
   * 퀴즈 완료 처리
   */
  _complete() {
    this.isCompleted = true;

    const results = {
      totalQuestions: this.questions.length,
      correctCount: this.answers.filter(a => a.isCorrect).length,
      answers: this.answers,
      score: this._calculateScore()
    };

    if (this.onComplete) {
      this.onComplete(results);
    }

    return results;
  }

  /**
   * 점수 계산 (100점 만점)
   */
  _calculateScore() {
    if (this.questions.length === 0) return 0;
    const correctCount = this.answers.filter(a => a.isCorrect).length;
    return Math.round((correctCount / this.questions.length) * 100);
  }

  /**
   * 퀴즈 리셋
   */
  reset() {
    this.currentIndex = 0;
    this.answers = [];
    this.isCompleted = false;
  }
}
