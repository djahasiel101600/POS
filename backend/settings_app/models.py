from django.db import models
from common.models import TimeStampedModel


class Store(TimeStampedModel):
    store_name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    contact_number = models.CharField(max_length=50, blank=True, null=True)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    currency = models.CharField(max_length=10, default='PHP')
    receipt_header = models.TextField(blank=True, null=True)
    receipt_footer = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'settings_store'

    def __str__(self):
        return self.store_name
