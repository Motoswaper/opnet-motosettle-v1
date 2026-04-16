// MotoSettle v1 — Dispute & Settlement Protocol for OP_NET
// AssemblyScript (WASM) — deterministic, minimal, indexer‑friendly

@unmanaged
class Escrow {
  id: u64;
  creator: Address;
  counterparty: Address;
  token: Address;
  amount: u64;
  status: u8; // 0=Open, 1=Released, 2=Disputed, 3=Resolved, 4=Cancelled
  disputeId: u64;
}

@unmanaged
class Dispute {
  id: u64;
  escrowId: u64;
  creator: Address;
  counterparty: Address;
  arbiter: Address;
  status: u8; // 0=Open, 1=Resolved;
  winner: Address;
  loser: Address;
  reasonHash: string;
}

export class MotoSettle {

  private static nextEscrowId: u64 = 1;
  private static nextDisputeId: u64 = 1;

  private static escrows = new Map<u64, Escrow>();
  private static disputes = new Map<u64, Dispute>();

  private static trustLayer: Address;

  // Initialize with TrustLayer address
  static init(trustLayer: Address): void {
    assert(MotoSettle.trustLayer == ZERO_ADDRESS, "ALREADY_INITIALIZED");
    MotoSettle.trustLayer = trustLayer;
  }

  // Open escrow between creator and counterparty
  static openEscrow(counterparty: Address, token: Address, amount: u64): u64 {
    assert(amount > 0, "INVALID_AMOUNT");

    const creator = Context.sender();

    // Pull funds into contract
    OP20.transferFrom(creator, Context.contractAddress(), amount);

    const escrowId = MotoSettle.nextEscrowId++;
    const e = new Escrow();

    e.id = escrowId;
    e.creator = creator;
    e.counterparty = counterparty;
    e.token = token;
    e.amount = amount;
    e.status = 0;
    e.disputeId = 0;

    MotoSettle.escrows.set(escrowId, e);

    Events.emit("EscrowOpened", [
      escrowId.toString(),
      creator.toString(),
      counterparty.toString(),
      token.toString(),
      amount.toString()
    ]);

    return escrowId;
  }

  // Release funds to counterparty (happy path)
  static release(escrowId: u64): void {
    const sender = Context.sender();
    const e = MotoSettle.escrows.get(escrowId);

    assert(e != null, "ESCROW_NOT_FOUND");
    assert(e.status == 0, "INVALID_STATE");
    assert(e.creator == sender, "NOT_CREATOR");

    e.status = 1;

    // Pay counterparty
    OP20.transfer(e.counterparty, e.amount);

    Events.emit("EscrowReleased", [
      escrowId.toString(),
      e.creator.toString(),
      e.counterparty.toString(),
      e.amount.toString()
    ]);
  }

  // Cancel escrow (only if not disputed and creator requests)
  static cancel(escrowId: u64): void {
    const sender = Context.sender();
    const e = MotoSettle.escrows.get(escrowId);

    assert(e != null, "ESCROW_NOT_FOUND");
    assert(e.status == 0, "INVALID_STATE");
    assert(e.creator == sender, "NOT_CREATOR");

    e.status = 4;

    // Refund creator
    OP20.transfer(e.creator, e.amount);

    Events.emit("EscrowCancelled", [
      escrowId.toString()
    ]);
  }

  // Open a dispute on an escrow
  static openDispute(escrowId: u64, reasonHash: string): u64 {
    const sender = Context.sender();
    const e = MotoSettle.escrows.get(escrowId);

    assert(e != null, "ESCROW_NOT_FOUND");
    assert(e.status == 0, "INVALID_STATE");
    assert(sender == e.creator || sender == e.counterparty, "NOT_PARTY");

    e.status = 2;

    const disputeId = MotoSettle.nextDisputeId++;
    const d = new Dispute();

    d.id = disputeId;
    d.escrowId = escrowId;
    d.creator = e.creator;
    d.counterparty = e.counterparty;
    d.arbiter = ZERO_ADDRESS;
    d.status = 0;
    d.winner = ZERO_ADDRESS;
    d.loser = ZERO_ADDRESS;
    d.reasonHash = reasonHash;

    MotoSettle.disputes.set(disputeId, d);
    e.disputeId = disputeId;

    Events.emit("DisputeOpened", [
      disputeId.toString(),
      escrowId.toString(),
      e.creator.toString(),
      e.counterparty.toString(),
      reasonHash
    ]);

    return disputeId;
  }

  // Assign arbiter (must be trusted via TrustLayer)
  static assignArbiter(disputeId: u64, arbiter: Address): void {
    const sender = Context.sender();
    const d = MotoSettle.disputes.get(disputeId);

    assert(d != null, "DISPUTE_NOT_FOUND");
    assert(d.status == 0, "DISPUTE_CLOSED");
    assert(sender == d.creator || sender == d.counterparty, "NOT_PARTY");

    // --- TRUSTLAYER INTEGRATION ---
    assert(
      TrustLayer.hasTag(arbiter, "ARBITER"),
      "ARBITER_NOT_TRUSTED"
    );
    const rep = TrustLayer.reputation(arbiter);
    assert(rep >= 4000, "ARBITER_LOW_REPUTATION");
    // --- END TRUSTLAYER INTEGRATION ---

    d.arbiter = arbiter;

    Events.emit("ArbiterAssigned", [
      disputeId.toString(),
      arbiter.toString()
    ]);
  }

  // Resolve dispute — arbiter decides winner
  static resolveDispute(disputeId: u64, winner: Address): void {
    const arbiter = Context.sender();
    const d = MotoSettle.disputes.get(disputeId);

    assert(d != null, "DISPUTE_NOT_FOUND");
    assert(d.status == 0, "DISPUTE_CLOSED");
    assert(d.arbiter == arbiter, "NOT_ARBITER");

    const e = MotoSettle.escrows.get(d.escrowId);
    assert(e != null, "ESCROW_NOT_FOUND");
    assert(e.status == 2, "ESCROW_NOT_DISPUTED");

    assert(
      winner == e.creator || winner == e.counterparty,
      "INVALID_WINNER"
    );

    const loser = winner == e.creator ? e.counterparty : e.creator;

    d.status = 1;
    d.winner = winner;
    d.loser = loser;

    e.status = 3;

    // Pay winner
    OP20.transfer(winner, e.amount);

    // Optional: slash loser via TrustLayer
    TrustLayer.slash(loser, 100); // symbolic penalty

    Events.emit("DisputeResolved", [
      disputeId.toString(),
      e.id.toString(),
      winner.toString(),
      loser.toString()
    ]);
  }
}
