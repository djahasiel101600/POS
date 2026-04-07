from django.urls import path
from . import views

urlpatterns = [
    path('sales-summary/', views.SalesSummaryView.as_view(), name='report-sales-summary'),
    path('sales-trend/', views.SalesTrendView.as_view(), name='report-sales-trend'),
    path('top-products/', views.TopProductsView.as_view(), name='report-top-products'),
    path('by-cashier/', views.SalesByCashierView.as_view(), name='report-by-cashier'),
    path('by-payment-method/', views.SalesByPaymentMethodView.as_view(), name='report-by-payment'),
    path('low-stock/', views.LowStockReportView.as_view(), name='report-low-stock'),
    path('inventory-movements/', views.InventoryMovementsReportView.as_view(), name='report-inventory-movements'),
]
