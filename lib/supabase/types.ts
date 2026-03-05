export interface Profile {
  id: string
  nombre: string
  email: string
  created_at: string
}

export interface Categoria {
  id: number
  nombre: string
  descripcion: string | null
  created_at: string
}

export interface Producto {
  id: number
  nombre: string
  categoria_id: number | null
  precio: number
  precio_compra: number | null
  stock: number
  codigo_barras: string | null
  activo: boolean
  created_at: string
  categorias?: { id: number; nombre: string } | null
}

export interface VentaDetalle {
  id: number
  venta_id: number
  producto_id: number | null
  cantidad: number
  precio_unitario: number
  subtotal: number
  productos?: { nombre: string } | null
}

export interface Venta {
  id: number
  cliente_nombre: string | null
  total: number
  fecha: string
  created_at: string
  venta_detalle?: VentaDetalle[]
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; nombre: string; email: string; created_at: string }
        Insert: { id: string; nombre: string; email: string }
        Update: { nombre?: string; email?: string }
        Relationships: []
      }
      categorias: {
        Row: { id: number; nombre: string; descripcion: string | null; created_at: string }
        Insert: { nombre: string; descripcion?: string | null }
        Update: { nombre?: string; descripcion?: string | null }
        Relationships: []
      }
      productos: {
        Row: { id: number; nombre: string; categoria_id: number | null; precio: number; precio_compra: number | null; stock: number; codigo_barras: string | null; activo: boolean; created_at: string }
        Insert: { nombre: string; categoria_id?: number | null; precio: number; precio_compra?: number | null; stock?: number; codigo_barras?: string | null; activo?: boolean }
        Update: { nombre?: string; categoria_id?: number | null; precio?: number; precio_compra?: number | null; stock?: number; codigo_barras?: string | null; activo?: boolean }
        Relationships: [{ foreignKeyName: 'productos_categoria_id_fkey'; columns: ['categoria_id']; referencedRelation: 'categorias'; referencedColumns: ['id'] }]
      }
      ventas: {
        Row: { id: number; cliente_nombre: string | null; total: number; fecha: string; created_at: string }
        Insert: { cliente_nombre?: string | null; total: number; fecha?: string }
        Update: { cliente_nombre?: string | null; total?: number; fecha?: string }
        Relationships: []
      }
      venta_detalle: {
        Row: { id: number; venta_id: number | null; producto_id: number | null; cantidad: number; precio_unitario: number; subtotal: number }
        Insert: { venta_id?: number | null; producto_id?: number | null; cantidad: number; precio_unitario: number }
        Update: { cantidad?: number; precio_unitario?: number }
        Relationships: [
          { foreignKeyName: 'venta_detalle_venta_id_fkey'; columns: ['venta_id']; referencedRelation: 'ventas'; referencedColumns: ['id'] },
          { foreignKeyName: 'venta_detalle_producto_id_fkey'; columns: ['producto_id']; referencedRelation: 'productos'; referencedColumns: ['id'] }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
