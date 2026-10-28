import requirements from 'virtual:prototype-requirements';

export interface PrototypeRequirement {
  id: string;
  surface: string;
  route: string;
  order: number;
  title: string;
  functionalRequirement: string;
  businessRules: string[];
}

export const prototypeRequirements: PrototypeRequirement[] = requirements;

export const prototypeRequirementById = new Map(
  prototypeRequirements.map((requirement) => [requirement.id, requirement]),
);
