from rest_framework import generics, status
from rest_framework.response import Response

from .models import Product
from .serializers import ProductListSerializer, ProductDetailSerializer, ProductCreateUpdateSerializer
from .selectors import get_all_products
from .services import archive_product
from .permissions import ProductPermission


class ProductListCreateView(generics.ListCreateAPIView):
    permission_classes = [ProductPermission]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateUpdateSerializer
        return ProductListSerializer

    def get_queryset(self):
        params = self.request.query_params
        is_active = params.get('is_active')
        if is_active is not None:
            is_active = is_active.lower() == 'true'
        return get_all_products(
            category_id=params.get('category'),
            search=params.get('search'),
            is_active=is_active,
        )


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [ProductPermission]
    queryset = Product.objects.select_related('category').all()

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer

    def perform_destroy(self, instance):
        archive_product(instance)
