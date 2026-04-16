# MotoSettle v1 — Dispute & Settlement Protocol for OP_NET

MotoSettle v1 is the dispute and settlement primitive for the OP_NET ecosystem.

It enables:

- trustless escrow between two parties  
- dispute opening on an escrow  
- assignment of a trusted arbiter  
- resolution with a clear winner/loser  
- slashing of bad actors via TrustLayer  

MotoSettle connects payments (OP20), trust (TrustLayer), and resolution (arbiters) into a single deterministic flow.

---

## 🧱 Core Concepts

### Escrow
Each escrow has:

- `creator` — party funding the escrow  
- `counterparty` — party receiving funds on success  
- `token` — OP20 token used  
- `amount` — escrowed amount  
- `status` — 0=Open, 1=Released, 2=Disputed, 3=Resolved, 4=Cancelled  
- `disputeId` — linked dispute (if any)  

### Dispute
Each dispute has:

- `escrowId` — linked escrow  
- `creator` — original escrow creator  
- `counterparty` — other party  
- `arbiter` — trusted resolver  
- `status` — 0=Open, 1=Resolved  
- `winner` / `loser` — final outcome  
- `reasonHash` — off‑chain description hash  

---

## 🧩 Contract Methods

### `init(trustLayer: Address)`
Initializes MotoSettle with the TrustLayer contract address.

### `openEscrow(counterparty: Address, token: Address, amount: u64): u64`
Opens an escrow:

- pulls `amount` of `token` from `creator`  
- stores escrow  
- emits `EscrowOpened`  

### `release(escrowId: u64)`
Happy path:

- only `creator` can call  
- pays `counterparty`  
- emits `EscrowReleased`  

### `cancel(escrowId: u64)`
Cancel path:

- only `creator`  
- only if not disputed  
- refunds `creator`  
- emits `EscrowCancelled`  

### `openDispute(escrowId: u64, reasonHash: string): u64`
Opens a dispute:

- only `creator` or `counterparty`  
- sets escrow status to `Disputed`  
- creates dispute  
- emits `DisputeOpened`  

### `assignArbiter(disputeId: u64, arbiter: Address)`
Assigns an arbiter:

- only `creator` or `counterparty`  
- requires arbiter to be trusted in TrustLayer:  
  - tag `ARBITER`  
  - reputation ≥ 4000  
- emits `ArbiterAssigned`  

### `resolveDispute(disputeId: u64, winner: Address)`
Resolves a dispute:

- only assigned arbiter  
- winner must be `creator` or `counterparty`  
- pays winner  
- slashes loser via TrustLayer  
- emits `DisputeResolved`  

---

## 🔗 TrustLayer Integration

MotoSettle uses TrustLayer to:

- ensure arbiters are trusted (`ARBITER` tag)  
- enforce minimum reputation for arbiters  
- slash losers in disputes  

This makes dispute resolution:

- transparent  
- deterministic  
- ecosystem‑aware  
- reputation‑driven  

MotoSettle is the settlement backbone for OP_NET.
