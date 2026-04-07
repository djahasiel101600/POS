from django.db import models
from common.models import TimeStampedModel


class MovementType(models.TextChoices):
    STOCK_IN = 'stock_in', 'Stock In'
    STOCK_OUT = 'stock_out', 'Stock Out'
    ADJUSTMENT = 'adjustment', 'Adjustment'
    SALE_DEDUCTION = 'sale_deduction', 'Sale Deduction'
    REFUND_RETURN = 'refund_return', 'Refund/Return'


class InventoryMovement(TimeStampedModel):
    product = models.ForeignKey(
        'products.Product', on_delete=models.PROTECT, related_name='movements'
    )
    movement_type = models.CharField(max_length=20, choices=MovementType.choices)
    quantity = models.IntegerField()
    reference_type = models.CharField(max_length=50, blank=True, null=True)
    reference_id = models.BigIntegerField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, related_name='inventory_movements'
    )

    class Meta:
        db_table = 'inventory_movement'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product']),
            models.Index(fields=['movement_type']),
            models.Index(fields=['created_at']),
            models.Index(fields=['reference_type', 'reference_id']),
        ]

    def __str__(self):
        return f'{self.movement_type} | {self.product.name} | qty: {self.quantity}'
