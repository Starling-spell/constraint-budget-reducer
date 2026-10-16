# Submission draft — experimental deployment

Contribution type: Builder → Intelligent Contracts

Title: ConstraintBudgetReducer — Consensus-Checked Text Compaction

## Notes / Description

ConstraintBudgetReducer is an experimental semantic compaction primitive for immutable authored constraints. The leader generates shorter text under a UTF-8 byte budget. Validators independently audit the same candidate against every original clause, converse entailment, quantities, actors, negations and exceptions. Exact audit-label agreement and an all-PASS vector gate COMPACTED; FAIL or UNKNOWN yields REJECTED.

Consumers bind the immutable original input root; contract/proposer/nonce bindings prevent replay and substitution. This transforms registered text, not external reality; no oracle, graph or certificate exists. StudioNet deployment and source equality are verified. Dropped and changed obligations were rejected. However, the generated candidate was accepted despite leaving the consent-giver unspecified: the live audit missed an actor-scope omission. This limitation is documented, not claimed as verified preservation. 26 tests and 243 audit combinations pass.

## Evidence URLs

- https://github.com/Starling-spell/constraint-budget-reducer
- https://github.com/Starling-spell/constraint-budget-reducer/blob/main/contracts/ConstraintBudgetReducer.py
- https://github.com/Starling-spell/constraint-budget-reducer/blob/main/README.md
- https://github.com/Starling-spell/constraint-budget-reducer/blob/main/docs/proof-matrix.md
- https://github.com/Starling-spell/constraint-budget-reducer/blob/main/tests/test_reducer.py
- https://github.com/Starling-spell/constraint-budget-reducer/blob/main/LIVE_PROOFS.md
- https://explorer-studio.genlayer.com/address/0x3b19ab3a75000590368C5a4EE2D7bD8771B9847B
- https://explorer-studio.genlayer.com/tx/0x4026476c6a9722cb3855e9474f89720ae1e282669bc7b1c3cfcc363e296e8296
- https://explorer-studio.genlayer.com/tx/0xccc31f068b408895e2597b5160d086f01c074c6abf91b1d383d06483394f82e0
- https://explorer-studio.genlayer.com/tx/0x082b2c7ae7da990ba6e374af832419ccbf1abe1a168e25f491c06d016c77f824
- https://explorer-studio.genlayer.com/tx/0xbf841e211a32dd179824dc84d1302005dc123d2418649bad2ef0526d4a9d08d1
- https://explorer-studio.genlayer.com/tx/0x925ebdce6299aa5a3c1baae48bc5de58b42cd69e9b8967eb620ab40acd4f88d4 (expected replay ERROR, not successful compaction)

Do not describe this experiment as production-safe or as proven preservation of every constraint. The observed consent-scope omission requires further hardening before relying on generated output. See LIVE_PROOFS.md for receipt distinctions and exact artifacts.
