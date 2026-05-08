import { useState, useCallback } from 'react';
import { inventoryApi } from '../services/api';
import toast from 'react-hot-toast';

export const useInventario = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProductos = useCallback(async (page = 0, size = 50) => {
    setLoading(true);
    try {
      const response = await inventoryApi.get('', { params: { page, size } });
      const data = response.data;
      
      setProductos(data.content || (Array.isArray(data) ? data : []));
    } catch (error) {
      console.error('Error fetching productos:', error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await inventoryApi.get('/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchCategorias = useCallback(async () => {
    try {
      const response = await inventoryApi.get('/categories');
      setCategorias(response.data || []);
    } catch {
      setCategorias([]);
    }
  }, []);

  const createProducto = async (form) => {
    setLoading(true);
    try {
      const payload = {
        sku: form.sku,
        name: form.name,
        description: form.description || '',
        brand: form.brand || '',
        costPrice: parseFloat(form.costPrice || form.salePrice || 0),
        salePrice: parseFloat(form.salePrice || form.price || 0),
        quantityInStock: parseInt(form.quantityInStock || form.stock || 0),
        minStockLevel: parseInt(form.minStockLevel || form.minStock || 2),
        status: 'ACTIVE',
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      };
      const response = await inventoryApi.post('', payload);
      toast.success('Producto agregado al catálogo');
      await fetchProductos();
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProducto = async (id, form) => {
    setLoading(true);
    try {
      const payload = {
        sku: form.sku,
        name: form.name,
        description: form.description || '',
        costPrice: parseFloat(form.costPrice || form.salePrice || 0),
        salePrice: parseFloat(form.salePrice || form.price || 0),
        quantityInStock: parseInt(form.quantityInStock || form.stock || 0),
        minStockLevel: parseInt(form.minStockLevel || form.minStock || 2),
        status: 'ACTIVE',
      };
      const response = await inventoryApi.put(`/${id}`, payload);
      toast.success('Producto actualizado');
      await fetchProductos();
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProducto = async (id) => {
    setLoading(true);
    try {
      await inventoryApi.delete(`/${id}`);
      toast.success('Producto eliminado del catálogo');
      await fetchProductos();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    productos,
    categorias,
    stats,
    loading,
    fetchProductos,
    fetchCategorias,
    fetchStats,
    createProducto,
    updateProducto,
    deleteProducto,
  };
};
