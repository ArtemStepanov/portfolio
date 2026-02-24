---
title: "Restore Over Backup"
date: 2026-02-24
tags: ["homelab", "infrastructure"]
excerpt: "You don't have backups. You have hope. A green job status means nothing until you've tested a full restore."
---

You don't have backups. You have hope.

Most engineers run backup jobs. Few test restores.

## The Setup

Proxmox Backup Server at home, synced to a second PBS on Hetzner via pull rule.

Pull, not push. The remote side pulls only what it's allowed to — cleaner trust model than pushing credentials outward.

## The Part That Actually Matters

Architecture is secondary. What matters:

- **"Backup job is green"** does not mean you can recover.
- **"OK"** means you spun up a VM from that backup and it worked.

If you can't remember the last time you did a full restore, you don't have a backup strategy. You have a cron job and a prayer.

Schedule a restore drill. This week. Not "someday."
