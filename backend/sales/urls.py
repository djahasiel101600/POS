from django.urls import path
from . import views

urlpatterns = [
    path('', views.SaleListCreateView.as_view(), name='sale-list-create'),
    path('<int:pk>/', views.SaleDetailView.as_view(), name='sale-detail'),
    path('<int:pk>/void/', views.VoidSaleView.as_view(), name='sale-void'),
    path('<int:pk>/receipt/', views.ReceiptView.as_view(), name='sale-receipt'),
]
