import { Medal } from 'lucide-react';

interface RankBadgeProps {
    index: number;
}

export const RankBadge = ({ index }: RankBadgeProps) => {
    if (index === 0) return <Medal className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="w-5 text-center text-sm text-muted-foreground font-mono">{index + 1}</span>;
};
