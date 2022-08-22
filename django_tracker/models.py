from django.db import models


# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = True` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class Budget(models.Model):
    budget_id = models.AutoField(primary_key=True)
    start_time = models.DateField()
    end_time = models.DateField()
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    budget_name = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'budget'


class BudgetIncomes(models.Model):
    income_id = models.AutoField(primary_key=True)
    income_name = models.CharField(max_length=100)
    budget = models.ForeignKey(Budget, models.DO_NOTHING)
    income_amount = models.IntegerField()

    class Meta:
        managed = True
        db_table = 'budget_incomes'


class BudgetLimits(models.Model):
    budget = models.ForeignKey(Budget, models.DO_NOTHING, db_index=True)
    purc_category = models.ForeignKey('PurchaseCategory', models.DO_NOTHING, db_index=True)
    spend_limit = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'budget_limits'
        constraints = [
            models.UniqueConstraint(fields=['budget', 'purc_category'], name='unique_budget_purc_category')
        ]
        #unique_together = (('budget', 'purc_category'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = True
        db_table = 'django_migrations'


class PurchaseCategory(models.Model):
    purc_category_id = models.AutoField(primary_key=True)
    purc_category_name = models.CharField(max_length=100)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    spend_limit = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'purchase_category'


class Purchases(models.Model):
    purc_id = models.AutoField(primary_key=True)
    item_name = models.CharField(max_length=64)
    price = models.IntegerField()
    transact = models.ForeignKey('Transactions', models.DO_NOTHING, db_column='transact_id')
    purc_category = models.ForeignKey(PurchaseCategory, models.DO_NOTHING, db_column='purc_category', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'purchases'
        unique_together = (('transact', 'purc_id'),)


class TaxCategory(models.Model):
    tax_id = models.AutoField(primary_key=True)
    tax_name = models.CharField(max_length=100)
    tax_rate = models.IntegerField()
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = True
        db_table = 'tax_category'


class TransactTax(models.Model):
    transact = models.ForeignKey('Transactions', models.DO_NOTHING, db_column='transact_id')
    tax = models.ForeignKey(TaxCategory, models.DO_NOTHING)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    id = models.AutoField(primary_key=True)

    class Meta:
        managed = True
        db_table = 'transact_tax'
        unique_together = (('transact', 'tax'),)


class Transactions(models.Model):
    transact_id = models.AutoField(primary_key=True)
    transact_date = models.DateField()
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    budget = models.ForeignKey(Budget, models.DO_NOTHING)

    class Meta:
        managed = True
        db_table = 'transactions'
