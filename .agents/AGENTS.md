# AI Coding Standards — Master Prompt & General Rules

CORE RULES:
- Write clean, human-grade code. It must not read like AI output.
- Comments explain WHY, never WHAT. If the code needs a comment to explain what it does, rewrite the code until it doesn't.
- No filler variable names: data, result, temp, item, obj are banned. Use precise, domain-specific names.
- No over-engineering. Solve the actual problem. Add abstraction only when you have three or more concrete cases that justify it.
- No dead code, no leftover console.log, no TODO comments unless I ask.
- Match the conventions already in the codebase exactly. If I show you existing code, treat it as the source of truth for style.
- Return code only. No preamble, no explanation unless I ask. If a decision has real tradeoffs, add one line after the code block.

NAMING:
- Variables and functions: camelCase
- Components and classes: PascalCase
- Constants and env vars: SCREAMING_SNAKE_CASE
- Files: kebab-case for utilities, PascalCase for components
- Booleans always start with: is, has, can, should (isLoading, hasError)
- Event handlers always start with: handle (handleSubmit, handleMenuClose)
- No abbreviations unless they are universal (url, id, api, html, css)

FUNCTIONS:
- One responsibility per function. If you cannot name it without "and", split it.
- Max ~30 lines per function. If it grows beyond that, extract.
- No magic numbers. Every numeric literal gets a named constant with context:
  const MAX_RETRY_ATTEMPTS = 3

TYPESCRIPT:
- No `any`. Ever. Use `unknown` and narrow it, or define the type properly.
- Prefer `interface` for objects, `type` for unions and primitives.
- Export types alongside the code that owns them, not in a global types dump.
- Use generics when the pattern repeats across two or more types.
- Strict null checks are always on. Never assume a value exists.

TAILWIND (when applicable):
- Design tokens first. Never use an arbitrary value if a semantic token exists.
  Wrong:  text-[#A6252A]
  Right:  text-primary-600
- Replace arbitrary sizes with standard utilities when within 2px tolerance:
  Wrong:  h-[49px]        Right:  h-12
  Wrong:  w-[33px]        Right:  w-8
  Wrong:  max-w-[1280px]  Right:  max-w-7xl
  Keep arbitrary values only when no standard utility maps to them.
- Class order: layout → spacing → sizing → typography → color → border → effects → state variants

STATE:
- Keep state as close to where it is used as possible. Do not hoist early.
- Never store derived values. Compute them.
- Server state (fetched data) and client state (UI toggles) are different. Treat them with different tools.

ERROR HANDLING:
- Every async operation has an explicit error state. No silent failures.
- User-facing messages use plain language. Log technical details separately.
- Every data-fetching component handles three states: loading, error, empty.

ACCESSIBILITY:
- Every interactive element is keyboard-reachable and has a visible focus state.
- Images always have descriptive alt text. Decorative images get alt="".
- Icon-only buttons always have aria-label.
- Use semantic HTML first. Reach for aria only when semantics fall short.
- Color alone never conveys meaning.

PERFORMANCE:
- Do not use useMemo or useCallback by default. Add them only after profiling shows a real problem.
- Images always have explicit width and height to prevent layout shift.
- Dynamic imports for routes and heavy components that are not needed on load.
- Never fetch inside a loop.

SECURITY:
- Never put secrets, tokens, or API keys in client-side code.
- Never trust user input. Validate and sanitize server-side.
- Never use dangerouslySetInnerHTML without explicit sanitization.
- Parameterize all database queries. No string concatenation for SQL.

---

## Tailwind Arbitrary → Standard Utility Reference

Replace arbitrary values with these when within 2px tolerance.
Keep the arbitrary value if nothing maps closely enough.

| Arbitrary     | Standard     | Arbitrary      | Standard     |
|---------------|--------------|----------------|--------------|
| `h-[16px]`    | `h-4`        | `w-[16px]`     | `w-4`        |
| `h-[20px]`    | `h-5`        | `w-[20px]`     | `w-5`        |
| `h-[24px]`    | `h-6`        | `w-[24px]`     | `w-6`        |
| `h-[32px]`    | `h-8`        | `w-[32px]`     | `w-8`        |
| `h-[36px]`    | `h-9`        | `w-[33px]`     | `w-8`        |
| `h-[40px]`    | `h-10`       | `w-[40px]`     | `w-10`       |
| `h-[48px]`    | `h-12`       | `w-[48px]`     | `w-12`       |
| `h-[49px]`    | `h-12`       | `w-[64px]`     | `w-16`       |
| `h-[64px]`    | `h-16`       | `w-[80px]`     | `w-20`       |
| `p-[8px]`     | `p-2`        | `gap-[8px]`    | `gap-2`      |
| `p-[12px]`    | `p-3`        | `gap-[12px]`   | `gap-3`      |
| `p-[16px]`    | `p-4`        | `gap-[16px]`   | `gap-4`      |
| `p-[24px]`    | `p-6`        | `gap-[24px]`   | `gap-6`      |
| `p-[32px]`    | `p-8`        | `gap-[32px]`   | `gap-8`      |
| `text-[12px]` | `text-xs`    | `rounded-[4px]`| `rounded`    |
| `text-[14px]` | `text-sm`    | `rounded-[8px]`| `rounded-lg` |
| `text-[16px]` | `text-base`  |`rounded-[12px]`| `rounded-xl` |
| `text-[18px]` | `text-lg`    |`rounded-[16px]`| `rounded-2xl`|
| `text-[20px]` | `text-xl`    |`max-w-[640px]` | `max-w-xl`   |
| `text-[24px]` | `text-2xl`   |`max-w-[768px]` | `max-w-3xl`  |
| `text-[30px]` | `text-3xl`   |`max-w-[1024px]`| `max-w-5xl`  |
| `text-[36px]` | `text-4xl`   |`max-w-[1280px]`| `max-w-7xl`  |
