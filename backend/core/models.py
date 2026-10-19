from django.db import models


class DynamicChoiceManager(models.Manager):
    """Manager for DynamicOption — fetches active options per key."""

    def for_key(self, key: str):
        return self.get_queryset().filter(key=key, is_active=True).order_by('label')


class DynamicOption(models.Model):
    """
    Generic dynamic dropdown configuration.

    Any dropdown that must be configurable at runtime (affected systems,
    problem categories, work-performed checklist items) is stored here —
    add a value for a key and it is instantly selectable in the frontend.
    """

    SYSTEM_KEY = 'system'
    CATEGORY_KEY = 'category'
    WORK_PERFORMED_KEY = 'work_performed'

    KEY_CHOICES = [
        (SYSTEM_KEY, 'Affected system'),
        (CATEGORY_KEY, 'Problem category'),
        (WORK_PERFORMED_KEY, 'Work performed checklist item'),
    ]

    key = models.CharField(max_length=64, choices=KEY_CHOICES, db_index=True)
    label = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects: DynamicChoiceManager = DynamicChoiceManager()

    class Meta:
        unique_together = ('key', 'label')
        ordering = ['key', 'label']

    def __str__(self):
        return f'{self.key}: {self.label}'
