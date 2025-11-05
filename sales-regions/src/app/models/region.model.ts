export interface NodeData {
  nodeId: number;
  code: string;
  name: string;
  parentId: number | null;
  id: number;
  status: number;
  createdBy?: number;
  createdTime?: string;
  modifiedBy?: number | null;
  modifiedTime?: string | null;
}

export interface HierarchyNode {
  node: NodeData;
  salesPoints: any[] | null;
  nodes: HierarchyNode[];
  hierarchyCode: string | null;
}


export interface Region {
  id: number;
  nodeId: number;
  code: string;
  name: string;
}

export interface Area {
  id: number;
  nodeId: number;
  code: string;
  name: string;
  regionId: number;
}

export interface Territory {
  id: number;
  nodeId: number;
  code: string;
  name: string;
  areaId: number;
}

export interface SalesPoint {
  id: number;
  salesPointId: number;
  code: string;
  name: string;
  banglaName: string;
  officeAddress: string;
  contactNo: string;
  emailAddress: string;
  townName: string;
  territoryId: number;
}

// PrimeNG dropdown/multiselect options
export interface SelectOption {
  label: string;
  value: number;
}
