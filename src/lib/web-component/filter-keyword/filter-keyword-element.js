class filterKeyword extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    const filterContainer = document
      .querySelector('#filterKeywordTemplate')
      .content.cloneNode(true);

    this.inputBox = filterContainer.querySelector(
      'input[name="filter-keyword"]'
    );
    console.log(this.inputBox);

    shadow.appendChild(filterContainer);
  }

  connectedCallback() {
    this.inputBox.addEventListener(
      'input',
      this.delay((event) => {
        // console.log(
        //   `original target value ${event.originalTarget.value} and data ${event.data}`
        // );
        this.dispatchEvent(
          new CustomEvent('keywordchange', {
            detail: event.originalTarget.value,
          })
        );
      }, 1000)
    );
  }

  delay(fn, ms) {
    let timer = 0;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(fn.bind(this, ...args), ms || 0);
    };
  }
}

window.customElements.define('filter-keyword', filterKeyword);
