/**
 * Logger utility for consistent logging and error tracking
 */

// Configuration
const config = {
  // Log levels
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    critical: 4
  },
  
  // Current log level (can be set based on environment)
  currentLevel: process.env.NODE_ENV === 'production' ? 2 : 0,
  
  // Whether to include timestamps
  includeTimestamps: true,
  
  // Whether to send telemetry data to backend
  enableTelemetry: process.env.NODE_ENV === 'production',
  
  // Endpoint for error reporting
  telemetryEndpoint: '/api/telemetry/log'
};

/**
 * Format a log message with timestamp and other details
 * 
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 * @returns {string} Formatted log message
 */
const formatLogMessage = (level, message, data) => {
  const timestamp = config.includeTimestamps ? `[${new Date().toISOString()}] ` : '';
  const prefix = `${timestamp}[${level.toUpperCase()}] `;
  
  if (data) {
    return `${prefix}${message} ${JSON.stringify(data)}`;
  }
  
  return `${prefix}${message}`;
};

/**
 * Send telemetry data to the backend
 * 
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
const sendTelemetry = async (level, message, data = {}) => {
  if (!config.enableTelemetry) return;
  
  try {
    // Only send telemetry for warnings and errors
    if (config.levels[level] < config.levels.warn) return;
    
    const telemetryData = {
      level,
      message,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...data
    };
    
    // Use fetch to avoid circular dependency with our API client
    await fetch(config.telemetryEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telemetryData),
      // Don't wait for response or handle errors - fire and forget
      keepalive: true
    });
  } catch (err) {
    // Silently fail - don't cause additional errors when reporting errors
    console.debug('Failed to send telemetry:', err);
  }
};

/**
 * Log a debug message
 * 
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
const debug = (message, data) => {
  if (config.currentLevel <= config.levels.debug) {
    console.debug(formatLogMessage('debug', message, data));
  }
};

/**
 * Log an info message
 * 
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
const info = (message, data) => {
  if (config.currentLevel <= config.levels.info) {
    console.info(formatLogMessage('info', message, data));
  }
};

/**
 * Log a warning message
 * 
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
const warn = (message, data) => {
  if (config.currentLevel <= config.levels.warn) {
    console.warn(formatLogMessage('warn', message, data));
    sendTelemetry('warn', message, data);
  }
};

/**
 * Log an error message
 * 
 * @param {string} message - Log message
 * @param {Error|Object} error - Error object or data
 * @param {Object} additionalData - Additional context data
 */
const error = (message, error, additionalData) => {
  if (config.currentLevel <= config.levels.error) {
    const errorObj = error instanceof Error ? { 
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error;
    
    console.error(formatLogMessage('error', message, errorObj));
    
    // Send telemetry with combined data
    sendTelemetry('error', message, {
      ...errorObj,
      ...(additionalData || {})
    });
  }
};

/**
 * Log a critical error - always logged regardless of level
 * 
 * @param {string} message - Log message
 * @param {Error|Object} error - Error object or data
 * @param {Object} additionalData - Additional context data
 */
const critical = (message, error, additionalData) => {
  const errorObj = error instanceof Error ? { 
    message: error.message,
    stack: error.stack,
    name: error.name
  } : error;
  
  console.error(formatLogMessage('CRITICAL', message, errorObj));
  
  // Send telemetry with additional data
  sendTelemetry('critical', message, {
    ...errorObj,
    ...(additionalData || {})
  });
};

/**
 * Update logger configuration
 * 
 * @param {Object} newConfig - New configuration
 */
const configure = (newConfig) => {
  Object.assign(config, newConfig);
};

// Export the logger interface
const logger = {
  debug,
  info,
  warn,
  error,
  critical,
  configure
};

export default logger;

 