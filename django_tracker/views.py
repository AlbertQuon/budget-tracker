from . import models
from . import serializers
from rest_framework import generics

# Auth
from django.contrib.auth import login

from rest_framework import permissions
from rest_framework.authtoken.serializers import AuthTokenSerializer
from knox.views import LoginView as KnoxLoginView


http_method_names = ['get', 'head']

class LoginView(KnoxLoginView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        serializer = AuthTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        return super(LoginView, self).post(request, format=None)


class PurchaseCategoryView(generics.ListCreateAPIView):
    queryset=models.PurchaseCategory.objects.all()
    serializer_class = serializers.PurchaseCategorySerializer


class AuthUserView(generics.CreateAPIView):
    queryset = models.AuthUser.objects.all()
    serializer_class = serializers.AuthUserSerializer
    

class TaxCategoryView(generics.ListCreateAPIView):
    queryset = models.TaxCategory.objects.all()
    serializer_class = serializers.TaxCategorySerializer


class TransactTaxView(generics.ListCreateAPIView):
    queryset = models.TransactTax.objects.all()
    serializer_class = serializers.TransactTaxSerializer


class TransactionsView(generics.ListCreateAPIView):
    queryset = models.Transactions.objects.all()
    serializer_class = serializers.TransactionsSerializer


class PurchasesView(generics.ListCreateAPIView):
    queryset = models.Purchases.objects.all()
    serializer_class = serializers.PurchasesSerializer
    
    
# class AddPurchaseCategory(ListAPIView):
#     queryset=PurchaseCategory.objects.all()
#     serializer_class = serializers.PurchaseCategorySerializer
    
#     def post(self, request, format=None):
#         self.http_method_names.append("GET")

#         serializer = serializers.PurchaseCategorySerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_20)

# class GetPurchaseCategory(CreateAPIView):
#     #queryset=PurchaseCategory.objects.all()
#     #serializer_class = PurchaseCategorySerializer

#     def get(self, request, format=None):
#         categories = PurchaseCategory.objects.all()
#         serializer = serializers.PurchaseCategorySerializer(categories, many=True)
#         return Response(serializer.data)


   