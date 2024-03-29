# Generated by Django 4.0.4 on 2022-08-22 20:22

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('django_tracker', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Budget',
            fields=[
                ('budget_id', models.AutoField(primary_key=True, serialize=False)),
                ('start_time', models.DateField()),
                ('end_time', models.DateField()),
                ('budget_name', models.CharField(blank=True, max_length=100, null=True)),
                ('user', models.ForeignKey(default=None, on_delete=django.db.models.deletion.DO_NOTHING, to='django_tracker.authuser')),
            ],
            options={
                'db_table': 'budget',
                'managed': True,
            },
        ),
        migrations.CreateModel(
            name='PurchaseCategory',
            fields=[
                ('purc_category_id', models.AutoField(primary_key=True, serialize=False)),
                ('purc_category_name', models.CharField(default='', max_length=100)),
                ('spend_limit', models.IntegerField(blank=True, null=True)),
                ('user', models.ForeignKey(default=None, on_delete=django.db.models.deletion.DO_NOTHING, to='django_tracker.authuser')),
            ],
            options={
                'db_table': 'purchase_category',
                'managed': True,
            },
        ),
        migrations.CreateModel(
            name='TaxCategory',
            fields=[
                ('tax_id', models.AutoField(primary_key=True, serialize=False)),
                ('tax_name', models.CharField(max_length=100)),
                ('tax_rate', models.IntegerField()),
                ('user', models.ForeignKey(default=None, on_delete=django.db.models.deletion.DO_NOTHING, to='django_tracker.authuser')),
            ],
            options={
                'db_table': 'tax_category',
                'managed': True,
            },
        ),
        migrations.CreateModel(
            name='Transactions',
            fields=[
                ('transact_id', models.AutoField(primary_key=True, serialize=False)),
                ('transact_date', models.DateField()),
                ('budget', models.ForeignKey(default=None, on_delete=django.db.models.deletion.DO_NOTHING, to='django_tracker.budget')),
                ('user', models.ForeignKey(default=None, on_delete=django.db.models.deletion.DO_NOTHING, to='django_tracker.authuser')),
            ],
            options={
                'db_table': 'transactions',
                'managed': True,
            },
        ),
        migrations.CreateModel(
            name='BudgetLimits',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('spend_limit', models.IntegerField(blank=True, null=True)),
                ('budget', models.ForeignKey(default=None, on_delete=django.db.models.deletion.DO_NOTHING, to='django_tracker.budget')),
                ('purc_category', models.ForeignKey(default=None, on_delete=django.db.models.deletion.DO_NOTHING, to='django_tracker.purchasecategory')),
            ],
            options={
                'db_table': 'budget_limits',
                'managed': True,
            },
        ),
        migrations.CreateModel(
            name='BudgetIncomes',
            fields=[
                ('income_id', models.AutoField(primary_key=True, serialize=False)),
                ('income_name', models.CharField(max_length=100)),
                ('income_amount', models.IntegerField(default=0)),
                ('budget', models.ForeignKey(default=None, on_delete=django.db.models.deletion.DO_NOTHING, to='django_tracker.budget')),
            ],
            options={
                'db_table': 'budget_incomes',
                'managed': True,
            },
        ),
        migrations.CreateModel(
            name='TransactTax',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('tax', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='django_tracker.taxcategory')),
                ('transact', models.ForeignKey(db_column='transact_id', on_delete=django.db.models.deletion.DO_NOTHING, to='django_tracker.transactions')),
                ('user', models.ForeignKey(default=None, on_delete=django.db.models.deletion.DO_NOTHING, to='django_tracker.authuser')),
            ],
            options={
                'db_table': 'transact_tax',
                'managed': True,
                'unique_together': {('transact', 'tax')},
            },
        ),
        migrations.CreateModel(
            name='Purchases',
            fields=[
                ('purc_id', models.AutoField(primary_key=True, serialize=False)),
                ('item_name', models.CharField(max_length=64)),
                ('price', models.IntegerField()),
                ('purc_category', models.ForeignKey(blank=True, db_column='purc_category', null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='django_tracker.purchasecategory')),
                ('transact', models.ForeignKey(db_column='transact_id', default=None, on_delete=django.db.models.deletion.DO_NOTHING, to='django_tracker.transactions')),
            ],
            options={
                'db_table': 'purchases',
                'managed': True,
                'unique_together': {('transact', 'purc_id')},
            },
        ),
        migrations.AddConstraint(
            model_name='budgetlimits',
            constraint=models.UniqueConstraint(fields=('budget', 'purc_category'), name='unique_budget_purc_category'),
        ),
    ]
