# Generated by Django 2.2 on 2019-07-22 18:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reminders', '0006_auto_20190722_1801'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='reminder',
            name='task_id',
        ),
        migrations.AlterField(
            model_name='reminder',
            name='time',
            field=models.DateTimeField(),
        ),
    ]
