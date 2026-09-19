// 共用頁首位於巢狀頁面時，將系列入口修正為上一層的 collection.html。
document.querySelectorAll('.site-header a[href="./collection.html"]').forEach(function (link) {
  link.setAttribute("href", "../collection.html");
});
