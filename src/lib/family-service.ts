/**
 * Family Service - Manages parent-child linking via link codes
 * Uses localStorage for persistence across parent and child views
 */

// Storage keys
const PARENT_PROFILES_KEY = 'dilcare_parent_profiles';
const LINKED_CHILDREN_KEY = 'dilcare_linked_children';

// Parent profile as shared with children
export interface SharedParentProfile {
    linkCode: string;
    name: string;
    age: number;
    phone: string;
    bloodGroup: string;
    healthData: {
        bloodPressure?: { systolic: number; diastolic: number; timestamp: string };
        bloodSugar?: { value: number; timestamp: string };
        stepsToday: number;
        waterIntake: number;
    };
    medicines: {
        total: number;
        taken: number;
        nextDue?: { name: string; time: string };
    };
    lastUpdated: string;
}

// What a child sees about their parent
export interface ParentHealthSummary {
    linkCode: string;
    name: string;
    relationship: 'mother' | 'father' | 'guardian';
    lastUpdated: Date;
    healthStats: {
        bloodPressure?: { systolic: number; diastolic: number; timestamp: Date };
        bloodSugar?: { value: number; timestamp: Date };
        stepsToday?: number;
        waterIntake?: number;
    };
    medicineAdherence: {
        totalMedicines: number;
        takenToday: number;
        missedToday: number;
        nextDue?: { name: string; time: string };
    };
    alerts: HealthAlert[];
}

export interface HealthAlert {
    id: string;
    type: 'high_bp' | 'low_bp' | 'high_sugar' | 'low_sugar' | 'missed_medicine' | 'low_activity';
    severity: 'warning' | 'critical';
    message: string;
    timestamp: Date;
}

// Link record for child
interface ChildLink {
    linkCode: string;
    parentName: string;
    relationship: 'mother' | 'father' | 'guardian';
    linkedAt: string;
}

class FamilyService {
    private static instance: FamilyService;

    static getInstance(): FamilyService {
        if (!FamilyService.instance) {
            FamilyService.instance = new FamilyService();
        }
        return FamilyService.instance;
    }

    // Save parent profile to be discoverable by link code
    saveParentProfile(profile: SharedParentProfile): void {
        const profiles = this.getAllParentProfiles();
        profiles[profile.linkCode] = profile;
        localStorage.setItem(PARENT_PROFILES_KEY, JSON.stringify(profiles));
    }

    // Get all stored parent profiles
    private getAllParentProfiles(): Record<string, SharedParentProfile> {
        const stored = localStorage.getItem(PARENT_PROFILES_KEY);
        return stored ? JSON.parse(stored) : {};
    }

    // Get a parent profile by link code
    getParentByLinkCode(linkCode: string): SharedParentProfile | null {
        const profiles = this.getAllParentProfiles();
        return profiles[linkCode.toUpperCase()] || null;
    }

    // Child links to parent using code
    linkParent(childId: string, linkCode: string, relationship: 'mother' | 'father' | 'guardian'): boolean {
        const parent = this.getParentByLinkCode(linkCode);

        if (!parent) {
            console.error('No parent found with link code:', linkCode);
            return false;
        }

        // Save the link for this child
        const links = this.getChildLinks(childId);

        // Check if already linked
        if (links.find(l => l.linkCode === linkCode.toUpperCase())) {
            console.log('Already linked to this parent');
            return true;
        }

        links.push({
            linkCode: linkCode.toUpperCase(),
            parentName: parent.name,
            relationship,
            linkedAt: new Date().toISOString()
        });

        localStorage.setItem(`${LINKED_CHILDREN_KEY}_${childId}`, JSON.stringify(links));
        return true;
    }

    // Get all links for a child
    getChildLinks(childId: string): ChildLink[] {
        const stored = localStorage.getItem(`${LINKED_CHILDREN_KEY}_${childId}`);
        return stored ? JSON.parse(stored) : [];
    }

    // Remove a parent link
    unlinkParent(childId: string, linkCode: string): void {
        const links = this.getChildLinks(childId).filter(l => l.linkCode !== linkCode);
        localStorage.setItem(`${LINKED_CHILDREN_KEY}_${childId}`, JSON.stringify(links));
    }

    // Get health summaries for all linked parents
    getLinkedParentsSummaries(childId: string): ParentHealthSummary[] {
        const links = this.getChildLinks(childId);
        const summaries: ParentHealthSummary[] = [];

        for (const link of links) {
            const parent = this.getParentByLinkCode(link.linkCode);
            if (parent) {
                summaries.push(this.convertToSummary(parent, link.relationship));
            }
        }

        return summaries;
    }

    // Convert stored profile to summary
    private convertToSummary(profile: SharedParentProfile, relationship: 'mother' | 'father' | 'guardian'): ParentHealthSummary {
        const now = new Date();

        return {
            linkCode: profile.linkCode,
            name: profile.name,
            relationship,
            lastUpdated: new Date(profile.lastUpdated),
            healthStats: {
                bloodPressure: profile.healthData.bloodPressure ? {
                    systolic: profile.healthData.bloodPressure.systolic,
                    diastolic: profile.healthData.bloodPressure.diastolic,
                    timestamp: new Date(profile.healthData.bloodPressure.timestamp)
                } : undefined,
                bloodSugar: profile.healthData.bloodSugar ? {
                    value: profile.healthData.bloodSugar.value,
                    timestamp: new Date(profile.healthData.bloodSugar.timestamp)
                } : undefined,
                stepsToday: profile.healthData.stepsToday,
                waterIntake: profile.healthData.waterIntake,
            },
            medicineAdherence: {
                totalMedicines: profile.medicines.total,
                takenToday: profile.medicines.taken,
                missedToday: profile.medicines.total - profile.medicines.taken,
                nextDue: profile.medicines.nextDue,
            },
            alerts: this.generateAlerts(profile),
        };
    }

    // Generate alerts based on health data
    private generateAlerts(profile: SharedParentProfile): HealthAlert[] {
        const alerts: HealthAlert[] = [];

        // Check blood pressure
        if (profile.healthData.bloodPressure) {
            const { systolic, diastolic } = profile.healthData.bloodPressure;
            if (systolic >= 140 || diastolic >= 90) {
                alerts.push({
                    id: this.generateId(),
                    type: 'high_bp',
                    severity: 'warning',
                    message: `${profile.name} has elevated blood pressure`,
                    timestamp: new Date(),
                });
            }
        }

        // Check missed medicines
        if (profile.medicines.taken < profile.medicines.total) {
            alerts.push({
                id: this.generateId(),
                type: 'missed_medicine',
                severity: 'warning',
                message: `${profile.name} has ${profile.medicines.total - profile.medicines.taken} pending medicine(s)`,
                timestamp: new Date(),
            });
        }

        // Check activity
        if (profile.healthData.stepsToday < 2000) {
            alerts.push({
                id: this.generateId(),
                type: 'low_activity',
                severity: 'warning',
                message: `${profile.name} has low activity today`,
                timestamp: new Date(),
            });
        }

        return alerts;
    }

    // Clear all links for a child (for testing/reset)
    clearChildLinks(childId: string): void {
        localStorage.removeItem(`${LINKED_CHILDREN_KEY}_${childId}`);
    }

    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

export default FamilyService;
