## Description

<!-- What does this PR do? Why is it needed? -->

## Related Issues

<!-- Link related issues, e.g. Closes #123 -->

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation
- [ ] Refactor / internal change

## Checklist

- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` passes
- [ ] Commits are scoped to one logical change
- [ ] New/changed spec fields are normalized in `src/lib/openapi/parse-document.ts` (if applicable)
- [ ] Components consume normalized types from `src/types/openapi.ts`, not the raw spec shape
- [ ] No inline (`//`) comments; TSDoc used on exported functions/components/types
- [ ] `"use client"` only added where state, effects, or browser APIs are needed

## Additional Context

<!-- Screenshots, notes for reviewers, etc. -->
