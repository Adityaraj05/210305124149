const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 9876;

app.use(cors());

const windowSize = 10;
let numberStorage = [];

const numberUrls = {
  'p': "http://20.244.56.144/test/primes",
  'f': "http://20.244.56.144/test/fibo",
  'e': "http://20.244.56.144/test/even",
  'r': "http://20.244.56.144/test/rand"
};

async function fetchNumbers(typeId) {
  try {
    const response = await axios.get(numberUrls[typeId], { timeout: 500 });
    return response.data.numbers || [];
  } catch (error) {
    return [];
  }
}

app.get('/numbers/:typeId', async (req, res) => {
  const { typeId } = req.params;
  if (!['p', 'f', 'e', 'r'].includes(typeId)) {
    return res.status(400).json({ error: 'Invalid type ID' });
  }

  const newNumbers = await fetchNumbers(typeId);

  const windowPrevState = [...numberStorage];

  // Add new numbers, maintaining uniqueness and window size
  newNumbers.forEach(num => {
    if (!numberStorage.includes(num)) {
      numberStorage.push(num);
    }
    if (numberStorage.length > windowSize) {
      numberStorage.shift();
    }
  });

  const windowCurrState = [...numberStorage];
  const avg = numberStorage.length ? (numberStorage.reduce((acc, num) => acc + num, 0) / numberStorage.length) : 0;

  res.json({
    windowPrevState,
    windowCurrState,
    numbers: newNumbers,
    avg
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
