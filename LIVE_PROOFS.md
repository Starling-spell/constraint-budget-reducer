# Proof ledger

## Verified deployment — 2026-10-16

StudioNet (chain 61999), gasless. Dedicated encrypted signer: `0x7a413BB4AB62E31d62d4cD9efC8C8a8Dae37FB42`.

[Deployed contract](https://explorer-studio.genlayer.com/address/0x3b19ab3a75000590368C5a4EE2D7bD8771B9847B).

Deployed source matches `contracts/ConstraintBudgetReducer.py` and the public repository. Normalized source SHA-256: `8b97b0652a572e0a204ca2c14df03bb520dfad70e51c737c738e65ad1c12bed9`. Contract source was not modified during deployment.

| Step | Transaction | Verified result |
|---|---|---|
| Deploy | [4026476c](https://explorer-studio.genlayer.com/tx/0x4026476c6a9722cb3855e9474f89720ae1e282669bc7b1c3cfcc363e296e8296) | FINALIZED / SUCCESS / MAJORITY_AGREE |
| Register immutable clauses | [c0ec5405](https://explorer-studio.genlayer.com/tx/0xc0ec540560c6b7a5e12e4c0926b2f8ba063c9806cb1bd53b93d08be70eecd52f) | FINALIZED / SUCCESS / MAJORITY_AGREE |
| Generate and audit compact text | [ccc31f06](https://explorer-studio.genlayer.com/tx/0xccc31f068b408895e2597b5160d086f01c074c6abf91b1d383d06483394f82e0) | FINALIZED / SUCCESS / MAJORITY_AGREE; COMPACTED, with the semantic limitation below |
| Audit dropped clauses | [082b2c7a](https://explorer-studio.genlayer.com/tx/0x082b2c7ae7da990ba6e374af832419ccbf1abe1a168e25f491c06d016c77f824) | FINALIZED / SUCCESS / MAJORITY_AGREE; REJECTED |
| Audit changed obligations | [bf841e21](https://explorer-studio.genlayer.com/tx/0xbf841e211a32dd179824dc84d1302005dc123d2418649bad2ef0526d4a9d08d1) | FINALIZED / SUCCESS / MAJORITY_AGREE; REJECTED |
| Replay generated attempt nonce | [925ebdce](https://explorer-studio.genlayer.com/tx/0x925ebdce6299aa5a3c1baae48bc5de58b42cd69e9b8967eb620ab40acd4f88d4) | FINALIZED / expected ERROR / MAJORITY_AGREE; `Attempt nonce used` |

Five successful executions and one expected execution error are recorded. The replay transaction is a negative security proof, not a successful compaction.

### Independent state readback

Bundle ID: `bc2bf0bec146ae9c8ee5eb7fd7c9a2ed7eceff1b59bf80abf23098578acb7906`.

Input root: `dd7630da4fc25354f86ce7879ded3f960dafe43fa49e4521b2b2410a393d5bfd`.

| Attempt | Bytes (budget 230) | Stored audit | State |
|---|---:|---|---|
| Generated | 220 | preserved PASS/PASS/PASS; globals PASS/PASS | COMPACTED, with observed consent-scope omission |
| Dropped | 85 | preserved PASS/FAIL/FAIL; globals FAIL/FAIL | REJECTED |
| Invented | 130 | preserved FAIL/FAIL/FAIL; globals FAIL/FAIL | REJECTED |

After the replay error, all three artifact roots and the input root were independently recomputed from state. Exact-root consumer access returned the generated text. Consumer access to both rejected attempts and to a wrong input root reverted. These checks establish state/gate behavior, not formal semantic fidelity.

### Observed semantic limitation — do not omit from submission

The generated candidate received PASS for all three clauses, `no_additions` and `details_exact`. Its exact text was:

> Operator must encrypt every backup before storage, retaining them for 30 days. Personal data export is prohibited except with explicit written consent. Temporary logs must be deleted within 24 hours after job completion.

The original requires the **data subject** to give explicit written consent. The generated exception leaves the consent-giver unspecified. Therefore this live run is evidence of model-approved publication and an observed semantic audit limitation, **not proof that every actor and exception scope was preserved**. Exact agreement does not prevent shared model errors. No external reality, real service delivery, formal equivalence, or production safety is established.

### Reproduction and local checks

`PROOFS.json` records sanitized transaction metadata and state. `node scripts/complete-proofs.mjs` resumes only recorded known transaction hashes. Never clear an unknown-broadcast entry without checking signer history. Failed execution is not a successful application proof.

GenVM lint and SDK semantic validation pass. All 26 direct/helper/callback tests pass, including 243 label combinations; four SDK calldata roundtrips pass. Direct tests mock AI responses. The separate callback tests are not distributed-network proofs.

## Deployment preparation — 2026-10-14

A fresh test-only signer was generated: `0xFffb807bC1c65E80317B062D5Ad145955e6Ba1E4`.

The keystore is encrypted outside this repository. Windows Credential Manager was unavailable; its recovery password is stored separately under Windows CurrentUser DPAPI encryption. No private key or password is included in Git or console output. Recovery is bound to the Windows identity that created the files. Do not fund this wallet.

The October 14 attempt did not return a transaction hash; read-only RPC checks failed and the local attempt was interrupted. On October 16, both latest and pending nonces for this old signer were independently checked as zero. Its DPAPI recovery was unavailable under the current Windows identity. The verified deployment above used the existing unlocked dedicated proof signer instead. No private key or password was exported.
