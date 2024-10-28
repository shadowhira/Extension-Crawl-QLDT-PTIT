// loginController.js
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const pt = require("puppeteer");
const minimal_args = require("../constant/minimalArgs");

// Load environment variables from .env
dotenv.config();
const { login } = require("../modules/loginModule"); // Import login function

// Login controller function
const loginController = async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }
  let broswer;
  try{
    broswer = await pt.launch({
      headless: true,
      args: minimal_args,
      userDataDir: "./path/to/cache/resource", // cache tài nguyên
    });
  
    const page = await broswer.newPage();
  
    // Chặn các tài nguyên không cần thiết như ảnh, font, media, stylesheet
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const resourceType = request.resourceType();
      if (["image", "media", "font"].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });
    console.log("Navigating to the page...");
  
    const navigationPromise = page.goto("https://qldt.ptit.edu.vn/#/home", {
      waitUntil: "networkidle0",
      timeout: 60000,
    }); // Increase timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Navigation timeout")), 30000)
    ); // 30s timeout
    await Promise.race([navigationPromise, timeoutPromise]);
  
    console.log("Page loaded. Attempting to log in...");

    const isLogin = await login(page, username, password); // Ensure to pass the correct parameters
    if (isLogin) {
      console.log("Login access!");
      return res.status(200).json({ success: true, message: "Login successful!" });
    } else {
      console.log("Login failed!");
      return res.status(401).json({ success: false, message: "Login failed!" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }finally {
      if (broswer) {
        await broswer.close();
      }
    }
};

module.exports = { loginController };
