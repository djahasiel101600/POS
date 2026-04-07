import uuid
from decimal import Decimal
from django.db import transaction
from django.utils import timezone

from products.models import Product
from inventory.services import deduct_stock_for_sale, return_stock_for_refund
from audit_logs.services import log_action
from common.exceptions import InsufficientStockError, InvalidOperationError
from .models import Sale, SaleItem, Payment, SaleStatus


def _generate_receipt_number() -> str:
    from django.utils import timezone
    now = timezone.now()
    return f'REC-{now.strftime("%Y%m%d")}-{uuid.uuid4().hex[:6].upper()}'


@transaction.atomic
def create_sale(items_data: list, payment_method: str, cashier,
                discount_amount: Decimal = Decimal('0'),
                cash_received: Decimal = None,
                notes: str = '',
                reference_number: str = '') -> Sale:
    """
    Create a sale atomically:
    1. Validate stock for each item
    2. Calculate totals on the backend (never trust frontend totals)
    3. Create Sale + SaleItems
    4. Deduct stock & record inventory movements
    5. Log audit
    """
    # Load and lock products
    product_ids = [item['product_id'] for item in items_data]
    products = {p.id: p for p in Product.objects.select_for_update().filter(id__in=product_ids, is_active=True)}

    if len(products) != len(product_ids):
        raise InvalidOperationError('One or more products not found or inactive.')

    # Calculate subtotal
    subtotal = Decimal('0')
    sale_items = []
    for item_data in items_data:
        product = products[item_data['product_id']]
        qty = item_data['quantity']
        line_discount = Decimal(str(item_data.get('line_discount', 0)))

        if product.stock_quantity < qty:
            raise InsufficientStockError(f'Insufficient stock for {product.name}.')

        unit_price = product.selling_price
        line_total = (unit_price * qty) - line_discount
        subtotal += line_total
        sale_items.append({
            'product': product,
            'product_name_snapshot': product.name,
            'unit_price': unit_price,
            'quantity': qty,
            'line_discount': line_discount,
            'line_total': line_total,
        })

    # Backend tax calculation (fetch from store settings)
    try:
        from settings_app.models import Store
        store = Store.objects.first()
        tax_rate = store.tax_rate if store else Decimal('0')
    except Exception:
        tax_rate = Decimal('0')

    taxable_amount = subtotal - discount_amount
    tax_amount = (taxable_amount * tax_rate / 100).quantize(Decimal('0.01'))
    total_amount = taxable_amount + tax_amount

    # Calculate change for cash
    change_amount = None
    if payment_method == 'cash' and cash_received is not None:
        change_amount = Decimal(str(cash_received)) - total_amount
        if change_amount < 0:
            raise InvalidOperationError('Cash received is less than total amount.')

    # Create Sale
    sale = Sale.objects.create(
        receipt_number=_generate_receipt_number(),
        cashier=cashier,
        subtotal=subtotal,
        discount_amount=discount_amount,
        tax_amount=tax_amount,
        total_amount=total_amount,
        payment_method=payment_method,
        cash_received=cash_received,
        change_amount=change_amount,
        status=SaleStatus.COMPLETED,
        notes=notes,
    )

    # Create SaleItems and deduct stock
    for item in sale_items:
        SaleItem.objects.create(
            sale=sale,
            product=item['product'],
            product_name_snapshot=item['product_name_snapshot'],
            unit_price=item['unit_price'],
            quantity=item['quantity'],
            line_discount=item['line_discount'],
            line_total=item['line_total'],
        )
        deduct_stock_for_sale(item['product'], item['quantity'], sale.id, cashier)

    # Create Payment record
    Payment.objects.create(
        sale=sale,
        payment_method=payment_method,
        amount=total_amount,
        reference_number=reference_number,
    )

    # Audit log
    log_action(
        user=cashier,
        action='create_sale',
        entity_type='sale',
        entity_id=sale.id,
        details={'receipt_number': sale.receipt_number, 'total': str(total_amount)},
    )

    return sale


@transaction.atomic
def void_sale(sale: Sale, voided_by) -> Sale:
    if sale.status != SaleStatus.COMPLETED:
        raise InvalidOperationError(f'Cannot void a sale with status: {sale.status}.')

    sale.status = SaleStatus.VOIDED
    sale.voided_by = voided_by
    sale.voided_at = timezone.now()
    sale.save(update_fields=['status', 'voided_by', 'voided_at'])

    # Return stock for each item
    for item in sale.items.select_related('product').all():
        return_stock_for_refund(item.product, item.quantity, sale.id, voided_by)

    log_action(
        user=voided_by,
        action='void_sale',
        entity_type='sale',
        entity_id=sale.id,
        details={'receipt_number': sale.receipt_number},
    )
    return sale
