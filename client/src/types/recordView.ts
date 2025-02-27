export interface LayoutSection {
  id: string;
  title: string;
  columns: number; // 1, 2, or 3
  order: number;
  components: LayoutComponent[];
}

export interface LayoutComponent {
  id: string;
  type: 'field' | 'related_list' | 'widget' | 'custom';
  title?: string;
  fieldId?: string; // For field type
  relatedTableId?: string; // For related_list type
  widgetId?: string; // For widget type
  customComponent?: string; // For custom type
  width: 'full' | '1/2' | '1/3' | '2/3';
  order: number;
  settings?: Record<string, any>;
}

export interface TableLayout {
  id: string;
  tableId: string;
  name: string;
  isDefault: boolean;
  sections: LayoutSection[];
  createdAt: string;
  updatedAt: string;
} 