# Architecture boundary

The input is immutable text authored onchain, not a statement of external events. The application owns display and non-authoritative previews. The contract owns byte-budget enforcement, original/candidate binding, and publication after semantic fidelity consensus. There is no source adapter, graph update, escrow or one-time certificate.

```
Authenticated clauses -> immutable bundle
                            |
                       LLM compaction
                            |
                  independent fidelity audit
                            |
                exact normalized label agreement
                     /                 \
          all labels PASS          FAIL or UNKNOWN
              COMPACTED                REJECTED
                  |
         input-root-bound text read
```

The candidate text, not merely a status, is the consequential AI output stored for reuse. Validators need not generate identical paraphrases: they independently audit the proposed text against the same original. Every original clause must be entailed; the original conjunction must entail every new obligation; quantities, actors and exceptions must preserve scope. Disagreement causes network rejection/rotation and no stored attempt; it is not represented as an application success or fabricated conflict record.

Original contradictions are retained, not resolved. An artifact is neither authorization nor a safety assessment. Reuse requires a matching immutable input root.
