from .models import InventoryMovement


def get_movements(product_id=None, movement_type=None):
    qs = InventoryMovement.objects.select_related('product', 'created_by').all()
    if product_id:
        qs = qs.filter(product_id=product_id)
    if movement_type:
        qs = qs.filter(movement_type=movement_type)
    return qs
