from .models import Sale


def get_sales(cashier_id=None, status=None, payment_method=None, date_from=None, date_to=None):
    qs = Sale.objects.select_related('cashier').prefetch_related('items', 'payments').all()
    if cashier_id:
        qs = qs.filter(cashier_id=cashier_id)
    if status:
        qs = qs.filter(status=status)
    if payment_method:
        qs = qs.filter(payment_method=payment_method)
    if date_from:
        qs = qs.filter(created_at__date__gte=date_from)
    if date_to:
        qs = qs.filter(created_at__date__lte=date_to)
    return qs


def get_sale_by_id(sale_id) -> Sale:
    return Sale.objects.select_related('cashier').prefetch_related('items__product', 'payments').get(pk=sale_id)
