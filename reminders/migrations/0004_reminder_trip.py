# Generated by Django 2.2 on 2019-07-21 21:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reminders', '0003_reminder'),
    ]

    operations = [
        migrations.AddField(
            model_name='reminder',
            name='trip',
            field=models.CharField(default=1, max_length=150),
            preserve_default=False,
        ),
    ]
