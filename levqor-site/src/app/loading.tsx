export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20 animate-pulse">
      <div className="text-center mb-20">
        <div className="h-4 w-40 mx-auto rounded bg-gray-200 mb-6" />
        <div className="h-16 w-3/4 mx-auto rounded bg-gray-200 mb-6" />
        <div className="h-6 w-2/3 mx-auto rounded bg-gray-200 mb-8" />
        <div className="flex gap-4 justify-center">
          <div className="h-14 w-40 rounded-xl bg-gray-200" />
          <div className="h-14 w-32 rounded-xl bg-gray-200" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
