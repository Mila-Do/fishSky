import React from 'react';
import { useGenerationState } from '../../lib/context/GenerationStateContext';
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonLoaderProps {
  isVisible?: boolean;
  message?: string;
}

export default function SkeletonLoader({
  isVisible: externalIsVisible,
  message = 'Generowanie fiszek...',
}: SkeletonLoaderProps) {
  const { state } = useGenerationState();
  
  // Use the external visibility prop if provided, otherwise use the state
  const isVisible = externalIsVisible !== undefined ? externalIsVisible : state.isGenerating;
  
  if (!isVisible) return null;

  return (
    <div className="flex flex-col space-y-8 my-10">
      <div className="flex items-center space-x-2 mb-6">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-4 w-48" />
      </div>
      
      <div className="text-center mb-4 text-gray-600">{message}</div>
      
      {/* Skeleton cards */}
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="border rounded-md p-4 bg-white shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-3/4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="w-1/4 flex justify-end space-x-2">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
          </div>
          <div className="border-t pt-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
      
      <div className="mt-6 flex justify-center space-x-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
  );
} 