---
title: "Good Tooling Comes from Real Pain"
date: 2026-02-24
tags: ["tooling", "homelab"]
excerpt: "The best tools aren't pet projects. They're what you build after the third time you fat-finger a config."
---

**Good tooling comes from real pain.**

When you operate infrastructure daily, you hit a wall: the small tools that make repetitive work predictable don't exist yet.

That's how Caddy Admin UI happened.

Caddy is an excellent reverse proxy. Its Admin API is powerful — but there's no native UI. You edit configs by hand or script API calls.

After the third time I fat-fingered a route config, I built one: a lightweight Go + Preact interface for managing routes, redirects, headers, auth, and compression — synced to the Admin API in real time.

Not a "pet project for the sake of it."
A side-effect of actually using the thing.

Nobody sets out to build a tool. You just run out of patience.
