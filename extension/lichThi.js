document.addEventListener('DOMContentLoaded', () => {
  const feature = "Feature 1";
  
  // Retrieve schedule data from Chrome storage
  chrome.storage.local.get([`${feature}Data`], (result) => {
    const scheduleData = result[`${feature}Data`] ? result[`${feature}Data`].data : null;
    console.log(scheduleData ? "Data loaded" : "No data available"); // Log for debugging

    if (scheduleData) {
      const termSelect = document.getElementById("termSelect");
      const scheduleTableBody = document.querySelector("#scheduleTable tbody");

      if (!termSelect || !scheduleTableBody) {
        console.error("Required elements not found in the DOM.");
        return;
      }

      // Sort terms by academic year (descending) and semester number (ascending)
      const sortedTerms = Object.keys(scheduleData).sort((a, b) => {
        const [hocKyA, namHocA] = a.match(/Học kỳ (\d) Năm học (\d{4})-(\d{4})/).slice(1, 4);
        const [hocKyB, namHocB] = b.match(/Học kỳ (\d) Năm học (\d{4})-(\d{4})/).slice(1, 4);
        
        // Convert extracted values to integers
        const yearA = parseInt(namHocA);
        const yearB = parseInt(namHocB);
        const semesterA = parseInt(hocKyA);
        const semesterB = parseInt(hocKyB);

        // Sort by year (descending), then by semester (ascending)
        if (yearA !== yearB) {
          return yearB - yearA;
        } else {
          return semesterB - semesterA;
        }
      });

      // Populate term select dropdown with sorted terms
      sortedTerms.forEach(term => {
        const option = document.createElement("option");
        option.value = term;
        option.textContent = term;
        termSelect.appendChild(option);
      });

      // Display schedule based on selected term
      termSelect.addEventListener("change", () => displaySchedule(scheduleData, termSelect.value));
      
      // Initial display for the first term if available
      const initialTerm = termSelect.options[0]?.value;
      if (initialTerm) {
        displaySchedule(scheduleData, initialTerm);
      }
    } else {
      console.log("No data found in storage.");
    }
  });

  function displaySchedule(scheduleData, term) {
    const schedule = scheduleData[term];
    const scheduleTableBody = document.querySelector("#scheduleTable tbody");
    scheduleTableBody.innerHTML = ""; // Clear existing rows

    if (!schedule || schedule.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td class="no-data" colspan="10">No data available</td>`;
      scheduleTableBody.appendChild(row);
    } else {
      schedule.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.stt}</td>
          <td>${item.maMH}</td>
          <td>${item.tenMH}</td>
          <td>${item.siSo}</td>
          <td>${item.ngay}</td>
          <td>${item.gio}</td>
          <td>${item.phut}</td>
          <td>${item.phong}</td>
          <td>${item.coSo}</td>
          <td>${item.hinhThuc}</td>
        `;
        scheduleTableBody.appendChild(row);
      });
    }
  }
});
