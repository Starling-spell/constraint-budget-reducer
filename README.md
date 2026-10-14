# ConstraintBudgetReducer

Experimental consensus-checked semantic compaction of immutable authored constraints.

## Boundary

This is a text transformation primitive, not an oracle, evidence certificate, authorization engine, or claim of real-world compliance. Registered clauses are the actual input data. No URLs or provider summaries are fetched or treated as factual evidence. No graph, mutable head, one-time certificate, or settlement exists.

Applications can reuse a shorter constraint representation for limited-context agents while retaining an exact link to the original input. No token-count claim: budgets measure UTF-8 bytes.

## Consequential GenLayer operation

`register -> compact -> AI candidate -> independent fidelity audits -> COMPACTED / REJECTED`

The leader generates compact text. Each validator independently compares that same candidate with every original clause, checks converse entailment (no new obligations), and checks numerical, exception, negation and actor scope. Every decision-bearing audit label must match exactly. Only all-PASS results expose the compact artifact. UNKNOWN and FAIL prevent publication through the consumer method. A disputed network result does not create an application record; no fake CONFLICTED state is claimed.

`assess` checks a caller-proposed candidate using the same substantive audit; it is useful for adversarial examples. Candidate text is never proof of its own validity.

## Security and limitations

Immutable authenticated input, contract/proposer/nonce domain separation, strict JSON schemas, UTF-8 budgets, input-root-bound consumer reads, and replay rejection. Original constraints are never deleted. Contradictions in the original must remain contradictions; this contract does not make a policy safe or consistent. Semantic consensus is probabilistic and may share model errors. Do not use the output to move funds or authorize high-risk actions without additional review. No external code execution or asset custody.

## Local validation

```
python -m pip install -r requirements.txt
genvm-lint check contracts/ConstraintBudgetReducer.py
python -m pytest tests -q
```

Direct tests use mocked generation and audits. They do not prove distributed consensus. Validator callback tests execute the actual callback separately.

## Deployment

```
genlayer network set studionet
genlayer account use YOUR_ENCRYPTED_TEST_ACCOUNT
genlayer deploy --contract contracts/ConstraintBudgetReducer.py
```

Use StudioNet only. Check FINALIZED **and execution SUCCESS**, then compare Explorer source with this file. See LIVE_PROOFS.md for actual deployment status.

The optional sanitized Node scripts require `npm ci`, an installed GenLayer CLI entrypoint supplied through `REDUCER_CLI_PATH`, and an already-unlocked encrypted dedicated test account selected through `REDUCER_TEST_ACCOUNT`. They never export signing keys, expose raw validator configuration, or blindly repeat an uncertain broadcast.

See [architecture](docs/architecture.md), [proof matrix](docs/proof-matrix.md) and [security model](SECURITY.md). Semantic preservation is not a formal proof and novelty/reviewer acceptance is not guaranteed.
