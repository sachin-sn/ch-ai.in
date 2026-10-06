# System Design Interview Guide: Index

This series explains common system design questions. Each file covers one architecture. Each file contains diagrams, components, data flow, trade-offs, and interview follow-up questions.

## Writing standard

The text uses ASD-STE100 Simplified Technical English rules:

- Each sentence contains one idea.
- Descriptive sentences have a maximum of 25 words.
- Procedural sentences have a maximum of 20 words and use the imperative form.
- The text uses the active voice.
- One term has one meaning. The text does not use synonyms for the same item.

## Architecture files

| No. | File | Topic |
|-----|------|-------|
| 1 | `01-chat-service-whatsapp.md` | Real-time chat service with low delivery latency |
| 2 | `02-video-streaming-youtube.md` | Video upload, processing, and streaming platform |
| 3 | `03-low-latency-distributed-systems.md` | Design methods for low-latency distributed systems |
| 4 | `04-ordered-message-queues.md` | Message order and correct processing in queues |
| 5 | `05-url-shortener.md` | URL shortener service |
| 6 | `06-rate-limiter.md` | Distributed rate limiter |
| 7 | `07-notification-system.md` | Multi-channel notification system |
| 8 | `08-news-feed.md` | Social media news feed |
| 9 | `09-offline-messaging.md` | Message delivery during network failure (offline-first, store and forward) |
| 10 | `10-circuit-breaker.md` | Circuit breaker pattern and related resilience patterns |
| 11 | `11-self-healing-infrastructure.md` | Self-healing (auto-healing) infrastructure |
| 12 | `12-scaling-5-million-users.md` | Scalable and cost-effective architecture for 5 million users |
| 13 | `13-handling-5-million-requests.md` | Elastic system that scales up and down to 5 million requests without breaking |
| 14 | `14-end-to-end-encryption.md` | End-to-end encryption (Signal Protocol, as used by WhatsApp) |
| 15 | `15-realtime-react-dashboard.md` | Large real-time dashboard in React that stays stable under constant updates |
| 16 | `16-data-transfer-fast-to-slow-server.md` | Transfer a large file from a fast server to a slow server |

## Other frequently asked questions

Use the same method to prepare for these questions:

1. **Ride-hailing service (Uber, Ola).** Location updates, geo-index (geohash, quadtree), driver matching.
2. **Distributed cache (Redis, Memcached).** Consistent hashing, eviction, replication.
3. **Search autocomplete.** Trie, top-K queries, prefix cache.
4. **Payment system.** Idempotency keys, ledger, reconciliation, exactly-once effect.
5. **Collaborative editor (Google Docs).** Operational transformation (OT) or CRDT.
6. **Unique ID generator.** Snowflake IDs, clock skew.
7. **Web crawler.** URL frontier, politeness, duplicate detection.
8. **Ticket booking (BookMyShow).** Seat lock, concurrency control, payment timeout.
9. **File storage and sync (Dropbox, Google Drive).** Chunking, deduplication, sync conflicts.
10. **Leaderboard.** Redis sorted sets, sharded counters.

## A standard method for each interview answer

Use these steps in each interview:

1. Ask questions to find the functional requirements.
2. Write the non-functional requirements (latency, availability, scale).
3. Calculate the approximate load (users, requests per second, storage).
4. Draw the high-level architecture.
5. Define the APIs and the data model.
6. Explain the main data flow.
7. Find the bottlenecks. Explain how to scale each one.
8. Explain the trade-offs that you made.

> **Note:** The diagrams use Mermaid syntax. Many Markdown renderers show Mermaid as images. If your renderer does not support Mermaid, export each diagram to SVG at https://mermaid.live.
