from . import models
from . import serializers
from rest_framework import generics

from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Auth
from django.contrib.auth import login
from django.contrib.auth.models import User

from rest_framework import permissions
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny, IsAuthenticated
#from knox.views import LoginView as KnoxLoginView


http_method_names = ['get', 'head']
# @api_view(['GET'])
# def current_user(request):
#     """
#     Determine the current user by their token, and return their data
#     """
    
#     serializer = UserSerializer(request.user)
#     return Response(serializer.data)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = serializers.MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = serializers.RegisterSerializer


@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/api/token/',
        '/api/register/',
        '/api/token/refresh/'
    ]
    return Response(routes)


# class LoginView(KnoxLoginView):
#     permission_classes = (permissions.AllowAny,)

#     def post(self, request, format=None):
#         serializer = AuthTokenSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         user = serializer.validated_data['user']
#         login(request, user)
#         return super(LoginView, self).post(request, format=None)


class PurchaseCategoryListView(generics.ListCreateAPIView):
    #queryset=models.PurchaseCategory.objects.all()
    serializer_class = serializers.PurchaseCategorySerializer
    
    def get_queryset(self):
        user = self.request.user.id
        return models.PurchaseCategory.objects.filter(user=user)


class PurchaseCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset=models.PurchaseCategory.objects.all()
    serializer_class = serializers.PurchaseCategorySerializer


class AuthUserView(generics.CreateAPIView):
    queryset = models.AuthUser.objects.all()
    serializer_class = serializers.AuthUserSerializer


class TaxCategoryListView(generics.ListCreateAPIView):
    #queryset = models.TaxCategory.objects.all()
    serializer_class = serializers.TaxCategorySerializer
    def get_queryset(self):
        user = self.request.user.id
        return models.TaxCategory.objects.filter(user=user)


class TaxCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.TaxCategory.objects.all()
    serializer_class = serializers.TaxCategorySerializer


class TransactTaxListView(generics.ListCreateAPIView):
    #queryset = models.TransactTax.objects.all()
    serializer_class = serializers.TransactTaxSerializer
    def get_queryset(self):
        user = self.request.user.id
        return models.TransactTax.objects.filter(user=user)


class TransactTaxDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.TransactTax.objects.all()
    serializer_class = serializers.TransactTaxSerializer


class TransactionsListView(generics.ListCreateAPIView):
    queryset = models.Transactions.objects.all()
    serializer_class = serializers.TransactionsSerializer
    def get_queryset(self):
        user = self.request.user.id
        return models.Transactions.objects.filter(user=user)
    

class TransactionsDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Transactions.objects.all()
    serializer_class = serializers.TransactionsSerializer


class PurchasesListView(generics.ListCreateAPIView):
    queryset = models.Purchases.objects.all()
    serializer_class = serializers.PurchasesSerializer


class PurchasesDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Purchases.objects.all()
    serializer_class = serializers.PurchasesSerializer
    

class BudgetListView(generics.ListCreateAPIView):
    #queryset = models.Budget.objects.all()
    serializer_class = serializers.BudgetSerializer
    def get_queryset(self):
        user = self.request.user.id
        return models.Budget.objects.filter(user=user)


class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Budget.objects.all()
    serializer_class = serializers.BudgetSerializer


class BudgetLimitListView(generics.ListCreateAPIView):
    queryset = models.BudgetLimits.objects.all()
    serializer_class = serializers.BudgetLimitSerializer


class BudgetLimitDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.BudgetLimits.objects.all()
    serializer_class = serializers.BudgetLimitSerializer


    
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


   