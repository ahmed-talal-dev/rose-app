export function ProductCardSkeleton() {
    return (
        <div className="bg-card dark:bg-transparent rounded-2xl overflow-hidden border border-border dark:border-transparent animate-pulse">
            <div className="aspect-square bg-muted" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded-lg w-3/4" />
                <div className="h-3 bg-muted rounded-lg w-1/2" />
                <div className="flex items-center justify-between">
                    <div className="h-5 bg-muted rounded-lg w-1/3" />
                    <div className="h-8 bg-muted rounded-xl w-1/4" />
                </div>
            </div>
        </div>
    );
}
