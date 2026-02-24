---
title: "The Accident That Fixed My Homelab"
date: 2026-02-24
tags: ["homelab", "infrastructure", "devops"]
excerpt: "A routine update bricked my server. Five days of manual recovery taught me what no DevOps handbook could."
---

If a change can't be reproduced from scratch — it was an accident, not a decision.

I didn't read that in a DevOps handbook. I learned it the hard way.

A routine update bricked the baremetal Ubuntu Server running on my Mi Notebook Pro. I had backups. I didn't have *tested restores*. And I didn't have Infrastructure as Code.

Five days of nightmare followed.

Rebuilding everything by hand. Manually merging configs line by line. Copy-pasting folders one at a time. Trying to remember which undocumented tweak I made six months ago to keep a specific service running.

By day four, I seriously considered shutting the whole homelab down and walking away.

But that failure forced a complete perspective shift on how I operate systems. Now, my rules are absolute:

1. **Backups only exist if restores are tested and proven.** Proxmox Backup Server pulling to a Hetzner Storage Box + external cold storage. Verified by restore, not by a green job status.
2. **Infrastructure only exists if it's defined as code.** If I can't rebuild it from scratch with two commands, it's a liability.

You can learn these principles by reading articles, or you can learn them by spending five days manually merging config files.

I highly recommend the first method.
