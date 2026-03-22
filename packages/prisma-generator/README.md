# Cognotate Prisma Generator

## Overview

This package generates validation schemas from Prisma schema.

It maps structure only. It does not add validation rules or business logic.

The output is a minimal base layer.

Currently supported targets:

- Zod

Additional targets may be added as separate generators.

---

## Design

Prisma defines data structure. Validation libraries provide composition. This generator only maps between them.

The mapping can be viewed as a functor:

- source category: Prisma schema
- target category: validation schema (Zod, Valibot, etc.)
- structure is preserved
- no extra semantics are introduced

All behavior beyond structure is deferred to composition.

---

## Functor Composition

Because the mapping is a functor, composition is preserved.

Composition in the target library (e.g., Zod’s `pick`, `omit`, `extend`, `partial`, `required`) corresponds to composition of the underlying structure.

The generator does not attempt to implement these operations. It only provides the base object.

---

## Why Minimal

Zod already supports:

- `pick`
- `omit`
- `extend`
- `partial`
- `required`

These form a composable system. The generator should not duplicate or replace this.

Instead:

- generate base schema
- compose where needed

This principle applies to any target library. Each library has its own composition primitives.

---

## Scope

This package provides only the base mapping from Prisma to a target validation library.

We recommend:

- explicit schema composition
- on-demand selection
- no hidden behavior

---

## Multiple Targets

The generator is designed as a mapping layer that can target different validation libraries.

Each target is a separate generator.

Current targets:

- Zod

Planned targets:

- Valibot
- ArkType
- Effect Schema
- Yup
- Joi

Each target generator remains independent. They share the same structural mapping philosophy.

---

## Maintenance

The Zod generator is considered stable.

Only:

- compatibility updates
- bug fixes

No new features will be added to the Zod target.

Other targets will be maintained according to their own release cycles.

---

## Summary

A minimal mapping layer from Prisma to validation schemas.

Structure first. Composition later.

Multiple targets, one philosophy.
