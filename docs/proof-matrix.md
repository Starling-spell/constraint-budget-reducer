# Proof matrix

| Scenario | Required result | Evidence level |
|---|---|---|
| LLM-generated compact text, all fidelity checks PASS | COMPACTED; exact original-root consumer read succeeds | Mocked direct test; live result pending |
| Dropped clause or uncertain preservation | REJECTED; consumer read fails | Mocked direct tests; live result pending |
| Invented obligation or altered exception/quantity | REJECTED | Mocked direct tests; live result pending |
| Validator disagrees on any decision label | Validator callback false; no agreement claimed | Actual callback unit test, not distributed consensus |
| Duplicate proposer nonce | Revert before LLM; original attempt unchanged | Mocked direct test; live result pending |
| UTF-8 bytes exceed budget, malformed audit or wrong binding | Reject | Direct/helper/callback tests |

26 local tests pass; all 243 combinations of three clause labels and two global labels are checked. The actual AST-extracted validator callback is tested with independent disagreement and binding substitution. Direct execution runs only the leader. No onchain success is claimed in this matrix until matching successful finalized receipts and state reads are recorded in LIVE_PROOFS.md.
