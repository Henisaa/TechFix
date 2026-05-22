package com.techfix.payment.pago.service;

import com.techfix.payment.pago.model.Pago;

public interface PagoService {

    Pago crearPago(Long idVisitaTecnica, Pago pago, String operatorUsername);

    Pago verPago(Long id);

    Pago alterarPago(Long id, Pago pagoDetalles, String operatorUsername);
}
