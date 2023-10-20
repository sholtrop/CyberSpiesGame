// Return an array of `amount` numbers of which AT LEAST two sum up to 100
export function makeNumberListWith100Sum(amount: number): number[] {
  const firstPart = getRandomInt(1, 99);
  const secondPart = 100 - firstPart;

  // Generate the list of `amount` random unique numbers
  const setOfNumbers = new Set<number>();

  setOfNumbers.add(firstPart);
  setOfNumbers.add(secondPart);

  while (setOfNumbers.size < amount) {
    setOfNumbers.add(getRandomInt(1, 99));
  }

  let listOfNumbers = Array.from(setOfNumbers.values());
  shuffleArray(listOfNumbers);
  return listOfNumbers;
}

// Return a random whole number between `min` and `max`
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffleArray(array: number[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Generate a random index between 0 and i

    // Swap elements at i and j
    [array[i], array[j]] = [array[j], array[i]];
  }
}
