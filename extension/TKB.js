document.addEventListener('DOMContentLoaded', () => {
  const feature = "Feature 3";
  chrome.storage.local.get([`${feature}Data`], (result) => {
      const timetable = result[`${feature}Data`];
      console.log(timetable); // Log timetable data for debugging
      
      const weekSelector = document.getElementById('week-selector');
      const timetableContainer = document.getElementById('timetable-container');
      const prevButton = document.getElementById('prev-week');
      const nextButton = document.getElementById('next-week');

      if (timetable) {
          const weeks = timetable.data[Object.keys(timetable.data)[0]];
          weeks.forEach((week, index) => {
              const option = document.createElement('option');
              option.value = index; // Use week index for selection
              option.textContent = week.week; // Display week name
              weekSelector.appendChild(option);
          });

          let currentWeekIndex = 0; // Start with the first week
          displayTimetable(weeks[currentWeekIndex]);

          // Change timetable when week is selected
          weekSelector.addEventListener('change', (event) => {
              currentWeekIndex = parseInt(event.target.value); // Update current week index
              displayTimetable(weeks[currentWeekIndex]);
          });

          // Previous week button click event
          prevButton.addEventListener('click', () => {
              if (currentWeekIndex > 0) { // Check to prevent going beyond the first week
                  currentWeekIndex--;
                  weekSelector.selectedIndex = currentWeekIndex; // Update the selector
                  displayTimetable(weeks[currentWeekIndex]);
              }
          });

          // Next week button click event
          nextButton.addEventListener('click', () => {
              if (currentWeekIndex < weeks.length - 1) { // Check to prevent going beyond the last week
                  currentWeekIndex++;
                  weekSelector.selectedIndex = currentWeekIndex; // Update the selector
                  displayTimetable(weeks[currentWeekIndex]);
              }
          });
      } else {
          timetableContainer.innerText = 'Không có dữ liệu thời khóa biểu.'; // No timetable data available
      }
  });

  function displayTimetable(week) {
      const schedule = week.schedule;
      const weekHtml = `<h2>${week.week}</h2>`;
      let html = '<table><tr><th>Ngày</th><th>Môn học</th></tr>'; // Added header for clarity

      // Define the days of the week to check (from Monday to Sunday)
      const daysToDisplay = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

      let hasLessons = false; // Flag to check if any lessons are displayed

      daysToDisplay.forEach(day => {
          const lessons = schedule[day];
          if (lessons && lessons.length > 0 && lessons[0] !== "Không có môn học nào.") {
              hasLessons = true; // Set flag to true if there's at least one lesson
              html += `<tr><td>${day}</td>`;
              lessons.forEach(lesson => {
                  html += `<td>${lesson.subject} - ${lesson.GV} - ${lesson.Phòng} - ${lesson.time}</td>`;
              });
              html += '</tr>';
          }
      });

      // If there are no lessons, display a message
      if (!hasLessons) {
          html += `<tr><td colspan="2">Không có môn học nào trong tuần này.</td></tr>`;
      }

      html += '</table>'; // Close table
      document.getElementById('timetable-container').innerHTML = weekHtml + html; // Update timetable display
  }
});
