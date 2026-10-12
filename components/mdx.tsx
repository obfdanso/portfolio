import type { MDXComponents } from "mdx/types";
import { rehypeSections } from "@/lib/rehype-sections";

const components: MDXComponents = {
  h2: (props) => <h2 className="mt-14 text-step-2" {...props} />,
  h3: (props) => <h3 className="mt-10 text-step-1" {...props} />,
  p: (props) => <p className="mt-5 text-fg-muted" {...props} />,
  ul: (props) => <ul className="mt-5 list-disc space-y-2 pl-6 text-fg-muted" {...props} />,
  ol: (props) => <ol className="mt-5 list-decimal space-y-2 pl-6 text-fg-muted" {...props} />,
  a: (props) => <a className="text-accent underline underline-offset-4" {...props} />,
  strong: (props) => <strong className="font-semibold text-fg" {...props} />,
  hr: (props) => <hr className="mt-12 border-fg-muted/15" {...props} />,
  blockquote: (props) => (
    <blockquote className="mt-6 border-l-2 border-accent/50 pl-5 text-fg-muted" {...props} />
  ),
  pre: (props) => (
    <pre
      className="mt-6 overflow-x-auto rounded-xl border border-fg-muted/15 bg-surface/60 p-4 text-step-xs"
      {...props}
    />
  ),
};

// MDXRemote is itself an async server component. Calling it directly and
// awaiting the result — rather than returning <MDXRemote /> unresolved — means
// this component hands back plain resolved JSX, which is what makes it
// renderable in unit tests as well as in the RSC tree.
//
// The MDX compiler is loaded here, when a case study renders, not at the top
// of the file. The case study page imports this file, and the dev server
// loads that page just to run generateStaticParams; a top-level import made
// it load the whole compiler for that too, about 0.4s on every first case
// study after starting `next dev`. Production prerenders every case study,
// so visitors never pay either cost.
export async function Mdx({ source }: { source: string }) {
  const [{ MDXRemote }, { default: remarkGfm }] = await Promise.all([
    import("next-mdx-remote/rsc"),
    import("remark-gfm"),
  ]);
  return MDXRemote({
    source,
    components,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        // Each section into a card beside the scroll line, as on the resume.
        rehypePlugins: [rehypeSections],
      },
    },
  });
}
