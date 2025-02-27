export interface TableField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  unique: boolean;
  defaultValue?: string;
  description?: string;
  validation?: string;
  options?: string;
  lookupConfig?: any;
  currencyConfig?: any;
  formula?: string;
  timezone?: string;
}

export interface DatabaseTable {
  id: string;
  name: string;
  label: string;
  description: string;
  fields: TableField[];
  createdAt: string;
  updatedAt: string;
} 