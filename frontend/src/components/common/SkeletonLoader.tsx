import { Skeleton } from "@chakra-ui/react";

interface ISkeletonLoader {
  count: number;
  height: string;
  width?: string;
}

export default function SkeletonLoader({
  count,
  height,
  width,
}: ISkeletonLoader) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <Skeleton
          key={i}
          startColor="blackAlpha.400"
          endColor="whiteAlpha.300"
          height={height}
          width={{ base: "full" || width }}
          borderRadius={4}
        />
      ))}
    </>
  );
}
