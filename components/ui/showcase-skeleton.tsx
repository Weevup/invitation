import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ShowcaseSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Card Skeleton */}
      <Card className="border-[#FF4713]/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-6 w-6 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full rounded-lg" />
        </CardContent>
      </Card>

      {/* Tabs Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-10 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>

      {/* Save Button Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-12 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
