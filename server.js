const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Route to handle question requests
app.post('/ask', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'No question provided' });
  }

  try {
    // Launch the Puppeteer browser
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to ChatGPT's official site (no login required for the free version)
    await page.goto('https://chat.openai.com/');

    // Wait for the chat input area to load
    await page.waitForSelector('textarea[placeholder="Send a message"]');

    // Type the user's question into the ChatGPT input field
    await page.type('textarea[placeholder="Send a message"]', question, { delay: 100 });

    // Press "Enter" to submit the message
    await page.keyboard.press('Enter');

    // Wait for the AI's response to appear in the chat interface
    await page.waitForSelector('.message:last-child');

    // Extract the AI's response
    const aiResponse = await page.evaluate(() => {
      const lastMessage = document.querySelector('.message:last-child');
      return lastMessage ? lastMessage.innerText : '';
    });

    // Close the browser
    await browser.close();

    // Return the AI response to the frontend
    res.json({ answer: aiResponse });

  } catch (error) {
    console.error('Error interacting with ChatGPT:', error);
    res.status(500).json({ error: 'Error processing the request' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
