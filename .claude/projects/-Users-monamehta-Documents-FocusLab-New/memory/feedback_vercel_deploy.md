---
name: Vercel deploy requires correct git author email
description: Vercel Hobby plan blocks deployments when commit author email doesn't match the verified GitHub/Vercel account email
type: feedback
---

Vercel Hobby plan blocks deployments ("Blocked" status) if the commit author email doesn't match the verified account email. The user's git was defaulting to `monamehta@MONAs-MacBook-Air.local` instead of `mona@klarecon.com`.

**Why:** Vercel's commit author verification on Hobby plans requires the committer email to match a verified email on the connected GitHub account. Disconnecting/reconnecting the Git integration re-triggers this check.

**How to apply:** Always ensure git commits use `mona@klarecon.com` as the author email. The global git config is now set correctly. If deploys ever get "Blocked" again, check `git config user.email` first. Also: `npx vercel --prod` CLI deploys get blocked the same way — always deploy via git push.
