from questionary import password
from requests import request
from rest_framework import serializers
from . import models
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        
        return token


class AuthUserSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'username',
            'email'
        )
        model = User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('id','username','password','password2')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields don't match"})
        return attrs
    
    def create(self, validated_data):
        user = User.objects.create(username=validated_data['username'])
        user.set_password(validated_data['password'])
        user.save()

        return user


class UpdateUserSerializer(serializers.ModelSerializer):
    newUsername = serializers.CharField(write_only=True, required=True) 
    oldPassword = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    

    class Meta:
        model = User
        fields = ('id','newUsername','username','oldPassword','password','password2')
        
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields don't match"})

        if attrs['oldPassword'] == attrs['password']:
            raise serializers.ValidationError({"oldPassword": "Entered the same password"})
        return attrs
    
    def validate_oldPassword(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError({"oldPassword": "Old password is not correct"}) 
        return value
    
    def update(self, instance, validated_data):
        instance.username = validated_data['newUsername']
        instance.set_password(validated_data['password'])
        
        instance.save()
        
        return instance        


class UpdateUsernameSerializer(serializers.ModelSerializer):
    newUsername = serializers.CharField(write_only=True, required=True) 
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ('id','newUsername','username','password')
        
    def validate_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError({"password": "Password is not correct"}) 
        return value
    
    def validate_username(self, value):
        user = self.context['request'].user
        if user.username == value:
            raise serializers.ValidationError({"username": "Same username was entered"}) 
        return value
    
    def update(self, instance, validated_data):
        instance.username = validated_data['newUsername']
        instance.save()
        
        return instance   


class PurchaseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = models.PurchaseCategory


class TaxCategorySerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = models.TaxCategory


class TransactionsSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = models.Transactions


class TransactTaxSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = models.TransactTax


class PurchasesSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = models.Purchases


class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = models.Budget
        
        
class BudgetLimitSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = models.BudgetLimits




