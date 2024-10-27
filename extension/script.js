async function fetchData() {
    const url = "https://google-translator9.p.rapidapi.com/v2";
    const options = {
      method: "POST",
      headers: {
        "x-rapidapi-key": "a9dd4305dfmshe84a151c08d73dbp161303jsn179b248e577b",
        "x-rapidapi-host": "google-translator9.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: document.getElementById("input").value, // Lấy giá trị từ ô input
        source: "en",
        target: "vi",
        format: "text",
      }),
    };
  
    try {
      const response = await fetch(url, options);
      const result = await response.json();
      
      // Trích xuất translatedText
      const translatedText = result.data.translations[0].translatedText;
      console.log(translatedText);
      document.getElementById("output").innerText = "Result: " +translatedText;
    } catch (error) {
      console.error(error);
      document.getElementById("output").innerText = "Error fetching data";

      const result = await fetch("url/getTKB", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      document.getElementById("output").innerText = "Error fetching data";

    }
  }
  
  document.getElementById("fetch").addEventListener("click", fetchData);
  