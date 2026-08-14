export default function Loading({ message = "Loading..." }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600"
        aria-hidden="true"
      />
      <p className="mt-3 text-sm text-slate-500" role="status">
        {message}
      </p>
    </div>
  );
}
