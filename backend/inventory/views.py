from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import InventoryMovement
from .serializers import InventoryMovementSerializer, StockInSerializer, StockAdjustmentSerializer
from .selectors import get_movements
from .services import stock_in, stock_adjustment
from .permissions import InventoryPermission
from products.selectors import get_low_stock_products
from products.serializers import ProductListSerializer
from common.exceptions import InsufficientStockError


class InventoryMovementListView(generics.ListAPIView):
    permission_classes = [InventoryPermission]
    serializer_class = InventoryMovementSerializer

    def get_queryset(self):
        return get_movements(
            product_id=self.request.query_params.get('product'),
            movement_type=self.request.query_params.get('movement_type'),
        )


class StockInView(APIView):
    permission_classes = [InventoryPermission]

    def post(self, request):
        serializer = StockInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        product = stock_in(data['product_id'], data['quantity'], request.user, data.get('notes', ''))
        return Response({'detail': 'Stock added.', 'stock_quantity': product.stock_quantity}, status=status.HTTP_200_OK)


class StockAdjustmentView(APIView):
    permission_classes = [InventoryPermission]

    def post(self, request):
        serializer = StockAdjustmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            product = stock_adjustment(data['product_id'], data['quantity'], request.user, data['notes'])
        except InsufficientStockError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'Stock adjusted.', 'stock_quantity': product.stock_quantity}, status=status.HTTP_200_OK)


class LowStockView(generics.ListAPIView):
    permission_classes = [InventoryPermission]
    serializer_class = ProductListSerializer

    def get_queryset(self):
        return get_low_stock_products()
