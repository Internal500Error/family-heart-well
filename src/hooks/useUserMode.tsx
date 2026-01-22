/**
 * User Mode Context - Manages parent/child mode switching
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserMode = 'parent' | 'child';

interface UserModeContextType {
    mode: UserMode;
    setMode: (mode: UserMode) => void;
    parentLinkCode: string;
    generateNewLinkCode: () => void;
    parentProfile: ParentProfile | null;
    setParentProfile: (profile: ParentProfile) => void;
}

export interface ParentProfile {
    id: string;
    name: string;
    age: number;
    linkCode: string;
    healthData: {
        bloodPressure?: { systolic: number; diastolic: number };
        bloodSugar?: number;
        stepsToday?: number;
        waterIntake?: number;
    };
    medicines: {
        total: number;
        taken: number;
        nextDue?: { name: string; time: string };
    };
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined);

// Generate unique 6-character code
const generateLinkCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Storage keys
const MODE_STORAGE_KEY = 'dilcare_user_mode';
const LINK_CODE_STORAGE_KEY = 'dilcare_parent_link_code';
const PARENT_PROFILE_KEY = 'dilcare_parent_profile';

export const UserModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [mode, setModeState] = useState<UserMode>('parent');
    const [parentLinkCode, setParentLinkCode] = useState<string>('');
    const [parentProfile, setParentProfileState] = useState<ParentProfile | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const savedMode = localStorage.getItem(MODE_STORAGE_KEY) as UserMode;
        const savedLinkCode = localStorage.getItem(LINK_CODE_STORAGE_KEY);
        const savedProfile = localStorage.getItem(PARENT_PROFILE_KEY);

        if (savedMode) {
            setModeState(savedMode);
        }

        if (savedLinkCode) {
            setParentLinkCode(savedLinkCode);
        } else {
            // Generate new code for first time
            const newCode = generateLinkCode();
            setParentLinkCode(newCode);
            localStorage.setItem(LINK_CODE_STORAGE_KEY, newCode);
        }

        if (savedProfile) {
            setParentProfileState(JSON.parse(savedProfile));
        }
    }, []);

    const setMode = (newMode: UserMode) => {
        setModeState(newMode);
        localStorage.setItem(MODE_STORAGE_KEY, newMode);
    };

    const generateNewLinkCode = () => {
        const newCode = generateLinkCode();
        setParentLinkCode(newCode);
        localStorage.setItem(LINK_CODE_STORAGE_KEY, newCode);
    };

    const setParentProfile = (profile: ParentProfile) => {
        setParentProfileState(profile);
        localStorage.setItem(PARENT_PROFILE_KEY, JSON.stringify(profile));
    };

    return (
        <UserModeContext.Provider value={{
            mode,
            setMode,
            parentLinkCode,
            generateNewLinkCode,
            parentProfile,
            setParentProfile
        }}>
            {children}
        </UserModeContext.Provider>
    );
};

export const useUserMode = (): UserModeContextType => {
    const context = useContext(UserModeContext);
    if (!context) {
        throw new Error('useUserMode must be used within a UserModeProvider');
    }
    return context;
};

export default UserModeContext;
