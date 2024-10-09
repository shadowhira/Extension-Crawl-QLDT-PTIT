const pt = require("puppeteer");
pt.launch({
  headless: false,
  args: ["--disable-setuid-sandbox"],
  ignoreHTTPSErrors: true,
}).then(async (browser) => {
  //browser new page
  const page = await browser.newPage();
  //set viewpoint of browser page
  await page.setViewport({ width: 1000, height: 500 });

  //launch URL
  await page.goto("https://qldt.ptit.edu.vn/#/home", {
    waitUntil: "networkidle2",
    timeout: 30000,
  }); // chờ cho không còn yêu cầu mạng nào đang được thực hiện.

  //capture screenshot
  await page.screenshot({
    path: "tutorialspoint.png",
    delay: 1000,
  });

  // nhap tai khoan
  await page.type("input[name='username']", "b21dccn680");

  // nhap mat khau
  await page.type("input[name='password']", "B21dccn680@31133.slink0");

  // Nhấn nút đăng nhập
  await Promise.all([
    page.click("button[class='btn btn-primary mb-1 ng-star-inserted']"),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);

  await page.waitForSelector(".cover:last-child", { visible: true });

  console.log("Logged in successfully!");

  // Lấy dữ liệu từ trang
  const data = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll(".cover")); // Thay đổi selector phù hợp với dữ liệu bạn cần
    return elements.map((element) => {
      return {
        text: element.innerText, // Hoặc bạn có thể lấy bất kỳ thuộc tính nào khác
        html: element.outerHTML,
      };
    });
  });

  console.log(data);
  await page.waitForSelector(".cover:last-child", { visible: true });
  // chụp ảnh trang web
  await page.screenshot({
    path: "logged_in.png",
  });

  // Chờ cho các phần tử <ul> xuất hiện
  await page.waitForSelector("ul.list-unstyled.my-1.ml-1.ng-star-inserted");

  // Nhấp vào thẻ <a> bên trong thẻ <ul> thứ 4 từ dưới lên
  const anchorClicked = await page.evaluate(() => {
    const uls = Array.from(
      document.querySelectorAll("ul.list-unstyled.my-1.ml-1.ng-star-inserted")
    );
    if (uls.length >= 4) {
      const fourthUl = uls[uls.length - 4]; // Thẻ <ul> thứ 4 từ dưới lên
      const anchor = fourthUl.querySelector("a.link-primary"); // Lấy thẻ <a> có class link-primary
      if (anchor) {
        anchor.click(); // Nhấp vào thẻ <a>
        return true; // Trả về true nếu nhấp thành công
      }
    }
    return false; // Trả về false nếu không nhấp được
  });

  if (anchorClicked) {
    console.log("Đã nhấp vào thẻ <a> thành công.");

    // Chờ cho bảng thời khóa biểu xuất hiện
    await page.waitForSelector("table.table.table-sm.table-bordered");

    // Lấy dữ liệu từ bảng thời khóa biểu
    const scheduleData = await page.evaluate(() => {
      const rows = Array.from(
        document.querySelectorAll("table.table.table-sm.table-bordered tr")
      );
      // return rows.map(row => {
      //     const cells = Array.from(row.querySelectorAll('td'));
      //     return cells.map(cell => cell.innerText.trim()); // Lấy nội dung trong từng ô
      // });
      const headers = Array.from(rows[0].querySelectorAll("td")).map((header) =>
        header.innerText.trim()
      );
      const data = rows.slice(1).map((row) => {
        const cells = Array.from(row.querySelectorAll("td")).map((cell) =>
          cell.innerText.trim()
        );
        return cells;
      });
      return { headers, data }; // Trả về headers và data
    });

    // console.log("Thời khóa biểu:", scheduleData); // In ra thời khóa biểu

    // In ra lịch học theo ngày
    const days = scheduleData.headers.slice(1); // Lấy tên các ngày từ headers
    const classes = scheduleData.data; // Lấy dữ liệu lịch học

    // Xử lý và in ra lịch học
    days.forEach((day, index) => {
      console.log(`Lịch học vào ${day}:`);
      classes.forEach((row) => {
        const subject = row[index];
        if (subject) {
          console.log(` - ${subject}`);
        }
      });
      console.log("-----------------------");
    });
    // Chụp ảnh màn hình
    await page.screenshot({ path: "time_table_clicked.png", fullPage: true });
  } else {
    console.log("Không thể nhấp vào thẻ <a>. Kiểm tra lại selector.");
  }

  //browser close
  await browser.close();
});
