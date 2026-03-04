export const dashboardMetrics = {
  ventas: '45,231',
  ventasChange: 12,
  ingresos: 'S/ 28,450',
  ingresosChange: 8,
  ordenes: '1,234',
  ordenesChange: 5,
  clientes: '892',
  clientesChange: -2,
}

export const ventasMensuales = [
  { mes: 'Ene', ventas: 4000 },
  { mes: 'Feb', ventas: 3000 },
  { mes: 'Mar', ventas: 2000 },
  { mes: 'Abr', ventas: 2780 },
  { mes: 'May', ventas: 1890 },
  { mes: 'Jun', ventas: 2390 },
  { mes: 'Jul', ventas: 3490 },
  { mes: 'Ago', ventas: 4200 },
  { mes: 'Sep', ventas: 3800 },
  { mes: 'Oct', ventas: 4100 },
  { mes: 'Nov', ventas: 4500 },
  { mes: 'Dic', ventas: 5200 },
]

export const ventasRecientes = [
  { id: 1, cliente: 'Juan García', producto: 'Laptop Pro', cantidad: 1, total: 'S/ 4,796', fecha: '2024-03-04', estado: 'Completado' },
  { id: 2, cliente: 'María López', producto: 'Mouse Inalámbrico', cantidad: 2, total: 'S/ 177', fecha: '2024-03-03', estado: 'Completado' },
  { id: 3, cliente: 'Carlos Rodríguez', producto: 'Teclado Mecánico', cantidad: 1, total: 'S/ 549', fecha: '2024-03-03', estado: 'Pendiente' },
  { id: 4, cliente: 'Ana Martínez', producto: 'Monitor 27"', cantidad: 1, total: 'S/ 1,289', fecha: '2024-03-02', estado: 'Completado' },
  { id: 5, cliente: 'Pedro Sánchez', producto: 'Hub USB', cantidad: 3, total: 'S/ 277', fecha: '2024-03-02', estado: 'Cancelado' },
]

export const productos = [
  { id: 1, nombre: 'Laptop Pro', categoria: 'Computadoras', precio: 'S/ 4,796', stock: 15, ventas: 234 },
  { id: 2, nombre: 'Mouse Inalámbrico', categoria: 'Periféricos', precio: 'S/ 89', stock: 120, ventas: 1205 },
  { id: 3, nombre: 'Teclado Mecánico', categoria: 'Periféricos', precio: 'S/ 549', stock: 45, ventas: 456 },
  { id: 4, nombre: 'Monitor 27"', categoria: 'Monitores', precio: 'S/ 1,289', stock: 8, ventas: 89 },
  { id: 5, nombre: 'Hub USB', categoria: 'Accesorios', precio: 'S/ 92', stock: 200, ventas: 876 },
  { id: 6, nombre: 'Webcam HD', categoria: 'Accesorios', precio: 'S/ 291', stock: 32, ventas: 123 },
]

export const categorias = [
  { id: 1, nombre: 'Computadoras', productos: 8, ventas: 1200 },
  { id: 2, nombre: 'Periféricos', productos: 15, ventas: 3450 },
  { id: 3, nombre: 'Monitores', productos: 6, ventas: 890 },
  { id: 4, nombre: 'Accesorios', productos: 24, ventas: 2340 },
]

export const distribucionVentas = [
  { nombre: 'Computadoras', valor: 1200 },
  { nombre: 'Periféricos', valor: 3450 },
  { nombre: 'Monitores', valor: 890 },
  { nombre: 'Accesorios', valor: 2340 },
]

export const reportesData = [
  { id: 1, nombre: 'Reporte de Ventas Mensuales', fecha: '2024-03-01', estado: 'Completado', descargas: 234 },
  { id: 2, nombre: 'Análisis de Inventario', fecha: '2024-02-28', estado: 'Completado', descargas: 156 },
  { id: 3, nombre: 'Proyección de Ingresos Q1', fecha: '2024-02-20', estado: 'Completado', descargas: 89 },
  { id: 4, nombre: 'Análisis de Clientes', fecha: '2024-02-15', estado: 'Generando', descargas: 0 },
  { id: 5, nombre: 'Reporte de Rentabilidad', fecha: '2024-02-01', estado: 'Completado', descargas: 234 },
]
