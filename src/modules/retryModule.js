// Hàm retry toàn bộ quá trình crawl
async function crawlWithRetry(fn, retries = 3, waitTime = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn(); // Thực hiện hàm crawl
    } catch (err) {
      console.error(`Attempt ${i + 1} failed. Retrying entire crawl process...`);
      if (i === retries - 1) throw err; // Nếu đã hết retries thì throw error
      await new Promise(resolve => setTimeout(resolve, waitTime)); // Chờ trước khi retry
    }
  }
}

// Hàm retry logic để đảm bảo không miss thao tác
async function tryWithRetry(fn, retries = 3, waitTime = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn(); // Thực hiện hành động
    } catch (err) {
      console.error(`Attempt ${i + 1} failed. Retrying action...`);
      if (i === retries - 1) throw err; // Nếu hết retries thì throw error
      await new Promise(resolve => setTimeout(resolve, waitTime)); // Chờ trước khi retry
    }
  }
}

module.exports = { crawlWithRetry, tryWithRetry };
