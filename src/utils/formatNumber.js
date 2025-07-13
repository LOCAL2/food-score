/**
 * Format number with comma separators
 * @param {number} num - Number to format
 * @returns {string} - Formatted number string
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0'
  }
  
  return num.toLocaleString('en-US')
}

/**
 * Format number with Thai locale (if needed)
 * @param {number} num - Number to format
 * @returns {string} - Formatted number string
 */
export const formatNumberThai = (num) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0'
  }
  
  return num.toLocaleString('th-TH')
}

/**
 * Format large numbers with abbreviations (K, M, B)
 * @param {number} num - Number to format
 * @returns {string} - Formatted number string with abbreviation
 */
export const formatNumberShort = (num) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0'
  }
  
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  
  return num.toString()
}
