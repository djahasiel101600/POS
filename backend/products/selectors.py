from .models import Product, Category


def get_active_products(category_id=None, search=None):
    qs = Product.objects.select_related('category').filter(is_active=True)
    if category_id:
        qs = qs.filter(category_id=category_id)
    if search:
        qs = qs.filter(name__icontains=search) | qs.filter(sku__icontains=search) | qs.filter(barcode__icontains=search)
    return qs


def get_all_products(category_id=None, search=None, is_active=None):
    qs = Product.objects.select_related('category').all()
    if category_id:
        qs = qs.filter(category_id=category_id)
    if search:
        qs = qs.filter(name__icontains=search) | qs.filter(sku__icontains=search) | qs.filter(barcode__icontains=search)
    if is_active is not None:
        qs = qs.filter(is_active=is_active)
    return qs


def get_low_stock_products():
    from django.db.models import F
    return Product.objects.filter(is_active=True, stock_quantity__lte=F('low_stock_threshold'))


def get_active_categories():
    return Category.objects.filter(is_active=True)


def get_all_categories():
    return Category.objects.all()
