package com.techfix.stock.service;

import com.techfix.stock.dto.ProductRequest;
import com.techfix.stock.dto.ProductResponse;
import com.techfix.stock.dto.StockAdjustmentRequest;
import com.techfix.stock.dto.StockMovementRequest;
import com.techfix.stock.dto.StockMovementResponse;
import com.techfix.stock.exception.ConflictException;
import com.techfix.stock.exception.InsufficientStockException;
import com.techfix.stock.exception.ResourceNotFoundException;
import com.techfix.stock.model.MovementType;
import com.techfix.stock.model.Product;
import com.techfix.stock.model.ProductStatus;
import com.techfix.stock.model.StockMovement;
import com.techfix.stock.repository.ProductRepository;
import com.techfix.stock.repository.StockMovementRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductService — Unit Tests")
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private StockMovementRepository movementRepository;

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private ProductService productService;

    // create

    @Test
    @DisplayName("create: SKU ya existe → ConflictException")
    void create_skuExistente_lanzaConflict() {
        ProductRequest req = buildRequest("SKU-DUPL", null, 0);
        when(productRepository.existsBySku("SKU-DUPL")).thenReturn(true);

        assertThatThrownBy(() -> productService.create(req))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("SKU already in use");
    }

    @Test
    @DisplayName("create: barcode ya existe → ConflictException")
    void create_barcodeExistente_lanzaConflict() {
        ProductRequest req = buildRequest("SKU-OK", "BAR-DUPL", 0);
        when(productRepository.existsBySku("SKU-OK")).thenReturn(false);
        when(productRepository.existsByBarcode("BAR-DUPL")).thenReturn(true);

        assertThatThrownBy(() -> productService.create(req))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Barcode already in use");
    }

    @Test
    @DisplayName("create: stock inicial > 0 → guarda producto y registra movimiento PURCHASE")
    void create_stockInicialPositivo_guardaYRegistraMovimiento() {
        ProductRequest req = buildRequest("SKU-NEW", null, 10);
        Product savedProduct = buildProduct(1L, "SKU-NEW", 10);

        when(productRepository.existsBySku("SKU-NEW")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);
        when(movementRepository.save(any(StockMovement.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductResponse response = productService.create(req);

        assertThat(response.getSku()).isEqualTo("SKU-NEW");
        // Debe guardar el producto + 1 movimiento inicial de compra
        verify(productRepository, times(1)).save(any(Product.class));
        verify(movementRepository, times(1)).save(any(StockMovement.class));
    }

    @Test
    @DisplayName("create: stock inicial = 0 → guarda producto sin registrar movimiento")
    void create_stockInicialCero_noCreaMovimiento() {
        ProductRequest req = buildRequest("SKU-ZERO", null, 0);
        Product savedProduct = buildProduct(1L, "SKU-ZERO", 0);

        when(productRepository.existsBySku("SKU-ZERO")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        productService.create(req);

        verify(movementRepository, never()).save(any());
    }

    // update

    @Test
    @DisplayName("update: nuevo SKU ya lo usa otro producto → ConflictException")
    void update_skuDuplicado_lanzaConflict() {
        Product existing = buildProduct(1L, "SKU-OLD", 5);
        when(productRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(productRepository.existsBySku("SKU-TAKEN")).thenReturn(true);

        ProductRequest req = buildRequest("SKU-TAKEN", null, 5);

        assertThatThrownBy(() -> productService.update(1L, req))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("SKU already in use");
    }

    @Test
    @DisplayName("update: nuevo barcode ya lo usa otro producto → ConflictException")
    void update_barcodeDuplicado_lanzaConflict() {
        Product existing = buildProduct(1L, "SKU-OK", 5);
        existing.setBarcode("BAR-OLD");
        when(productRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(productRepository.existsByBarcode("BAR-TAKEN")).thenReturn(true);

        ProductRequest req = buildRequest("SKU-OK", "BAR-TAKEN", 5);

        assertThatThrownBy(() -> productService.update(1L, req))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Barcode already in use");
    }

    // delete

    @Test
    @DisplayName("delete: producto existente → soft delete (status = INACTIVE)")
    void delete_productoExistente_seteaInactive() {
        Product product = buildProduct(1L, "SKU-DEL", 5);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        productService.delete(1L);

        assertThat(product.getStatus()).isEqualTo(ProductStatus.INACTIVE);
        verify(productRepository).save(product);
    }

    // busquedaPorId

    @Test
    @DisplayName("findById: ID inexistente → ResourceNotFoundException")
    void findById_noExiste_lanzaNotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    // registrarMovimiento

    @Test
    @DisplayName("registerMovement: quantity = 0 → IllegalArgumentException")
    void registerMovement_cantidadCero_lanzaIllegalArgument() {
        StockMovementRequest req = new StockMovementRequest();
        req.setQuantity(0);
        req.setProductId(1L);

        assertThatThrownBy(() -> productService.registerMovement(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("zero");
    }

    @Test
    @DisplayName("registerMovement: SALE con stock insuficiente → InsufficientStockException")
    void registerMovement_ventaStockInsuficiente_lanzaInsuficiente() {
        Product product = buildProduct(1L, "SKU-LOW", 3);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        StockMovementRequest req = new StockMovementRequest();
        req.setProductId(1L);
        req.setMovementType(MovementType.SALE);
        req.setQuantity(10); // de ejemplo quiere vender 10 pero solo hay 3

        assertThatThrownBy(() -> productService.registerMovement(req))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("Insufficient stock");
    }

    @Test
    @DisplayName("registerMovement: SALE válida → descuenta stock y registra movimiento")
    void registerMovement_ventaValida_descontaStock() {
        Product product = buildProduct(1L, "SKU-OK", 20);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(movementRepository.save(any())).thenAnswer(inv -> {
            StockMovement m = inv.getArgument(0);
            m.setProduct(product);
            return m;
        });

        StockMovementRequest req = new StockMovementRequest();
        req.setProductId(1L);
        req.setMovementType(MovementType.SALE);
        req.setQuantity(5);

        StockMovementResponse response = productService.registerMovement(req);

        assertThat(product.getQuantityInStock()).isEqualTo(15);
        assertThat(response.getQuantityAfter()).isEqualTo(15);
        assertThat(response.getQuantityBefore()).isEqualTo(20);
    }

    @Test
    @DisplayName("registerMovement: PURCHASE válida → suma stock y registra movimiento")
    void registerMovement_compraValida_sumaStock() {
        Product product = buildProduct(1L, "SKU-OK", 10);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(movementRepository.save(any())).thenAnswer(inv -> {
            StockMovement m = inv.getArgument(0);
            m.setProduct(product);
            return m;
        });

        StockMovementRequest req = new StockMovementRequest();
        req.setProductId(1L);
        req.setMovementType(MovementType.PURCHASE);
        req.setQuantity(8);

        StockMovementResponse response = productService.registerMovement(req);

        assertThat(product.getQuantityInStock()).isEqualTo(18);
        assertThat(response.getQuantityAfter()).isEqualTo(18);
    }

    // ajustamosStock

    @Test
    @DisplayName("adjustStock: ajuste directo → calcula delta y registra movimiento ADJUSTMENT")
    void adjustStock_ajusteDirecto_calculaDeltaYRegistraMovimiento() {
        Product product = buildProduct(1L, "SKU-ADJ", 30);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(movementRepository.save(any())).thenAnswer(inv -> {
            StockMovement m = inv.getArgument(0);
            m.setProduct(product);
            return m;
        });

        StockAdjustmentRequest req = new StockAdjustmentRequest();
        req.setNewQuantity(50);
        req.setReason("Inventario físico");
        req.setCreatedBy("admin");

        StockMovementResponse response = productService.adjustStock(1L, req);

        assertThat(product.getQuantityInStock()).isEqualTo(50);
        assertThat(response.getQuantityBefore()).isEqualTo(30);
        assertThat(response.getQuantityAfter()).isEqualTo(50);
        assertThat(response.getQuantity()).isEqualTo(20); // 50-30
    }

    // Helpers

    private ProductRequest buildRequest(String sku, String barcode, int qty) {
        ProductRequest req = new ProductRequest();
        req.setSku(sku);
        req.setName("Producto " + sku);
        req.setBarcode(barcode);
        req.setCostPrice(BigDecimal.valueOf(1000));
        req.setSalePrice(BigDecimal.valueOf(2000));
        req.setQuantityInStock(qty);
        req.setStatus(ProductStatus.ACTIVE);
        return req;
    }

    private Product buildProduct(Long id, String sku, int qty) {
        return Product.builder()
                .id(id)
                .sku(sku)
                .name("Producto " + sku)
                .quantityInStock(qty)
                .minStockLevel(5)
                .costPrice(BigDecimal.valueOf(1000))
                .salePrice(BigDecimal.valueOf(2000))
                .status(ProductStatus.ACTIVE)
                .build();
    }
}
