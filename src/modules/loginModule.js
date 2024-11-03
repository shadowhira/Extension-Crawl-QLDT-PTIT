// loginModule.js

const dotenv = require('dotenv');
dotenv.config(); // Load the updated environment variables

async function login(page, username, password) {
  try {
    // const USERNAME = process.env.QLDT_USERNAME;
    // const PASSWORD = process.env.QLDT_PASSWORD;
    // Wait for and enter username
    await page.waitForSelector("input[name='username']", { visible: true, timeout: 60000 });
    await page.type("input[name='username']", username);
    // Wait for and enter password
    await page.waitForSelector("input[name='password']", { visible: true, timeout: 60000 });
    await page.type("input[name='password']", password);
    // Click the login <button></button>
    await page.click("button[class='btn btn-primary mb-1 ng-star-inserted']");

    // Wait for a brief moment to allow for the error message to appear, if any
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds, adjust as necessary

    // Check for the error message indicating login failure
    const errorSelector = ".alert.alert-danger.p-1.mb-1.ng-star-inserted"; // Replace with actual selector
    const hasError = await page.$(errorSelector);

    if (hasError) {
      return false; // Return false if login was not successful
    }

    return true; // Return true if login was successful

  } catch (error) {
    console.error("Login error:", error);
    return false; // Return false if an error occurs during the login process
  }
}

module.exports = { login };
