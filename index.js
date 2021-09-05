// LINE送信部分
const send = () => {
  const https = require("https")
  const querystring = require("querystring")
  
  const Token = "ここにLINENotifyトークン"
  const content = querystring.stringify({
      message: "adobeCCDeleterでエラーが発生しました。"
  })
  
  const options = {
      hostname: "notify-api.line.me",
      path: "/api/notify",
      method: "POST",
      headers: {
          "Content-type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(content),
          "Authorization": `Bearer ${Token}`
      }
  }
  
  const request = https.request(options, res => {
      res.setEncoding("utf8")
      res.on("data", console.log)
      res.on("error", console.log)
  })
  
  request.write(content)
  request.end()
}

const puppeteer = require("puppeteer");

// 定数 (後述)
const LOGIN_URL = "https://assets.adobe.com/deleted";
const LOGIN_USER = "ここにメールアドレス"; // 使用したいユーザーID
const LOGIN_PASS = "ここにパスワード"; // 使用したいユーザーIDのパスワード
const LOGIN_USER_SELECTOR = "input[type=email]";
const LOGIN_PASS_SELECTOR = "input[type=password]";
const LOGIN_USER_SUBMIT_SELECTOR = "button[data-id=EmailPage-ContinueButton]";
const LOGIN_PASS_SUBMIT_SELECTOR = "button[data-id=PasswordPage-ContinueButton]";
const deleteBtn = "button[data-test-id=CollectionHeader__permanentlyDelete]";
const completeDeleteBtn = ".spectrum-Button--warning";

/**
 * メイン処理です。
 */
(async () => {
  const browser = await puppeteer.launch({
    // ブラウザを開く
    headless: false, // ブラウザを表示するか (デバッグの時は false にしたほうが画面が見えてわかりやすいです)
  });
  const page = await browser.newPage(); // 新規ページ
  await page.setViewport({ width: 1440, height: 900 }); // ビューポート (ウィンドウサイズ)
  await page.setExtraHTTPHeaders({
    // 必要な場合、HTTPヘッダを追加
    "Accept-Language": "ja",
  });

  // ログイン画面でログイン
  await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded" });
  await page.waitFor(5000);
  await page.type(LOGIN_USER_SELECTOR, LOGIN_USER);
  await Promise.all([ // ログインボタンクリック
    // クリック後ページ遷移後通信が完了するまで待つ (ページによっては 'domcontentloaded' 等でも可)
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click(LOGIN_USER_SUBMIT_SELECTOR),
  ]);
  await page.waitFor(2000);
  await page.type(LOGIN_PASS_SELECTOR, LOGIN_PASS);
  await page.click(LOGIN_PASS_SUBMIT_SELECTOR),
  await page.waitFor(10000);
  console.log('ロード完了')
  for (;;) {
    // アイテム選択
    await page.click(".spectrum-Checkbox-input")
    await page.waitFor(700);
    await page.click(deleteBtn)
    await page.waitFor(700);
    await page.click(completeDeleteBtn)
    await page.waitFor(1500);
  }
})().catch((e) => {
  console.error(e)
  send();
});
