package com.techfix.payment.pago.service;

import com.techfix.payment.pago.model.Pago;

import java.util.List;

public interface PagoService {

    Pago crearPago(Long idVisitaTecnica, Pago pago, String operatorUsername);

    Pago verPago(Long id);

    Pago alterarPago(Long id, Pago pagoDetalles, String operatorUsername);

    List<Pago> listarTodos();
}
