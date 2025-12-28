import { useEffect } from "preact/hooks";
import { Component, ComponentChildren, toChildArray } from "preact";

// from https://byby.dev/js-slugify-string
export function slugify(str: string) {
  return String(str)
    .normalize("NFKD") // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, "") // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9 -]/g, "") // remove non-alphanumeric characters
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // remove consecutive hyphens
}

function childrenText(children: ComponentChildren): string {
  return toChildArray(children)
    .map((child) => (typeof child === "number" || typeof child === "string" ? String(child) : ""))
    .join(" ");
}

const HEADING_REGISTRY = new Map<string, number>();

function LinkableHeading({
  heading: Heading,
  children,
  id,
  className,
}: {
  heading: Component;
  children?: ComponentChildren;
  id?: string;
  className?: string;
}) {
  const headingId = id || slugify(childrenText(children));

  useEffect(() => {
    HEADING_REGISTRY.set(headingId, (HEADING_REGISTRY.get(headingId) || 0) + 1);

    if ((HEADING_REGISTRY.get(headingId) || 0) > 1) {
      console.warn(`Multiple headings with ID=${headingId}`);
    }

    return () => {
      HEADING_REGISTRY.set(headingId, (HEADING_REGISTRY.get(headingId) || 0) - 1);
    };
  });

  return (
    // @ts-ignore: Preact vs React component
    <Heading id={headingId} className={className}>
      {children}
    </Heading>
  );
}

export function LinkableH1({
  children,
  id,
  className,
}: {
  children?: ComponentChildren;
  id?: string;
  className?: string;
}) {
  return (
    <LinkableHeading heading={"h1" as unknown as Component} id={id} className={className}>
      {children}
    </LinkableHeading>
  );
}
export function LinkableH2({
  children,
  id,
  className,
}: {
  children?: ComponentChildren;
  id?: string;
  className?: string;
}) {
  return (
    <LinkableHeading heading={"h2" as unknown as Component} id={id} className={className}>
      {children}
    </LinkableHeading>
  );
}
export function LinkableH3({
  children,
  id,
  className,
}: {
  children?: ComponentChildren;
  id?: string;
  className?: string;
}) {
  return (
    <LinkableHeading heading={"h3" as unknown as Component} id={id} className={className}>
      {children}
    </LinkableHeading>
  );
}
export function LinkableH4({
  children,
  id,
  className,
}: {
  children?: ComponentChildren;
  id?: string;
  className?: string;
}) {
  return (
    <LinkableHeading heading={"h4" as unknown as Component} id={id} className={className}>
      {children}
    </LinkableHeading>
  );
}
