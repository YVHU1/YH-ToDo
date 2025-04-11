class UndoManager {
  constructor(maxHistory = 10) {
    this.history = [];
    this.maxHistory = maxHistory;
  }

  addToHistory(todo) {
    this.history.unshift(todo);
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }
  }

  getLastCompleted() {
    return this.history[0] || null;
  }

  undoLast() {
    if (this.history.length > 0) {
      return this.history.shift();
    }
    return null;
  }

  clearHistory() {
    this.history = [];
  }
}

module.exports = UndoManager; 