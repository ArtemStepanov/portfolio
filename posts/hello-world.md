---
title: "Hello World: First Post"
date: 2026-02-24
tags: ["meta"]
excerpt: "The first post on my engineering blog. Testing the new posts system."
---

## Why a blog?

I wanted a place to share notes on my homelab, engineering tips, and things I learn along the way.

## What to expect

- **Homelab write-ups** — Proxmox, networking, self-hosting
- **Engineering tips** — .NET, Go, Kubernetes
- **Tools and workflows** — things that make life easier

## A code sample

Here's a simple Go HTTP server:

```go
package main

import (
    "fmt"
    "net/http"
)

func main() {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "Hello from the homelab!")
    })
    http.ListenAndServe(":8080", nil)
}
```

That's it for now. More posts coming soon.
