async function test_fetch() {
  const { default: fetch } = await import("node-fetch");
  const resp = await fetch("https://snapcraft.io/");
  console.log(
    `Response: ${resp.url} returned HTTP ${resp.status} ${resp.statusText}`
  );
}

async function test_temporal() {
  const dayjs = require("dayjs");
  const utc = require("dayjs/plugin/utc");
  dayjs.extend(utc);

  const now = new Date();
  const d_now = dayjs(now);
  console.log(d_now.utc().format());
}

Promise.all([test_fetch(), test_temporal()]).then(() => {});
