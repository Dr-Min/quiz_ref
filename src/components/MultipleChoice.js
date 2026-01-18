/**
 * MultipleChoice - 4지선다 컴포넌트
 *
 * 사용법:
 * const mc = new MultipleChoice(containerEl);
 * mc.onSelect = (selectedIndex, selectedValue) => { ... };
 * mc.render(question);
 */
export class MultipleChoice {
  constructor(container) {
    this.container = container;
    this.onSelect = null;
    this.selectedIndex = null;
    this.isLocked = false;
  }

  /**
   * 문제 렌더링
   * @param {Object} question - { question, options, correctAnswer }
   */
  render(question) {
    this.selectedIndex = null;
    this.isLocked = false;

    const html = `
      <div class="question-card">
        <h2 class="question-text">${question.question}</h2>
        <div class="options-list">
          ${question.options.map((option, index) => `
            <button
              class="option-btn"
              data-index="${index}"
              data-value="${option}"
            >
              <span class="option-label">${this._getLabel(index)}</span>
              <span class="option-text">${option}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this._bindEvents();
  }

  /**
   * 선택지 라벨 (A, B, C, D)
   */
  _getLabel(index) {
    return ['A', 'B', 'C', 'D'][index] || String(index + 1);
  }

  /**
   * 이벤트 바인딩
   */
  _bindEvents() {
    const buttons = this.container.querySelectorAll('.option-btn');
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
    const index = parseInt(btn.dataset.index);
    const value = btn.dataset.value;

    // 기존 선택 해제
    this.container.querySelectorAll('.option-btn').forEach(b => {
      b.classList.remove('selected');
    });

    // 새 선택 표시
    btn.classList.add('selected');
    this.selectedIndex = index;

    if (this.onSelect) {
      this.onSelect(index, value);
    }
  }

  /**
   * 정답/오답 표시
   * @param {number} correctIndex - 정답 인덱스
   * @param {number} selectedIndex - 선택한 인덱스
   */
  showResult(correctIndex, selectedIndex) {
    this.isLocked = true;

    const buttons = this.container.querySelectorAll('.option-btn');
    buttons.forEach((btn, index) => {
      btn.classList.add('disabled');

      if (index === correctIndex) {
        btn.classList.add('correct');
      } else if (index === selectedIndex && index !== correctIndex) {
        btn.classList.add('incorrect');
      }
    });
  }

  /**
   * 선택 잠금 (답 제출 후)
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
    this.selectedIndex = null;
    this.isLocked = false;
  }
}
