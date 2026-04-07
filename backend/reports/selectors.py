from django.db.models import Sum, Count, Avg, Q
from django.db.models.functions import TruncDate, TruncMonth
from decimal import Decimal

from sales.models import Sale, SaleItem, SaleStatus
from products.models import Product
from inventory.models import InventoryMovement


def get_sales_summary(date_from=None, date_to=None):
    qs = Sale.objects.filter(status=SaleStatus.COMPLETED)
    if date_from:
        qs = qs.filter(created_at__date__gte=date_from)
    if date_to:
        qs = qs.filter(created_at__date__lte=date_to)

    agg = qs.aggregate(
        total_revenue=Sum('total_amount'),
        total_transactions=Count('id'),
        total_discount=Sum('discount_amount'),
        total_tax=Sum('tax_amount'),
        avg_transaction=Avg('total_amount'),
    )

    voided_count = Sale.objects.filter(status=SaleStatus.VOIDED)
    if date_from:
        voided_count = voided_count.filter(created_at__date__gte=date_from)
    if date_to:
        voided_count = voided_count.filter(created_at__date__lte=date_to)

    return {
        'total_revenue': agg['total_revenue'] or Decimal('0'),
        'total_transactions': agg['total_transactions'] or 0,
        'total_discount': agg['total_discount'] or Decimal('0'),
        'total_tax': agg['total_tax'] or Decimal('0'),
        'avg_transaction_value': agg['avg_transaction'] or Decimal('0'),
        'voided_transactions': voided_count.count(),
    }


def get_sales_trend(date_from=None, date_to=None, group_by='day'):
    qs = Sale.objects.filter(status=SaleStatus.COMPLETED)
    if date_from:
        qs = qs.filter(created_at__date__gte=date_from)
    if date_to:
        qs = qs.filter(created_at__date__lte=date_to)

    if group_by == 'month':
        qs = qs.annotate(period=TruncMonth('created_at'))
    else:
        qs = qs.annotate(period=TruncDate('created_at'))

    return (
        qs.values('period')
        .annotate(total=Sum('total_amount'), count=Count('id'))
        .order_by('period')
    )


def get_top_products(date_from=None, date_to=None, limit=10):
    qs = SaleItem.objects.filter(sale__status=SaleStatus.COMPLETED)
    if date_from:
        qs = qs.filter(sale__created_at__date__gte=date_from)
    if date_to:
        qs = qs.filter(sale__created_at__date__lte=date_to)

    return (
        qs.values('product_id', 'product_name_snapshot')
        .annotate(total_qty=Sum('quantity'), total_revenue=Sum('line_total'))
        .order_by('-total_qty')[:limit]
    )


def get_sales_by_cashier(date_from=None, date_to=None):
    qs = Sale.objects.filter(status=SaleStatus.COMPLETED)
    if date_from:
        qs = qs.filter(created_at__date__gte=date_from)
    if date_to:
        qs = qs.filter(created_at__date__lte=date_to)

    return (
        qs.values('cashier_id', 'cashier__full_name')
        .annotate(total_sales=Sum('total_amount'), num_transactions=Count('id'))
        .order_by('-total_sales')
    )


def get_sales_by_payment_method(date_from=None, date_to=None):
    qs = Sale.objects.filter(status=SaleStatus.COMPLETED)
    if date_from:
        qs = qs.filter(created_at__date__gte=date_from)
    if date_to:
        qs = qs.filter(created_at__date__lte=date_to)

    return (
        qs.values('payment_method')
        .annotate(total=Sum('total_amount'), count=Count('id'))
        .order_by('-total')
    )


def get_low_stock_report():
    from django.db.models import F
    return Product.objects.filter(
        is_active=True, stock_quantity__lte=F('low_stock_threshold')
    ).values('id', 'name', 'sku', 'stock_quantity', 'low_stock_threshold', 'category__name')


def get_inventory_movements_report(date_from=None, date_to=None, product_id=None):
    qs = InventoryMovement.objects.select_related('product', 'created_by')
    if date_from:
        qs = qs.filter(created_at__date__gte=date_from)
    if date_to:
        qs = qs.filter(created_at__date__lte=date_to)
    if product_id:
        qs = qs.filter(product_id=product_id)
    return qs
