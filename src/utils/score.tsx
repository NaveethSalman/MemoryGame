// utils/scoreUtils.ts

export interface HighScore {
  time: number; // in seconds
  moves: number;
  score: number; // calculated score
  date: string;
}

// Calculate score: lower is better (time in seconds + moves * 2)
export const calculateScore = (timeInSeconds: number, moves: number): number => {
  return timeInSeconds + (moves * 2);
};

// Get high score from localStorage
export const getHighScore = (): HighScore | null => {
  try {
    const stored = localStorage.getItem('memoryGameHighScore');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading high score:', error);
  }
  return null;
};

// Save high score to localStorage
export const saveHighScore = (time: number, moves: number): boolean => {
  try {
    const newScore = calculateScore(time, moves);
    const currentHighScore = getHighScore();
    
    // If no high score exists, or new score is better (lower), save it
    if (!currentHighScore || newScore < currentHighScore.score) {
      const highScore: HighScore = {
        time,
        moves,
        score: newScore,
        date: new Date().toISOString()
      };
      localStorage.setItem('memoryGameHighScore', JSON.stringify(highScore));
      return true; // New high score!
    }
  } catch (error) {
    console.error('Error saving high score:', error);
  }
  return false; // Not a new high score
};

// Format time for display
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Clear high score (for testing or reset)
export const clearHighScore = (): void => {
  try {
    localStorage.removeItem('memoryGameHighScore');
  } catch (error) {
    console.error('Error clearing high score:', error);
  }
};