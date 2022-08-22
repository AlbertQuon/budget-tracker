# Generated by Django 4.0.4 on 2022-06-29 00:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('django_tracker', '0005_budget_budgetlimits'),
    ]

    operations = [
        migrations.CreateModel(
            name='TokenBlacklistBlacklistedtoken',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('blacklisted_at', models.DateTimeField()),
            ],
            options={
                'db_table': 'token_blacklist_blacklistedtoken',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='TokenBlacklistOutstandingtoken',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('token', models.TextField()),
                ('created_at', models.DateTimeField(blank=True, null=True)),
                ('expires_at', models.DateTimeField()),
                ('jti', models.CharField(max_length=255, unique=True)),
            ],
            options={
                'db_table': 'token_blacklist_outstandingtoken',
                'managed': False,
            },
        ),
    ]
