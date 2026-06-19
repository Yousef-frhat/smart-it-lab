// Tiny cross-platform nano-ID — avoids adding uuid package dependency
export const uuid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);
