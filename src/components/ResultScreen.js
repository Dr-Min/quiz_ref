/**
 * ResultScreen - 결과 화면 컴포넌트
 *
 * 사용법:
 * const result = new ResultScreen(containerEl);
 * result.onRetry = () => { ... };
 * result.onHome = () => { ... };
 * result.render(summary);
 */
export class ResultScreen {
  constructor(container) {
    this.container = container;
    this.onRetry = null;
    this.onHome = null;
  }

  /**
   * 결과 화면 렌더링
   * @param {Object} summary - ScoreManager.generateSummary() 결과
   */
  render(summary) {
    const html = `
      <div class="result-card">
        <div class="result-header">
          <h2 class="result-title">퀴즈 완료!</h2>
        </div>

        <div class="result-score">
          <div class="score-circle" style="--grade-color: ${summary.gradeColor}">
            <span class="score-grade">${summary.grade}</span>
            <span class="score-value">${summary.score}점</span>
          </div>
        </div>

        <p class="result-message">${summary.gradeLabel}</p>

        <div class="result-stats">
          <div class="stat-item">
            <span class="stat-label">총 문제</span>
            <span class="stat-value">${summary.totalQuestions}문제</span>
          </div>
          <div class="stat-item stat-item--correct">
            <span class="stat-label">정답</span>
            <span class="stat-value">${summary.correctCount}문제</span>
          </div>
          <div class="stat-item stat-item--incorrect">
            <span class="stat-label">오답</span>
            <span class="stat-value">${summary.incorrectCount}문제</span>
          </div>
        </div>

        <div class="result-actions">
          <button class="btn btn--primary" id="retry-btn">다시 풀기</button>
          <button class="btn btn--secondary" id="home-btn">홈으로</button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this._bindEvents();
  }

  /**
   * 상세 결과 렌더링 (오답 노트)
   * @param {Array} answers - QuizEngine 답변 배열
   */
  renderDetails(answers) {
    const incorrectAnswers = answers.filter(a => !a.isCorrect);

    if (incorrectAnswers.length === 0) {
      return;
    }

    const detailsHtml = `
      <div class="result-details">
        <h3 class="details-title">오답 노트</h3>
        <ul class="details-list">
          ${incorrectAnswers.map((a, i) => `
            <li class="details-item">
              <span class="details-number">Q${a.questionIndex + 1}</span>
              <div class="details-content">
                <p class="details-question">${a.question.question}</p>
                <p class="details-answer">
                  <span class="your-answer">내 답: ${a.userAnswer}</span>
                  <span class="correct-answer">정답: ${a.question.correctAnswer}</span>
                </p>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    const card = this.container.querySelector('.result-card');
    if (card) {
      card.insertAdjacentHTML('beforeend', detailsHtml);
    }
  }

  /**
   * 이벤트 바인딩
   */
  _bindEvents() {
    const retryBtn = this.container.querySelector('#retry-btn');
    const homeBtn = this.container.querySelector('#home-btn');

    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        if (this.onRetry) this.onRetry();
      });
    }

    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        if (this.onHome) {
          this.onHome();
        } else {
          window.location.href = '/';
        }
      });
    }
  }

  /**
   * 화면 표시
   */
  show() {
    this.container.classList.remove('hidden');
  }

  /**
   * 화면 숨김
   */
  hide() {
    this.container.classList.add('hidden');
  }

  /**
   * 초기화
   */
  clear() {
    this.container.innerHTML = '';
  }
}
