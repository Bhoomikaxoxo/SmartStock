import { User } from '../types';

// Seeded user database for prototype demonstration & credentials reference
export const SEEDED_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'user-owner',
    name: 'Rahul Nair',
    email: 'owner@sweetcrustbakery.com',
    role: 'owner',
    avatarInitial: 'RN',
    passwordHash: 'demo1234',
  },
  {
    id: 'user-purchasing',
    name: 'Amit Verma',
    email: 'purchasing@sweetcrustbakery.com',
    role: 'purchasing',
    avatarInitial: 'AV',
    passwordHash: 'demo1234',
  },
  {
    id: 'user-staff',
    name: 'Priya Sharma',
    email: 'staff@sweetcrustbakery.com',
    role: 'staff',
    avatarInitial: 'PS',
    passwordHash: 'demo1234',
  },
];
