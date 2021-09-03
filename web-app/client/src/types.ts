export type attribute = { name: string; value: number };
export type dependencyEncoded = { lhs: number[]; rhs: number };
export type dependency = { lhs: attribute[]; rhs: attribute };
export type taskStatus =
  | "UNSCHEDULED"
  | "PROCESSING"
  | "COMPLETED"
  | "SERVER ERROR"
  | "INCORRECT INPUT DATA";
export type parameters = {
  algName: string;
  semicolon: string;
  errorPercent: number;
  hasHeader: boolean;
  maxLHS: number;
};
