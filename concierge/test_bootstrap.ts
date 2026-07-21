import 'dotenv/config';
import { loadBaserowConfig } from "./server/baserow/config.js";
import { listRegsForResident, listUpcomingEvents, findUserRegForEvent, activeUserReg } from "./server/baserow/service.js";

async function main() {
  const cfg = loadBaserowConfig();
  if (!cfg) { console.log("No config"); process.exit(1); }

  const userId = 459336400;

  const myRegs = await listRegsForResident(cfg, userId);
  console.log("myRegs count:", myRegs.length);
  for (const r of myRegs) {
    console.log("  id:", r.id, "EventID:", r.EventID, "ResidentID:", r.ResidentID, "Status:", r.Status);
  }

  const events = await listUpcomingEvents(cfg);
  console.log("\nUpcoming events:", events.length);
  for (const ev of events) {
    console.log("event id:", ev.id, "title:", ev.Title || ev.Name);
    const my = findUserRegForEvent(myRegs, userId, Number(ev.id));
    const active = activeUserReg(my);
    console.log("  found:", my ? "YES status=" + my.Status : "NO", "| active:", active ? active.Status : "N/A");
  }
}

main().catch(e => console.error(e));
