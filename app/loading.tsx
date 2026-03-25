import { SkeletonBox } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-container px-4 py-12">
      <div className="text-center">
        <SkeletonBox className="mx-auto mb-3 h-12 w-96" />
        <SkeletonBox className="mx-auto h-5 w-80" />
      </div>
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonBox key={i} className="h-44" />
        ))}
      </div>
    </div>
  );
}
