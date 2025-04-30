export interface Competitor {
  id: string;
  name: string;
  logo: string;
  industry: Industry;
  relationshipStrength: RelationshipStrength;
  relationshipDetails: RelationshipDetail[];
}

export interface RelationshipDetail {
  id: string;
  title: string;
  description: string;
  year: number;
  evidenceUrl?: string;
  evidenceType: 'article' | 'case_study' | 'press_release' | 'job_posting' | 'linkedin';
}

export type Industry = 
  | 'IT Services' 
  | 'Consulting' 
  | 'Technology' 
  | 'Business Process Outsourcing' 
  | 'System Integration';

export type RelationshipStrength = 'strong' | 'moderate' | 'weak';