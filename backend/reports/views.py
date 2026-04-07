from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics

from .selectors import (
    get_sales_summary, get_sales_trend, get_top_products,
    get_sales_by_cashier, get_sales_by_payment_method,
    get_low_stock_report, get_inventory_movements_report
)
from .permissions import ReportPermission
from inventory.serializers import InventoryMovementSerializer


class _DateFilterMixin:
    def get_date_params(self, request):
        return request.query_params.get('date_from'), request.query_params.get('date_to')


class SalesSummaryView(_DateFilterMixin, APIView):
    permission_classes = [ReportPermission]

    def get(self, request):
        date_from, date_to = self.get_date_params(request)
        data = get_sales_summary(date_from, date_to)
        return Response(data)


class SalesTrendView(_DateFilterMixin, APIView):
    permission_classes = [ReportPermission]

    def get(self, request):
        date_from, date_to = self.get_date_params(request)
        group_by = request.query_params.get('group_by', 'day')
        data = list(get_sales_trend(date_from, date_to, group_by))
        return Response(data)


class TopProductsView(_DateFilterMixin, APIView):
    permission_classes = [ReportPermission]

    def get(self, request):
        date_from, date_to = self.get_date_params(request)
        limit = int(request.query_params.get('limit', 10))
        data = list(get_top_products(date_from, date_to, limit))
        return Response(data)


class SalesByCashierView(_DateFilterMixin, APIView):
    permission_classes = [ReportPermission]

    def get(self, request):
        date_from, date_to = self.get_date_params(request)
        data = list(get_sales_by_cashier(date_from, date_to))
        return Response(data)


class SalesByPaymentMethodView(_DateFilterMixin, APIView):
    permission_classes = [ReportPermission]

    def get(self, request):
        date_from, date_to = self.get_date_params(request)
        data = list(get_sales_by_payment_method(date_from, date_to))
        return Response(data)


class LowStockReportView(APIView):
    permission_classes = [ReportPermission]

    def get(self, request):
        data = list(get_low_stock_report())
        return Response(data)


class InventoryMovementsReportView(_DateFilterMixin, APIView):
    permission_classes = [ReportPermission]

    def get(self, request):
        date_from, date_to = self.get_date_params(request)
        product_id = request.query_params.get('product')
        qs = get_inventory_movements_report(date_from, date_to, product_id)
        serializer = InventoryMovementSerializer(qs, many=True)
        return Response(serializer.data)
