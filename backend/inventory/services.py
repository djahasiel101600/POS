from django.db import transaction
from products.models import Product
from .models import InventoryMovement, MovementType
from common.exceptions import InsufficientStockError


def _record_movement(product: Product, movement_type: str, quantity: int,
                     user, reference_type=None, reference_id=None, notes=None):
    InventoryMovement.objects.create(
        product=product,
        movement_type=movement_type,
        quantity=quantity,
        reference_type=reference_type,
        reference_id=reference_id,
        notes=notes,
        created_by=user,
    )


@transaction.atomic
def stock_in(product_id: int, quantity: int, user, notes: str = '') -> Product:
    product = Product.objects.select_for_update().get(pk=product_id)
    product.stock_quantity += quantity
    product.save(update_fields=['stock_quantity'])
    _record_movement(product, MovementType.STOCK_IN, quantity, user, notes=notes)
    return product


@transaction.atomic
def stock_adjustment(product_id: int, quantity: int, user, notes: str) -> Product:
    """Adjust stock by a delta (positive or negative). Notes/reason is required."""
    product = Product.objects.select_for_update().get(pk=product_id)
    new_qty = product.stock_quantity + quantity
    if new_qty < 0:
        raise InsufficientStockError(f'Adjustment would result in negative stock for {product.name}.')
    product.stock_quantity = new_qty
    product.save(update_fields=['stock_quantity'])
    _record_movement(product, MovementType.ADJUSTMENT, quantity, user, notes=notes)
    return product


@transaction.atomic
def deduct_stock_for_sale(product: Product, quantity: int, sale_id: int, user) -> None:
    """Deduct stock as part of a sale transaction. Must be called within an atomic block."""
    if product.stock_quantity < quantity:
        raise InsufficientStockError(f'Insufficient stock for {product.name}.')
    product.stock_quantity -= quantity
    product.save(update_fields=['stock_quantity'])
    _record_movement(
        product, MovementType.SALE_DEDUCTION, -quantity, user,
        reference_type='sale', reference_id=sale_id
    )


@transaction.atomic
def return_stock_for_refund(product: Product, quantity: int, sale_id: int, user) -> None:
    """Return stock as part of a refund. Must be called within an atomic block."""
    product.stock_quantity += quantity
    product.save(update_fields=['stock_quantity'])
    _record_movement(
        product, MovementType.REFUND_RETURN, quantity, user,
        reference_type='sale', reference_id=sale_id
    )
