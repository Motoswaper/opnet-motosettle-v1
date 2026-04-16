
<div align="center">

# ⚖️ MotoSettle v1  
### **Deterministic Dispute & Settlement Protocol for OP_NET**

MotoSettle is the dispute and settlement primitive of the OP_NET ecosystem.  
It connects escrow, disputes, arbiters, and trust into a single deterministic flow.

<br>

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![OP_NET](https://img.shields.io/badge/Network-OP__NET-blue.svg)
![AssemblyScript](https://img.shields.io/badge/Language-AssemblyScript-purple.svg)

<br>

### 🔗 Quick Links

[📘 MotoSettle Docs](./docs/MOTOSETTLE.md) •  
[🧩 Indexer Schema](./docs/INDEXER_MOTOSETTLE.md)

<br><br>

</div>

---

# 🧬 Overview

**MotoSettle v1** is the official dispute & settlement protocol for OP_NET.

It enables:

- trustless escrow between two parties  
- dispute opening on an escrow  
- assignment of trusted arbiters (via TrustLayer)  
- resolution with clear winner/loser  
- slashing of bad actors  

MotoSettle is designed to integrate with:

- **TrustLayer** (trust & reputation)  
- **OP20** (payments)  
- **OPSHOP** (marketplace)  
- **Wallets & explorers**  

---

# 📂 Repository Structure

/contracts
└── MotoSettle.ts

/docs
├── MOTOSETTLE.md
└── INDEXER_MOTOSETTLE.md

README.md
LICENSE

---

# 🧱 Core Features

## 🔵 Escrow
Open escrow between creator and counterparty with OP20 tokens.

## 🟣 Disputes
Either party can open a dispute on an active escrow.

## 🟢 Arbiters
Arbiters must be trusted via TrustLayer:

- tag: `ARBITER`  
- reputation ≥ 4000  

## 🔥 Resolution & Slashing
Arbiter selects a winner:

- winner receives funds  
- loser can be slashed via TrustLayer  

---

# 🧩 Events

- `EscrowOpened(escrowId, creator, counterparty, token, amount)`  
- `EscrowReleased(escrowId, creator, counterparty, amount)`  
- `EscrowCancelled(escrowId)`  
- `DisputeOpened(disputeId, escrowId, creator, counterparty, reasonHash)`  
- `ArbiterAssigned(disputeId, arbiter)`  
- `DisputeResolved(disputeId, escrowId, winner, loser)`  

---

# 📘 Documentation

- Full protocol spec: [`docs/MOTOSETTLE.md`](./docs/MOTOSETTLE.md)  
- Indexer schema: [`docs/INDEXER_MOTOSETTLE.md`](./docs/INDEXER_MOTOSETTLE.md)

---

# 📜 License

MIT — open and free for the OP_NET ecosystem.

---

<div align="center">

### Disputes are inevitable — chaos is optional  
**MotoSettle makes resolution deterministic.**

</div>
