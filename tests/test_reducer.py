import ast
import hashlib
import itertools
import json
import re
from pathlib import Path
from types import SimpleNamespace
import pytest

TREE = ast.parse(Path("contracts/ConstraintBudgetReducer.py").read_text())
NS = {"json": json, "hashlib": hashlib, "re": re, "LABELS": ("PASS", "FAIL", "UNKNOWN")}
exec(compile(ast.Module(body=[n for n in TREE.body if isinstance(n, ast.FunctionDef)
                            and n.name != "fail"], type_ignores=[]), "actual-helpers", "exec"), NS)
CLAUSES = (
    "The operator must encrypt every backup before storing it and must retain the backups for exactly 30 days.\n"
    "The operator must not export personal data, except when the data subject gives explicit written consent.\n"
    "The operator must delete temporary logs within 24 hours after the related job finishes."
)
COMPACT = "Encrypt all backups before storage; retain 30 days. No personal-data exports absent the subject's explicit written consent. Delete temporary logs within 24h of job completion."
PASS = {"preserved": ["PASS"] * 3, "no_additions": "PASS", "details_exact": "PASS"}


@pytest.fixture
def reducer(direct_vm, direct_deploy, direct_alice):
    direct_vm.sender = direct_alice
    return direct_deploy("contracts/ConstraintBudgetReducer.py")


def mock(vm, text=COMPACT, audit=PASS):
    vm.clear_mocks()
    vm.mock_llm(r"(?s).*CONSTRAINT COMPACTION.*", json.dumps({"text": text}))
    vm.mock_llm(r"(?s).*CONSTRAINT FIDELITY AUDIT.*", json.dumps(audit))


def test_generation_and_consumer_binding(reducer, direct_vm):
    original = reducer.register("input", CLAUSES)
    before = reducer.get_bundle(original)
    mock(direct_vm)
    key = reducer.compact("generated", original, 230)
    record = reducer.get_attempt(key)
    assert record["status"] == "COMPACTED"
    assert record["report"]["text"] == COMPACT
    root = record.pop("root")
    assert root == NS["digest"](record)
    assert reducer.get_compact_text(key, before["root"]) == COMPACT
    assert reducer.get_bundle(original) == before
    with direct_vm.expect_revert("No matching compact artifact"):
        reducer.get_compact_text(key, "0" * 64)


@pytest.mark.parametrize("field,label", [("preserved", "FAIL"), ("preserved", "UNKNOWN"),
    ("no_additions", "FAIL"), ("no_additions", "UNKNOWN"), ("details_exact", "FAIL"), ("details_exact", "UNKNOWN")])
def test_fail_closed_each_dimension(reducer, direct_vm, field, label):
    original = reducer.register("input", CLAUSES)
    audit = json.loads(json.dumps(PASS))
    if field == "preserved":
        audit[field][1] = label
    else:
        audit[field] = label
    mock(direct_vm, audit=audit)
    key = reducer.assess("bad", original, 230, "The operator may export all personal data without consent.")
    assert reducer.get_attempt(key)["status"] == "REJECTED"
    with direct_vm.expect_revert("No matching compact artifact"):
        reducer.get_compact_text(key, reducer.get_bundle(original)["root"])


def test_replay_and_proposer_namespaces(reducer, direct_vm, direct_bob):
    original = reducer.register("input", CLAUSES)
    with direct_vm.expect_revert("Nonce used"):
        reducer.register("input", CLAUSES)
    mock(direct_vm)
    first = reducer.compact("once", original, 230)
    with direct_vm.expect_revert("Attempt nonce used"):
        reducer.compact("once", original, 230)
    direct_vm.sender = direct_bob
    second = reducer.compact("once", original, 230)
    assert first != second


@pytest.mark.parametrize("candidate", ["", " leading", "trailing ", "\x00bad", "💡" * 58])
def test_utf8_candidate_bounds(reducer, direct_vm, candidate):
    original = reducer.register("input", CLAUSES)
    with direct_vm.expect_revert("Invalid candidate"):
        reducer.assess("bad", original, 230, candidate)


@pytest.mark.parametrize("budget", [0, 79, 3200])
def test_budget_requires_reduction(reducer, direct_vm, budget):
    original = reducer.register("input", CLAUSES)
    with direct_vm.expect_revert("Budget must reduce"):
        reducer.compact("bad", original, budget)


@pytest.mark.parametrize("raw", ["one clause only", "same clause text\nsame clause text", "first valid clause\n trailing clause"])
def test_invalid_original(reducer, direct_vm, raw):
    with direct_vm.expect_revert():
        reducer.register("input", raw)


def test_all_audit_combinations():
    for labels in itertools.product(NS["LABELS"], repeat=5):
        report = {"preserved": list(labels[:3]), "no_additions": labels[3], "details_exact": labels[4]}
        assert NS["accepted"](NS["parse_audit"](report, 3)) == all(x == "PASS" for x in labels)


@pytest.mark.parametrize("bad", [None, [], {"preserved": ["PASS"], "no_additions": "PASS", "details_exact": "PASS"},
    {"preserved": [True]*3, "no_additions": "PASS", "details_exact": "PASS"},
    '{"preserved":["PASS","PASS","PASS"],"no_additions":"PASS","no_additions":"FAIL","details_exact":"PASS"}'])
def test_strict_audit_parser(bad):
    with pytest.raises((ValueError, TypeError)):
        NS["parse_audit"](bad, 3)


def test_actual_validator_disagreement_and_substitution():
    cls = next(n for n in TREE.body if isinstance(n, ast.ClassDef))
    method = next(n for n in cls.body if isinstance(n, ast.FunctionDef) and n.name == "_reduce")
    fn = next(n for n in method.body if isinstance(n, ast.FunctionDef) and n.name == "validator")
    class Return:
        def __init__(self, data): self.calldata = data
    binding = {"input_root": "original"}
    nondet = SimpleNamespace(exec_prompt=lambda *args, **kwargs: PASS)
    ns = dict(NS, gl=SimpleNamespace(vm=SimpleNamespace(Return=Return), nondet=nondet), binding=binding,
              budget=230, supplied=None, bundle={"clauses": ["a", "b", "c"]})
    exec(compile(ast.Module(body=[fn], type_ignores=[]), "actual-validator", "exec"), ns)
    report = {"binding": binding, "text": COMPACT, "audit": PASS}
    assert ns["validator"](Return(report))
    nondet.exec_prompt = lambda *args, **kwargs: dict(PASS, no_additions="FAIL")
    assert not ns["validator"](Return(report))
    nondet.exec_prompt = lambda *args, **kwargs: PASS
    assert not ns["validator"](Return(dict(report, binding={"input_root": "other"})))
    ns["supplied"] = "different"
    assert not ns["validator"](Return(report))
    assert not ns["validator"](object())
