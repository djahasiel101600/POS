from rest_framework import generics
from .models import Category
from .serializers import CategorySerializer
from .selectors import get_all_categories
from .permissions import ProductPermission


class CategoryListCreateView(generics.ListCreateAPIView):
    permission_classes = [ProductPermission]
    serializer_class = CategorySerializer

    def get_queryset(self):
        return get_all_categories()


class CategoryDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [ProductPermission]
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
