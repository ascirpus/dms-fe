import type { User } from '@/types';

const AVATAR_COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
];

function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

export function getAvatarColor(identifier: string): string {
    if (!identifier) return AVATAR_COLORS[0];
    return AVATAR_COLORS[hashString(identifier) % AVATAR_COLORS.length];
}

type UserLike = Pick<User, 'firstName' | 'lastName' | 'email'>;

function isValidName(val: unknown): val is string {
    return typeof val === 'string' && val.length > 0 && val !== 'null';
}

export function getDisplayName(user: UserLike): string {
    const parts = [user.firstName, user.lastName].filter(isValidName);
    return parts.join(' ') || user.email || '';
}

export function getInitialsFromUser(user: UserLike): string {
    if (isValidName(user.firstName) && isValidName(user.lastName)) {
        return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }

    if (isValidName(user.firstName)) {
        return user.firstName[0].toUpperCase();
    }

    if (user.email) {
        return user.email[0].toUpperCase();
    }

    return '?';
}
