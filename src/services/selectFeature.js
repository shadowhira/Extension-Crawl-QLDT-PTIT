// selectUl.js
async function selectAndClickUl(page, ulIndexFromBottom) {
  // Chờ cho các phần tử <ul> xuất hiện
  await page.waitForSelector('ul.list-unstyled.my-1.ml-1.ng-star-inserted');

  // Nhấp vào thẻ <a> bên trong thẻ <ul> theo chỉ số từ dưới lên
  const anchorClicked = await page.evaluate((ulIndexFromBottom) => {
    const uls = Array.from(document.querySelectorAll('ul.list-unstyled.my-1.ml-1.ng-star-inserted'));
    if (uls.length >= ulIndexFromBottom) {
      const targetUl = uls[uls.length - ulIndexFromBottom]; // Thẻ <ul> theo chỉ số từ dưới lên
      const anchor = targetUl.querySelector('a.link-primary'); // Lấy thẻ <a> có class link-primary
      if (anchor) {
        anchor.click(); // Nhấp vào thẻ <a>
        return true; // Trả về true nếu nhấp thành công
      }
    }
    return false; // Trả về false nếu không nhấp được
  }, ulIndexFromBottom); // Truyền ulIndexFromBottom vào trong evaluate

  if (anchorClicked) {
    console.log(`Đã nhấp vào thẻ <a> trong thẻ <ul> thứ ${ulIndexFromBottom} từ dưới lên thành công.`);
    return true;
  } else {
    console.log(`Không thể nhấp vào thẻ <a> trong thẻ <ul> thứ ${ulIndexFromBottom} từ dưới lên.`);
    return false;
  }
}

module.exports = { selectAndClickUl };