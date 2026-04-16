# MotoSettle v1 — Indexer Schema

This schema defines how indexers, explorers, and dashboards should track MotoSettle escrows and disputes.

---

## 🗄️ Tables

### escrows

| field          | type   | description                         |
|----------------|--------|-------------------------------------|
| id             | number | escrow id                           |
| creator        | string | creator address                     |
| counterparty   | string | counterparty address                |
| token          | string | OP20 token address                  |
| amount         | number | escrowed amount                     |
| status         | number | 0=Open,1=Released,2=Disputed,3=Resolved,4=Cancelled |
| disputeId      | number | linked dispute id (if any)          |
| blockNumber    | number | block number                        |
| txHash         | string | transaction hash                    |
| timestamp      | number | unix timestamp                      |

---

### disputes

| field          | type   | description                         |
|----------------|--------|-------------------------------------|
| id             | number | dispute id                          |
| escrowId       | number | linked escrow id                    |
| creator        | string | creator address                     |
| counterparty   | string | counterparty address                |
| arbiter        | string | arbiter address                     |
| status         | number | 0=Open,1=Resolved                   |
| winner         | string | winner address                      |
| loser          | string | loser address                       |
| reasonHash     | string | off‑chain reason hash               |
| blockNumber    | number | block number                        |
| txHash         | string | transaction hash                    |
| timestamp      | number | unix timestamp                      |

---

### events

Indexers should track:

- `EscrowOpened`  
- `EscrowReleased`  
- `EscrowCancelled`  
- `DisputeOpened`  
- `ArbiterAssigned`  
- `DisputeResolved`  

---

## 🔗 Usage

Indexers and dashboards can:

- show open escrows  
- show disputed escrows  
- show arbiter activity  
- correlate disputes with TrustLayer reputation and slashing  

MotoSettle + TrustLayer together provide a full dispute & trust layer for OP_NET.
