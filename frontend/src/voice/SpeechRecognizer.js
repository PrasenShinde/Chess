/**
 * SpeechRecognizer.js
 * Wrapper around the browser Web Speech API (SpeechRecognition / webkitSpeechRecognition).
 * Handles microphone permissions, browser compatibility, recognition lifecycle, and error callbacks.
 */

export class SpeechRecognizer {
  /**
   * Initializes the speech recognizer instance if browser support is available.
   * @param {Object} [options]
   * @param {string} [options.lang="en-US"]
   * @param {boolean} [options.continuous=false]
   * @param {boolean} [options.interimResults=false]
   */
  constructor(options = {}) {
    const SpeechRecognitionApi =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    this.isSupported = Boolean(SpeechRecognitionApi);
    this.recognition = SpeechRecognitionApi ? new SpeechRecognitionApi() : null;

    if (this.recognition) {
      this.recognition.lang = options.lang || "en-US";
      this.recognition.continuous = options.continuous !== undefined ? options.continuous : false;
      this.recognition.interimResults = options.interimResults || false;
      this.recognition.maxAlternatives = 1;
    }

    this.isListening = false;
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;
    this.onStartCallback = null;

    this._bindEvents();
  }

  /**
   * Returns true if Web Speech API is supported in the current browser.
   * @returns {boolean}
   */
  static checkSupport() {
    return typeof window !== "undefined" &&
      Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Binds native SpeechRecognition event listeners to custom handlers.
   * @private
   */
  _bindEvents() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.onStartCallback) {
        this.onStartCallback();
      }
    };

    this.recognition.onresult = (event) => {
      if (!event.results || !event.results[0]) return;
      const transcript = event.results[0][0].transcript.trim();
      if (this.onResultCallback) {
        this.onResultCallback(transcript);
      }
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      let errorMessage = "Speech recognition error occurred.";

      switch (event.error) {
        case "not-allowed":
        case "service-not-allowed":
          errorMessage = "Microphone permission denied. Please allow microphone access.";
          break;
        case "no-speech":
          errorMessage = "No speech detected. Please try speaking again.";
          break;
        case "audio-capture":
          errorMessage = "No microphone was found on your device.";
          break;
        case "network":
          errorMessage = "Network error during speech recognition.";
          break;
        case "aborted":
          errorMessage = "Speech recognition was aborted.";
          break;
        default:
          errorMessage = event.error || errorMessage;
      }

      if (this.onErrorCallback) {
        this.onErrorCallback(errorMessage, event.error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };
  }

  /**
   * Starts speech recognition.
   * @param {Object} callbacks
   * @param {Function} callbacks.onResult - Called with the recognized transcript string.
   * @param {Function} [callbacks.onError] - Called with error message and error code.
   * @param {Function} [callbacks.onStart] - Called when listening starts.
   * @param {Function} [callbacks.onEnd] - Called when listening ends.
   */
  startListening({ onResult, onError, onStart, onEnd } = {}) {
    if (!this.isSupported) {
      const errorMsg = "Web Speech API is not supported in this browser. Please use Google Chrome, Edge, or Safari.";
      if (onError) onError(errorMsg, "unsupported");
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.onStartCallback = onStart;
    this.onEndCallback = onEnd;

    try {
      this.recognition.start();
    } catch (err) {
      if (err.name !== "InvalidStateError" && onError) {
        onError("Could not start speech recognition.", err.name);
      }
    }
  }

  /**
   * Stops active speech recognition.
   */
  stopListening() {
    if (!this.recognition || !this.isListening) return;
    try {
      this.recognition.stop();
    } catch (err) {
      // Ignored if already stopped
    }
    this.isListening = false;
  }
}

export default SpeechRecognizer;
