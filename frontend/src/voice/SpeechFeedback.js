/**
 * SpeechFeedback.js
 * Speech synthesis module using Web Speech Synthesis API.
 * Provides voice responses for move confirmations, warnings, and errors.
 */

export class SpeechFeedback {
  constructor() {
    this.isSupported = typeof window !== "undefined" && "speechSynthesis" in window;
    this.utterance = null;
  }

  /**
   * Speaks a text message using the browser SpeechSynthesis API.
   * @param {string} message Text to speak
   * @param {Object} [options] Options for speech (rate, pitch, volume)
   */
  speak(message, options = {}) {
    if (!this.isSupported || !message) return;

    try {
      // Cancel any active speech before speaking new message
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;
      utterance.lang = options.lang || "en-US";

      window.speechSynthesis.speak(utterance);
      this.utterance = utterance;
    } catch (err) {
      console.warn("[SpeechFeedback] Speech synthesis error:", err);
    }
  }

  /**
   * Cancels any ongoing speech.
   */
  cancel() {
    if (!this.isSupported) return;
    try {
      window.speechSynthesis.cancel();
    } catch (err) {
      // Ignored
    }
  }
}

// Singleton export
export const speechFeedback = new SpeechFeedback();
export default speechFeedback;
