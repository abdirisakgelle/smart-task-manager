/**
 * Convert local date and time to ISO string (preserving local timezone)
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @returns {string} ISO string in local timezone
 */
export const localDateTimeToISO = (date, time) => {
  // Simply combine date and time without any timezone conversion
  const result = `${date}T${time}:00`;
  
  console.log('🔍 TimeUtils Debug:', {
    inputDate: date,
    inputTime: time,
    result: result
  });
  
  return result;
};

/**
 * Convert local date and time to UTC ISO string (for backward compatibility)
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @returns {string} UTC ISO string
 */
export const localDateTimeToUTC = (date, time) => {
  // Create a date string in local timezone
  const localDateTime = `${date}T${time}:00`;
  const localDate = new Date(localDateTime);
  
  // Convert to UTC ISO string
  return localDate.toISOString();
};

/**
 * Convert ISO string to local date and time
 * @param {string} isoString - ISO string
 * @returns {object} Object with date and time in local timezone
 */
export const isoToLocalDateTime = (isoString) => {
  const date = new Date(isoString);
  
  // Format date as YYYY-MM-DD in local timezone
  const localDate = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  
  // Format time as HH:MM in local timezone
  const localTime = date.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
  
  return {
    date: localDate,
    time: localTime
  };
};

/**
 * Format due date for display
 * @param {string} dueDate - Due date string
 * @returns {string} Formatted date string
 */
export const formatDueDateForDisplay = (dueDate) => {
  const date = new Date(dueDate);
  console.log('🔍 formatDueDateForDisplay:', {
    input: dueDate,
    date: date,
    result: date.toLocaleDateString()
  });
  return date.toLocaleDateString();
};

/**
 * Format due time for display
 * @param {string} dueDate - Due date string
 * @returns {string} Formatted time string
 */
export const formatDueTimeForDisplay = (dueDate) => {
  const date = new Date(dueDate);
  console.log('🔍 formatDueTimeForDisplay:', {
    input: dueDate,
    date: date,
    result: date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  });
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}; 