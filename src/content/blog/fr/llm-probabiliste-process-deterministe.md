---
title: "Le LLM est probabiliste, votre process ne devrait pas l'être"
description: "On ne rendra pas un LLM déterministe, mais on peut écrire le chemin qu'il suit. Ce que j'attends d'un outil de workflows pour LLM."
pubDate: 2026-10-14
tags: ['ai', 'llm', 'workflows']
translationKey: 'workflows-deterministes'
draft: true
---

Je lance souvent le skill de code review d'Anthropic. Son principe : lancer plusieurs agents **en parallèle**, chacun sur une lentille différente. Sauf que, régulièrement, le LLM décide de les lancer les uns après les autres.

Le skill dit « en parallèle ». Le LLM, lui, décide régulièrement de faire autrement.

Le seul moyen de m'assurer qu'ils partent toujours en parallèle : ne pas demander au LLM de gérer le parallélisme. Une consigne écrite en prose reste une demande, pas une garantie.

## Le LLM n'est pas le problème

Qu'un même prompt donne deux réponses différentes, plus personne ne s'en étonne : c'est le principe de l'échantillonnage. Ce qui surprend davantage, c'est que descendre la température à 0 ne règle pas le problème. La documentation de l'API Claude le dit en toutes lettres : « même avec une température de 0.0, les résultats ne seront pas totalement déterministes » ([API Messages](https://platform.claude.com/docs/en/api/messages/create), traduction libre). OpenAI parle de sorties « _mostly deterministic_ » et d'un échantillonnage « _best effort_ » avec le paramètre `seed` ([cookbook](https://developers.openai.com/cookbook/examples/reproducible_outputs_with_the_seed_parameter)).

Thinking Machines a mesuré l'écart ([Horace He et al., septembre 2025](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/)). Mille complétions du même prompt, à température 0, sur Qwen3-235B : **80 réponses distinctes**. Elles sont identiques sur les 102 premiers tokens, puis divergent au 103ᵉ : « Queens, New York » dans 992 cas, « New York City » dans 8.

La cause n'est pas celle qu'on répète d'habitude. Ce n'est pas la concurrence entre threads GPU qui est en jeu, mais la taille des batchs, qui varie avec la charge du serveur : le même calcul n'additionne pas ses nombres dans le même ordre selon le batch dans lequel il tombe. Avec des kernels « batch-invariant », les mille complétions deviennent identiques. Mais cela concerne ceux qui hébergent l'inférence, et ça a un coût : sur leur benchmark (un GPU, Qwen3-8B), 1 000 séquences passent de 26 s à 42 s, avec des kernels qu'ils disent ne pas avoir optimisés.

Attendre que les fournisseurs règlent le problème n'est donc pas une stratégie. Le déterminisme ne viendra pas du modèle. Il faut le chercher autour.

## Un workflow n'est pas un agent

Anthropic a posé la distinction dans « Building effective agents » ([décembre 2024](https://www.anthropic.com/research/building-effective-agents), traduction libre) :

- un **workflow** est un système où les LLM et les outils sont orchestrés par des chemins de code prédéfinis ;
- un **agent** est un système où le LLM dirige dynamiquement son propre processus et son usage des outils.

La documentation de [LangGraph](https://docs.langchain.com/oss/python/langgraph/workflows-agents) reprend la même distinction : les workflows ont des chemins de code prédéterminés et un ordre d'exécution, les agents définissent eux-mêmes leur processus.

Anthropic recommande de chercher « la solution la plus simple possible » et de n'ajouter de la complexité que si nécessaire. Quand elle l'est, les workflows apportent « prévisibilité et cohérence » pour les tâches bien définies, alors que les agents conviennent quand il faut de la flexibilité et des décisions pilotées par le modèle.

La vraie question n'est donc pas « agent ou pas agent ». C'est : **quelles décisions est-ce que je laisse au modèle ?** Chacune est une source de variance. Un workflow écrit, c'est dépenser cette variance exprès, à l'endroit où elle sert, et nulle part ailleurs.

## Ce qu'un outil de workflows devrait offrir

**1. Des étapes explicites et versionnées.** Un process qui vit dans un prompt, ou dans la tête de quelqu'un, ne se relit pas, ne se compare pas, ne se revoit pas en PR. Il doit être un fichier du dépôt, comme le code.

**2. Un contrat d'entrée et de sortie à chaque étape.** Une étape qui reçoit « du texte » et renvoie « du texte » ne peut pas être vérifiée. Avec un schéma, l'étape suivante peut refuser ce qu'elle reçoit, et l'erreur apparaît là où elle est née, pas trois étapes plus loin.

**3. Des critères de sortie vérifiés par du code.** Anthropic décrit déjà le principe pour le _prompt chaining_ : on peut ajouter des « _programmatic checks_ » (des _gates_) sur les étapes intermédiaires « pour s'assurer que le processus est toujours sur la bonne voie ». Laisser le LLM déclarer lui-même que c'est bon, c'est tourner en rond. Les tests générés par LLM en sont une illustration : sur ULT, un benchmark de 3 909 fonctions Python réelles, ils n'atteignent en moyenne que 40,21 % de mutation score ([Huang et al., arXiv:2508.00408](https://arxiv.org/abs/2508.00408)). « Ça passe » ne dit presque rien, comme je l'expliquais dans [l'article sur le mutation testing](/blog/mutation-testing-vos-tests-testent-ils-vraiment-quelque-chose/). À l'inverse, le build de ce site échoue si un article publié n'a pas de `translationKey` : un contrôle qui peut dire non, sans demander son avis à personne.

**4. Le rejeu et les traces.** Un process qui échoue à l'étape 7 ne devrait pas repartir de l'étape 1. Les moteurs de workflows durables le font depuis longtemps : chez [Temporal](https://docs.temporal.io/evaluate/understanding-temporal), si le processus plante, un autre reprend le travail, reconstruit l'état et repart là où l'exécution s'était arrêtée. Et leur [documentation](https://docs.temporal.io/workflow-definition) pose exactement la frontière de cet article : le code du workflow doit être déterministe pour pouvoir être rejoué, et les opérations non déterministes, dont les « _LLM/AI invocations_ », vont dans des _Activities_, exécutées hors du chemin de rejeu et automatiquement retentées.

**5. L'humain aux points de décision.** Certaines décisions ne se délèguent pas : merger, déployer, dépenser. Un bon outil sait s'arrêter, attendre une validation, puis reprendre sans perdre l'état.

**6. Un ordre et un parallélisme décidés par l'outil, pas par le modèle.** C'est la leçon de la scène d'ouverture. Quand le parallélisme n'est qu'une consigne en prose dans un skill, c'est le LLM qui l'interprète, et il peut l'interpréter autrement d'une exécution à l'autre. Dans un workflow, le fan-out est une propriété du graphe d'exécution : on ne consulte le modèle que pour le contenu de chaque branche, jamais pour décider qu'il y a des branches ni dans quel ordre elles partent.

## Ce que je n'attends pas

Pas une couche d'abstraction de plus. Anthropic prévient que les frameworks « créent souvent des couches d'abstraction supplémentaires qui peuvent masquer les prompts et les réponses sous-jacents, les rendant plus difficiles à déboguer ». Un outil de workflows qui cache ce que le modèle a reçu et répondu retire d'une main le contrôle qu'il donne de l'autre.

Pas non plus un format propriétaire : si le workflow est la chose la plus précieuse, il doit rester lisible sans l'outil.

## Ce que j'espère

Ce qui existe aujourd'hui se répartit en familles qui se parlent peu : des frameworks de code comme LangGraph, des moteurs d'exécution durable comme Temporal, des éditeurs graphiques comme Rivet ou Vellum (cités par Anthropic). Je ne les ai pas comparés ici, et ce n'est pas le sujet. Le sujet, c'est la liste ci-dessus.

J'espère qu'un outil rassemblera ce socle sans cacher ce que fait le modèle, et qu'il finira par se démarquer. En attendant, il y a une chose qui ne demande aucun outil : écrire le workflow. Même une simple checklist versionnée vaut mieux qu'un process qui n'existe que dans un prompt.
