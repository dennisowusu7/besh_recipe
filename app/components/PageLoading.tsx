import { PageLoadingProps } from "@/lib/types";

export default function PageLoading({ message = "Loading..." }: PageLoadingProps) {
  return (
    <section className="mx-auto flex w-full flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between p-4">
        <div className="h-10 w-56 animate-pulse rounded-md bg-gray-200/70" />
        <div className="h-12 w-40 animate-pulse rounded-xl bg-violet-300/70" />
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center gap-3 py-2">
          <span className="h-3 w-3 animate-ping rounded-full bg-violet-500" />
          <p className="text-sm font-medium text-violet-700">{message}</p>
        </div>
        <div className="h-11 animate-pulse rounded-md bg-gray-200/70" />
        <div className="h-11 animate-pulse rounded-md bg-gray-200/70" />
        <div className="h-11 animate-pulse rounded-md bg-gray-200/70" />
        <div className="m-auto h-52 w-52 animate-pulse rounded-lg border-2 border-gray-300 bg-gray-200/70" />
        <div className="h-80 animate-pulse rounded-md border border-gray-300 bg-gray-200/60" />
      </div>
    </section>
  );
}