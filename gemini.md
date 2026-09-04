# Workspace Directives (gemini.md)
# B.L.A.S.T. Protocol Environment

## Strict Architectural Rules
1. **Next.js Paradigms:** Default to Server Components. Use `'use client'` only when hook logic (`useState`, `useEffect`, `useStore`) or browser APIs are explicitly required.
2. **State Segregation:** Do not drill props deeply. Rely on the Zustand stores (`@/stores/*`) for cross-component global state mapping.
3. **Styling Engine:** Tailwind CSS v4 is the exclusive styling system. Inline styles are prohibited unless driven by dynamic Framer Motion springs.
4. **Resiliency over Speed:** If a feature requires backend processing (e.g., AI integration), implement fail-safes and robust error handling boundaries prior to rendering UI.
5. **No Blind R3F Renders:** WebGL canvases must explicitly block SSR execution via `next/dynamic` and provide visually distinct HTML fallbacks during chunk loading.
