from .models import Product, Category


def create_product(**fields) -> Product:
    return Product.objects.create(**fields)


def update_product(product: Product, **fields) -> Product:
    for attr, value in fields.items():
        setattr(product, attr, value)
    product.save()
    return product


def archive_product(product: Product) -> Product:
    product.is_active = False
    product.save(update_fields=['is_active'])
    return product


def create_category(name: str, is_active: bool = True) -> Category:
    return Category.objects.create(name=name, is_active=is_active)


def update_category(category: Category, **fields) -> Category:
    for attr, value in fields.items():
        setattr(category, attr, value)
    category.save()
    return category
