from .models import PurchaseCategory
from .serializers import PurchaseCategorySerializer
from rest_framework.generics import ListAPIView, CreateAPIView

class AddPurchaseCategory(ListAPIView):
    queryset=PurchaseCategory.objects.all()
    serializer_class = PurchaseCategorySerializer

class GetPurchaseCategory(CreateAPIView):
    queryset=PurchaseCategory.objects.all()
    serializer_class = PurchaseCategorySerializer

