import type { MDXComponents } from "mdx/types";
import Link from "next/link";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children }) => (
      <h2 className="border-b border-b-light-gray-2 py-2 text-xl font-extrabold first:pt-0 sm:text-2xl md:text-3xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="pt-2 text-lg font-extrabold sm:text-xl">{children}</h3>
    ),
    a: ({ children, href }) =>
      href?.startsWith("/") ? (
        <Link href={href} className="font-bold hover:underline focus:underline">
          {children}
        </Link>
      ) : (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold hover:underline focus:underline"
        >
          {children}
        </a>
      ),
    p: ({ children }) => <p className="text-base sm:text-lg">{children}</p>,
    ul: ({ children }) => (
      <ul className="list-disc space-y-2 pl-6 text-base sm:text-lg">
        {children}
      </ul>
    ),
    ol: ({ children, start }) => (
      <ol
        start={start}
        className="list-decimal space-y-2 pl-6 text-base sm:text-lg"
      >
        {children}
      </ol>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-l-light-gray-3 pl-4 text-light-gray-7">
        {children}
      </blockquote>
    ),
    pre: ({ children }) => (
      <pre className="overflow-x-auto rounded-md bg-light-gray-9 p-4 text-sm text-light-gray-0 sm:text-base">
        {children}
      </pre>
    ),
    code: ({ children }) => (
      <code className="rounded bg-light-gray-1 px-1 py-0.5 font-mono text-[0.9em] [pre_&]:bg-transparent [pre_&]:p-0">
        {children}
      </code>
    ),
    ...components,
  };
}
