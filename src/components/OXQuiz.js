/**
 * OXQuiz - O/X 퀴즈 컴포넌트
 *
 * 사용법:
 * const ox = new OXQuiz(containerEl);
 * ox.onSelect = (answer) => { ... }; // 'O' or 'X'
 * ox.render(question);
 */
export class OXQuiz {
  constructor(container) {
    this.container = container;
    this.onSelect = null;
    this.selectedAnswer = null;
    this.isLocked = false;
  }

  /**
   * 문제 렌더링
   * @param {Object} question - { question, correctAnswer: 'O' | 'X' }
   */
  render(question) {
    this.selectedAnswer = null;
    this.isLocked = false;

    const html = `
      <div class="question-card">
        <h2 class="question-text">${question.question}</h2>
        <div class="ox-buttons">
          <button class="ox-btn ox-btn--o" data-answer="O">
            <span class="ox-icon">⭕</span>
            <span class="ox-label">맞아요</span>
          </button>
          <button class="ox-btn ox-btn--x" data-answer="X">
            <span class="ox-icon">❌</span>
            <span class="ox-label">아니에요</span>
          </button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this._bindEvents();
  }

  /**
   * 이벤트 바인딩
   */
  _bindEvents() {
    const buttons = this.container.querySelectorAll('.ox-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => this._handleSelect(e));
    });
  }

  /**
   * 선택 처리
   */
  _handleSelect(e) {
    if (this.isLocked) return;

    const btn = e.currentTarget;
    const answer = btn.dataset.answer;

    // 기존 선택 해제
    this.container.querySelectorAll('.ox-btn').forEach(b => {
      b.classList.remove('selected');
    });

    // 새 선택 표시
    btn.classList.add('selected');
    this.selectedAnswer = answer;

    if (this.onSelect) {
      this.onSelect(answer);
    }
  }

  /**
   * 정답/오답 표시
   * @param {string} correctAnswer - 'O' 또는 'X'
   * @param {string} selectedAnswer - 사용자가 선택한 답
   */
  showResult(correctAnswer, selectedAnswer) {
    this.isLocked = true;

    const buttons = this.container.querySelectorAll('.ox-btn');
    buttons.forEach(btn => {
      const answer = btn.dataset.answer;
      btn.classList.add('disabled');

      if (answer === correctAnswer) {
        btn.classList.add('correct');
      } else if (answer === selectedAnswer && answer !== correctAnswer) {
        btn.classList.add('incorrect');
      }
    });
  }

  /**
   * 선택 잠금
   */
  lock() {
    this.isLocked = true;
  }

  /**
   * 선택 해제
   */
  unlock() {
    this.isLocked = false;
  }

  /**
   * 초기화
   */
  clear() {
    this.container.innerHTML = '';
    this.selectedAnswer = null;
    this.isLocked = false;
  }
}
