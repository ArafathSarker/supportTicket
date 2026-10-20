from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('support_ticket', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='ticket',
            name='sensor_id',
            field=models.CharField(
                default='',
                help_text='Sensor ID / asset tag',
                max_length=255,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ticket',
            name='factory_section',
            field=models.CharField(
                default='',
                help_text='Factory section / location',
                max_length=255,
            ),
            preserve_default=False,
        ),
    ]
