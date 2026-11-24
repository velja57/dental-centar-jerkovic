/** Strukturirani podaci kao <script type="application/ld+json">; "<" se escapuje (preporuka iz Next.js dokumentacije). */
export function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
