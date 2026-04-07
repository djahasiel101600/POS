from django.db import models
from common.models import TimeStampedModel


class SaleStatus(models.TextChoices):
    COMPLETED = 'completed', 'Completed'
    VOIDED = 'voided', 'Voided'
    REFUNDED = 'refunded', 'Refunded'
    HELD = 'held', 'Held'


class PaymentMethod(models.TextChoices):
    CASH = 'cash', 'Cash'
    GCASH = 'gcash', 'GCash'
    CARD = 'card', 'Card'
    BANK_TRANSFER = 'bank_transfer', 'Bank Transfer'
    OTHER = 'other', 'Other'


class Sale(TimeStampedModel):
    receipt_number = models.CharField(max_length=50, unique=True)
    cashier = models.ForeignKey(
        'accounts.User', on_delete=models.PROTECT, related_name='sales'
    )
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    cash_received = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    change_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=SaleStatus.choices, default=SaleStatus.COMPLETED)
    notes = models.TextField(blank=True, null=True)
    voided_by = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='voided_sales'
    )
    voided_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'sales_sale'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['receipt_number']),
            models.Index(fields=['cashier']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['payment_method']),
        ]

    def __str__(self):
        return f'Sale #{self.receipt_number}'


class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(
        'products.Product', on_delete=models.PROTECT, related_name='sale_items'
    )
    product_name_snapshot = models.CharField(max_length=255)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField()
    line_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'sales_sale_item'

    def __str__(self):
        return f'{self.product_name_snapshot} x{self.quantity}'


class Payment(TimeStampedModel):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='payments')
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reference_number = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'sales_payment'

    def __str__(self):
        return f'{self.payment_method} - {self.amount}'
