export function WorkInProgress({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-navy">{title}</h1>
      <p className="mt-4 text-lg text-navy/60">
        This page is a work in progress. Check back soon!
      </p>
    </div>
  );
}
