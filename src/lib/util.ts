import { dev } from "$app/environment";

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

// Halt execution for `timeMs` miliseconds.
export function asyncSleep(timeMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeMs);
  });
}

// Start the phone's NFC scanner and give the user `timeoutSecs` seconds to scan an NFC tag.
// Returns the contents of the NFC tag as a string, or null if the user did not scan a tag in time.
export async function scanNfc(timeoutSecs = 10): Promise<string | null> {
  try {
    const ndef = new NDEFReader();
    await ndef.scan();
    console.debug(`NFC Scanner activated`);
    return new Promise((resolve, reject) => {
      ndef.onreadingerror = (err) => {
        console.error(`Cannot read data from the NFC tag: ${err}`);
        reject();
      };
      ndef.onreading = (event) => {
        let msg = ``;
        const textDecoder = new TextDecoder();
        event.message.records.forEach((m) => {
          msg += textDecoder.decode(m.data);
        });
        // Got a message from an NFC tag, so return the message
        resolve(msg);
      };
      // Keep scanning for `timeoutSecs` seconds, then resolve to null as we did not scan something within the time limit
      asyncSleep(timeoutSecs * 1000).then(() => resolve(null));
    });
  } catch (err) {
    if (err instanceof Error) console.error(err.toString());
    else console.error(`Unknown error occurred while activating NFC reader`);
    return null;
  }
}

export function deviceIsSupported(): boolean {
  return ("NDEFReader" in window && window.isSecureContext) || dev;
}
