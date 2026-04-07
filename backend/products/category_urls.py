from django.urls import path
from . import category_views

urlpatterns = [
    path('', category_views.CategoryListCreateView.as_view(), name='category-list-create'),
    path('<int:pk>/', category_views.CategoryDetailView.as_view(), name='category-detail'),
]
