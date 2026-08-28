import crypto from "crypto";
const token = process.env.TELEGRAM_BOT_TOKEN!;
function sign(user: object) {
  const params: Record<string,string> = { auth_date: String(Math.floor(Date.now()/1000)), query_id: "AAA", user: JSON.stringify(user) };
  const dcs = Object.keys(params).sort().map(k=>`${k}=${params[k]}`).join("\n");
  const secret = crypto.createHmac("sha256","WebAppData").update(token).digest();
  const hash = crypto.createHmac("sha256",secret).update(dcs).digest("hex");
  return new URLSearchParams({...params, hash}).toString();
}
const initData = sign({id:6505578903, first_name:"Admin", username:"admin"});
const { topUp, pay, bootstrap } = await import("./lib/store/miniapp.server");
for (const asset of ["BTC","USDT_TRC20","USDC_ERC20"] as const) {
  try { console.log(asset, await topUp(initData, asset, 20)); }
  catch (e) { console.log(asset, "ERROR", (e as Error).message); }
}
try { console.log("checkout", await pay(initData)); } catch(e){ console.log("checkout ERROR", (e as Error).message); }
