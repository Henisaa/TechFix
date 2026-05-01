import ProductCard from '../components/ui/ProductCard';

const productosMock = [
  {
    cod_repuesto: "GPU-RTX3060-001",
    nombre_repuesto: "Tarjeta Gráfica NVIDIA RTX 3060",
    categoria: "GPU / Tarjeta de Video",
    descripcion: "Tarjeta gráfica de escritorio ideal para gaming y estaciones de trabajo. 8GB GDDR6, soporte DirectX 12, compatible con sistemas SFF con adaptador.",
    precio_clp: 320000,
    stock: 5,
    image: "https://placehold.co/300x200?text=GPU+RTX+3060"
  },
  {
    cod_repuesto: "SSD-SAM970-1TB",
    nombre_repuesto: "SSD NVMe Samsung 970 EVO 1TB",
    categoria: "Almacenamiento",
    descripcion: "Disco de estado sólido NVMe M.2 de alta velocidad. Lectura hasta 3.500 MB/s. Compatible con laptops y PCs de escritorio.",
    precio_clp: 89000,
    stock: 12,
    image: "https://placehold.co/300x200?text=SSD+Samsung+1TB"
  },
  {
    cod_repuesto: "PANT-IP13-LCD",
    nombre_repuesto: "Pantalla LCD iPhone 13",
    categoria: "Pantalla / Display (Celular)",
    descripcion: "Pantalla de repuesto original para iPhone 13. Incluye digitalizador táctil y cámara frontal integrada. Resolución Super Retina XDR.",
    precio_clp: 95000,
    stock: 3,
    image: "https://placehold.co/300x200?text=Pantalla+iPhone+13"
  },
  {
    cod_repuesto: "RAM-KIN-16GB-3200",
    nombre_repuesto: "RAM DDR4 16GB 3200MHz Kingston",
    categoria: "Memoria RAM",
    descripcion: "Módulo de memoria RAM DDR4 de 16GB a 3200MHz. Compatible con la mayoría de placas madre Intel y AMD. Ideal para gaming y trabajo multitarea.",
    precio_clp: 42000,
    stock: 20,
    image: "https://placehold.co/300x200?text=RAM+16GB+DDR4"
  },
  {
    cod_repuesto: "BAT-SAMA54-5000",
    nombre_repuesto: "Batería Samsung Galaxy A54",
    categoria: "Batería (Celular)",
    descripcion: "Batería de repuesto original 5.000 mAh para Samsung Galaxy A54. Incluye adhesivo de instalación y herramientas básicas.",
    precio_clp: 28000,
    stock: 8,
    image: "https://placehold.co/300x200?text=Bateria+Galaxy+A54"
  },
  {
    cod_repuesto: "COOL-NOC-NH-U12S",
    nombre_repuesto: "Cooler CPU Noctua NH-U12S",
    categoria: "Refrigeración",
    descripcion: "Disipador de CPU tower de alto rendimiento. Compatible con sockets Intel LGA1700/1200 y AMD AM4/AM5. Incluye pasta térmica NT-H1.",
    precio_clp: 55000,
    stock: 4,
    image: "https://placehold.co/300x200?text=Cooler+Noctua"
  }
];

const Catalogo = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">Catálogo de Repuestos</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Encuentra componentes originales y certificados para asegurar el mejor rendimiento de tus equipos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productosMock.map((producto, idx) => (
            <ProductCard key={idx} product={producto} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Catalogo;
