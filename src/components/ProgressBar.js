/**
 * ProgressBar - 진행률 표시 컴포넌트
 *
 * 사용법:
 * const progress = new ProgressBar(containerEl);
 * progress.render(5); // 총 5문제
 * progress.update(2); // 2번째 문제로 이동
 */
export class ProgressBar {
  constructor(container) {
    this.container = container;
    this.total = 0;
    this.current = 0;
  }

  /**
   * 프로그레스 바 초기 렌더링
   * @param {number} total - 전체 문제 수
   */
  render(total) {
    this.total = total;
    this.current = 0;

    const html = `
      <div class="progress-bar">
        <div class="progress-bar__fill" style="width: 0%"></div>
      </div>
      <div class="progress-steps">
        ${Array.from({ length: total }, (_, i) => `
          <div class="progress-step ${i === 0 ? 'active' : ''}" data-step="${i}">
            ${i + 1}
          </div>
        `).join('')}
      </div>
    `;

    this.container.innerHTML = html;
  }

  /**
   * 진행률 업데이트
   * @param {number} current - 현재 문제 인덱스 (0부터 시작)
   */
  update(current) {
    this.current = current;
    const percentage = ((current + 1) / this.total) * 100;

    // 바 업데이트
    const fill = this.container.querySelector('.progress-bar__fill');
    if (fill) {
      fill.style.width = `${percentage}%`;
    }

    // 스텝 업데이트
    const steps = this.container.querySelectorAll('.progress-step');
    steps.forEach((step, index) => {
      step.classList.remove('active', 'completed');

      if (index < current) {
        step.classList.add('completed');
      } else if (index === current) {
        step.classList.add('active');
      }
    });
  }

  /**
   * 특정 스텝 정답/오답 표시
   * @param {number} stepIndex
   * @param {boolean} isCorrect
   */
  markStep(stepIndex, isCorrect) {
    const step = this.container.querySelector(`.progress-step[data-step="${stepIndex}"]`);
    if (step) {
      step.classList.add(isCorrect ? 'correct' : 'incorrect');
    }
  }

  /**
   * 완료 상태로 변경
   */
  complete() {
    const fill = this.container.querySelector('.progress-bar__fill');
    if (fill) {
      fill.style.width = '100%';
      fill.classList.add('complete');
    }
  }

  /**
   * 초기화
   */
  clear() {
    this.container.innerHTML = '';
    this.total = 0;
    this.current = 0;
  }
}
