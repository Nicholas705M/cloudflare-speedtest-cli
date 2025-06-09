import SpeedTest from "@cloudflare/speedtest";

new SpeedTest().onFinish = (results) => console.log(results.getSummary());
