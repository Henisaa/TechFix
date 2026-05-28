import { useState } from 'react';
import { FiCreditCard, FiLock, FiCalendar } from 'react-icons/fi';

const luhn = (num) => {
  const digits = num.replace(/\D/g, '');
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return digits.length >= 13 && sum % 10 === 0;
};

const formatCardNumber = (val) => {
  const digits = val.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (val) => {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
};

const CardPaymentForm = ({ onCardData, disabled }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  const rawDigits = cardNumber.replace(/\s/g, '');
  const isLuhnValid = rawDigits.length === 16 && luhn(rawDigits);
  const isExpiryValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry);
  const isCvvValid = /^\d{3,4}$/.test(cvv);

  const masked = rawDigits.length === 16
    ? `****-****-****-${rawDigits.slice(-4)}`
    : '';

  const handleChange = (field, val) => {
    const updates = { cardNumber: rawDigits, cvv, expiry, cardHolder };
    if (field === 'cardNumber') updates.cardNumber = val.replace(/\s/g, '');
    if (field === 'cvv') updates.cvv = val;
    if (field === 'expiry') updates.expiry = val;
    if (field === 'cardHolder') updates.cardHolder = val;

    const newMasked = updates.cardNumber.length === 16
      ? `****-****-****-${updates.cardNumber.slice(-4)}`
      : '';

    const valid =
      updates.cardNumber.length === 16 &&
      luhn(updates.cardNumber) &&
      /^(0[1-9]|1[0-2])\/\d{2}$/.test(updates.expiry) &&
      /^\d{3,4}$/.test(updates.cvv) &&
      updates.cardHolder.trim().length >= 2;

    onCardData({ masked: newMasked, valid });
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative rounded-2xl p-5 transition-all duration-300 ${
          rawDigits.length === 16
            ? isLuhnValid
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
              : 'bg-gradient-to-br from-red-400 to-rose-600'
            : 'bg-gradient-to-br from-slate-700 to-slate-900'
        } text-white shadow-xl overflow-hidden`}
      >
        <div className="absolute top-3 right-3 opacity-30">
          <svg viewBox="0 0 50 50" className="w-16 h-16 fill-white">
            <circle cx="18" cy="25" r="18" />
            <circle cx="32" cy="25" r="18" />
          </svg>
        </div>
        <FiCreditCard className="text-3xl mb-4 opacity-80" />
        <p className="font-mono text-xl tracking-widest mb-4">
          {cardNumber || '•••• •••• •••• ••••'}
        </p>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs uppercase opacity-60 mb-0.5">Titular</p>
            <p className="font-semibold text-sm tracking-wide uppercase">
              {cardHolder || 'NOMBRE APELLIDO'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase opacity-60 mb-0.5">Vence</p>
            <p className="font-semibold text-sm">{expiry || 'MM/YY'}</p>
          </div>
        </div>
        {rawDigits.length === 16 && !isLuhnValid && (
          <p className="mt-3 text-xs bg-white/20 rounded-lg px-3 py-1.5 font-medium">
            ⚠ Número de tarjeta inválido
          </p>
        )}
        {isLuhnValid && rawDigits.length === 16 && (
          <p className="mt-3 text-xs bg-white/20 rounded-lg px-3 py-1.5 font-medium">
            ✓ Tarjeta válida
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nombre del Titular *
        </label>
        <input
          type="text"
          required
          disabled={disabled}
          placeholder="Como aparece en la tarjeta"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm uppercase tracking-wide disabled:bg-slate-50"
          value={cardHolder}
          onChange={(e) => {
            const v = e.target.value.toUpperCase().slice(0, 26);
            setCardHolder(v);
            handleChange('cardHolder', v);
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
          <FiCreditCard className="text-xs" /> Número de Tarjeta *
        </label>
        <input
          type="text"
          required
          disabled={disabled}
          inputMode="numeric"
          placeholder="0000 0000 0000 0000"
          maxLength={19}
          className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-mono tracking-widest disabled:bg-slate-50 ${
            rawDigits.length === 16
              ? isLuhnValid
                ? 'border-emerald-400 bg-emerald-50'
                : 'border-red-400 bg-red-50'
              : 'border-slate-300'
          }`}
          value={cardNumber}
          onChange={(e) => {
            const v = formatCardNumber(e.target.value);
            setCardNumber(v);
            handleChange('cardNumber', v);
          }}
        />
        {rawDigits.length > 0 && rawDigits.length < 16 && (
          <p className="text-xs text-slate-400 mt-1">{16 - rawDigits.length} dígitos restantes</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
            <FiCalendar className="text-xs" /> Vencimiento *
          </label>
          <input
            type="text"
            required
            disabled={disabled}
            inputMode="numeric"
            placeholder="MM/YY"
            maxLength={5}
            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-mono disabled:bg-slate-50 ${
              expiry.length === 5
                ? isExpiryValid
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-red-400 bg-red-50'
                : 'border-slate-300'
            }`}
            value={expiry}
            onChange={(e) => {
              const v = formatExpiry(e.target.value);
              setExpiry(v);
              handleChange('expiry', v);
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
            <FiLock className="text-xs" /> CVV *
          </label>
          <input
            type="password"
            required
            disabled={disabled}
            inputMode="numeric"
            placeholder="•••"
            maxLength={4}
            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-mono disabled:bg-slate-50 ${
              cvv.length >= 3
                ? isCvvValid
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-red-400 bg-red-50'
                : 'border-slate-300'
            }`}
            value={cvv}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 4);
              setCvv(v);
              handleChange('cvv', v);
            }}
          />
        </div>
      </div>

      <p className="text-xs text-slate-400 flex items-center gap-1">
        <FiLock className="text-xs" />
        Simulación de pago — tus datos no se almacenan ni se realizan cargos
      </p>
    </div>
  );
};

export default CardPaymentForm;
