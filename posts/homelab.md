---
title: "Homelab"
date: 2026-02-24
tags: ["homelab", "infrastructure", "devops"]
excerpt: "Three nodes, ~30 services, everything as code. How a personal Proxmox cluster became my best environment for practicing production-grade discipline."
---

My homelab runs 24/7 in a corner of my apartment. Nobody pays me for it.

## The Stack

It's three physical nodes — an Mi Notebook Pro 15.7, Lenovo ThinkStation P510, HP ProDesk — running a Proxmox cluster with ~30 services: Immich, Home Assistant, Forgejo, Paperless, and a handful of others.

It's a hobby. And also where I break things without consequences.

## Everything as Code

Everything is managed as code. Ansible handles configuration. OpenTofu handles provisioning. Caddy handles routing. Tailscale handles remote access. Backups go local → Hetzner Storage Box.

## Learning by Breaking

When I want to understand distributed storage, I implement it. When I want to understand backup reliability, I test restore, not backup. When I built Caddy Admin UI — a Go/Preact web interface for managing Caddy routes — it came from actually running Caddy in prod at home and being annoyed at editing configs by hand.

The discipline I practice there:

- **Code over clicks.** Every config change goes through code. No manual edits that "I'll remember"
- **Tunnels over ports.** Access via private tunnel, not exposed ports
- **Restore over backup.** Backups verified by restore, not by a green job status
- **Reproducible by default.** Every service from scratch in under an hour

The hobby part is real — I genuinely enjoy building this. But the side effect is that I get to practice production-grade discipline in an environment where mistakes are cheap and fast.

---

Break something at home at 11pm: annoying.

Break something at work at 11pm: expensive.

I prefer the first kind of education.
