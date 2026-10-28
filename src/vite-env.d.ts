/// <reference types="vite/client" />

declare module 'virtual:prototype-requirements' {
  import type { PrototypeRequirement } from './data/prototypeRequirements';

  const requirements: PrototypeRequirement[];
  export default requirements;
}
