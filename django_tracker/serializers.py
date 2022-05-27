from rest_framework import serializers
from .models import PurchaseCategory

class PurchaseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'name'
        )
        model = PurchaseCategory