---
title: "Mutation testing: do your tests actually test anything?"
description: "Code coverage says nothing about how good your tests are. Mutation testing does — and it can save you from a real production incident."
pubDate: 2026-08-20
tags: ["testing", "php", "mutation-testing"]
---

## The everyday scenario

You push your PR. The pipeline complains:

```
✗ Coverage decreased: 78% → 74%
Minimum required: 80%
```

You write a test, fast. Green again:

```
✓ Tests passed
✓ Coverage: 81%
✓ Pipeline passed
```

Merged. Everyone's happy.

Except nothing in that process checked whether the test actually catches a bug. It just executed some lines of code. Coverage measures the **quantity** of code your tests run, not the **quality** of what they verify.

And since we started asking an AI assistant to "generate a test" to bump the number back up, the problem has gotten worse: according to a 2025 study (Huang et al.), LLM-generated tests score an average mutation score of just 20%. They pass, they count toward coverage, and they catch almost nothing.

## The story that hurts

A real incident, at a former client: the amounts shown on invoices no longer matched the actual charges. Finance flagged discrepancies of a few cents per line — multiplied by 50,000 invoices a month, that's an €8,000 delta.

The cause: a "small refactor" had dropped a rounding call.

```php
// Before
return round($price * $quantity * (1 + $taxRate), 2);

// After
return $price * $quantity * (1 + $taxRate);
```

The associated test existed, and it still passed:

```php
public function testTotalWithTax(): void
{
    // 10.00 * 5 * 1.20 = 60.0 — with or without round()
    $this->assertSame(60.0, $this->calc->total(10.00, 5, 0.20));
}
```

The problem: round numbers. With `10.00 * 5 * 1.20`, rounding changes literally nothing about the result, so the test can't see it disappear. With real-world values — `19.99 × 3 × 1.055 = 63.268…` — the missing cent would have jumped out immediately. A test that looks solid, an exact assertion, but test data too clean to reveal anything.

## The idea behind mutation testing

What if you deliberately sabotaged the code, one tiny change at a time, and watched whether the tests noticed?

That's exactly what a mutation testing tool does (I use [Infection](https://infection.github.io) for PHP):

1. It takes your code and generates **mutants** — variants with a single tiny change (`+` becomes `-`, `&&` becomes `||`, a `>=` condition becomes `>`...)
2. It reruns your test suite against each mutant
3. If a test fails → the mutant is **killed**. Your tests did their job.
4. If every test still passes despite the change → the mutant **escaped**. Your tests saw nothing.

The **MSI** (Mutation Score Indicator) — the percentage of mutants killed — is the real report card for your test suite. Not coverage.

## Not all mutants are equal

Some are obvious: `true` → `false`, `+` → `-`. Useful for understanding the concept, but rarely the ones that surprise you.

The interesting ones are quieter: an `&&` that becomes `||`, a `throw` that silently disappears. Without a tool, these slip through code review unnoticed. That's exactly where mutation testing earns its keep — and it's the kind of mutant that, once caught, pushes you to fix a genuinely weak test.

Two traps worth knowing about too:

- **Equivalent mutants**: the code changed, but observable behavior is identical — impossible to kill, no matter the test.
- **Trivial mutants**: noise that inflates the numbers without adding value.

## In practice, in CI

Don't run a mutation testing tool against the whole project — execution time balloons fast (every mutant means rerunning the whole suite), and some mutants break the control flow and cause timeouts.

The right approach: only target what actually changed in the PR.

```bash
vendor/bin/infection --git-diff-filter=AM --min-msi=70
```

Fast, targeted, and it gives a real guarantee about the code that was just touched, rather than an unreadable global score.

**Coverage** answers "which lines got executed." **MSI** answers "do my tests detect an actual behavior change." Two different metrics — and only the second one protects you from an incident like the one above.

---

*I gave a longer talk on this (AFUP Paris / Dayuse, June 2026), X-Men theme included — [the slides are online](https://mirandaguillaume.github.io/mutation-testing/) if you want the full version.*
