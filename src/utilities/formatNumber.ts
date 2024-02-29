export function formatNumber(numString: string): string {

    if (!numString) {
      // Input is undefined or empty, return an empty string
      return '';
    }

    const num = parseFloat(numString.replace(/,/g, '')); // Remove commas and parse as float
  
    if (isNaN(num)) {
      // Not a valid number, return the original value
      return numString;
    }
  
    if (Math.abs(num) >= 1e6) {
        // Million or more
        return (Math.floor(num / 1e5) / 10).toFixed(1) + 'M';
      } else if (Math.abs(num) >= 1e3) {
        // Thousand or more
        return (Math.floor(num / 1e2) / 10).toFixed(1) + 'K';
      } else {
        // Less than a thousand
        return num.toFixed(0);
      }
  }