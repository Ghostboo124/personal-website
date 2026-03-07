import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "cleanup expired sessions",
  { hourUTC: 3, minuteUTC: 0 },
  internal.session.cleanupExpiredSessions,
);

crons.daily(
  "cleanup expired oauth states",
  { hourUTC: 3, minuteUTC: 15 },
  internal.oauth.cleanupExpiredStates,
);

crons.daily(
  "cleanup expired indieauth codes",
  { hourUTC: 3, minuteUTC: 30 },
  internal.indieauth.cleanupExpiredAuthorizationCodes,
);

export default crons;
