/**
 * main.js - 퀴즈 애플리케이션 진입점
 */

import { QuizEngine } from './core/QuizEngine.js';
import { ScoreManager } from './core/ScoreManager.js';
import { DataLoader } from './core/DataLoader.js';
import { MultipleChoice } from './components/MultipleChoice.js';
import { OXQuiz } from './components/OXQuiz.js';
import { ProgressBar } from './components/ProgressBar.js';
import { ResultScreen } from './components/ResultScreen.js';

class QuizApp {
  constructor() {
    // DOM 요소
    this.quizContent = document.getElementById('quiz-content');
    this.resultScreen = document.getElementById('result-screen');
    this.progressContainer = document.getElementById('progress-bar-container');
    this.questionCounter = document.getElementById('question-counter');
    this.quizTypeLabel = document.getElementById('quiz-type-label');

    // 모듈 초기화
    this.dataLoader = new DataLoader();
    this.scoreManager = new ScoreManager();
    this.engine = null;
    this.quizComponent = null;
    this.progressBar = null;
    this.resultComponent = null;

    // 퀴즈 타입
    this.quizType = this._getQuizType();

    // 현재 선택한 답
    this.selectedAnswer = null;
  }

  /**
   * URL에서 퀴즈 타입 추출
   */
  _getQuizType() {
    const params = new URLSearchParams(window.location.search);
    return params.get('type') || 'multiple-choice';
  }

  /**
   * 앱 초기화 및 시작
   */
  async init() {
    try {
      // 데이터 로드
      const quizData = await this.dataLoader.loadQuiz(this.quizType);

      // 라벨 업데이트
      this._updateTypeLabel();

      // 퀴즈 엔진 설정
      this.engine = new QuizEngine(quizData.questions);
      this._setupEngineCallbacks();

      // 컴포넌트 초기화
      this._initComponents();

      // 프로그레스 바 렌더링
      this.progressBar.render(this.engine.getTotalQuestions());

      // 퀴즈 시작
      this.engine.start();

    } catch (error) {
      console.error('Quiz initialization failed:', error);
      this._showError('퀴즈를 불러오는데 실패했습니다.');
    }
  }

  /**
   * 타입 라벨 업데이트
   */
  _updateTypeLabel() {
    const labels = {
      'multiple-choice': '4지선다',
      'ox': 'O/X',
      'cosmetic': '피부 진단',
      'cosmetic-ox': '뷰티 상식',
      'haircare': '두피/모발 진단',
      'haircare-ox': '헤어케어 상식',
      'event': '상식 퀴즈',
      'event-ox': 'O/X 퀴즈'
    };
    if (this.quizTypeLabel) {
      this.quizTypeLabel.textContent = labels[this.quizType] || this.quizType;
    }
  }

  /**
   * O/X 타입인지 확인
   */
  _isOXType() {
    return this.quizType === 'ox' || this.quizType.endsWith('-ox');
  }

  /**
   * 엔진 콜백 설정
   */
  _setupEngineCallbacks() {
    // 문제 변경 시
    this.engine.onQuestionChange = (question, index) => {
      this._renderQuestion(question, index);
    };

    // 답변 제출 시
    this.engine.onAnswerSubmit = (record) => {
      this._showFeedback(record);
      this.progressBar.markStep(record.questionIndex, record.isCorrect);
    };

    // 퀴즈 완료 시
    this.engine.onComplete = (results) => {
      this._showResults(results);
    };
  }

  /**
   * 컴포넌트 초기화
   */
  _initComponents() {
    // 프로그레스 바
    this.progressBar = new ProgressBar(this.progressContainer);

    // 퀴즈 타입에 따른 컴포넌트 선택
    if (this._isOXType()) {
      this.quizComponent = new OXQuiz(this.quizContent);
    } else {
      this.quizComponent = new MultipleChoice(this.quizContent);
    }

    // 선택 콜백
    this.quizComponent.onSelect = (indexOrAnswer, value) => {
      // 4지선다: value가 실제 값, O/X: indexOrAnswer가 'O' 또는 'X'
      this.selectedAnswer = this._isOXType() ? indexOrAnswer : value;
    };

    // 결과 화면
    this.resultComponent = new ResultScreen(this.resultScreen);
    this.resultComponent.onRetry = () => this._retry();
    this.resultComponent.onHome = () => {
      window.location.href = '/';
    };
  }

  /**
   * 문제 렌더링
   */
  _renderQuestion(question, index) {
    this.selectedAnswer = null;

    // 카운터 업데이트
    if (this.questionCounter) {
      this.questionCounter.textContent = `${index + 1} / ${this.engine.getTotalQuestions()}`;
    }

    // 프로그레스 업데이트
    this.progressBar.update(index);

    // 문제 렌더링
    this.quizComponent.render(question);

    // 다음/제출 버튼 추가
    this._addActionButton();
  }

  /**
   * 액션 버튼 추가
   */
  _addActionButton() {
    // 기존 버튼 영역 제거
    const existingActions = this.quizContent.querySelector('.quiz-actions');
    if (existingActions) {
      existingActions.remove();
    }

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'quiz-actions';

    const isLastQuestion = this.engine.currentIndex === this.engine.getTotalQuestions() - 1;
    const buttonText = isLastQuestion ? '결과 보기' : '다음';

    actionsDiv.innerHTML = `
      <button class="btn btn--primary" id="next-btn">${buttonText}</button>
    `;

    this.quizContent.appendChild(actionsDiv);

    // 버튼 이벤트
    const nextBtn = document.getElementById('next-btn');
    nextBtn.addEventListener('click', () => this._handleNext());
  }

  /**
   * 다음 버튼 클릭 처리
   */
  _handleNext() {
    // 답 선택 확인
    if (this.selectedAnswer === null) {
      alert('답을 선택해주세요.');
      return;
    }

    // 이미 제출된 상태면 다음으로 이동
    if (this.quizComponent.isLocked) {
      this.engine.next();
      return;
    }

    // 답변 제출
    const record = this.engine.submitAnswer(this.selectedAnswer);

    // 정답/오답 표시
    const question = this.engine.getCurrentQuestion();
    if (this._isOXType()) {
      this.quizComponent.showResult(question.correctAnswer, this.selectedAnswer);
    } else {
      const correctIndex = question.options.indexOf(question.correctAnswer);
      const selectedIndex = question.options.indexOf(this.selectedAnswer);
      this.quizComponent.showResult(correctIndex, selectedIndex);
    }
  }

  /**
   * 피드백 표시
   */
  _showFeedback(record) {
    const existingFeedback = this.quizContent.querySelector('.feedback');
    if (existingFeedback) {
      existingFeedback.remove();
    }

    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = `feedback ${record.isCorrect ? 'feedback--correct' : 'feedback--incorrect'}`;

    const explanation = record.question.explanation || '';

    feedbackDiv.innerHTML = `
      <p class="feedback__text">${record.isCorrect ? '정답입니다!' : '틀렸습니다.'}</p>
      ${explanation ? `<p class="feedback__explanation">${explanation}</p>` : ''}
    `;

    // 문제 카드 뒤에 삽입
    const questionCard = this.quizContent.querySelector('.question-card');
    if (questionCard) {
      questionCard.after(feedbackDiv);
    }
  }

  /**
   * 결과 화면 표시
   */
  _showResults(results) {
    // 퀴즈 영역 숨김
    this.quizContent.classList.add('hidden');
    this.progressContainer.classList.add('hidden');

    // 프로그레스 완료 표시
    this.progressBar.complete();

    // 결과 요약 생성
    const summary = this.scoreManager.generateSummary(results);

    // 결과 화면 렌더링
    this.resultComponent.render(summary);
    this.resultComponent.renderDetails(results.answers);
    this.resultComponent.show();
  }

  /**
   * 다시 풀기
   */
  _retry() {
    // 결과 화면 숨김
    this.resultComponent.hide();

    // 퀴즈 영역 표시
    this.quizContent.classList.remove('hidden');
    this.progressContainer.classList.remove('hidden');

    // 엔진 리셋
    this.engine.reset();

    // 프로그레스 바 리렌더
    this.progressBar.render(this.engine.getTotalQuestions());

    // 퀴즈 재시작
    this.engine.start();
  }

  /**
   * 에러 표시
   */
  _showError(message) {
    this.quizContent.innerHTML = `
      <div class="error-message">
        <p>${message}</p>
        <a href="/" class="btn btn--secondary">홈으로 돌아가기</a>
      </div>
    `;
  }
}

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
  // quiz.html에서만 실행
  if (document.getElementById('quiz-content')) {
    const app = new QuizApp();
    app.init();
  }
});
