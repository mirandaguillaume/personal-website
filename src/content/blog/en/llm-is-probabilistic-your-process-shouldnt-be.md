---
title: "The LLM is probabilistic. Your process shouldn't be"
description: "We won't make an LLM deterministic, but we can write down the path it follows. What I expect from a workflow tool for LLMs."
pubDate: 2026-10-14
tags: ['ai', 'llm', 'workflows']
translationKey: 'workflows-deterministes'
draft: true
---

I often run Anthropic's code review skill. Its principle: launch several agents **in parallel**, each on a different lens. Except that, regularly, the LLM decides to launch them one after the other.

The skill says "in parallel". The LLM regularly decides otherwise.

The only way to be sure they always start in parallel: don't ask the LLM to manage parallelism. An instruction written in prose is a request, not a guarantee.

## The LLM isn't the problem

Nobody is surprised that the same prompt can give two different answers: that's how sampling works. What is more surprising is that setting the temperature to 0 doesn't fix it. The Claude API documentation says so plainly: "Note that even with temperature of 0.0, the results will not be fully deterministic" ([Messages API](https://platform.claude.com/docs/en/api/messages/create)). OpenAI talks about "mostly deterministic" outputs and a "best effort" at deterministic sampling with the `seed` parameter ([cookbook](https://developers.openai.com/cookbook/examples/reproducible_outputs_with_the_seed_parameter)).

Thinking Machines measured the gap ([Horace He et al., September 2025](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/)). A thousand completions of the same prompt, at temperature 0, on Qwen3-235B: **80 distinct answers**. They are identical for the first 102 tokens, then diverge at the 103rd: "Queens, New York" in 992 cases, "New York City" in 8.

The cause isn't the usual suspect. It isn't concurrency between GPU threads but batch size, which varies with server load: the same computation doesn't add its numbers in the same order depending on the batch it lands in. With "batch-invariant" kernels, the thousand completions become identical. But that only helps whoever hosts the inference, and it has a cost: on their benchmark (one GPU, Qwen3-8B), 1,000 sequences go from 26 s to 42 s, with kernels they say they haven't optimized.

So waiting for providers to fix this isn't a strategy. Determinism won't come from the model. It has to be found around it.

## A workflow is not an agent

Anthropic drew the line in "Building effective agents" ([December 2024](https://www.anthropic.com/research/building-effective-agents)):

- **Workflows** are systems where LLMs and tools are orchestrated through predefined code paths;
- **Agents** are systems where LLMs dynamically direct their own processes and tool usage.

The [LangGraph](https://docs.langchain.com/oss/python/langgraph/workflows-agents) documentation uses the same split: workflows have predetermined code paths and run in a certain order, while agents define their own processes.

Anthropic recommends finding "the simplest solution possible" and only adding complexity when needed. When it is needed, workflows offer "predictability and consistency" for well-defined tasks, whereas agents are the better option when flexibility and model-driven decision-making are needed.

So the real question isn't "agent or not". It's: **which decisions do I leave to the model?** Each one is a source of variance. Writing a workflow means spending that variance on purpose, where it pays off, and nowhere else.

## What a workflow tool should offer

**1. Explicit, versioned steps.** A process that lives in a prompt, or in someone's head, can't be read, diffed or reviewed in a PR. It should be a file in the repository, like code.

**2. An input and output contract at every step.** A step that receives "text" and returns "text" can't be checked. With a schema, the next step can refuse what it receives, and the error shows up where it was born, not three steps later.

**3. Exit criteria checked by code.** Anthropic already describes the principle for prompt chaining: you can add "programmatic checks" (the "gate" in their diagram) on intermediate steps "to ensure that the process is still on track". Letting the LLM declare that it's fine is going in circles. LLM-generated tests illustrate this: on ULT, a benchmark of 3,909 real-world Python functions, they only reach an average mutation score of 40.21% ([Huang et al., arXiv:2508.00408](https://arxiv.org/abs/2508.00408)). "It passes" says almost nothing, as I explained in [the mutation testing article](/en/blog/mutation-testing-do-your-tests-actually-test-anything/). By contrast, this site's build fails if a published article has no `translationKey`: a check that can say no, without asking anyone's opinion.

**4. Replay and traces.** A process that fails at step 7 shouldn't restart from step 1. Durable workflow engines have done this for a long time: with [Temporal](https://docs.temporal.io/evaluate/understanding-temporal), if the process crashes, another one takes over, rebuilds the state and resumes where the execution stopped. And their [documentation](https://docs.temporal.io/workflow-definition) draws exactly the line this article is about: workflow code must be deterministic to support replay, and non-deterministic operations, including "LLM/AI invocations", go in Activities, which run outside the replay path and are automatically retried.

**5. A human at decision points.** Some decisions shouldn't be delegated: merging, deploying, spending. A good tool knows how to stop, wait for approval, then resume without losing state.

**6. Ordering and parallelism decided by the tool, not by the model.** This is the lesson of the opening scene. When parallelism is only an instruction in prose inside a skill, the LLM interprets it, and it can interpret it differently from one run to the next. In a workflow, fan-out is a property of the execution graph: the model is only consulted for the content of each branch, never to decide that there are branches or in what order they start.

## What I don't expect

Not one more layer of abstraction. Anthropic warns that frameworks "often create extra layers of abstraction that can obscure the underlying prompts and responses, making them harder to debug". A workflow tool that hides what the model received and answered takes back with one hand the control it gives with the other.

Not a proprietary format either: if the workflow is the most valuable thing, it should stay readable without the tool.

## What I hope for

What exists today falls into families that rarely talk to each other: code frameworks like LangGraph, durable execution engines like Temporal, graphical builders like Rivet or Vellum (mentioned by Anthropic). I haven't compared them here, and that isn't the point. The point is the list above.

I hope a tool will bring this foundation together without hiding what the model does, and that it will eventually stand out. In the meantime, one thing needs no tool at all: writing the workflow down. Even a plain versioned checklist beats a process that only exists in a prompt.
