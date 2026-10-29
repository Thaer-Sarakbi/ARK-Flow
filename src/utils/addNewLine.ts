export function addNewlinesToString(text: string, maxLength: number) {
    const words = text.split(' ');
    let result = '';
    let currentLineLength = 0;
  
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
  
      // If the word itself is longer than maxLength, just append it with a newline
      if (word.length > maxLength && currentLineLength === 0) {
          result += word + '\n';
          currentLineLength = 0;
          continue;
      }
  
      // If adding the next word exceeds the max length, start a new line
      if (currentLineLength + word.length + (currentLineLength > 0 ? 1 : 0) > maxLength) {
        result += '\n' + word;
        currentLineLength = word.length;
      } else {
        // Otherwise, add a space if it's not the very first word
        if (currentLineLength > 0) {
          result += ' ';
          currentLineLength += 1;
        }
        result += word;
        currentLineLength += word.length;
      }
    }
  
    return result;
  }