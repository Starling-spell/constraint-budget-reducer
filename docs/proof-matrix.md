# Proof matrix

| Scenario | Required result | Evidence level |
|---|---|---|
| LLM-generated compact text, all fidelity checks PASS | COMPACTED; exact original-root consumer read succeeds | Live: 220 bytes; consumer succeeds, but consent-giver omission was missed by the audit |
| Dropped clause or uncertain preservation | REJECTED; consumer read fails | Live dropped-clause attempt REJECTED; UNKNOWN remains mocked only |
| Invented obligation or altered exception/quantity | REJECTED | Live changed-obligation attempt REJECTED; exhaustive semantic correctness not established |
| Validator disagrees on any decision label | Validator callback false; no agreement claimed | Actual callback unit test, not distributed consensus |
| Duplicate proposer nonce | Revert before LLM; original attempt unchanged | Live FINALIZED expected ERROR `Attempt nonce used`; subsequent root readback unchanged |
| Consumer uses wrong input root | Revert | Live read revert independently verified |
| UTF-8 bytes exceed budget, malformed audit or wrong binding | Reject | Direct/helper/callback tests |

26 local tests pass; all 243 combinations of three clause labels and two global labels are checked. The actual AST-extracted validator callback is tested with independent disagreement and binding substitution. Direct execution runs only the leader. See LIVE_PROOFS.md and PROOFS.json for five finalized SUCCESS executions, one expected execution ERROR and independent state readback. Network disagreement was not induced. The generated live artifact's consent-scope omission is a known limitation, not a passed semantic-preservation claim.
