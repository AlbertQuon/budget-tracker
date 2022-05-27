from django.urls import path
from . import views

urlpatterns = [
    path('view/', views.AddPurchaseCategory.as_view()),
    path('create/', views.GetPurchaseCategory.as_view())
]