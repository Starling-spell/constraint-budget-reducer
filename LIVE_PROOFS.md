# Proof ledger

No deployment or onchain lifecycle is claimed yet. Only finalized receipts with successful execution and matching state will be listed as successful proofs. Mocked unit tests are not onchain evidence.

## Deployment preparation — 2026-10-14

A fresh test-only signer was generated: `0xFffb807bC1c65E80317B062D5Ad145955e6Ba1E4`.

The keystore is encrypted outside this repository. Windows Credential Manager was unavailable; its recovery password is stored separately under Windows CurrentUser DPAPI encryption. No private key or password is included in Git or console output. Recovery is bound to the Windows identity that created the files. Do not fund this wallet.

The StudioNet deployment attempt did not return a transaction hash. Read-only RPC checks failed, including `EACCES` from the alternative runtime. The local attempt was interrupted. No deployed address, successful execution, receipt, or live semantic proof has been verified. Do not blindly repeat an uncertain transaction; check the signer nonce/history when RPC access becomes available.
