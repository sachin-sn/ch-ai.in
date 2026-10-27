---
title: "I built a desk buddy that watches my calendar, my Mac, and my meetings (Part 1)"
date: "2026-10-27"
excerpt: "A small round robot with expressive eyes on an ESP32-S3: surprised before meetings, grumpy when my Mac's CPU is pinned, asleep at night. Built for about Rs. 5,000 and a weekend."
tags: ["esp32", "hardware", "3d-printing", "iot", "side-project"]
draft: false
---

I wanted a desk companion that is more than a clock. The result is a small round robot with expressive eyes. It gets
surprised when a meeting is about to start, grumpy when my Mac's CPU is pinned, and falls asleep at night. It is also
a rotary knob and touchscreen that fires shortcuts on my Mac.

This is Part 1: what I built over a weekend and the decisions I am happy with. Part 2 will cover what I finally
achieved once everything was finished.

Code: [github.com/sachin-sn/desk-buddy](https://github.com/sachin-sn/desk-buddy/)

## What it is

The face is an Elecrow CrowPanel 1.28" rotary display (ESP32-S3). I 3D-printed the head and body around it with a
CadQuery script, so every dimension is a parameter I can re-run.

## What it does

- **Mood engine.** The eyes blink, wander and change mood by priority:
  1. A meeting within 10 minutes: surprised
  2. Sleep hours: asleep
  3. Mac CPU at 85% or more: grumpy
  4. Just touched: happy
  5. Late-evening idle: tired
- **Calendar alerts.** A Google Apps Script runs as me and serves the next 36 hours of events as JSON. The device
  polls it every 5 minutes. This avoids Google's OAuth limits for embedded devices and keeps credentials off the
  device entirely.
- **Shortcuts.** Bluetooth keyboard buttons for media keys, typing and Spotlight macros. A small Node helper on the
  Mac handles what a keyboard can't, like opening a specific app or running a Shortcuts automation.
- **Web editor.** I edit layouts, timers and settings from a browser, served from the device itself.

<div class="video-block" style="display:flex;justify-content:center;margin:1.5rem 0">
  <video src="/videos/desk-buddy-demo.mp4" style="width:auto;max-height:360px" controls muted loop playsinline preload="metadata"></video>
</div>

## Design decisions I'm happy with

**1. Two cores, strict roles.** Core 1 only draws. Core 0 handles everything that can block: WiFi, flash and
Bluetooth. They talk through queues, so the eyes never stutter.

**2. Pure logic in dependency-free headers.** The eye engine, key-combo parser and agenda logic compile with plain
`g++`, so I could test them on my laptop with no hardware. I even render a contact sheet of every mood on the host.

**3. Action IDs, not commands.** The buddy only sends IDs like `open-notes`. The Mac helper maps them to real
commands from its own config. A bug or a stolen token can't become remote code execution on my laptop.

**4. Layouts in NVS, not the filesystem.** Re-flashing the web UI can never wipe my shortcuts.

## Making the body

The head holds the module from the front with three crush ribs, tilts back 20°, and sits on a diamond-shaped neck
peg so it can't swivel. The torso is shifted behind the neck so the bot doesn't tip backwards, and the body prints
flat with no supports.

The LED ring was the fun puzzle. The module's LEDs sit at 12, 2, 4, 6, 8 and 10 o'clock, so in the first print I cut
windows through the wall for five of them. The 6 o'clock LED sits right where the chin and neck socket are, so it
got a shallow groove instead of a hole.

For the second iteration I printed with two different colours of PLA and used clear filament to diffuse the LED
light.

## What I'd do next

- **Security.** Plain HTTP on the LAN is my main known weak spot. Both this and the next item are on my backlog.
- **Network blocking.** Calendar fetches can briefly block the network core.
- **Rubber feet,** so it stops sliding when I tap it.
- **Cut the cable.** Right now it works while connected to my Mac over USB. I want it to run without cables, over
  Bluetooth and WiFi only. For that I am adding a charging module with a USB-C connector and a Li-ion battery.

## What it cost

| Item                 | Cost      | Status                 |
| -------------------- | --------- | ---------------------- |
| ESP32 display        | Rs. 4,000 | Bought                 |
| 3D test prints       | Rs. 500   | Done                   |
| 18650 Li-ion battery | Rs. 250   | Bought, not yet fitted |
| Charging module      | Rs. 200   | Bought, not yet fitted |

Overall: about **Rs. 5,000** and a weekend of effort.

## Wait for Part 2

Once the battery and charging module are in and the cables are gone, I will post the follow-up with what I finally
achieved.
