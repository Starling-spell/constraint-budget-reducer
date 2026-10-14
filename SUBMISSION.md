# Submission draft — deployment pending

Contribution type: Builder → Intelligent Contracts

Title: ConstraintBudgetReducer — Consensus-Checked Text Compaction

## Notes / Description

ConstraintBudgetReducer is a reusable semantic compaction primitive for immutable authored constraints. The leader generates shorter text under a UTF-8 byte budget. Validators independently compare the exact candidate with every original clause, checking preservation, absence of invented obligations, and unchanged quantities, actors, negations and exceptions. Publication requires exact agreement on every audit label and an all-PASS vector; FAIL or UNKNOWN produces REJECTED. Validator disagreement does not publish an artifact.

Consumers bind the exact original input root. Original clauses remain immutable; contract/proposer/nonce bindings prevent replay and substitution. This transforms registered text, not external reality: it is not an oracle, graph transition, authorization or one-time certificate. The repository includes 26 direct/helper/callback tests and 243 audit combinations. Deployment and live consensus proofs remain unverified.

## Evidence URLs

- https://github.com/Starling-spell/constraint-budget-reducer
- https://github.com/Starling-spell/constraint-budget-reducer/blob/main/contracts/ConstraintBudgetReducer.py
- https://github.com/Starling-spell/constraint-budget-reducer/blob/main/README.md
- https://github.com/Starling-spell/constraint-budget-reducer/blob/main/docs/proof-matrix.md
- https://github.com/Starling-spell/constraint-budget-reducer/blob/main/tests/test_reducer.py

Do not attach the test-wallet address as a deployed contract. No Explorer contract or successful transaction evidence is available yet. Replace the pending statement only after finalized SUCCESS receipts, source equality and state readback are verified.
