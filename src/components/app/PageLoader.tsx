export default function PageLoader() {
  return (
    <div className="w-full px-8 md:px-20 lg:px-28 py-16">
      <div className="max-w-[92rem] mx-auto">
        <div className="h-8 w-44 rounded-lg bg-surface border border-border animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-40 rounded-2xl border border-border bg-surface animate-pulse" />
          <div className="h-40 rounded-2xl border border-border bg-surface animate-pulse" />
          <div className="h-40 rounded-2xl border border-border bg-surface animate-pulse" />
        </div>
      </div>
    </div>
  );
}
