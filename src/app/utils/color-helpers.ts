export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'beginner': return 'bg-[#00FF41] text-[#0F172A]';
    case 'intermediate': return 'bg-[#F59E0B] text-[#0F172A]';
    case 'advanced': return 'bg-[#EF4444] text-white';
    default: return 'bg-[#94A3B8] text-[#0F172A]';
  }
}

export function getServerStatusColor(status: string): string {
  switch (status) {
    case 'healthy': return 'text-accent bg-[#00FF41]/20';
    case 'warning': return 'text-[#F59E0B] bg-[#F59E0B]/20';
    case 'critical': return 'text-[#EF4444] bg-[#EF4444]/20';
    case 'offline': return 'text-muted-foreground bg-[#94A3B8]/20';
    default: return 'text-muted-foreground bg-[#94A3B8]/20';
  }
}

export function getUserStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'text-accent bg-[#00FF41]/20';
    case 'inactive': return 'text-muted-foreground bg-[#94A3B8]/20';
    case 'suspended': return 'text-[#EF4444] bg-[#EF4444]/20';
    default: return 'text-muted-foreground bg-[#94A3B8]/20';
  }
}
