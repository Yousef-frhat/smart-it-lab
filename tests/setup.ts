import "@testing-library/jest-dom";

// jsdom does not implement scrollIntoView — mock it globally
window.HTMLElement.prototype.scrollIntoView = function () {};

// jsdom does not implement requestAnimationFrame properly in all cases
// Ensure it calls the callback synchronously for tests
if (typeof window !== 'undefined') {
  window.requestAnimationFrame = (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  };
}
