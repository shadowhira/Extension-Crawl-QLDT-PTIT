// Example function in your Chrome Extension to fetch and save data
async function fetchDataAndSave() {
  try {
    const response = await fetch('http://localhost:3000/api/ctdt'); // Replace with your actual API endpoint
    const result = await response.json();

    if (response.ok) {
      // Save the crawled data to chrome.storage
      chrome.storage.local.set({ crawledData: result.data }, function() {
        if (chrome.runtime.lastError) {
          console.error("Error saving data to chrome.storage:", chrome.runtime.lastError);
        } else {
          console.log("Data saved successfully to chrome.storage!");
        }
      });
    } else {
      console.error("Failed to fetch data:", result.message);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Call the function when needed, e.g., on extension load or a button click
fetchDataAndSave();
