export const insertionSort = (inputArr) => {
    const length = inputArr.length;
    for (let i = 1; i < length; i++) {
        const key = inputArr[i];
        let j = i - 1;
        while (j >= 0 && inputArr[j].toLowerCase() > key.toLowerCase()) {
            inputArr[j + 1] = inputArr[j];
            j = j - 1;
        }
        inputArr[j + 1] = key;
    }
    return inputArr;
  };