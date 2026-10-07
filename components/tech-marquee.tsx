import { resume } from "@/content/resume";

// The tools on the home page come from the resume, so they never drift apart.
const GROUPS = ["Front-end", "Mobile and desktop"];

/**
 * A slow band of the tools Danso builds with. The list is rendered twice so
 * the loop is seamless; the copy is hidden from assistive technology, which
 * reads the tools once. It pauses under the mouse, and under reduced motion
 * it is simply a wrapped list.
 */
export function TechMarquee() {
  const items = resume.skills.filter((g) => GROUPS.includes(g.group)).flatMap((g) => g.items);
  const list = (hidden: boolean) => (
    <ul className="marquee__list" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Tools I build with" className="marquee">
      <div className="marquee__track">
        {list(false)}
        {list(true)}
      </div>
    </section>
  );
}
