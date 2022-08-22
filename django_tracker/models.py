from django.db import models


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
    user = models.ForeignKey(AuthUser, models.DO_NOTHING, default=None)
    budget_name = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'budget'


class BudgetIncomes(models.Model):
    income_id = models.AutoField(primary_key=True)
    income_name = models.CharField(max_length=100)
    budget = models.ForeignKey(Budget, models.DO_NOTHING, default=None)
    income_amount = models.IntegerField(default=0)

    class Meta:
        managed = True
        db_table = 'budget_incomes'


class BudgetLimits(models.Model):
    id = models.AutoField(primary_key=True)
    budget = models.ForeignKey(Budget, models.DO_NOTHING, db_index=True, default=None)
    purc_category = models.ForeignKey('PurchaseCategory', models.DO_NOTHING, db_index=True, default=None)
    spend_limit = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'budget_limits'
        constraints = [
            models.UniqueConstraint(fields=['budget', 'purc_category'], name='unique_budget_purc_category')
        ]
        #unique_together = (('budget', 'purc_category'),)


class PurchaseCategory(models.Model):
    purc_category_id = models.AutoField(primary_key=True)
    purc_category_name = models.CharField(max_length=100, default="")
    user = models.ForeignKey(AuthUser, models.DO_NOTHING, default=None)
    spend_limit = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'purchase_category'


class Purchases(models.Model):
    purc_id = models.AutoField(primary_key=True)
    item_name = models.CharField(max_length=64)
    price = models.IntegerField()
    transact = models.ForeignKey('Transactions', models.DO_NOTHING, db_column='transact_id', default=None)
    purc_category = models.ForeignKey(PurchaseCategory, models.DO_NOTHING, db_column='purc_category', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'purchases'
        unique_together = (('transact', 'purc_id'),)


class TaxCategory(models.Model):
    tax_id = models.AutoField(primary_key=True)
    tax_name = models.CharField(max_length=100)
    tax_rate = models.IntegerField()
    user = models.ForeignKey(AuthUser, models.DO_NOTHING, default=None)

    class Meta:
        managed = True
        db_table = 'tax_category'


class TransactTax(models.Model):
    transact = models.ForeignKey('Transactions', models.DO_NOTHING, db_column='transact_id')
    tax = models.ForeignKey(TaxCategory, models.DO_NOTHING)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING, default=None)
    id = models.AutoField(primary_key=True)

    class Meta:
        managed = True
        db_table = 'transact_tax'
        unique_together = (('transact', 'tax'),)


class Transactions(models.Model):
    transact_id = models.AutoField(primary_key=True)
    transact_date = models.DateField()
    user = models.ForeignKey(AuthUser, models.DO_NOTHING, default=None)
    budget = models.ForeignKey(Budget, models.DO_NOTHING, default=None)

    class Meta:
        managed = True
        db_table = 'transactions'
