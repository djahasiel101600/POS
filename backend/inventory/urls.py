from django.urls import path
from . import views

urlpatterns = [
    path('movements/', views.InventoryMovementListView.as_view(), name='inventory-movements'),
    path('stock-in/', views.StockInView.as_view(), name='inventory-stock-in'),
    path('adjustment/', views.StockAdjustmentView.as_view(), name='inventory-adjustment'),
    path('low-stock/', views.LowStockView.as_view(), name='inventory-low-stock'),
]
