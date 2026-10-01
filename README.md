# danso.dev

The portfolio of Danso Daniel Kwaku Arnan, a software engineer based in Accra.
It presents three projects, each with a written case study, plus an about page,
a resume and a contact form.

**Live site:** [danso.dev](https://danso.dev)

## How it is built

- **Next.js 16 App Router**, statically generated. Every page is prerendered at
  build time; the only server code is the contact form's API route.
- **Content is MDX in the repository**, validated against a Zod schema at build
  time. Bad frontmatter fails the build and names the file and the field, so a
  broken project card can never ship.
- **No dead links by construction.** Each project's `demo` field is a
  discriminated union (`live`, `repo-only`, `recording`, `recording-pending`).
  A project without a live URL has no `url` field, so a "Live site" button with
  nothing behind it is a type error rather than something to remember.
- **CSS-only motion.** The gradient, page entrances, hover and press feedback,
  and scroll reveals are all CSS, so they cost no JavaScript and run before
  React hydrates. Everything stops under `prefers-reduced-motion`.
- **Tested.** Unit tests (Vitest) cover the schemas, content loader, contact
  validation and components. End-to-end tests (Playwright) cover every route,
  keyboard navigation, both themes, reduced motion, the contact form's failure
  states, and an axe accessibility sweep in light and dark mode.

Lighthouse scores 100 for performance, accessibility, best practices and SEO on
every route.

## Stack

|           |                                               |
| --------- | --------------------------------------------- |
| Framework | Next.js 16.3.5, React 19.3.0                  |
| Language  | TypeScript 5.9.3, strict                      |
| Styling   | Tailwind CSS 4.3.3, OKLCH colour tokens       |
| Content   | MDX via next-mdx-remote, validated with Zod 4 |
| Email     | Resend                                        |
| Testing   | Vitest 5, Playwright 1.63, axe-core           |
| Hosting   | Vercel                                        |

Two versions are pinned deliberately and should not be upgraded on their own:

- **TypeScript stays on 5.9.3.** `typescript-eslint` 8.70 supports TypeScript
  below 6.1, so TypeScript 7 breaks linting.
- **ESLint stays on 9.** `eslint-config-next` 16.3.5 bundles an
  `eslint-plugin-react` that calls an API ESLint 10 removed, and linting
  crashes on any file containing JSX.

## Running it locally

Requires Node 24.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

| Script              | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Development server                                  |
| `npm run build`     | Production build                                    |
| `npm run start`     | Serve the production build                          |
| `npm run lint`      | ESLint                                              |
| `npm run typecheck` | TypeScript, no emit                                 |
| `npm run test`      | Unit tests                                          |
| `npm run test:e2e`  | End-to-end tests (builds and serves the site first) |
| `npm run verify`    | Lint, typecheck, unit tests and build               |
| `npm run format`    | Prettier                                            |

The end-to-end tests need a browser the first time: `npx playwright install chromium`.

## Environment variables

The contact form needs two, set in `.env.local` for local use and in the Vercel
project settings for production:

| Variable           | Purpose                                 |
| ------------------ | --------------------------------------- |
| `RESEND_API_KEY`   | Resend API key used to send the message |
| `CONTACT_TO_EMAIL` | The inbox messages are delivered to     |

Messages are sent from `portfolio@danso.dev`, so `danso.dev` must be verified as
a sending domain in Resend before the form will deliver. Until then the form
shows an error and points people to the email address shown beside it.

`.env` and `.env*.local` are gitignored. Never commit a key.

## Updating the content

Everything below is a content change. None of it needs code.

**Add a project.** Create `content/projects/<slug>.mdx` with the same
frontmatter as the existing files. The build validates it, and the project
appears on the home page, the projects page, the sitemap and its own case study
page, with a generated social card.

**Update the resume.** Two files change together:

1. Replace `public/Danso_Daniel.pdf` with the new PDF, keeping the same name.
2. Edit `content/resume.ts`. The `/resume` page renders entirely from it.

Keep the two in step. The PDF is what people download; the TypeScript file is
what they read on the page.

**Add bitby's screen recording.** The steps are in a comment at the top of
`content/projects/bitby.mdx`: save the video and a still frame under
`public/projects/`, then change the `demo` block. The tests check that both
files exist, so a missing file fails loudly instead of shipping a player that
cannot play.

**Replace a cover image.** Save it over `public/projects/<slug>-cover.png`,
ideally 1200 by 630 pixels and compressed. `next/image` optimises what it
serves, but the original stays in the repository.

**Add a photo.** Put it in `public/` and set the `PHOTO` constant at the top of
`app/about/page.tsx`. Until then the about page shows a typographic card instead.

## Project structure

```
app/          Routes, layouts, the contact API route, sitemap, social cards
components/   Page sections and UI primitives
content/      Project case studies (MDX) and resume data
lib/          Content loader, schemas, site constants, utilities
public/       Images, the resume PDF
tests/        Unit tests (Vitest) and end-to-end tests (Playwright)
```

Site-wide details such as name, role, email and GitHub live in `lib/site.ts`.
