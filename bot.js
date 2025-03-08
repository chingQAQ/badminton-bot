require("dotenv").config();

const axios = require("axios");

const cheerio = require("cheerio");

const sessionId = process.argv[2].split("=")[1];

const time = parseInt(process.argv[3].split("=")[1]);

const hours = parseInt(process.argv[4].split("=")[1]);

let bookingDate = "";

const bookingPlaceAndTimeList = [
  [
    {
      placeName: "5-1",
      place: "1112",
      time: time,
    },
    {
      placeName: "5-1",
      place: "1112",
      time: time + hours - 1,
    },
  ],
  [
    {
      placeName: "5-2",
      place: "1113",
      time: time,
    },
    {
      placeName: "5-2",
      place: "1113",
      time: time + hours - 1,
    },
  ],
  [
    {
      placeName: "5-3",
      place: "1114",
      time: time,
    },
    {
      placeName: "5-3",
      place: "1114",
      time: time + hours - 1,
    },
  ],
  [
    {
      placeName: "5-4",
      place: "1115",
      time: time,
    },
    {
      placeName: "5-4",
      place: "1115",
      time: time + hours - 1,
    },
  ],
  [
    {
      placeName: "5-5",
      place: "1116",
      time: time,
    },
    {
      placeName: "5-5",
      place: "1116",
      time: time + hours - 1,
    },
  ],
  [
    {
      placeName: "5-6",
      place: "1163",
      time: time,
    },
    {
      placeName: "5-6",
      place: "1163",
      time: time + hours - 1,
    },
  ],
  [
    {
      placeName: "5-7",
      place: "1164",
      time: time,
    },
    {
      placeName: "5-7",
      place: "1164",
      time: time + hours - 1,
    },
  ],
  [
    {
      placeName: "5-8",
      place: "1165",
      time: time,
    },
    {
      placeName: "5-8",
      place: "1165",
      time: time + hours - 1,
    },
  ],
  [
    {
      placeName: "5-9",
      place: "1166",
      time: time,
    },
    {
      placeName: "5-9",
      place: "1166",
      time: time + hours - 1,
    },
  ],
];

const orderListURL =
  "https://bwd.xuanen.com.tw/wd02.aspx?module=member&files=orderx_mt";

const BASE_URL = "https://bwd.xuanen.com.tw";

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  Referer: `https://bwd.xuanen.com.tw/wd02.aspx?module=net_booking&files=booking_place&StepFlag=2&PT=1&D=${bookingDate}&D2=3`,
  Cookie: `ASP.NET_SessionId=${sessionId}`,
};

function setBookingDate() {
    const now = new Date();

    now.setDate(now.getDate() + 7);

    const year = now.getFullYear();

    const month = String(now.getMonth() + 1).padStart(2, "0");

    const day = String(now.getDate()).padStart(2, "0");

    bookingDate = `${year}/${month}/${day}`;
}

function checkBookingStatus(html) {
    const $ = cheerio.load(html);

    const scriptContent = $("script").text();

    const match = scriptContent.match(/window\.location\.href='[^']*Y=(\d+)&/);
    
    if (match) {
        const Y = parseInt(match[1], 10);
        if (Y === 0) {
            console.log("❌ 預約失敗");

            return false;
        } else {
            return true;
        }
    }

    console.log("⚠ 無法解析 Y 值，可能是未預期的 HTML 結構");

    return false;
}

async function bookCourt({
    place,
    time
}) {
    try {
        const url = `https://bwd.xuanen.com.tw/wd02.aspx?module=net_booking&files=booking_place&StepFlag=25&QPid=${place}&QTime=${time}&PT=1&D=${bookingDate}`;

        const response = await axios.get(url, { headers });

        if (response.status === 200) {
            return checkBookingStatus(response.data);
        } else {
            console.log("❌ 預約請求失敗，狀態碼:", response.status);

        return false;
        }
    } catch (error) {
        console.error("❌ 請求錯誤:", error.message);

        return false;
    }
}

async function getOrderListAndCancel() {
    try {
        const response = await axios.get(orderListURL, { headers });

        const $ = cheerio.load(response.data);

        const cancelButton = $(
        "#ContentPlaceHolder1_Repeater1_LabelDo_0 img[alt='取消']"
        ).attr("onclick");

        if (!cancelButton) {
        console.log("未找到取消按鈕");

        return false;
        }

        const match = cancelButton.match(/window\.location\.href='(.*?)'/);

        if (!match) {
        console.log("無法解析取消請求 URL");

        return false;
        }

        let cancelUrl = match[1];

        cancelUrl = new URL(cancelUrl, BASE_URL).href;

        console.log("找到取消請求 URL:", cancelUrl);

        const cancelResponse = await axios.get(cancelUrl, { headers });

        if (cancelResponse.status === 200) {
            return true;
        } else {
            console.log("取消請求失敗", cancelResponse.status);

            return false;
        }
    } catch (error) {
            console.error("請求錯誤:", error.message);

            return false;
    }
}

async function proceedBooking(currentBookingPlaceAndTimeIndex = 0) {
    const pareOfBookingPlaceAndTime =
        bookingPlaceAndTimeList[currentBookingPlaceAndTimeIndex];

    if (!pareOfBookingPlaceAndTime) {
        console.log("❌ 所有預約都失敗！");

        return;
    }

    const result1 = await bookCourt(pareOfBookingPlaceAndTime[0]);

    const result2 = await bookCourt(pareOfBookingPlaceAndTime[1]);

    if (result1 && result2) {
        console.log(`🎉 ${pareOfBookingPlaceAndTime[0].placeName} 預約成功！`);

        return;
    }

    const cancelResult = await getOrderListAndCancel();

    if (cancelResult) {
        console.log("已取消預約！");

        proceedBooking(currentBookingPlaceAndTimeIndex + 1);

        return;
    }

    console.log("❌ 取消預約失敗！");

    return;
}

function run() {
    const now = new Date();

    const targetTime = new Date();

    targetTime.setHours(0, 0, 0, 0);

    if (now > targetTime) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const delay = targetTime - now;

    console.log(`選擇的預約時間: ${time} 點`);

    console.log(`預約時段長度: ${hours} 小時`);

    console.log(`預約的時間範圍是: ${time} 點到 ${time + hours} 點`);

    if (!sessionId) {
        console.log("❌ 未提供 sessionId");

        return;
    }

    if (!time) {
        console.log("❌ 預約時間不能為0");

        return;
    }

    if (!hours) {
        console.log("❌ 預約時段長度不能為0");

        return;
    }

    console.log(
      `⏳ 等待至 ${targetTime.toLocaleDateString("zh-TW")} ${targetTime.toLocaleTimeString()} 後嘗試預訂球場...`
    );

    setTimeout(() => {
        setBookingDate();

        console.log(`🚗 開始預訂 ${bookingDate} 的球場`);

        proceedBooking();
    }, delay);
}

run();
